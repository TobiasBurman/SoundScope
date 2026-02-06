export type PresetId =
  | "streaming"
  | "edm"
  | "podcast"
  | "hiphop";

export interface PresetTarget {
  name: string;
  description: string;
  targetLufs: number;
  maxTruePeak: number;
}

export const PRESETS: Record<PresetId, PresetTarget> = {
  streaming: {
    name: "Streaming Pop",
    description: "Balanced loudness for Spotify / Apple Music",
    targetLufs: -14,
    maxTruePeak: -1
  },

  edm: {
    name: "EDM Club",
    description: "Loud and punchy club master",
    targetLufs: -8,
    maxTruePeak: -0.8
  },

  hiphop: {
    name: "Hip-Hop",
    description: "Strong low-end with controlled dynamics",
    targetLufs: -10,
    maxTruePeak: -1
  },

  podcast: {
    name: "Podcast",
    description: "Broadcast loudness standard",
    targetLufs: -16,
    maxTruePeak: -1
  }
};
