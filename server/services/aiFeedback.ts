import Anthropic from '@anthropic-ai/sdk';
import { AudioAnalysisResult } from './audioAnalysis';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
});

export interface AIFeedbackResult {
  verdict: string;
  issues: {
    severity: "critical" | "warning" | "info";
    title: string;
    detail: string;
    action: string;
  }[];
  summary: string;
}

function formatBands(bands: AudioAnalysisResult['frequencies']): string {
  if (!bands) return '';
  return bands.map(b => `- ${b.name} (${b.low}-${b.high}Hz): ${b.rmsDb} dB RMS`).join('\n');
}

export async function getAIFeedback(
  userAnalysis: AudioAnalysisResult,
  referenceAnalysis?: AudioAnalysisResult | null,
  presetId?: string
): Promise<AIFeedbackResult> {

  try {
    let prompt = `You are an experienced mixing/mastering engineer. Analyze this audio measurement data and return structured JSON feedback.

USER MIX:
- Duration: ${userAnalysis.duration.toFixed(1)} seconds
- Sample rate: ${userAnalysis.sampleRate} Hz
- Bit depth: ${userAnalysis.bitDepth || 'unknown'} bit
- Channels: ${userAnalysis.channels === 1 ? 'Mono' : 'Stereo'}
- Format: ${userAnalysis.format}`;

if (presetId) {
  prompt += `

TARGET PROFILE:
User is mixing for ${presetId}.`;
}

    if (userAnalysis.loudness) {
      prompt += `

LOUDNESS (User Mix):
- Integrated Loudness: ${userAnalysis.loudness.integrated.toFixed(2)} LUFS
- Loudness Range: ${userAnalysis.loudness.range.toFixed(2)} LU
- True Peak: ${userAnalysis.loudness.truePeak.toFixed(2)} dBTP`;
    }

    if (userAnalysis.frequencies) {
      prompt += `

FREQUENCY ANALYSIS (User Mix) — RMS level per band:
${formatBands(userAnalysis.frequencies)}`;
    }

    if (referenceAnalysis && referenceAnalysis.loudness) {
      prompt += `

REFERENCE TRACK:
- Integrated Loudness: ${referenceAnalysis.loudness.integrated.toFixed(2)} LUFS
- Loudness Range: ${referenceAnalysis.loudness.range.toFixed(2)} LU
- True Peak: ${referenceAnalysis.loudness.truePeak.toFixed(2)} dBTP`;

      if (referenceAnalysis.frequencies) {
        prompt += `

FREQUENCY ANALYSIS (Reference) — RMS level per band:
${formatBands(referenceAnalysis.frequencies)}`;
      }

      prompt += `

COMPARISON:
- Loudness difference: ${(userAnalysis.loudness!.integrated - referenceAnalysis.loudness.integrated).toFixed(2)} LUFS (${userAnalysis.loudness!.integrated < referenceAnalysis.loudness.integrated ? 'quieter' : 'louder'})
- Dynamic range difference: ${(userAnalysis.loudness!.range - referenceAnalysis.loudness.range).toFixed(2)} LU
- Peak difference: ${(userAnalysis.loudness!.truePeak - referenceAnalysis.loudness.truePeak).toFixed(2)} dB`;
    }

    prompt += `

Respond ONLY with valid JSON in this exact format, no markdown, no code fences:

{
  "verdict": "One short sentence overall verdict",
  "issues": [
    {
      "severity": "critical",
      "title": "Short title, max 5 words",
      "detail": "One sentence explaining the observation with specific dB values and frequencies.",
      "action": "One concrete suggestion with exact dB and Hz values, e.g. 'Cut 2-3dB at 2.5kHz with a narrow Q'"
    }
  ],
  "summary": "2-3 sentences with the most important takeaway."
}

Rules:
- issues: 1-6 issues. It's OK to return just 1-2 issues if the mix sounds good. Do NOT invent problems.
- severity "critical" = genuine technical fault (clipping, extreme distortion, mono-incompatible phase issues). Most mixes will have ZERO critical issues.
- severity "warning" = noticeable imbalance that most listeners would hear
- severity "info" = minor observation, stylistic note, or positive reinforcement
- Reference the actual dB RMS values from the frequency data in your feedback
- Keep actions specific: mention exact frequencies (Hz), dB amounts, and EQ settings

IMPORTANT — Judge quality honestly:
- A professionally mastered track (LUFS between -7 and -14, true peak below 0 dBTP, balanced spectrum) is a GOOD mix. Say so. Don't nitpick it.
- If the mix has no real problems, return mostly "info" severity items with positive observations like "Well-balanced low end" or "Clean headroom".
- Different genres have different frequency profiles. A bass-heavy hip-hop track is supposed to have strong sub-bass. An acoustic track is supposed to have less sub-bass. This is NOT a problem.
- Only flag frequency balance as a real issue if a band is 8+ dB louder/quieter than its neighbors — that suggests a resonance or a hole, not artistic choice.
- Clipping (true peak > 0 dBTP) is the ONLY thing that should consistently be "critical".
- A loudness difference of < 2 LUFS from a target is negligible — mention it as "info" at most.
- When comparing to a reference: differences are observations, not problems. Frame them as "your mix has more/less X" not "your mix is wrong".`;

const response = await anthropic.messages.create({
  model: 'claude-sonnet-4-20250514',
  max_tokens: 800,
  messages: [{
    role: 'user',
    content: prompt
  }]
});

const textContent = response.content[0];
const raw = (textContent as any)?.text || "";

try {
  const parsed = JSON.parse(raw);
  return parsed as AIFeedbackResult;
} catch {
  const jsonMatch = raw.match(/```(?:json)?\s*([\s\S]*?)```/) || raw.match(/(\{[\s\S]*\})/);
  if (jsonMatch) {
    return JSON.parse(jsonMatch[1]) as AIFeedbackResult;
  }
  return {
    verdict: "Analysis complete",
    issues: [{ severity: "info", title: "See details", detail: raw.slice(0, 200), action: "Review the analysis data above" }],
    summary: raw.slice(0, 300)
  };
}

  } catch (error) {
    console.error('AI Feedback error:', error);
    throw new Error('Could not get AI feedback');
  }
}
