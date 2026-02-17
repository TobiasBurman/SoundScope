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

  if (integrated > -6) {
    return {
      label: "Volume",
      status: "bad",
      message: "Way too loud — will sound distorted",
    };
  }
  if (Math.abs(diff) <= 2) {
    return {
      label: "Volume",
      status: "good",
      message: "Good loudness for your genre",
    };
  }
  if (diff < -2) {
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
  if (truePeak > 0) {
    return {
      label: "Headroom",
      status: "bad",
      message: "Clipping detected — will distort on speakers",
    };
  }
  if (truePeak > -0.5) {
    return {
      label: "Headroom",
      status: "warn",
      message: "Very close to clipping — leave at least -1 dBTP",
    };
  }
  return {
    label: "Headroom",
    status: "good",
    message: "Clean headroom, no clipping",
  };
}

const statusColors = {
  good: { bg: "bg-green-500/10", border: "border-green-500/30", text: "text-green-400", dot: "bg-green-400" },
  warn: { bg: "bg-yellow-500/10", border: "border-yellow-500/30", text: "text-yellow-400", dot: "bg-yellow-400" },
  bad: { bg: "bg-red-500/10", border: "border-red-500/30", text: "text-red-400", dot: "bg-red-400" },
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
    <div className="rounded-xl p-6 bg-[#202f3d] border border-[#2d3e4f] space-y-4">
      {/* Overall verdict */}
      <div className="flex items-center gap-3">
        <div
          className={`w-3 h-3 rounded-full ${
            allGood ? "bg-green-400" : hasBad ? "bg-red-400" : "bg-yellow-400"
          }`}
        />
        <h2 className="text-lg font-semibold text-white">
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
                <span className="text-xs font-medium text-gray-300">
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
