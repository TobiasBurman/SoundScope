import { useRef, useState } from "react";
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
  const [dragging, setDragging] = useState(false);
  const audioUrl = file ? URL.createObjectURL(file) : null;
  const showPreview = !file && previewUrl && previewName;

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile) onFileChange(droppedFile);
  };

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-2">
        {label} {required && <span className="text-accent-500">*</span>}
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
            onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
            className={`w-full flex flex-col items-center justify-center gap-2
                       border-2 border-dashed
                       ${dragging
                         ? "border-accent-400 bg-accent-50 dark:bg-accent-500/10"
                         : "border-gray-300 dark:border-white/10 bg-[#f4f5f8] dark:bg-white/[0.02] hover:border-accent-400 hover:bg-accent-50 dark:hover:bg-accent-500/5"
                       }
                       rounded-xl px-4 py-8 text-gray-500 dark:text-gray-400
                       transition-colors cursor-pointer`}
          >
            <div className="p-2.5 rounded-lg bg-accent-100 dark:bg-white/5 text-accent-600 dark:text-gray-400">
              <Upload size={18} />
            </div>
            <span className="text-sm">
              Drop file here or <span className="text-accent-600 dark:text-accent-400 font-medium">browse</span>
            </span>
            <span className="text-xs text-gray-400 dark:text-gray-600">WAV, MP3, FLAC, AIFF</span>
          </button>
        </>
      )}

      {file && (
        <div className="relative bg-gray-50 dark:bg-white/[0.03] border border-gray-200 dark:border-white/[0.06] rounded-xl p-4">
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
        <div className="relative bg-gray-50 dark:bg-white/[0.03] border border-accent-500/30 rounded-xl p-4">
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
