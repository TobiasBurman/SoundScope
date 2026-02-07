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
    <div className="w-1 h-5 bg-[#a2e4f4] rounded-full" />
    <h2 className="text-lg font-semibold text-white">{title}</h2>
  </div>
);

const Card = ({ children }: { children: React.ReactNode }) => (
  <div className="h-full rounded-xl p-8 bg-[#202f3d] border border-[#2d3e4f]">
    {children}
  </div>
);

const ResultsSection = ({ result }: ResultsSectionProps) => {
  const userFrequencies = result.userMix.analysis.frequencies;
  const referenceFrequencies = result.reference?.analysis.frequencies;

  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 items-stretch">
      <div className="space-y-8">
        {result.userMix.analysis.loudness && (
          <Card>
            <SectionHeader title="Loudness Analysis" />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <LoudnessCard
                title="Your Mix"
                integrated={result.userMix.analysis.loudness.integrated}
                range={result.userMix.analysis.loudness.range}
                truePeak={result.userMix.analysis.loudness.truePeak}
              />

              {result.reference?.analysis.loudness && (
                <LoudnessCard
                  title="Reference Track"
                  integrated={result.reference.analysis.loudness.integrated}
                  range={result.reference.analysis.loudness.range}
                  truePeak={result.reference.analysis.loudness.truePeak}
                />
              )}

              {result.presetComparison && (
                <PresetTargetCard {...result.presetComparison} />
              )}
            </div>
          </Card>
        )}

        {result.comparison && (
          <Card>
            <SectionHeader title="Key Differences" />
            <ComparisonStats {...result.comparison} />
          </Card>
        )}
      </div>

      <div className="space-y-8">
        {userFrequencies && referenceFrequencies ? (
          <Card>
            <SectionHeader title="Frequency Analysis" />
            <FrequencyChart
              userMix={userFrequencies}
              reference={referenceFrequencies}
            />
          </Card>
        ) : (
          <Card>
            <SectionHeader title="Frequency Analysis" />
            <div className="flex items-center justify-center h-48 text-sm text-gray-400">
              Upload a reference track to compare tonal balance
            </div>
          </Card>
        )}
      </div>

      <div className="xl:col-span-2">
        <Card>
          <SectionHeader title="AI Recommendations" />
          <AIFeedback feedback={result.aiFeedback} />
        </Card>
      </div>
    </div>
  );
};

export default ResultsSection;
