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

function analyzeBand(filePath: string, low: number, high: number): Promise<number> {
  return new Promise((resolve) => {
    let stderrOutput = '';

    // Use 4th-order Butterworth highpass + lowpass for clean band isolation
    const filters = [
      `highpass=f=${low}:poles=2`,
      `highpass=f=${low}:poles=2`,
      `lowpass=f=${high}:poles=2`,
      `lowpass=f=${high}:poles=2`,
      'astats=metadata=1:reset=0'
    ].join(',');

    ffmpeg(filePath)
      .audioFilters(filters)
      .format('null')
      .on('stderr', (line: string) => {
        stderrOutput += line + '\n';
      })
      .on('end', () => {
        // Extract RMS level from astats output
        const rmsMatch = stderrOutput.match(/RMS level dB:\s*([-\d.]+)/);
        if (rmsMatch) {
          resolve(parseFloat(rmsMatch[1]));
        } else {
          // Fallback: try RMS_level
          const altMatch = stderrOutput.match(/Overall.*?RMS level dB:\s*([-\d.]+)/s);
          resolve(altMatch ? parseFloat(altMatch[1]) : -100);
        }
      })
      .on('error', () => resolve(-100))
      .output('-')
      .run();
  });
}

async function analyzeFrequencies(filePath: string) {
  const bands = [
    { name: 'subBass', low: 20, high: 60 },
    { name: 'bass', low: 60, high: 250 },
    { name: 'lowMid', low: 250, high: 500 },
    { name: 'mid', low: 500, high: 2000 },
    { name: 'highMid', low: 2000, high: 4000 },
    { name: 'presence', low: 4000, high: 6000 },
    { name: 'brilliance', low: 6000, high: 20000 }
  ];

  try {
    // Run all bands in parallel
    const dbValues = await Promise.all(
      bands.map(band => analyzeBand(filePath, band.low, band.high))
    );

    const results: Record<string, number> = {};

    // Find the loudest band as reference point
    const maxDb = Math.max(...dbValues.filter(v => v > -100));

    bands.forEach((band, i) => {
      const dbValue = dbValues[i];
      console.log(`   ${band.name} (${band.low}-${band.high}Hz): ${dbValue.toFixed(1)} dBFS`);

      // Normalize relative to loudest band (0-100 scale)
      // Loudest band = 100, each 1dB quieter = ~2.5 points less
      const relative = dbValue - maxDb; // will be 0 or negative
      results[band.name] = Math.max(0, Math.min(100, 100 + (relative * 2.5)));
    });

    console.log('🎵 Frequency analysis complete:', results);

    return {
      subBass: results.subBass,
      bass: results.bass,
      lowMid: results.lowMid,
      mid: results.mid,
      highMid: results.highMid,
      presence: results.presence,
      brilliance: results.brilliance
    };
  } catch (error) {
    console.error('Frequency analysis error:', error);
    return undefined;
  }
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