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

const LoadingPlaceholder = () => {
  const [msgIndex, setMsgIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setMsgIndex((i) => (i + 1) % MESSAGES.length);
    }, 2200);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="flex flex-col items-center gap-8 mt-12 w-full">

      {/* Cycling message */}
      <div style={{ height: 22 }} className="relative w-full flex justify-center">
        <AnimatePresence mode="wait">
          <motion.p
            key={msgIndex}
            className="absolute text-sm text-gray-500 dark:text-gray-400 tracking-wide whitespace-nowrap"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.3 }}
          >
            {MESSAGES[msgIndex]}
          </motion.p>
        </AnimatePresence>
      </div>

      {/* Skeleton cards */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 w-full">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className={`h-52 rounded-xl bg-gray-100 dark:bg-white/[0.03] border border-gray-200 dark:border-white/[0.04] ${i === 2 ? "xl:col-span-2" : ""}`}
            animate={{ opacity: [0.4, 0.65, 0.4] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut", delay: i * 0.25 }}
          />
        ))}
      </div>
    </div>
  );
};

export default LoadingPlaceholder;
