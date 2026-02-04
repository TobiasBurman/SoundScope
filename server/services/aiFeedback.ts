import Anthropic from '@anthropic-ai/sdk';
import { AudioAnalysisResult } from './audioAnalysis';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
});

export async function getAIFeedback(
  userAnalysis: AudioAnalysisResult,
  referenceAnalysis?: AudioAnalysisResult | null
): Promise<string> {
  try {
    let prompt = `You are an experienced mixing engineer. Analyze this audio file and provide concrete feedback.

USER MIX:
- Duration: ${userAnalysis.duration.toFixed(1)} seconds
- Sample rate: ${userAnalysis.sampleRate} Hz
- Bit depth: ${userAnalysis.bitDepth || 'unknown'} bit
- Channels: ${userAnalysis.channels === 1 ? 'Mono' : 'Stereo'}
- Format: ${userAnalysis.format}`;

    if (userAnalysis.loudness) {
      prompt += `

LOUDNESS ANALYSIS (User Mix):
- Integrated Loudness: ${userAnalysis.loudness.integrated.toFixed(2)} LUFS
- Loudness Range: ${userAnalysis.loudness.range.toFixed(2)} LU
- True Peak: ${userAnalysis.loudness.truePeak.toFixed(2)} dBTP`;
    }

    if (userAnalysis.frequencies) {
      prompt += `

FREQUENCY ANALYSIS (User Mix):
- Sub-Bass (20-60Hz): ${userAnalysis.frequencies.subBass.toFixed(1)}%
- Bass (60-250Hz): ${userAnalysis.frequencies.bass.toFixed(1)}%
- Low-Mid (250-500Hz): ${userAnalysis.frequencies.lowMid.toFixed(1)}%
- Mid (500-2kHz): ${userAnalysis.frequencies.mid.toFixed(1)}%
- High-Mid (2k-4kHz): ${userAnalysis.frequencies.highMid.toFixed(1)}%
- Presence (4k-6kHz): ${userAnalysis.frequencies.presence.toFixed(1)}%
- Brilliance (6k-20kHz): ${userAnalysis.frequencies.brilliance.toFixed(1)}%`;
    }

    // Add reference comparison if provided
    if (referenceAnalysis && referenceAnalysis.loudness) {
      prompt += `

REFERENCE TRACK:
- Integrated Loudness: ${referenceAnalysis.loudness.integrated.toFixed(2)} LUFS
- Loudness Range: ${referenceAnalysis.loudness.range.toFixed(2)} LU
- True Peak: ${referenceAnalysis.loudness.truePeak.toFixed(2)} dBTP`;

      if (referenceAnalysis.frequencies) {
        prompt += `

FREQUENCY ANALYSIS (Reference):
- Sub-Bass (20-60Hz): ${referenceAnalysis.frequencies.subBass.toFixed(1)}%
- Bass (60-250Hz): ${referenceAnalysis.frequencies.bass.toFixed(1)}%
- Low-Mid (250-500Hz): ${referenceAnalysis.frequencies.lowMid.toFixed(1)}%
- Mid (500-2kHz): ${referenceAnalysis.frequencies.mid.toFixed(1)}%
- High-Mid (2k-4kHz): ${referenceAnalysis.frequencies.highMid.toFixed(1)}%
- Presence (4k-6kHz): ${referenceAnalysis.frequencies.presence.toFixed(1)}%
- Brilliance (6k-20kHz): ${referenceAnalysis.frequencies.brilliance.toFixed(1)}%

FREQUENCY COMPARISON:
- Sub-Bass difference: ${(userAnalysis.frequencies!.subBass - referenceAnalysis.frequencies.subBass).toFixed(1)}%
- Bass difference: ${(userAnalysis.frequencies!.bass - referenceAnalysis.frequencies.bass).toFixed(1)}%
- Low-Mid difference: ${(userAnalysis.frequencies!.lowMid - referenceAnalysis.frequencies.lowMid).toFixed(1)}%
- Mid difference: ${(userAnalysis.frequencies!.mid - referenceAnalysis.frequencies.mid).toFixed(1)}%
- High-Mid difference: ${(userAnalysis.frequencies!.highMid - referenceAnalysis.frequencies.highMid).toFixed(1)}%
- Presence difference: ${(userAnalysis.frequencies!.presence - referenceAnalysis.frequencies.presence).toFixed(1)}%
- Brilliance difference: ${(userAnalysis.frequencies!.brilliance - referenceAnalysis.frequencies.brilliance).toFixed(1)}%`;
      }

      prompt += `

COMPARISON:
- Loudness difference: ${(userAnalysis.loudness!.integrated - referenceAnalysis.loudness.integrated).toFixed(2)} LUFS (${userAnalysis.loudness!.integrated < referenceAnalysis.loudness.integrated ? 'quieter' : 'louder'})
- Dynamic range difference: ${(userAnalysis.loudness!.range - referenceAnalysis.loudness.range).toFixed(2)} LU (${userAnalysis.loudness!.range > referenceAnalysis.loudness.range ? 'more dynamic' : 'less dynamic'})
- Peak difference: ${(userAnalysis.loudness!.truePeak - referenceAnalysis.loudness.truePeak).toFixed(2)} dB`;
    }

    prompt += `

Provide brief, actionable feedback (max 300 words) about:
${referenceAnalysis ? '1. How the user mix compares to the reference in loudness AND frequency balance' : '1. Loudness and frequency balance'}
2. ${referenceAnalysis ? 'Specific frequency adjustments needed to match the reference' : 'Which frequency bands need adjustment'}
3. Concrete mixing recommendations with specific frequency ranges and dB adjustments
4. One priority action to improve the mix

Keep the tone friendly and educational.`;

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 800,
      messages: [{
        role: 'user',
        content: prompt
      }]
    });

    const textContent = response.content.find(block => block.type === 'text');
    return textContent && 'text' in textContent ? textContent.text : 'Could not generate feedback';
    
  } catch (error) {
    console.error('AI Feedback error:', error);
    throw new Error('Could not get AI feedback');
  }
}