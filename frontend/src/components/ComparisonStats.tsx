interface ComparisonStatsProps {
  loudnessDiff: number;
  rangeDiff: number;
  peakDiff: number;
}

function getDiffColor(value: number): string {
  const abs = Math.abs(value);
  if (abs < 1) return 'text-green-400';
  if (abs < 2) return 'text-yellow-400';
  return 'text-red-400';  // red for both too high and too low
}

function getDiffLabel(value: number): string {
  if (Math.abs(value) < 1) return 'Close match';
  return value < 0 ? 'Your mix is lower' : 'Your mix is higher';
}

export default function ComparisonStats({ loudnessDiff, rangeDiff, peakDiff }: ComparisonStatsProps) {
  return (
    <div className="grid grid-cols-3 gap-8">
      <div className="text-center">
        <p className="text-xs text-gray-400 mb-2">Loudness Difference</p>
        <p className={`text-4xl font-bold ${getDiffColor(loudnessDiff)}`}>
          {loudnessDiff > 0 ? '+' : ''}
          {loudnessDiff.toFixed(1)}
        </p>
        <p className="text-xs text-gray-500 mt-2">LUFS</p>
        <p className={`text-xs mt-1 ${getDiffColor(loudnessDiff)}`}>{getDiffLabel(loudnessDiff)}</p>
      </div>

      <div className="text-center">
        <p className="text-xs text-gray-400 mb-2">Dynamic Range Difference</p>
        <p className={`text-4xl font-bold ${getDiffColor(rangeDiff)}`}>
          {rangeDiff > 0 ? '+' : ''}
          {rangeDiff.toFixed(1)}
        </p>
        <p className="text-xs text-gray-500 mt-2">LU</p>
        <p className={`text-xs mt-1 ${getDiffColor(rangeDiff)}`}>{getDiffLabel(rangeDiff)}</p>
      </div>

      <div className="text-center">
        <p className="text-xs text-gray-400 mb-2">Peak Difference</p>
        <p className={`text-4xl font-bold ${getDiffColor(peakDiff)}`}>
          {peakDiff > 0 ? '+' : ''}
          {peakDiff.toFixed(1)}
        </p>
        <p className="text-xs text-gray-500 mt-2">dB</p>
        <p className={`text-xs mt-1 ${getDiffColor(peakDiff)}`}>{getDiffLabel(peakDiff)}</p>
      </div>
    </div>
  );
}