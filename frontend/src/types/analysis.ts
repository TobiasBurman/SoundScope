export interface Loudness {
  integrated: number;
  range: number;
  truePeak: number;
}

export interface FrequencyBand {
  name: string;
  low: number;
  high: number;
  rmsDb: number;
}

export interface AudioAnalysis {
  loudness?: Loudness;
  frequencies?: FrequencyBand[];
}

export interface AnalysisResponse {
  userMix: {
    analysis: AudioAnalysis;
  };
  reference?: {
    analysis: AudioAnalysis;
  } | null;
  comparison?: {
    loudnessDiff: number;
    rangeDiff: number;
    peakDiff: number;
  } | null;
  presetComparison?: {
    preset: string;
    targetLufs: number;
    targetTruePeak: number;
    loudnessDiff: number;
    truePeakDiff: number;
  };
  aiFeedback: AIFeedbackResult;
}

export interface AIFeedbackResult {
  verdict: string;
  issues: {
    severity: "critical" | "warning" | "info";
    title: string;
    detail: string;
    action: string;
  }[];
  summary: string;
}
