import { Sun, Moon } from "lucide-react";
import { useTheme } from "../hooks/useTheme";
import LoginButton from "./LoginButton";

const Header = () => {
  const { theme, toggle } = useTheme();

  return (
    <div className="bg-white dark:bg-white/[0.04] backdrop-blur-xl border-b border-gray-200 dark:border-white/[0.08] shadow-sm dark:shadow-none">
      <div className="max-w-7xl mx-auto px-8 py-6 flex justify-between items-center">
        <div className="flex items-center gap-3">
          {/* Waveform logo */}
          <div className="flex items-end gap-[3px] h-6">
            <div className="w-[3px] rounded-full bg-accent-500 dark:bg-accent-400" style={{ height: "40%" }} />
            <div className="w-[3px] rounded-full bg-accent-500 dark:bg-accent-400" style={{ height: "70%" }} />
            <div className="w-[3px] rounded-full bg-accent-500 dark:bg-accent-400" style={{ height: "100%" }} />
            <div className="w-[3px] rounded-full bg-accent-500 dark:bg-accent-400" style={{ height: "55%" }} />
            <div className="w-[3px] rounded-full bg-accent-500 dark:bg-accent-400" style={{ height: "30%" }} />
          </div>
          <div>
            <h1 className="text-2xl font-bold font-display text-gray-900 dark:text-white">SoundScope</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Mix analysis for producers
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={toggle}
            className="p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors"
          >
            {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          <LoginButton />
        </div>
      </div>
    </div>
  );
};

export default Header;
