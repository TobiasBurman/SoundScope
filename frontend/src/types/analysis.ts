export interface Loudness {
    integrated: number;
    range: number;
    truePeak: number;
  }
  
  export interface FrequencyBands {
    subBass: number;
    bass: number;
    lowMid: number;
    mid: number;
    highMid: number;
    presence: number;
    brilliance: number;
  }
  
  export interface AudioAnalysis {
    loudness?: Loudness;
    frequencies?: FrequencyBands;
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
      targetLufs: number;
      targetTruePeak: number;
      loudnessDiff: number;
      truePeakDiff: number;
    };
    aiFeedback: string;
  }
  