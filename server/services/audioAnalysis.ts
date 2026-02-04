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
  frequencies?: {
    subBass: number;      // 20-60Hz
    bass: number;         // 60-250Hz
    lowMid: number;       // 250-500Hz
    mid: number;          // 500-2000Hz
    highMid: number;      // 2000-4000Hz
    presence: number;     // 4000-6000Hz
    brilliance: number;   // 6000-20000Hz
  };
}

async function analyzeFrequencies(filePath: string) {
  return new Promise<{
    subBass: number;
    bass: number;
    lowMid: number;
    mid: number;
    highMid: number;
    presence: number;
    brilliance: number;
  } | undefined>((resolve) => {
    const bands = {
      subBass: 0,
      bass: 0,
      lowMid: 0,
      mid: 0,
      highMid: 0,
      presence: 0,
      brilliance: 0
    };

    ffmpeg(filePath)
      .audioFilters([
        'asplit=7[a1][a2][a3][a4][a5][a6][a7]',
        '[a1]bandpass=f=40:width_type=h:w=40,volumedetect[sub]',
        '[a2]bandpass=f=155:width_type=h:w=190,volumedetect[bass]',
        '[a3]bandpass=f=375:width_type=h:w=250,volumedetect[lowmid]',
        '[a4]bandpass=f=1250:width_type=h:w=1500,volumedetect[mid]',
        '[a5]bandpass=f=3000:width_type=h:w=2000,volumedetect[highmid]',
        '[a6]bandpass=f=5000:width_type=h:w=2000,volumedetect[pres]',
        '[a7]bandpass=f=13000:width_type=h:w=14000,volumedetect[bril]'
      ])
      .output('/dev/null')
      .on('stderr', (stderrLine) => {
        const meanMatch = stderrLine.match(/mean_volume: ([-\d.]+) dB/);
        if (meanMatch) {
          const db = parseFloat(meanMatch[1]);
          const normalized = Math.max(0, Math.min(100, (db + 60) * (100 / 60)));
          
          if (stderrLine.includes('[sub]')) bands.subBass = normalized;
          else if (stderrLine.includes('[bass]')) bands.bass = normalized;
          else if (stderrLine.includes('[lowmid]')) bands.lowMid = normalized;
          else if (stderrLine.includes('[mid]')) bands.mid = normalized;
          else if (stderrLine.includes('[highmid]')) bands.highMid = normalized;
          else if (stderrLine.includes('[pres]')) bands.presence = normalized;
          else if (stderrLine.includes('[bril]')) bands.brilliance = normalized;
        }
      })
      .on('end', () => {
        const hasData = Object.values(bands).some(v => v > 0);
        resolve(hasData ? bands : undefined);
      })
      .on('error', (error) => {
        console.error('Frequency analysis error:', error);
        resolve(undefined);
      })
      .run();
  });
}

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
    
    console.log('🎵 Analyzing frequencies...');
    const frequencyData = await analyzeFrequencies(filePath);
    
    const result: AudioAnalysisResult = {
      duration: metadata.format.duration || 0,
      sampleRate: metadata.format.sampleRate || 0,
      bitDepth: metadata.format.bitsPerSample,
      channels: metadata.format.numberOfChannels || 0,
      format: metadata.format.container || 'unknown',
      loudness: loudnessData,
      frequencies: frequencyData
    };
    
    return result;
    
  } catch (error) {
    console.error('Audio analysis error:', error);
    throw new Error('Could not analyze audio file');
  }
}