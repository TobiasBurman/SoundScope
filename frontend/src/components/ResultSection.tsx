import { useState } from "react";
import { ChevronDown } from "lucide-react";
import MixOverview from "./MixOverview";
import LoudnessCard from "./LoudnessCard";
import ComparisonStats from "./ComparisonStats";
import AIFeedback from "./AIFeedback";
import FrequencyChart from "./FrequencyChart";
import PresetTargetCard from "./PresetTargetCard";

import type { AnalysisResponse } from "../types/analysis";

interface ResultsSectionProps {
  result: AnalysisResponse;
}

const SectionHeader = ({ title }: { title: string }) => (
  <div className="flex items-center gap-3 mb-6">
    <div className="w-1 h-5 bg-accent-500 dark:bg-accent-400 rounded-full" />
    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h2>
  </div>
);

const Card = ({ children }: { children: React.ReactNode }) => (
  <div className="rounded-xl p-6 bg-white dark:bg-white/[0.05] border border-gray-200 dark:border-white/[0.10] shadow-lg shadow-gray-200/50 dark:shadow-none dark:backdrop-blur-sm">
    {children}
  </div>
);

const glossary = [
  { term: "LUFS", desc: "How loud your track feels overall — the average perceived volume." },
  { term: "Dynamic Range (LU)", desc: "Difference between quiet and loud parts. Higher = more life." },
  { term: "True Peak (dBTP)", desc: "Highest signal level. Above 0 = clipping/distortion." },
  { term: "Frequency Balance", desc: "How energy is spread across bass, mids, and treble." },
];

const ResultsSection = ({ result }: ResultsSectionProps) => {
  const [showGlossary, setShowGlossary] = useState(false);
  const userFrequencies = result.userMix.analysis.frequencies;
  const referenceFrequencies = result.reference?.analysis.frequencies;
  const hasComparison = !!result.comparison;

  const hasReference = !!result.reference;
  const showPreset = !!result.presetComparison && !hasReference;
  const loudnessItems = 1 + (hasReference ? 1 : 0) + (showPreset ? 1 : 0);

  const loudnessGrid =
    loudnessItems === 3
      ? "grid-cols-1 sm:grid-cols-3"
      : "grid-cols-1 sm:grid-cols-2";

  return (
    <div className="space-y-6">
      {/* 1. Overview — clear status at a glance (solo mode only) */}
      {!hasReference && <MixOverview result={result} />}

      {/* 2. Loudness + Frequency side by side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {result.userMix.analysis.loudness && (
          <Card>
            <SectionHeader title="Loudness Details" />
            <div className={`grid gap-6 ${loudnessGrid}`}>
              <LoudnessCard
                title="Your Mix"
                integrated={result.userMix.analysis.loudness.integrated}
                range={result.userMix.analysis.loudness.range}
                truePeak={result.userMix.analysis.loudness.truePeak}
                showHints
              />

              {result.reference?.analysis.loudness && (
                <LoudnessCard
                  title="Reference"
                  integrated={result.reference.analysis.loudness.integrated}
                  range={result.reference.analysis.loudness.range}
                  truePeak={result.reference.analysis.loudness.truePeak}
                />
              )}

              {showPreset && (
                <PresetTargetCard {...result.presetComparison} />
              )}
            </div>
          </Card>
        )}

        {userFrequencies && (
          <Card>
            <SectionHeader title="Frequency Balance" />
            <FrequencyChart
              userMix={userFrequencies}
              reference={referenceFrequencies}
            />
          </Card>
        )}
      </div>

      {/* 3. Key Differences (reference mode only) */}
      {hasComparison && (
        <Card>
          <SectionHeader title="Key Differences" />
          <ComparisonStats {...result.comparison!} />
        </Card>
      )}

      {/* 4. AI Feedback */}
      <Card>
        <SectionHeader title="Mix Feedback" />
        <AIFeedback feedback={result.aiFeedback} />
      </Card>

      {/* 5. Glossary — collapsible at the bottom */}
      <button
        onClick={() => setShowGlossary(!showGlossary)}
        className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
      >
        <ChevronDown
          size={14}
          className={`transition-transform ${showGlossary ? "rotate-180" : ""}`}
        />
        What do these terms mean?
      </button>

      {showGlossary && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {glossary.map((item) => (
            <div key={item.term} className="rounded-lg p-3 bg-gray-50 dark:bg-white/[0.04] border border-gray-200/60 dark:border-white/[0.08] dark:backdrop-blur-sm">
              <p className="text-xs font-medium text-gray-900 dark:text-white mb-1">{item.term}</p>
              <p className="text-[11px] text-gray-500 dark:text-gray-400 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ResultsSection;
