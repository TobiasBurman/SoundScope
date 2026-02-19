import { useState } from "react";
import PageLayout from "./components/PageLayout";
import UploadSection from "./components/UploadSection";
import LoadingPlaceholder from "./components/LoadingPlaceholder";
import ResultsSection from "./components/ResultSection";
import SavedReferences from "./components/SavedReferences";

import { useAnalyzeAudio } from "./hooks/useAnalyzeAudio";
import { useUserReferences } from "./hooks/useUserReferences";
import { useAuth } from "./hooks/useAuth";

import {
  saveReference,
  deleteReference,
} from "./services/referenceServices";

import type { PresetId, SavedReference } from "./types";
import type { AnalysisResponse } from "./types/analysis";

const App = () => {
  const [userMixFile, setUserMixFile] = useState<File | null>(null);
  const [referenceFile, setReferenceFile] = useState<File | null>(null);
  const [preset, setPreset] = useState<PresetId>("pop");
  const [activeReference, setActiveReference] =
    useState<SavedReference | null>(null);
  const [savedResult, setSavedResult] = useState<AnalysisResponse | null>(null);

  const { user } = useAuth();

  const {
    references,
    loading: refsLoading,
    reload: reloadReferences,
  } = useUserReferences(user?.uid);

  const {
    mutate: analyzeAudio,
    data: result,
    isPending,
  } = useAnalyzeAudio();

  const isAlreadySaved =
    !!userMixFile &&
    references.some((r) => r.userMixName === userMixFile.name);

  const handleAnalyze = () => {
    if (!userMixFile) return;

    analyzeAudio({
      userMix: userMixFile,
      reference: referenceFile || undefined,
      preset,
    });
  };

  const handleSaveReference = async () => {
    if (!user || !userMixFile) return;
    await saveReference(user.uid, userMixFile, referenceFile ?? undefined, result ?? undefined);
    await reloadReferences();
  };

  const handleSelectReference = (ref: SavedReference) => {
    setActiveReference(ref);
    setSavedResult(ref.analysisResult ?? null);
  };

  const handleCloseReference = () => {
    setActiveReference(null);
    setSavedResult(null);
  };

  const handleDeleteReference = async (ref: SavedReference) => {
    await deleteReference(ref);
    await reloadReferences();

    if (activeReference?.id === ref.id) {
      handleCloseReference();
    }
  };

  const canSave = !!userMixFile && !!user && !!result && !isAlreadySaved;

  const sidebar = user ? (
    <div className="rounded-2xl p-5 bg-white dark:bg-white/[0.05] border border-gray-200 dark:border-white/[0.10] shadow-lg shadow-gray-200/50 dark:shadow-none dark:backdrop-blur-sm">
      <h3 className="text-[11px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-4">
        Saved Mixes
      </h3>

      {canSave && (
        <button
          onClick={handleSaveReference}
          className="w-full mb-4 px-3 py-2 rounded-lg text-xs font-medium
                     bg-accent-500/10 text-accent-700 dark:text-accent-300 border border-accent-500/20
                     hover:bg-accent-500/20 transition-colors"
        >
          + Save current analysis
        </button>
      )}

      {refsLoading ? (
        <p className="text-sm text-gray-400">Loading…</p>
      ) : (
        <SavedReferences
          references={references}
          onSelect={handleSelectReference}
          onDelete={handleDeleteReference}
        />
      )}
    </div>
  ) : undefined;

  return (
    <PageLayout sidebar={sidebar}>
      {activeReference && (
        <div className="mb-6 p-4 rounded-lg bg-accent-500/10 border border-accent-500/30 flex items-center justify-between">
          <p className="text-sm text-accent-700 dark:text-accent-300">
            Viewing saved analysis:{" "}
            <strong>{activeReference.name}</strong>
          </p>
          <button
            onClick={handleCloseReference}
            className="text-sm text-accent-700 dark:text-accent-300 hover:text-white"
          >
            ✕ Close
          </button>
        </div>
      )}

      <UploadSection
        userMixFile={userMixFile}
        referenceFile={referenceFile}
        preset={preset}
        isPending={isPending}
        activeReference={activeReference}
        onUserMixChange={setUserMixFile}
        onReferenceChange={setReferenceFile}
        onPresetChange={setPreset}
        onAnalyze={handleAnalyze}
        onClearReference={handleCloseReference}
        canSaveReference={
          !!userMixFile &&
          !!user &&
          !!result &&
          !isAlreadySaved
        }
        onSaveReference={handleSaveReference}
      />

      {!savedResult && isPending && <LoadingPlaceholder />}

      {savedResult ? (
        <ResultsSection result={savedResult} />
      ) : result ? (
        <ResultsSection result={result} />
      ) : null}
    </PageLayout>
  );
};

export default App;
