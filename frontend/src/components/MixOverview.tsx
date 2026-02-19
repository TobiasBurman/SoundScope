import type { AnalysisResponse } from "../types/analysis";

interface MixOverviewProps {
  result: AnalysisResponse;
}

interface StatusItem {
  label: string;
  status: "good" | "warn" | "bad";
  message: string;
}

function getLoudnessStatus(
  integrated: number,
  presetTarget?: number
): StatusItem {
  const target = presetTarget ?? -9;
  const diff = integrated - target;

  if (integrated > -4) {
    return {
      label: "Volume",
      status: "bad",
      message: "Extremely loud — likely distorted",
    };
  }
  if (Math.abs(diff) <= 2.5) {
    return {
      label: "Volume",
      status: "good",
      message: "Good loudness for your genre",
    };
  }
  if (diff < -2.5) {
    return {
      label: "Volume",
      status: "warn",
      message: `${Math.abs(diff).toFixed(0)} dB quieter than typical for this genre`,
    };
  }
  return {
    label: "Volume",
    status: "warn",
    message: `${diff.toFixed(0)} dB louder than typical — may lose dynamics`,
  };
}

function getDynamicsStatus(range: number): StatusItem {
  if (range < 2) {
    return {
      label: "Dynamics",
      status: "bad",
      message: "Extremely compressed — sounds flat and lifeless",
    };
  }
  if (range < 4) {
    return {
      label: "Dynamics",
      status: "warn",
      message: "Heavily compressed — consider backing off the limiter",
    };
  }
  if (range <= 12) {
    return {
      label: "Dynamics",
      status: "good",
      message: "Healthy dynamic range",
    };
  }
  return {
    label: "Dynamics",
    status: "warn",
    message: "Very dynamic — might sound inconsistent on small speakers",
  };
}

function getPeakStatus(truePeak: number): StatusItem {
  if (truePeak > 1.0) {
    return {
      label: "Headroom",
      status: "bad",
      message: "Heavy clipping — likely distorted",
    };
  }
  if (truePeak > 0) {
    return {
      label: "Headroom",
      status: "warn",
      message: "True peak above 0 dBTP — normal for loud masters",
    };
  }
  if (truePeak > -0.5) {
    return {
      label: "Headroom",
      status: "good",
      message: "Tight headroom — streaming safe",
    };
  }
  return {
    label: "Headroom",
    status: "good",
    message: "Clean headroom",
  };
}

const statusColors = {
  good: { bg: "bg-emerald-50 dark:bg-emerald-500/10", border: "border-emerald-300 dark:border-emerald-500/30", text: "text-emerald-700 dark:text-emerald-400", dot: "bg-emerald-500 dark:bg-emerald-400" },
  warn: { bg: "bg-amber-50 dark:bg-amber-500/10", border: "border-amber-300 dark:border-amber-500/30", text: "text-amber-700 dark:text-amber-400", dot: "bg-amber-500 dark:bg-amber-400" },
  bad: { bg: "bg-rose-50 dark:bg-rose-500/10", border: "border-rose-300 dark:border-rose-500/30", text: "text-rose-700 dark:text-rose-400", dot: "bg-rose-500 dark:bg-rose-400" },
};

export default function MixOverview({ result }: MixOverviewProps) {
  const loudness = result.userMix.analysis.loudness;
  if (!loudness) return null;

  const items: StatusItem[] = [
    getLoudnessStatus(loudness.integrated, result.presetComparison?.targetLufs),
    getDynamicsStatus(loudness.range),
    getPeakStatus(loudness.truePeak),
  ];

  const allGood = items.every((i) => i.status === "good");
  const hasBad = items.some((i) => i.status === "bad");

  return (
    <div className="rounded-xl p-6 bg-white dark:bg-white/[0.05] border border-gray-200 dark:border-white/[0.10] shadow-lg shadow-gray-200/50 dark:shadow-none dark:backdrop-blur-sm space-y-4">
      {/* Overall verdict */}
      <div className="flex items-center gap-3">
        <div
          className={`w-3 h-3 rounded-full ${
            allGood ? "bg-emerald-400" : hasBad ? "bg-rose-400" : "bg-amber-400"
          }`}
        />
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
          {allGood
            ? "Your mix sounds good"
            : hasBad
              ? "Your mix needs attention"
              : "Your mix is close — a few things to check"}
        </h2>
      </div>

      {/* Status items */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {items.map((item) => {
          const colors = statusColors[item.status];
          return (
            <div
              key={item.label}
              className={`rounded-lg px-4 py-3 ${colors.bg} border ${colors.border}`}
            >
              <div className="flex items-center gap-2 mb-1">
                <div className={`w-1.5 h-1.5 rounded-full ${colors.dot}`} />
                <span className="text-xs font-medium text-gray-600 dark:text-gray-300">
                  {item.label}
                </span>
              </div>
              <p className={`text-sm ${colors.text}`}>{item.message}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
