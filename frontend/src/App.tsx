import { useState } from "react";
import { useAnalyzeAudio } from "./hooks/useAnalyzeAudio";

import PageLayout from "./components/PageLayout";
import UploadSection from "./components/UploadSection";
import LoadingPlaceholder from "./components/LoadingPlaceholder";

import type { PresetId } from "./types";
import ResultsSection from "./components/ResultSection";

const App = () => {
  const [userMixFile, setUserMixFile] = useState<File | null>(null);
  const [referenceFile, setReferenceFile] = useState<File | null>(null);
  const [preset, setPreset] = useState<PresetId>("streaming");

  const { mutate: analyzeAudio, data: result, isPending } =
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
    <PageLayout>
      <UploadSection
        userMixFile={userMixFile}
        referenceFile={referenceFile}
        preset={preset}
        isPending={isPending}
        onUserMixChange={setUserMixFile}
        onReferenceChange={setReferenceFile}
        onPresetChange={setPreset}
        onAnalyze={handleAnalyze}
      />

      {isPending && <LoadingPlaceholder />}

      {result && <ResultsSection result={result} />}
    </PageLayout>
  );
};

export default App;
