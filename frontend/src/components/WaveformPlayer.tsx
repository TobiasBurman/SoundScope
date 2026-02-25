import { useEffect, useRef, useState } from "react";
import WaveSurfer from "wavesurfer.js";
import { Play, Pause } from "lucide-react";

interface Props {
  url: string;
}

const WaveformPlayer = ({ url }: Props) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const waveRef = useRef<WaveSurfer | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    if (!containerRef.current) return;

    waveRef.current = WaveSurfer.create({
      container: containerRef.current,
      waveColor: "#6b7280",
      progressColor: "#a2e4f4",
      cursorColor: "transparent",
      barWidth: 3,
      barGap: 2,
      height: 80,
      normalize: true
    });

    waveRef.current.load(url);

    waveRef.current.on("play", () => setIsPlaying(true));
    waveRef.current.on("pause", () => setIsPlaying(false));
    waveRef.current.on("finish", () => setIsPlaying(false));

    return () => {
      waveRef.current?.destroy();
    };
  }, [url]);

  return (
    <div className="flex items-center gap-4">
      <button
        onClick={() => waveRef.current?.playPause()}
        className="
          w-11 h-11 rounded-full
          bg-gray-200 hover:bg-gray-300 dark:bg-[#1c2a38] dark:hover:bg-[#243446]
          flex items-center justify-center
          transition
        "
      >
        {isPlaying ? (
          <Pause size={20} className="text-gray-800 dark:text-white" />
        ) : (
          <Play size={20} className="text-gray-800 dark:text-white ml-[2px]" />
        )}
      </button>

      <div className="flex-1" ref={containerRef} />
    </div>
  );
};

export default WaveformPlayer;
