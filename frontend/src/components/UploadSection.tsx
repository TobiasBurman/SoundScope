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
        className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-colors ${
            active
                ? "bg-blue-500 text-white"
                : "bg-[#1c2a38] text-gray-500 border border-[#2d3e4f]"
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
        <div className="rounded-2xl p-12 bg-[#202f3d] border border-[#3a4f63] mb-12 space-y-10">
            {/* ── Step 1: Upload your mix ── */}
            <div className="space-y-4">
                <div className="flex items-center gap-3">
                    <StepNumber n={1} active={true} />
                    <h2 className="text-lg font-semibold text-white">
                        Upload your mix
                    </h2>
                </div>

                <div className="ml-11">
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

            {/* ── Step 2: Choose comparison mode ── */}
            <div
                className={`space-y-4 transition-opacity ${
                    hasUserMix ? "opacity-100" : "opacity-40 pointer-events-none"
                }`}
            >
                <div className="flex items-center gap-3">
                    <StepNumber n={2} active={hasUserMix} />
                    <h2 className="text-lg font-semibold text-white">
                        Choose comparison
                    </h2>
                </div>

                <div className="ml-11 space-y-4">
                    {/* Mode selector */}
                    <div className="flex gap-3">
                        <button
                            onClick={() => setMode("preset")}
                            className={`flex-1 py-3 px-4 rounded-lg border text-sm font-medium transition-all ${
                                mode === "preset"
                                    ? "border-blue-500 bg-blue-500/10 text-blue-300"
                                    : "border-[#2d3e4f] bg-[#1c2a38] text-gray-400 hover:border-gray-500"
                            }`}
                        >
                            <span className="block text-base mb-1">Solo Analysis</span>
                            <span className="block text-xs text-gray-500">
                                Analyze against genre-standard targets
                            </span>
                        </button>

                        <button
                            onClick={() => setMode("reference")}
                            className={`flex-1 py-3 px-4 rounded-lg border text-sm font-medium transition-all ${
                                mode === "reference"
                                    ? "border-blue-500 bg-blue-500/10 text-blue-300"
                                    : "border-[#2d3e4f] bg-[#1c2a38] text-gray-400 hover:border-gray-500"
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
                            <label className="block text-sm text-gray-400 mb-1">
                                Target Profile
                            </label>
                            <select
                                value={preset}
                                onChange={(e) =>
                                    onPresetChange(e.target.value as PresetId)
                                }
                                className="w-full bg-[#1c2a38] border border-[#2d3e4f]
                                    rounded-lg px-4 py-3 text-white"
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

            {/* ── Step 3: Analyze ── */}
            <div
                className={`transition-opacity ${
                    canAnalyze ? "opacity-100" : "opacity-40 pointer-events-none"
                }`}
            >
                <div className="flex items-center gap-3 mb-4">
                    <StepNumber n={3} active={canAnalyze} />
                    <h2 className="text-lg font-semibold text-white">
                        Analyze
                    </h2>
                </div>

                <div className="ml-11">
                    <button
                        onClick={onAnalyze}
                        disabled={!canAnalyze || isPending}
                        className="w-full py-4 rounded-lg text-white font-medium
                            bg-gradient-to-r from-blue-500 to-blue-600
                            hover:from-blue-400 hover:to-blue-500
                            disabled:opacity-50 transition-all"
                    >
                        {isPending ? "Analyzing..." : "Analyze"}
                    </button>
                </div>
            </div>
        </div>
    );
}
