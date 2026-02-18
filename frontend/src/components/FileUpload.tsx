import { useRef } from "react";
import { Upload } from "lucide-react";
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
  const inputRef = useRef<HTMLInputElement>(null);
  const audioUrl = file ? URL.createObjectURL(file) : null;
  const showPreview = !file && previewUrl && previewName;

  return (
    <div>
      <label className="block text-sm text-gray-500 dark:text-gray-400 mb-2">
        {label} {required && "*"}
      </label>

      {!file && !showPreview && (
        <>
          <input
            ref={inputRef}
            type="file"
            accept="audio/*"
            onChange={(e) =>
              onFileChange(e.target.files?.[0] || null)
            }
            className="hidden"
          />
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="w-full flex items-center justify-center gap-2
                       bg-gray-100 dark:bg-[#1c2a38] border-2 border-dashed border-gray-400 dark:border-[#2d3e4f]
                       hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-[#1c2a38]/80
                       rounded-lg px-4 py-6 text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-gray-300
                       transition-colors cursor-pointer"
          >
            <Upload size={16} />
            <span className="text-sm">Choose file</span>
          </button>
        </>
      )}

      {file && (
        <div className="relative bg-gray-50 dark:bg-[#1c2a38] border border-gray-200 dark:border-[#2d3e4f] rounded-lg p-4">
          <p className="text-sm text-gray-900 dark:text-white mb-2 truncate">
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
        <div className="relative bg-gray-50 dark:bg-[#1c2a38] border border-blue-500/30 rounded-lg p-4">
          <p className="text-sm text-gray-900 dark:text-white mb-2 truncate">
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
