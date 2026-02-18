interface PresetTargetCardProps {
  preset: string;
  targetLufs: number;
  targetTruePeak: number;
  loudnessDiff: number;
  truePeakDiff: number;
}

const PRESET_LABELS: Record<string, string> = {
  pop: "Pop / Top 40",
  edm: "EDM / Dance",
  hiphop: "Hip-Hop / Trap",
  rock: "Rock / Indie",
  acoustic: "Acoustic / Jazz",
  podcast: "Podcast / Voice",
};

function getLoudnessMessage(diff: number, target: number): { text: string; color: string } {
  const absDiff = Math.abs(diff);
  if (absDiff < 1) {
    return { text: `Right on target (${target} LUFS)`, color: "text-green-400" };
  }
  if (diff < 0) {
    return {
      text: `${absDiff.toFixed(1)} dB quieter than target (${target} LUFS)`,
      color: absDiff > 3 ? "text-yellow-400" : "text-blue-300",
    };
  }
  return {
    text: `${absDiff.toFixed(1)} dB louder than target (${target} LUFS)`,
    color: absDiff > 3 ? "text-yellow-400" : "text-blue-300",
  };
}

function getPeakMessage(diff: number, target: number): { text: string; color: string } {
  if (diff > 0) {
    return {
      text: `Peak is ${diff.toFixed(1)} dB above the safe limit (${target} dBTP)`,
      color: "text-red-400",
    };
  }
  if (diff > -0.5) {
    return {
      text: `Peak is close to the limit (${target} dBTP)`,
      color: "text-yellow-400",
    };
  }
  return {
    text: `Peak is safely below the limit (${target} dBTP)`,
    color: "text-green-400",
  };
}

const PresetTargetCard = ({
  preset,
  targetLufs,
  targetTruePeak,
  loudnessDiff,
  truePeakDiff,
}: PresetTargetCardProps) => {
  const loudness = getLoudnessMessage(loudnessDiff, targetLufs);
  const peak = getPeakMessage(truePeakDiff, targetTruePeak);
  const presetLabel = PRESET_LABELS[preset] || preset;

  return (
    <div className="bg-gray-50 dark:bg-[#1c2a38] border border-gray-200 dark:border-[#2d3e4f] rounded-lg p-5">
      <h4 className="text-sm font-semibold text-blue-600 dark:text-[#a2e4f4] mb-1">
        Target Profile
      </h4>
      <p className="text-xs text-gray-500 mb-4">{presetLabel}</p>

      <div className="space-y-4">
        <div>
          <p className="text-xs text-gray-500 mb-1">Loudness</p>
          <p className={`text-sm font-medium ${loudness.color}`}>
            {loudness.text}
          </p>
        </div>

        <div>
          <p className="text-xs text-gray-500 mb-1">Peak Level</p>
          <p className={`text-sm font-medium ${peak.color}`}>
            {peak.text}
          </p>
        </div>
      </div>
    </div>
  );
};

export default PresetTargetCard;
