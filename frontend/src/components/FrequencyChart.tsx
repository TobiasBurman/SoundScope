import { useState } from "react";
import { ChevronDown } from "lucide-react";
import type { FrequencyBand } from "../types/analysis";

interface FrequencyChartProps {
  userMix: FrequencyBand[];
  reference?: FrequencyBand[];
}

interface GroupDef {
  label: string;
  shortLabel: string;
  range: string;
  bands: number[];
  description: string;
  highHint: string;
  lowHint: string;
}

const GROUPS: GroupDef[] = [
  {
    label: "Sub-Bass",
    shortLabel: "Sub",
    range: "20–60 Hz",
    bands: [0],
    description: "The deep rumble you feel. Kick drums, 808s.",
    highHint: "Boomy — may sound muddy on speakers. Try a high-pass at 30–40 Hz.",
    lowHint: "Thin low-end. If your genre needs weight, boost gently around 40–60 Hz.",
  },
  {
    label: "Bass",
    shortLabel: "Bass",
    range: "60–250 Hz",
    bands: [1, 2],
    description: "The body and warmth. Bass guitar, kick punch.",
    highHint: "Heavy — can mask vocals and mids. Try cutting 2–3 dB around 100–200 Hz.",
    lowHint: "Lacks warmth. Boosting 80–120 Hz can add fullness.",
  },
  {
    label: "Low-Mids",
    shortLabel: "Lo-Mid",
    range: "250–800 Hz",
    bands: [3, 4],
    description: "Fullness and body. Most common area for muddiness.",
    highHint: "Sounds 'boxy' or 'muddy'. Cut 2–4 dB around 300–500 Hz.",
    lowHint: "May sound thin or hollow.",
  },
  {
    label: "Mids",
    shortLabel: "Mid",
    range: "800–2.5k Hz",
    bands: [5, 6],
    description: "Where vocals and melodies live. Critical for clarity.",
    highHint: "Can sound harsh or nasal.",
    lowHint: "Vocals may sound distant or buried.",
  },
  {
    label: "Presence",
    shortLabel: "Pres",
    range: "2.5–5.5k Hz",
    bands: [7, 8],
    description: "Clarity and 'edge'. Makes things cut through.",
    highHint: "Fatiguing over time. Try a gentle dip around 3–4 kHz.",
    lowHint: "Mix may lack definition. A subtle boost here helps vocals cut through.",
  },
  {
    label: "Highs",
    shortLabel: "High",
    range: "5.5–12k Hz",
    bands: [9, 10],
    description: "Sparkle and detail. Cymbals, vocal breathiness.",
    highHint: "Sibilant ('ssss') or harsh. Try a de-esser or shelving EQ.",
    lowHint: "Sounds dull or dark. A high-shelf boost at 8–10 kHz adds brightness.",
  },
  {
    label: "Air",
    shortLabel: "Air",
    range: "12–20k Hz",
    bands: [11],
    description: "The shimmer on top. A little goes a long way.",
    highHint: "Likely from limiting artifacts. Usually not a problem.",
    lowHint: "Normal — this range naturally rolls off.",
  },
];

function avgDb(bands: FrequencyBand[], indices: number[]): number {
  const vals = indices.map((i) => bands[i]?.rmsDb).filter((v) => v != null && v > -100);
  if (vals.length === 0) return -100;
  return vals.reduce((a, b) => a + b, 0) / vals.length;
}

type BandStatus = "strong" | "present" | "normal" | "low" | "weak";

function getStatus(db: number, neighborAvg: number, refDb: number | null, isAirBand = false): {
  status: BandStatus;
  label: string;
  color: string;
  barColor: string;
} {
  if (refDb != null && refDb > -100) {
    const diff = db - refDb;
    if (diff > 6) return { status: "strong", label: "Stronger than reference", color: "text-yellow-400", barColor: "bg-yellow-400" };
    if (diff > 3) return { status: "present", label: "Slightly above reference", color: "text-amber-300", barColor: "bg-amber-400" };
    if (diff < -6) return { status: "weak", label: "Weaker than reference", color: "text-yellow-400", barColor: "bg-yellow-400" };
    if (diff < -3) return { status: "low", label: "Slightly below reference", color: "text-amber-300", barColor: "bg-amber-400" };
    return { status: "normal", label: "Matches reference", color: "text-green-400", barColor: "bg-blue-500" };
  }

  const diff = db - neighborAvg;

  // Air band naturally rolls off — use wider thresholds so it doesn't
  // get flagged on every well-mastered track
  const highThresh = isAirBand ? 12 : 8;
  const midHighThresh = isAirBand ? 8 : 4;
  const lowThresh = isAirBand ? -14 : -8;
  const midLowThresh = isAirBand ? -10 : -4;

  if (diff > highThresh) return { status: "strong", label: "Strong", color: "text-yellow-400", barColor: "bg-yellow-400" };
  if (diff > midHighThresh) return { status: "present", label: "Present", color: "text-amber-300", barColor: "bg-amber-400" };
  if (diff < lowThresh) return { status: "weak", label: "Weak", color: "text-yellow-400", barColor: "bg-yellow-400" };
  if (diff < midLowThresh) return { status: "low", label: "Low", color: "text-amber-300", barColor: "bg-amber-400" };
  return { status: "normal", label: "Balanced", color: "text-green-400", barColor: "bg-blue-500" };
}

function toPct(db: number, minDb: number, range: number): number {
  if (db <= -100) return 0;
  return Math.max(8, Math.round(((db - minDb) / range) * 85 + 15));
}

