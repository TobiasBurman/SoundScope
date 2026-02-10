import { useRef, useState } from "react";
import { Play, Pause } from "lucide-react";
import type { SavedReference } from "../types";

interface SavedReferencesProps {
  references: SavedReference[];
  onSelect: (ref: SavedReference) => void;
  onDelete: (ref: SavedReference) => Promise<void>;
}

function MiniPlayer({ url }: { url: string }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState(false);

  const toggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!audioRef.current) return;
    if (playing) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setPlaying(!playing);
  };

  return (
    <>
      <audio
        ref={audioRef}
        src={url}
        onEnded={() => setPlaying(false)}
      />
      <button
        onClick={toggle}
        className="shrink-0 w-7 h-7 rounded-full bg-[#243446] hover:bg-[#2d4558]
                   flex items-center justify-center transition-colors"
      >
        {playing ? (
          <Pause size={12} className="text-white" />
        ) : (
          <Play size={12} className="text-white ml-[1px]" />
        )}
      </button>
    </>
  );
}

export default function SavedReferences({
  references,
  onSelect,
  onDelete,
}: SavedReferencesProps) {
  if (references.length === 0) {
    return (
      <p className="text-sm text-gray-400">
        No saved references yet
      </p>
    );
  }

  return (
    <ul className="space-y-2">
      {references.map((ref) => (
        <li
          key={ref.id}
          className="flex items-center gap-2
                     rounded-lg border border-[#2d3e4f]
                     bg-[#1c2a38] px-3 py-2.5"
        >
          {ref.userMixUrl && <MiniPlayer url={ref.userMixUrl} />}

          <button
            onClick={() => onSelect(ref)}
            className="flex-1 min-w-0 text-sm text-white text-left hover:text-[#a2e4f4] truncate"
          >
            {ref.name}
          </button>

          <button
            onClick={() => onDelete(ref)}
            className="shrink-0 text-xs text-gray-500 hover:text-red-400 transition-colors"
          >
            ✕
          </button>
        </li>
      ))}
    </ul>
  );
}
