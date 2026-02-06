import WaveformPlayer from "./WaveformPlayer";

interface FileUploadProps {
  label: string;
  file: File | null;
  onFileChange: (file: File | null) => void;
  required?: boolean;
}

const FileUpload = ({ label, file, onFileChange, required }: FileUploadProps) => {
  const audioUrl = file ? URL.createObjectURL(file) : null;

  return (
    <div>
      <label className="block text-sm text-gray-400 mb-2">
        {label} {required && "*"}
      </label>

      {!file && (
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

          {/* File name */}
          <p className="text-sm text-white mb-2 truncate">
            {file.name}
          </p>

          {/* Audio player */}
          <WaveformPlayer url={audioUrl!} />


          {/* Remove button */}
          <button
            onClick={() => onFileChange(null)}
            className="absolute top-2 right-2 text-gray-400 hover:text-red-400"
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
};

export default FileUpload;
