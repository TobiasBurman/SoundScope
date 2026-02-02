 import Anthropic from '@anthropic-ai/sdk';
import { AudioAnalysisResult } from './audioAnalysis';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
});

export async function getAIFeedback(analysis: AudioAnalysisResult): Promise<string> {
  try {
    const prompt = `You are an experienced mixing engineer. Analyze this audio file and provide concrete feedback.

AUDIO DATA:
- Duration: ${analysis.duration.toFixed(1)} seconds
- Sample rate: ${analysis.sampleRate} Hz
- Bit depth: ${analysis.bitDepth || 'unknown'} bit
- Channels: ${analysis.channels === 1 ? 'Mono' : 'Stereo'}
- Format: ${analysis.format}

Provide brief, actionable feedback (max 150 words) about:
1. Technical quality (sample rate, bit depth)
2. Stereo/mono characteristics and implications
3. One concrete recommendation

Keep the tone friendly and educational.`;

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 500,
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