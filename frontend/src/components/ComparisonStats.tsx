interface ComparisonStatsProps {
  loudnessDiff: number;
  rangeDiff: number;
  peakDiff: number;
}

function getDiffColor(value: number): string {
  if (Math.abs(value) < 1) return 'text-green-400';
  if (Math.abs(value) < 3) return 'text-yellow-400';
  return 'text-red-400';
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
      </div>
      
      <div className="text-center">
        <p className="text-xs text-gray-400 mb-2">Dynamic Range Difference</p>
        <p className={`text-4xl font-bold ${getDiffColor(rangeDiff)}`}>
          {rangeDiff > 0 ? '+' : ''}
          {rangeDiff.toFixed(1)}
        </p>
        <p className="text-xs text-gray-500 mt-2">LU</p>
      </div>
      
      <div className="text-center">
        <p className="text-xs text-gray-400 mb-2">Peak Difference</p>
        <p className={`text-4xl font-bold ${getDiffColor(peakDiff)}`}>
          {peakDiff > 0 ? '+' : ''}
          {peakDiff.toFixed(1)}
        </p>
        <p className="text-xs text-gray-500 mt-2">dB</p>
      </div>
    </div>
  );
}