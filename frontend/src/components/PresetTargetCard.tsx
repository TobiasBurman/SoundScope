interface PresetTargetCardProps {
    targetLufs: number;
    targetTruePeak: number;
    loudnessDiff: number;
    truePeakDiff: number;
  }
  
  const formatDiff = (value: number) => {
    const sign = value > 0 ? "+" : "";
    return `${sign}${value.toFixed(2)}`;
  };
  
  const PresetTargetCard = ({
    targetLufs,
    targetTruePeak,
    loudnessDiff,
    truePeakDiff
  }: PresetTargetCardProps) => {
    const loudnessColor =
      Math.abs(loudnessDiff) < 1 ? "text-green-400" : "text-yellow-400";
  
    const peakColor =
      truePeakDiff <= 0 ? "text-green-400" : "text-red-400";
  
    return (
      <div className="bg-[#1c2a38] border border-[#2d3e4f] rounded-lg p-5">
        <h4 className="text-sm font-semibold text-[#a2e4f4] mb-4">
          Target Profile
        </h4>
  
        <div className="space-y-2 text-sm text-gray-300">
  
          <div className="flex justify-between">
            <span>Target Loudness</span>
            <span>{targetLufs} LUFS</span>
          </div>
  
          <div className="flex justify-between">
            <span>Loudness Diff</span>
            <span className={loudnessColor}>
              {formatDiff(loudnessDiff)} LUFS
            </span>
          </div>
  
          <div className="flex justify-between">
            <span>Target True Peak</span>
            <span>{targetTruePeak} dBTP</span>
          </div>
  
          <div className="flex justify-between">
            <span>True Peak Diff</span>
            <span className={peakColor}>
              {formatDiff(truePeakDiff)} dB
            </span>
          </div>
  
        </div>
      </div>
    );
  };
  
  export default PresetTargetCard;
  