import { useState } from "react";
import { useAnalyzeAudio } from "./hooks/useAnalyzeAudio";
import FileUpload from "./components/FileUpload";
import LoudnessCard from "./components/LoudnessCard";
import ComparisonStats from "./components/ComparisonStats";
import AIFeedback from "./components/AIFeedback";
import FrequencyChart from "./components/FrequencyChart";
import ProgressBar from "./components/ProgressBar";
import LoadingPlaceholder from "./components/LoadingPlaceholder";
import PresetTargetCard from "./components/PresetTargetCard";

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


const App = () => {
  const [userMixFile, setUserMixFile] = useState<File | null>(null);
  const [referenceFile, setReferenceFile] = useState<File | null>(null);
  const [preset, setPreset] = useState<string>("streaming");

  const { mutate: analyzeAudio, data: result, isPending, isError } =
    useAnalyzeAudio();

  const handleAnalyze = () => {
    if (!userMixFile) return;

    analyzeAudio({
      userMix: userMixFile,
      reference: referenceFile || undefined,
      preset
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#182736] via-[#162433] to-[#141f2b]">

      <div className="bg-[#202f3d] border-b border-[#2d3e4f]">
        <div className="max-w-7xl mx-auto px-8 py-6">
          <h1 className="text-2xl font-bold text-white">SoundScope</h1>
          <p className="text-sm text-gray-400">
            AI-powered reference-based mix analysis
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-8 py-12">

        <div className="rounded-2xl p-12 bg-[#202f3d] border border-[#3a4f63] ring-1 ring-[#a2e4f4]/20 mb-12">

          <SectionHeader title="Upload your tracks" />

          <div className="space-y-6 mb-8">
            <FileUpload
              label="Your Mix"
              file={userMixFile}
              onFileChange={setUserMixFile}
              required
            />

            <FileUpload
              label="Reference Track (Optional)"
              file={referenceFile}
              onFileChange={setReferenceFile}
            />
          </div>
          <div className="mb-6">
            <label className="block text-sm text-gray-400 mb-1">
              Target Profile
            </label>

            <select
              value={preset}
              onChange={(e) => setPreset(e.target.value)}
              className="w-full bg-[#1c2a38] border border-[#2d3e4f] 
               rounded-lg px-4 py-3 text-white"
            >
              <option value="streaming">Streaming Pop</option>
              <option value="edm">EDM Club</option>
              <option value="hiphop">Hip-Hop</option>
              <option value="podcast">Podcast</option>
            </select>
          </div>

          <button
            onClick={handleAnalyze}
            disabled={!userMixFile || isPending}
            className="w-full py-4 rounded-lg text-white font-medium
                       bg-gradient-to-r from-blue-500 to-blue-600
                       hover:from-blue-400 hover:to-blue-500
                       disabled:opacity-50 transition-all"
          >
            {isPending ? "Analyzing..." : "Analyze"}
          </button>

          <ProgressBar active={isPending} />
        </div>

        {isError && (
          <div className="bg-red-900/20 border border-red-800 rounded-lg px-6 py-4 mb-10">
            <p className="text-sm text-red-300">
              Analysis failed. Please try again.
            </p>
          </div>
        )}

        {isPending && <LoadingPlaceholder />}

        {result && (
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
                      <PresetTargetCard
                        targetLufs={result.presetComparison.targetLufs}
                        targetTruePeak={result.presetComparison.targetTruePeak}
                        loudnessDiff={result.presetComparison.loudnessDiff}
                        truePeakDiff={result.presetComparison.truePeakDiff}
                      />
                    )}
                  </div>
                </Card>
              )}

              {result.comparison && (
                <Card>
                  <SectionHeader title="Key Differences" />
                  <ComparisonStats
                    loudnessDiff={result.comparison.loudnessDiff}
                    rangeDiff={result.comparison.rangeDiff}
                    peakDiff={result.comparison.peakDiff}
                  />
                </Card>
              )}

            </div>

            <div className="space-y-8">

              {result.reference?.analysis ? (
                <Card>
                  <SectionHeader title="Frequency Analysis" />
                  <FrequencyChart
                    userMix={result.userMix.analysis}
                    reference={result.reference.analysis}
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
        )}

        <div className="text-center text-xs text-gray-500 py-16">
          Built for producers • SoundScope v1
        </div>

      </div>
    </div>
  );
};

export default App;
