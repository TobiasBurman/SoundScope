export interface AudioAnalysis {
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

export interface UploadedFile {
  originalName: string;
  size: number;
}

export interface AnalysisResponse {
  message: string;
  userMix: {
    file: UploadedFile;
    analysis: AudioAnalysis;
  };
  reference: {
    file: UploadedFile;
    analysis: AudioAnalysis;
  } | null;
  comparison: {
    loudnessDiff: number;
    rangeDiff: number;
    peakDiff: number;
  } | null;
  aiFeedback: string;
  preset?: string;

presetComparison?: {
  preset: string;
  targetLufs: number;
  targetTruePeak: number;
  loudnessDiff: number;
  truePeakDiff: number;
};
}

