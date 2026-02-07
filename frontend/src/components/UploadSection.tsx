import FileUpload from "./FileUpload";
import ProgressBar from "./ProgressBar";
import { type PresetId } from "../types";

interface UploadSectionProps {
  userMixFile: File | null;
  referenceFile: File | null;
  preset: PresetId;
  isPending: boolean;
  onUserMixChange: (file: File | null) => void;
  onReferenceChange: (file: File | null) => void;
  onPresetChange: (preset: PresetId) => void;
  onAnalyze: () => void;
}

const UploadSection = ({
  userMixFile,
  referenceFile,
  preset,
  isPending,
  onUserMixChange,
  onReferenceChange,
  onPresetChange,
  onAnalyze
}: UploadSectionProps) => {
  return (
    <div className="rounded-2xl p-12 bg-[#202f3d] border border-[#3a4f63] ring-1 ring-[#a2e4f4]/20 mb-12">
      <h2 className="text-lg font-semibold text-white mb-6">
        Upload your tracks
      </h2>

      <div className="space-y-6 mb-8">
        <FileUpload
          label="Your Mix"
          file={userMixFile}
          onFileChange={onUserMixChange}
          required
        />

        <FileUpload
          label="Reference Track (Optional)"
          file={referenceFile}
          onFileChange={onReferenceChange}
        />
      </div>

      <div className="mb-6">
        <label className="block text-sm text-gray-400 mb-1">
          Target Profile
        </label>

        <select
          value={preset}
          onChange={(e) => onPresetChange(e.target.value as PresetId)}
          className="w-full bg-[#1c2a38] border border-[#2d3e4f] rounded-lg px-4 py-3 text-white"
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
                   disabled:opacity-50"
      >
        {isPending ? "Analyzing..." : "Analyze"}
      </button>

      <ProgressBar active={isPending} />
    </div>
  );
};

export default UploadSection;
