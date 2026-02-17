export type PresetId =
  | "pop"
  | "edm"
  | "podcast"
  | "hiphop"
  | "rock"
  | "acoustic";

export interface PresetTarget {
  name: string;
  description: string;
  targetLufs: number;
  maxTruePeak: number;
}

export const PRESETS: Record<PresetId, PresetTarget> = {
  pop: {
    name: "Pop / Top 40",
    description: "Modern competitive master",
    targetLufs: -9,
    maxTruePeak: -1
  },

  edm: {
    name: "EDM / Dance",
    description: "Loud and punchy club master",
    targetLufs: -7,
    maxTruePeak: -1
  },

  hiphop: {
    name: "Hip-Hop / Trap",
    description: "Hard-hitting with strong low-end",
    targetLufs: -8,
    maxTruePeak: -1
  },

  rock: {
    name: "Rock / Indie",
    description: "Dynamic with punch",
    targetLufs: -10,
    maxTruePeak: -1
  },

  acoustic: {
    name: "Acoustic / Jazz",
    description: "Open dynamics, natural sound",
    targetLufs: -14,
    maxTruePeak: -1
  },

  podcast: {
    name: "Podcast / Voice",
    description: "Clear speech, broadcast standard",
    targetLufs: -16,
    maxTruePeak: -1
  }
};