const FrequencyChart = ({ userMix, reference }: FrequencyChartProps) => {
  const [expandedBand, setExpandedBand] = useState<number | null>(null);

  const userGroups = GROUPS.map((g) => avgDb(userMix, g.bands));
  const refGroups = reference ? GROUPS.map((g) => avgDb(reference, g.bands)) : null;

  // Normalize for the visual chart
  const allVals = [...userGroups, ...(refGroups || [])].filter((v) => v > -100);
  const maxDb = Math.max(...allVals);
  const minDb = Math.min(...allVals);
  const range = maxDb - minDb || 1;

  // Get statuses
  const statuses = GROUPS.map((_, i) => {
    const prev = i > 0 ? userGroups[i - 1] : null;
    const next = i < userGroups.length - 1 ? userGroups[i + 1] : null;
    const neighbors = [prev, next].filter((v): v is number => v != null && v > -100);
    const neighborAvg = neighbors.length > 0
      ? neighbors.reduce((a, b) => a + b, 0) / neighbors.length
      : userGroups[i];
    const isAirBand = i === GROUPS.length - 1;
    return getStatus(userGroups[i], neighborAvg, refGroups ? refGroups[i] : null, isAirBand);
  });

  const issueCount = statuses.filter((s) => s.status !== "normal").length;

  return (
    <div className="space-y-4">
      {/* ── Visual bar chart ── */}
      <div className="flex items-end gap-2 h-28 px-1">
        {GROUPS.map((group, i) => {
          const userPct = toPct(userGroups[i], minDb, range);
          const refPct = refGroups ? toPct(refGroups[i], minDb, range) : null;
          const status = statuses[i];
          const isExpanded = expandedBand === i;
          const hasRef = refPct != null;

          return (
            <button
              key={group.label}
              onClick={() => setExpandedBand(isExpanded ? null : i)}
              className="flex-1 flex flex-col items-center gap-1 group h-full justify-end"
            >
              {/* Bars side by side */}
              <div className={`flex items-end ${hasRef ? "gap-0.5" : ""} h-full justify-center w-full`}>
                {/* User bar */}
                <div
                  className={`${hasRef ? "w-1/2 max-w-[16px]" : "w-full max-w-[32px]"} rounded-t transition-all duration-500 ${status.barColor} ${
                    isExpanded ? "opacity-100" : "opacity-70 group-hover:opacity-100"
                  }`}
                  style={{ height: `${userPct}%` }}
                />
                {/* Reference bar */}
                {hasRef && (
                  <div
                    className={`w-1/2 max-w-[16px] rounded-t transition-all duration-500 bg-white/25 ${
                      isExpanded ? "opacity-100" : "opacity-60 group-hover:opacity-100"
                    }`}
                    style={{ height: `${refPct}%` }}
                  />
                )}
              </div>
              {/* Label */}
              <span className={`text-[9px] leading-none ${
                isExpanded ? "text-white font-medium" : "text-gray-500"
              }`}>
                {group.shortLabel}
              </span>
            </button>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-4 text-[10px] text-gray-500">
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 bg-blue-500 rounded-sm" />
          <span>Your Mix</span>
        </div>
        {reference && (
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 bg-white/25 rounded-sm" />
            <span>Reference</span>
          </div>
        )}
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 bg-yellow-400 rounded-sm" />
          <span>Stands out</span>
        </div>
      </div>

      {/* ── Summary ── */}
      <p className="text-xs text-gray-400">
        {issueCount === 0
          ? "Your frequency balance looks even. Tap any band for details."
          : `${issueCount} band${issueCount > 1 ? "s" : ""} stand${issueCount === 1 ? "s" : ""} out. Tap for details.`}
      </p>

      {/* ── Band list ── */}
      <div className="space-y-0.5">
        {GROUPS.map((group, i) => {
          const status = statuses[i];
          const isExpanded = expandedBand === i;
          const isBalanced = status.status === "normal";
          const isHigh = status.status === "strong" || status.status === "present";
          const isLow = status.status === "weak" || status.status === "low";

          return (
            <div key={group.label}>
              <button
                onClick={() => setExpandedBand(isExpanded ? null : i)}
                className={`w-full text-left rounded-lg px-3 py-2 transition-colors ${
                  isExpanded ? "bg-[#1c2a38]" : "hover:bg-[#1c2a38]/50"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-20">
                      <span className="text-xs font-medium text-white">{group.label}</span>
                    </div>
                    <span className="text-[10px] text-gray-500">{group.range}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-[11px] font-medium ${status.color}`}>
                      {status.label}
                    </span>
                    {!isBalanced && (
                      <span className="w-1.5 h-1.5 rounded-full bg-yellow-400" />
                    )}
                    <ChevronDown
                      size={11}
                      className={`text-gray-500 transition-transform ${isExpanded ? "rotate-180" : ""}`}
                    />
                  </div>
                </div>
              </button>

              {isExpanded && (
                <div className="mx-3 mb-1 px-3 py-2.5 rounded-lg bg-[#162433] border border-[#2d3e4f] space-y-2">
                  <p className="text-[11px] text-gray-400 leading-relaxed">
                    {group.description}
                  </p>
                  {isHigh && (
                    <p className="text-[11px] font-medium text-yellow-300 leading-relaxed">
                      {group.highHint}
                    </p>
                  )}
                  {isLow && (
                    <p className="text-[11px] font-medium text-blue-300 leading-relaxed">
                      {group.lowHint}
                    </p>
                  )}
                  {isBalanced && (
                    <p className="text-[11px] text-green-400/80 leading-relaxed">
                      No issues — this range sounds balanced.
                    </p>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default FrequencyChart;
