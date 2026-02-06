import { parseFile } from 'music-metadata';
import ffmpeg from 'fluent-ffmpeg';

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
    subBass: number;
    bass: number;
    lowMid: number;
    mid: number;
    highMid: number;
    presence: number;
    brilliance: number;
  };
}

async function analyzeLoudness(filePath: string) {
  return new Promise<{ integrated: number; range: number; truePeak: number } | undefined>((resolve) => {
    let stderrOutput = '';
    
    ffmpeg(filePath)
      .audioFilters('loudnorm=print_format=json')
      .format('null')
      .on('stderr', (stderrLine: string) => {
        stderrOutput += stderrLine;
      })
      .on('end', () => {
        try {
          if (!stderrOutput) {
            resolve(undefined);
            return;
          }
          
          const jsonMatch = stderrOutput.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            const data = JSON.parse(jsonMatch[0]);
            resolve({
              integrated: parseFloat(data.input_i),
              range: parseFloat(data.input_lra),
              truePeak: parseFloat(data.input_tp)
            });
          } else {
            resolve(undefined);
          }
        } catch (error) {
          console.error('Failed to parse loudness data:', error);
          resolve(undefined);
        }
      })
      .on('error', (error: Error) => {
        console.error('Loudness analysis error:', error);
        resolve(undefined);
      })
      .output('-')
      .run();
  });
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
    
    const bands = [
      { name: 'subBass', low: 20, high: 60 },
      { name: 'bass', low: 60, high: 250 },
      { name: 'lowMid', low: 250, high: 500 },
      { name: 'mid', low: 500, high: 2000 },
      { name: 'highMid', low: 2000, high: 4000 },
      { name: 'presence', low: 4000, high: 6000 },
      { name: 'brilliance', low: 6000, high: 20000 }
    ];

    const results: Record<string, number> = {};
    let completed = 0;

    bands.forEach(band => {
      let stderrOutput = '';
      const centerFreq = (band.low + band.high) / 2;
      const bandwidth = band.high - band.low;
      
      ffmpeg(filePath)
        .audioFilters(`bandpass=f=${centerFreq}:width_type=h:w=${bandwidth},volumedetect`)
        .format('null')
        .on('stderr', (line: string) => {
          stderrOutput += line + '\n';
        })
        .on('end', () => {
          console.log(`✅ ${band.name} analysis complete`);
          
          const meanMatch = stderrOutput.match(/mean_volume:\s*([-\d.]+)\s*dB/);
          if (meanMatch) {
            const meanDb = parseFloat(meanMatch[1]);
            console.log(`   ${band.name}: ${meanDb} dB`);
            // Convert dB to percentage (typical range: -60dB to -20dB)
            const normalized = Math.max(0, Math.min(100, ((meanDb + 60) / 40) * 100));
            results[band.name] = normalized;
          } else {
            console.log(`   ${band.name}: no data found`);
            results[band.name] = 0;
          }

          completed++;
          
          if (completed === bands.length) {
            console.log('🎵 All frequency bands analyzed:', results);
            resolve({
              subBass: results.subBass || 0,
              bass: results.bass || 0,
              lowMid: results.lowMid || 0,
              mid: results.mid || 0,
              highMid: results.highMid || 0,
              presence: results.presence || 0,
              brilliance: results.brilliance || 0
            });
          }
        })
        .on('error', (error: Error) => {
          console.error(`❌ Error analyzing ${band.name}:`, error.message);
          results[band.name] = 0;
          completed++;
          
          if (completed === bands.length) {
            resolve({
              subBass: results.subBass || 0,
              bass: results.bass || 0,
              lowMid: results.lowMid || 0,
              mid: results.mid || 0,
              highMid: results.highMid || 0,
              presence: results.presence || 0,
              brilliance: results.brilliance || 0
            });
          }
        })
        .output('-')
        .run();
    });
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