import { parseFile } from 'music-metadata';
import ffmpeg from 'fluent-ffmpeg';
import { promisify } from 'util';

export interface AudioAnalysisResult {
  duration: number;
  sampleRate: number;
  bitDepth?: number;
  channels: number;
  format: string;
  loudness?: {
    integrated: number;
    range: number;
    truePeak: number;
  };
}

// Analyze loudness with ffmpeg

async function analyzeLoudness(filePath: string) {
  return new Promise<{ integrated: number; range: number; truePeak: number } | undefined>((resolve) => {
    let stderrOutput = '';
    
    ffmpeg(filePath)
      .audioFilters('loudnorm=print_format=json')
      .format('null')
      .on('stderr', (stderrLine) => {
        stderrOutput += stderrLine;
      })
      .on('end', () => {
        try {
          // Parse loudness data from stderr
          const jsonMatch = stderrOutput.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            const data = JSON.parse(jsonMatch[0]);
            resolve({
              integrated: parseFloat(data.input_i),
              range: parseFloat(data.input_lra),
              truePeak: parseFloat(data.input_tp)
            });
          } else {
            console.log('No loudness JSON found in output');
            resolve(undefined);
          }
        } catch (error) {
          console.error('Failed to parse loudness data:', error);
          resolve(undefined);
        }
      })
      .on('error', (error) => {
        console.error('Loudness analysis error:', error);
        resolve(undefined);
      })
      .save('-');
  });
}

export async function analyzeAudioFile(filePath: string): Promise<AudioAnalysisResult> {
  try {
    const metadata = await parseFile(filePath);
    
    console.log('📊 Analyzing loudness...');
    const loudnessData = await analyzeLoudness(filePath);
    
    const result: AudioAnalysisResult = {
      duration: metadata.format.duration || 0,
      sampleRate: metadata.format.sampleRate || 0,
      bitDepth: metadata.format.bitsPerSample,
      channels: metadata.format.numberOfChannels || 0,
      format: metadata.format.container || 'unknown',
      loudness: loudnessData
    };
    
    return result;
    
  } catch (error) {
    console.error('Audio analysis error:', error);
    throw new Error('Could not analyze audio file');
  }
}