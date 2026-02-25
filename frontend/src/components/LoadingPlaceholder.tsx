import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";

const MESSAGES = [
  "Analyzing your mix…",
  "Checking loudness levels…",
  "Scanning frequency balance…",
  "Measuring dynamic range…",
  "Consulting the AI…",
  "Almost there…",
];

const BAR_COUNT = 14;

// Pre-computed random durations so they're stable across renders
const durations = Array.from({ length: BAR_COUNT }, (_, i) => 0.5 + (i % 5) * 0.13);
const delays    = Array.from({ length: BAR_COUNT }, (_, i) => (i * 0.07) % 0.6);

const LoadingPlaceholder = () => {
  const [msgIndex, setMsgIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setMsgIndex((i) => (i + 1) % MESSAGES.length);
    }, 2200);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="flex flex-col items-center gap-10 mt-16 w-full">

      {/* Equalizer */}
      <div className="flex flex-col items-center gap-4">
        <div className="flex items-end gap-[6px]" style={{ height: 72 }}>
          {Array.from({ length: BAR_COUNT }).map((_, i) => (
            <motion.div
              key={i}
              className="w-3 rounded-full bg-gradient-to-t from-blue-600 to-blue-400"
              style={{ height: 72, transformOrigin: "bottom" }}
              animate={{ scaleY: [0.1, 1, 0.15, 0.8, 0.1] }}
              transition={{
                duration: durations[i],
                repeat: Infinity,
                ease: "easeInOut",
                delay: delays[i],
              }}
            />
          ))}
        </div>

        {/* Cycling message */}
        <div style={{ height: 24 }} className="relative w-full flex justify-center">
          <AnimatePresence mode="wait">
            <motion.p
              key={msgIndex}
              className="absolute text-sm text-gray-400 tracking-wide whitespace-nowrap"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.3 }}
            >
              {MESSAGES[msgIndex]}
            </motion.p>
          </AnimatePresence>
        </div>
      </div>

      {/* Skeleton cards */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 w-full">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className={`h-52 rounded-xl bg-white/[0.03] border border-white/[0.04] ${i === 2 ? "xl:col-span-2" : ""}`}
            animate={{ opacity: [0.4, 0.65, 0.4] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut", delay: i * 0.25 }}
          />
        ))}
      </div>
    </div>
  );
};

export default LoadingPlaceholder;
