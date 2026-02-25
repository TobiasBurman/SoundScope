import { parseFile } from 'music-metadata';
import ffmpeg from 'fluent-ffmpeg';

export interface FrequencyBand {
  name: string;
  low: number;
  high: number;
  rmsDb: number;
}

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
  frequencies?: FrequencyBand[];
}

const FREQUENCY_BANDS = [
  { name: "Sub-Bass", low: 20, high: 60 },
  { name: "Bass", low: 60, high: 150 },
  { name: "Upper Bass", low: 150, high: 250 },
  { name: "Low-Mid", low: 250, high: 400 },
  { name: "Mid", low: 400, high: 800 },
  { name: "Upper Mid", low: 800, high: 1500 },
  { name: "Presence Low", low: 1500, high: 2500 },
  { name: "Presence", low: 2500, high: 4000 },
  { name: "Upper Presence", low: 4000, high: 5500 },
  { name: "Brilliance Low", low: 5500, high: 8000 },
  { name: "Brilliance", low: 8000, high: 12000 },
  { name: "Air", low: 12000, high: 20000 },
];

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
          if (!stderrOutput) { resolve(undefined); return; }
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
        const rmsMatch = stderrOutput.match(/RMS level dB:\s*([-\d.]+)/);
        if (rmsMatch) {
          resolve(parseFloat(rmsMatch[1]));
        } else {
          const altMatch = stderrOutput.match(/Overall.*?RMS level dB:\s*([-\d.]+)/s);
          resolve(altMatch ? parseFloat(altMatch[1]) : -100);
        }
      })
      .on('error', () => resolve(-100))
      .output('-')
      .run();
  });
}

async function analyzeFrequencies(filePath: string): Promise<FrequencyBand[] | undefined> {
  try {
    const dbValues = await Promise.all(
      FREQUENCY_BANDS.map(band => analyzeBand(filePath, band.low, band.high))
    );

    const results: FrequencyBand[] = FREQUENCY_BANDS.map((band, i) => {
      const rmsDb = Math.round(dbValues[i] * 10) / 10;
      console.log(`   ${band.name} (${band.low}-${band.high}Hz): ${rmsDb} dB RMS`);
      return { name: band.name, low: band.low, high: band.high, rmsDb };
    });

    console.log('Frequency analysis complete');
    return results;
  } catch (error) {
    console.error('Frequency analysis error:', error);
    return undefined;
  }
}

export async function analyzeAudioFile(filePath: string): Promise<AudioAnalysisResult> {
  try {
    const metadata = await parseFile(filePath);

    // Run loudness and all 12 frequency bands in parallel (was sequential before)
    console.log('Analyzing loudness and frequencies in parallel...');
    const [loudnessData, frequencyData] = await Promise.all([
      analyzeLoudness(filePath),
      analyzeFrequencies(filePath)
    ]);

    return {
      duration: metadata.format.duration || 0,
      sampleRate: metadata.format.sampleRate || 0,
      bitDepth: metadata.format.bitsPerSample,
      channels: metadata.format.numberOfChannels || 0,
      format: metadata.format.container || 'unknown',
      loudness: loudnessData,
      frequencies: frequencyData
    };

  } catch (error) {
    console.error('Audio analysis error:', error);
    throw new Error('Could not analyze audio file');
  }
}
