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

const BAR_COUNT = 12;

const LoadingPlaceholder = () => {
  const [msgIndex, setMsgIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setMsgIndex((i) => (i + 1) % MESSAGES.length);
    }, 2200);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center mt-20 gap-10">
      {/* Equalizer bars */}
      <div className="flex items-end gap-[5px] h-20">
        {Array.from({ length: BAR_COUNT }).map((_, i) => (
          <motion.div
            key={i}
            className="w-3 rounded-full bg-gradient-to-t from-blue-600 to-blue-400"
            animate={{
              height: [
                `${20 + Math.random() * 40}%`,
                `${50 + Math.random() * 50}%`,
                `${15 + Math.random() * 35}%`,
                `${60 + Math.random() * 40}%`,
                `${20 + Math.random() * 30}%`,
              ],
            }}
            transition={{
              duration: 1.1 + i * 0.07,
              repeat: Infinity,
              repeatType: "mirror",
              ease: "easeInOut",
              delay: i * 0.06,
            }}
            style={{ minHeight: 6 }}
          />
        ))}
      </div>

      {/* Cycling text */}
      <div className="h-7 relative flex items-center justify-center w-full">
        <AnimatePresence mode="wait">
          <motion.p
            key={msgIndex}
            className="absolute text-sm text-gray-400 tracking-wide"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.35, ease: "easeInOut" }}
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
            className={`h-52 rounded-xl bg-gray-200 dark:bg-white/[0.03] border border-transparent dark:border-white/[0.04] ${
              i === 2 ? "xl:col-span-2" : ""
            }`}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: [0.4, 0.7, 0.4] }}
            transition={{
              opacity: { duration: 1.8, repeat: Infinity, ease: "easeInOut", delay: i * 0.2 },
              y: { duration: 0.4, delay: i * 0.1 },
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default LoadingPlaceholder;
