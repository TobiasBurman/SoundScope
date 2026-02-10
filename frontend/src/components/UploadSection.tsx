import FileUpload from "./FileUpload";
import type { PresetId, SavedReference } from "../types";

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
    return (
        <div className="rounded-2xl p-12 bg-[#202f3d] border border-[#3a4f63] mb-12">
            <h2 className="text-lg font-semibold text-white mb-6">
                Upload your tracks
            </h2>

            <div className="space-y-6 mb-8">
                <FileUpload
                    label="Your Mix"
                    file={userMixFile}
                    onFileChange={onUserMixChange}
                    required
                    previewUrl={!userMixFile && activeReference ? activeReference.userMixUrl : undefined}
                    previewName={!userMixFile && activeReference ? activeReference.userMixName : undefined}
                    onClearPreview={onClearReference}
                />

                <div>
                    <FileUpload
                        label="Reference Track (Optional)"
                        file={referenceFile}
                        onFileChange={onReferenceChange}
                        previewUrl={!referenceFile && activeReference?.referenceUrl ? activeReference.referenceUrl : undefined}
                        previewName={!referenceFile && activeReference?.referenceName ? activeReference.referenceName : undefined}
                        onClearPreview={onClearReference}
                    />

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
            </div>

            <div className="mb-6">
                <label className="block text-sm text-gray-400 mb-1">
                    Target Profile
                </label>

                <select
                    value={preset}
                    onChange={(e) => onPresetChange(e.target.value as PresetId)}
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
                onClick={onAnalyze}
                disabled={!userMixFile || isPending}
                className="w-full py-4 rounded-lg text-white font-medium
                   bg-gradient-to-r from-blue-500 to-blue-600
                   hover:from-blue-400 hover:to-blue-500
                   disabled:opacity-50 transition-all"
            >
                {isPending ? "Analyzing..." : "Analyze"}
            </button>
        </div>
    );
}
