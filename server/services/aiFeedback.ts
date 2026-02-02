import Anthropic from "@anthropic-ai/sdk";
import { AudioAnalysisResult } from "./audioAnalysis";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
});

export async function getAIFeedback(
  analysis: AudioAnalysisResult,
): Promise<string> {
  try {
    let prompt = `You are an experienced mixing engineer. Analyze this audio file and provide concrete feedback.

AUDIO DATA:
- Duration: ${analysis.duration.toFixed(1)} seconds
- Sample rate: ${analysis.sampleRate} Hz
- Bit depth: ${analysis.bitDepth || "unknown"} bit
- Channels: ${analysis.channels === 1 ? "Mono" : "Stereo"}
- Format: ${analysis.format}`;

    // Add loudness data if available
    if (analysis.loudness) {
      prompt += `

LOUDNESS ANALYSIS:
- Integrated Loudness: ${analysis.loudness.integrated.toFixed(2)} LUFS
- Loudness Range: ${analysis.loudness.range.toFixed(2)} LU
- True Peak: ${analysis.loudness.truePeak.toFixed(2)} dBTP`;
    }

    prompt += `

Provide brief, actionable feedback (max 200 words) about:
1. Loudness levels (is it appropriate for streaming platforms like Spotify -14 LUFS, YouTube -13 LUFS?)
2. Dynamic range (is it over-compressed or does it have good dynamics?)
3. Headroom and peak levels (risk of clipping?)
4. One concrete recommendation for improvement

Keep the tone friendly and educational.`;

    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 600,
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    const textContent = response.content.find((block) => block.type === "text");
    return textContent && "text" in textContent
      ? textContent.text
      : "Could not generate feedback";
  } catch (error) {
    console.error("AI Feedback error:", error);
    throw new Error("Could not get AI feedback");
  }
}
