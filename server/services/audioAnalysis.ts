import { parseFile } from 'music-metadata';
import ffmpeg from 'fluent-ffmpeg';
import { spawn } from 'child_process';

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

async function analyzeLoudness(filePath: string): Promise<{ integrated: number; range: number; truePeak: number } | undefined> {
  return new Promise((resolve) => {
    let stderr = '';

    ffmpeg(filePath)
      .audioFilters('ebur128=peak=true')
      .format('null')
      .on('stderr', (line: string) => {
        stderr += line + '\n';
      })
      .on('end', () => {
        try {
          // Summary lines have leading whitespace (unlike per-second measurement lines)
          const intMatch = stderr.match(/^\s+I:\s+([-\d.]+)\s+LUFS\s*$/m);
          const lraMatch = stderr.match(/^\s+LRA:\s+([-\d.]+)\s+LU\s*$/m);
          const peakMatch = stderr.match(/^\s+Peak:\s+([-\d.]+)\s+dBFS\s*$/m);

          if (intMatch && lraMatch && peakMatch) {
            resolve({
              integrated: parseFloat(intMatch[1]),
              range: parseFloat(lraMatch[1]),
              truePeak: parseFloat(peakMatch[1])
            });
          } else {
            console.error('[loudness] ebur128 parse failed. Stderr tail:', stderr.slice(-800));
            resolve(undefined);
          }
        } catch (error) {
          console.error('[loudness] Parse error:', error);
          resolve(undefined);
        }
      })
      .on('error', (error: Error) => {
        console.error('[loudness] ffmpeg error:', error);
        resolve(undefined);
      })
      .output('-')
      .run();
  });
}

// --- Single-pass: reads the file ONCE and measures all 12 bands simultaneously ---
async function analyzeFrequenciesSinglePass(filePath: string): Promise<FrequencyBand[] | undefined> {
  return new Promise((resolve) => {
    const n = FREQUENCY_BANDS.length;

    const splits = FREQUENCY_BANDS.map((_, i) => `[s${i}]`).join('');
    const chains = FREQUENCY_BANDS.map((band, i) =>
      `[s${i}]` +
      `highpass=f=${band.low}:poles=2,highpass=f=${band.low}:poles=2,` +
      `lowpass=f=${band.high}:poles=2,lowpass=f=${band.high}:poles=2,` +
      `astats=metadata=1:reset=0[o${i}]`
    ).join(';');

    const filterComplex = `asplit=${n}${splits};${chains}`;

    const maps: string[] = [];
    for (let i = 0; i < n; i++) {
      maps.push('-map', `[o${i}]`, '-f', 'null', '/dev/null');
    }

    const ffmpegBin = process.env.FFMPEG_PATH || 'ffmpeg';
    const args = ['-i', filePath, '-filter_complex', filterComplex, ...maps];

    let stderr = '';
    const proc = spawn(ffmpegBin, args, { stdio: ['ignore', 'ignore', 'pipe'] });

    proc.stderr!.on('data', (data: Buffer) => {
      stderr += data.toString();
    });

    proc.on('close', (code) => {
      console.log(`[freq single-pass] exit code: ${code}`);
      // Log enough stderr so we can see the actual astats output format
      console.log('[freq single-pass] stderr (last 3000 chars):\n' + stderr.slice(-3000));

      try {
        // Strategy 1: parse by [Parsed_astats_N @ ...] RMS level dB:
        const results = FREQUENCY_BANDS.map((band, i) => {
          const rx = new RegExp(`\\[Parsed_astats_${i} @[^\\]]+\\]\\s*RMS level dB:\\s*([\\-\\d.]+)`);
          const m = stderr.match(rx);
          return {
            name: band.name, low: band.low, high: band.high,
            rmsDb: m ? Math.round(parseFloat(m[1]) * 10) / 10 : -100
          };
        });

        const allFailed = results.every(r => r.rmsDb === -100);

        if (allFailed) {
          // Strategy 2: collect ALL "RMS level dB:" values in order of appearance
          // Each band outputs 1 value (mono) or 3 values (stereo: ch1, ch2, overall)
          // Try to extract N values and use every Kth one
          const allRms: number[] = [];
          const rmsRx = /RMS level dB:\s*([-\d.]+)/g;
          let match;
          while ((match = rmsRx.exec(stderr)) !== null) {
            allRms.push(parseFloat(match[1]));
          }

          console.log(`[freq single-pass] Strategy 2: found ${allRms.length} RMS values`);

          if (allRms.length >= n) {
            // Determine step: if 3*n values → stereo (take every 3rd), if n values → mono
            const step = allRms.length >= 3 * n ? 3 : (allRms.length >= 2 * n ? 2 : 1);
            const mapped = FREQUENCY_BANDS.map((band, i) => ({
              name: band.name, low: band.low, high: band.high,
              rmsDb: Math.round(allRms[i * step] * 10) / 10
            }));
            console.log('[freq single-pass] Strategy 2 results:', mapped.map(r => `${r.name}: ${r.rmsDb}`));
            resolve(mapped);
            return;
          }

          console.error(`[freq single-pass] Both strategies failed (found ${allRms.length} RMS values)`);
          resolve(undefined);
          return;
        }

        results.forEach(r => console.log(`   ${r.name} (${r.low}-${r.high}Hz): ${r.rmsDb} dB RMS`));
        console.log('[freq single-pass] complete');
        resolve(results);
      } catch (err) {
        console.error('[freq single-pass] parse error:', err);
        resolve(undefined);
      }
    });

    proc.on('error', (err) => {
      console.error('[freq single-pass] spawn error:', err);
      resolve(undefined);
    });
  });
}

// --- Fallback: original 12-process approach (known working) ---
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
      .on('stderr', (line: string) => { stderrOutput += line + '\n'; })
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

async function analyzeFrequenciesFallback(filePath: string): Promise<FrequencyBand[] | undefined> {
  console.log('[freq fallback] running 12 individual ffmpeg processes...');
  try {
    const dbValues = await Promise.all(
      FREQUENCY_BANDS.map(band => analyzeBand(filePath, band.low, band.high))
    );
    return FREQUENCY_BANDS.map((band, i) => {
      const rmsDb = Math.round(dbValues[i] * 10) / 10;
      console.log(`   ${band.name} (${band.low}-${band.high}Hz): ${rmsDb} dB RMS`);
      return { name: band.name, low: band.low, high: band.high, rmsDb };
    });
  } catch (error) {
    console.error('[freq fallback] error:', error);
    return undefined;
  }
}

export async function analyzeAudioFile(filePath: string): Promise<AudioAnalysisResult> {
  try {
    const metadata = await parseFile(filePath);

    console.log('Starting loudness + frequency analysis in parallel...');

    // Run loudness and single-pass frequency analysis simultaneously
    const [loudnessData, freqSinglePass] = await Promise.all([
      analyzeLoudness(filePath),
      analyzeFrequenciesSinglePass(filePath)
    ]);

    // Fall back to individual processes only if single-pass completely failed
    const frequencyData = freqSinglePass ?? await analyzeFrequenciesFallback(filePath);

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
