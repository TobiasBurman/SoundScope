import { parseFile } from 'music-metadata';

export interface AudioAnalysisResult {
  duration: number;
  sampleRate: number;
  bitDepth?: number;
  channels: number;
  format: string;
  loudness?: number;
  peakLevel?: number;
}

// Analysera en ljudfil
export async function analyzeAudioFile(filePath: string): Promise<AudioAnalysisResult> {
  try {
    const metadata = await parseFile(filePath);
    
    const result: AudioAnalysisResult = {
      duration: metadata.format.duration || 0,
      sampleRate: metadata.format.sampleRate || 0,
      bitDepth: metadata.format.bitsPerSample,
      channels: metadata.format.numberOfChannels || 0,
      format: metadata.format.container || 'unknown'
    };
    
    return result;
    
  } catch (error) {
    console.error('Fel vid audioanalys:', error);
    throw new Error('Kunde inte analysera ljudfilen');
  }
}