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


export interface SavedReference {
  id: string;
  userId: string;
  name: string;
  createdAt: number;
}


export type PresetId =
  | "streaming"
  | "edm"
  | "hiphop"
  | "podcast";


