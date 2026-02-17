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
    name: string;
    low: number;
    high: number;
    rmsDb: number;
  }[];
}

export interface UploadedFile {
  originalName: string;
  size: number;
}


export type PresetId =
  | "pop"
  | "edm"
  | "hiphop"
  | "rock"
  | "acoustic"
  | "podcast";

export interface SavedReference {
  id: string;
  userId: string;
  name: string;
  userMixUrl: string;
  userMixPath: string;
  userMixName: string;
  referenceUrl?: string;
  referencePath?: string;
  referenceName?: string;
  createdAt: number;
  analysisResult?: import("./analysis").AnalysisResponse;
}



