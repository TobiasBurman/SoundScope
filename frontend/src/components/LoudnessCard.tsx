interface LoudnessCardProps {
  title: string;
  integrated: number;
  range: number;
  truePeak: number;
  showHints?: boolean;
}

function getLoudnessHint(value: number): string {
  if (value > -5) return "Extremely loud — likely over-limited";
  if (value > -8) return "Loud, typical for competitive pop/EDM masters";
  if (value > -11) return "Solid loudness for modern music";
  if (value > -16) return "Good for streaming, plenty of dynamics";
  if (value > -20) return "Moderate, suits dynamic genres";
  return "Quiet, may need gain";
}

function getRangeHint(value: number): string {
  if (value < 3) return "Heavily compressed";
  if (value < 6) return "Tight, typical for modern masters";
  if (value < 10) return "Balanced dynamics";
  return "Very dynamic, less compressed";
}

function getPeakHint(value: number): string {
  if (value > 1.0) return "Heavy clipping — likely distorted";
  if (value > 0) return "Above 0 dBTP — normal for loud masters";
  if (value > -0.5) return "Tight headroom — streaming safe";
  if (value > -1) return "Industry standard for streaming";
  return "Conservative headroom";
}

export default function LoudnessCard({ title, integrated, range, truePeak, showHints = false }: LoudnessCardProps) {
  return (
    <div>
      <h3 className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-4">{title}</h3>
      <div className="space-y-5">
        <div>
          <p className="text-xs text-gray-400 mb-1">Integrated Loudness</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{integrated.toFixed(1)}</p>
          <p className="text-xs text-gray-500">LUFS</p>
          {showHints && (
            <p className="text-xs text-gray-400 mt-1">{getLoudnessHint(integrated)}</p>
          )}
        </div>
        <div>
          <p className="text-xs text-gray-400 mb-1">Dynamic Range</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{range.toFixed(1)}</p>
          <p className="text-xs text-gray-500">LU</p>
          {showHints && (
            <p className="text-xs text-gray-400 mt-1">{getRangeHint(range)}</p>
          )}
        </div>
        <div>
          <p className="text-xs text-gray-400 mb-1">True Peak</p>
          <p className={`text-2xl font-bold ${truePeak > 1.0 ? "text-red-400" : truePeak > 0 ? "text-amber-400" : "text-gray-900 dark:text-white"}`}>
            {truePeak.toFixed(1)}
          </p>
          <p className="text-xs text-gray-500">dBTP</p>
          {showHints && (
            <p className={`text-xs mt-1 ${truePeak > 1.0 ? "text-red-400" : truePeak > 0 ? "text-amber-400" : "text-gray-400"}`}>
              {getPeakHint(truePeak)}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
