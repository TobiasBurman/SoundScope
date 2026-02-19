import { useState } from "react";
import FileUpload from "./FileUpload";
import type { PresetId, SavedReference } from "../types";

type CompareMode = "preset" | "reference";

interface UploadSectionProps {
    userMixFile: File | null;
    referenceFile: File | null;
    preset: PresetId;
    isPending: boolean;
    activeReference: SavedReference | null;

    onUserMixChange: (file: File | null) => void;
    onReferenceChange: (file: File | null) => void;
    onPresetChange: (preset: PresetId) => void;
    onAnalyze: () => void;
    onClearReference: () => void;

    canSaveReference?: boolean;
    onSaveReference?: () => void;
}

const StepNumber = ({ n, active }: { n: number; active: boolean }) => (
    <div
        className={`shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-sm font-semibold transition-colors ${
            active
                ? "bg-accent-600 text-white"
                : "bg-gray-200 dark:bg-white/5 text-gray-400 dark:text-gray-600 border border-gray-300 dark:border-white/10"
        }`}
    >
        {n}
    </div>
);

export default function UploadSection({
    userMixFile,
    referenceFile,
    preset,
    isPending,
    activeReference,
    onUserMixChange,
    onReferenceChange,
    onPresetChange,
    onAnalyze,
    onClearReference,
    canSaveReference,
    onSaveReference,
}: UploadSectionProps) {
    const [mode, setMode] = useState<CompareMode>("preset");
    const [refError, setRefError] = useState<string | null>(null);

    const hasUserMix = !!userMixFile || !!activeReference;
    const canAnalyze =
        mode === "preset"
            ? !!userMixFile
            : !!userMixFile && (!!referenceFile || !!activeReference?.referenceUrl);

    const handleReferenceChange = (file: File | null) => {
        if (
            file &&
            userMixFile &&
            file.name === userMixFile.name &&
            file.size === userMixFile.size
        ) {
            setRefError("Reference track can't be the same file as your mix.");
            return;
        }
        setRefError(null);
        onReferenceChange(file);
    };

    return (
        <div className="rounded-2xl p-10 bg-white dark:bg-white/[0.05] border border-gray-300 dark:border-white/[0.10] shadow-lg shadow-gray-200/50 dark:shadow-none mb-10 space-y-8">
            {/* ── Step 1: Drop your mix ── */}
            <div className="space-y-4">
                <div className="flex items-center gap-3">
                    <StepNumber n={1} active={true} />
                    <h2 className="text-xl font-heading text-gray-900 dark:text-white">
                        Drop your mix
                    </h2>
                </div>

                <div className="ml-10">
                    <FileUpload
                        label="Your Mix"
                        file={userMixFile}
                        onFileChange={onUserMixChange}
                        required
                        previewUrl={
                            !userMixFile && activeReference
                                ? activeReference.userMixUrl
                                : undefined
                        }
                        previewName={
                            !userMixFile && activeReference
                                ? activeReference.userMixName
                                : undefined
                        }
                        onClearPreview={onClearReference}
                    />
                </div>
            </div>

            {/* ── Step 2: Pick your target ── */}
            <div
                className={`space-y-4 transition-opacity ${
                    hasUserMix ? "opacity-100" : "opacity-[0.25] pointer-events-none"
                }`}
            >
                <div className="flex items-center gap-3">
                    <StepNumber n={2} active={hasUserMix} />
                    <h2 className="text-xl font-heading text-gray-900 dark:text-white">
                        Pick your target
                    </h2>
                </div>

                <div className="ml-10 space-y-4">
                    {/* Mode selector */}
                    <div className="flex gap-3">
                        <button
                            onClick={() => setMode("preset")}
                            className={`flex-1 py-3 px-4 rounded-xl border text-sm font-medium transition-all ${
                                mode === "preset"
                                    ? "border-accent-500 bg-accent-50 dark:bg-accent-500/10 text-accent-700 dark:text-accent-300"
                                    : "border-gray-200 dark:border-white/[0.06] bg-gray-50/80 dark:bg-white/[0.02] text-gray-600 dark:text-gray-400 hover:border-gray-300 dark:hover:border-white/10"
                            }`}
                        >
                            <span className="block text-base mb-1">Solo Analysis</span>
                            <span className="block text-xs text-gray-500">
                                Analyze against genre-standard targets
                            </span>
                        </button>

                        <button
                            onClick={() => setMode("reference")}
                            className={`flex-1 py-3 px-4 rounded-xl border text-sm font-medium transition-all ${
                                mode === "reference"
                                    ? "border-accent-500 bg-accent-50 dark:bg-accent-500/10 text-accent-700 dark:text-accent-300"
                                    : "border-gray-200 dark:border-white/[0.06] bg-gray-50/80 dark:bg-white/[0.02] text-gray-600 dark:text-gray-400 hover:border-gray-300 dark:hover:border-white/10"
                            }`}
                        >
                            <span className="block text-base mb-1">Compare to Reference</span>
                            <span className="block text-xs text-gray-500">
                                Match against a professional mix
                            </span>
                        </button>
                    </div>

                    {/* Mode-specific content */}
                    {mode === "preset" ? (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-1">
                                Target Profile
                            </label>
                            <select
                                value={preset}
                                onChange={(e) =>
                                    onPresetChange(e.target.value as PresetId)
                                }
                                className="w-full bg-[#f4f5f8] dark:bg-white/[0.03] border border-gray-200 dark:border-white/[0.06]
                                    rounded-xl px-4 py-3 text-gray-900 dark:text-white"
                            >
                                <option value="pop">Pop / Top 40</option>
                                <option value="edm">EDM / Dance</option>
                                <option value="hiphop">Hip-Hop / Trap</option>
                                <option value="rock">Rock / Indie</option>
                                <option value="acoustic">Acoustic / Jazz</option>
                                <option value="podcast">Podcast / Voice</option>
                            </select>
                        </div>
                    ) : (
                        <div>
                            <FileUpload
                                label="Reference Track"
                                file={referenceFile}
                                onFileChange={handleReferenceChange}
                                previewUrl={
                                    !referenceFile && activeReference?.referenceUrl
                                        ? activeReference.referenceUrl
                                        : undefined
                                }
                                previewName={
                                    !referenceFile && activeReference?.referenceName
                                        ? activeReference.referenceName
                                        : undefined
                                }
                                onClearPreview={onClearReference}
                            />
                            {refError && (
                                <p className="mt-2 text-sm text-red-400">
                                    {refError}
                                </p>
                            )}

                            {canSaveReference && onSaveReference && (
                                <button
                                    onClick={onSaveReference}
                                    className="mt-3 text-sm px-3 py-2 rounded-md
                                        bg-green-600 hover:bg-green-500
                                        text-white transition"
                                >
                                    Save reference
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* ── Step 3: Let's go ── */}
            <div
                className={`transition-opacity ${
                    canAnalyze ? "opacity-100" : "opacity-[0.25] pointer-events-none"
                }`}
            >
                <div className="flex items-center gap-3 mb-4">
                    <StepNumber n={3} active={canAnalyze} />
                    <h2 className="text-xl font-heading text-gray-900 dark:text-white">
                        Let's go
                    </h2>
                </div>

                <div className="ml-10">
                    <button
                        onClick={onAnalyze}
                        disabled={!canAnalyze || isPending}
                        className="w-full py-4 rounded-xl text-white font-medium
                            bg-accent-600 hover:bg-accent-500
                            disabled:opacity-50 transition-all shadow-lg shadow-accent-600/25 dark:shadow-none active:scale-[0.98]"
                    >
                        {isPending ? "Analyzing..." : "Analyze my mix"}
                    </button>
                </div>
            </div>
        </div>
    );
}
