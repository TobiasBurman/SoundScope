import WaveformPlayer from "./WaveformPlayer";

interface FileUploadProps {
  label: string;
  file: File | null;
  onFileChange: (file: File | null) => void;
  required?: boolean;
  previewUrl?: string;
  previewName?: string;
  onClearPreview?: () => void;
}

const FileUpload = ({
  label,
  file,
  onFileChange,
  required,
  previewUrl,
  previewName,
  onClearPreview,
}: FileUploadProps) => {
  const audioUrl = file ? URL.createObjectURL(file) : null;
  const showPreview = !file && previewUrl && previewName;

  return (
    <div>
      <label className="block text-sm text-gray-400 mb-2">
        {label} {required && "*"}
      </label>

      {!file && !showPreview && (
        <input
          type="file"
          accept="audio/*"
          onChange={(e) =>
            onFileChange(e.target.files?.[0] || null)
          }
          className="w-full bg-[#1c2a38] border border-[#2d3e4f]
                     rounded-lg px-4 py-3 text-white"
        />
      )}

      {file && (
        <div className="relative bg-[#1c2a38] border border-[#2d3e4f] rounded-lg p-4">
          <p className="text-sm text-white mb-2 truncate">
            {file.name}
          </p>
          <WaveformPlayer url={audioUrl!} />
          <button
            onClick={() => onFileChange(null)}
            className="absolute top-2 right-2 text-gray-400 hover:text-red-400"
          >
            ✕
          </button>
        </div>
      )}

      {showPreview && (
        <div className="relative bg-[#1c2a38] border border-blue-500/30 rounded-lg p-4">
          <p className="text-sm text-white mb-2 truncate">
            {previewName}
          </p>
          <WaveformPlayer url={previewUrl} />
          {onClearPreview && (
            <button
              onClick={onClearPreview}
              className="absolute top-2 right-2 text-gray-400 hover:text-red-400"
            >
              ✕
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default FileUpload;
