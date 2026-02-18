interface LoudnessCardProps {
  title: string;
  integrated: number;
  range: number;
  truePeak: number;
  showHints?: boolean;
}

function getLoudnessHint(value: number): string {
  if (value > -8) return "Very loud, likely clipping";
  if (value > -11) return "Loud, typical for pop/EDM";
  if (value > -16) return "Good for streaming platforms";
  if (value > -20) return "Moderate, good for dynamic genres";
  return "Quiet, may need gain";
}

function getRangeHint(value: number): string {
  if (value < 3) return "Heavily compressed";
  if (value < 6) return "Tight, typical for modern masters";
  if (value < 10) return "Balanced dynamics";
  return "Very dynamic, less compressed";
}

function getPeakHint(value: number): string {
  if (value > 0) return "Clipping — will distort on playback";
  if (value > -0.5) return "Borderline, risk of inter-sample peaks";
  if (value > -1.5) return "Safe for most platforms";
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
          <p className={`text-2xl font-bold ${truePeak > 0 ? "text-red-400" : "text-gray-900 dark:text-white"}`}>
            {truePeak.toFixed(1)}
          </p>
          <p className="text-xs text-gray-500">dBTP</p>
          {showHints && (
            <p className={`text-xs mt-1 ${truePeak > 0 ? "text-red-400" : "text-gray-400"}`}>
              {getPeakHint(truePeak)}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
