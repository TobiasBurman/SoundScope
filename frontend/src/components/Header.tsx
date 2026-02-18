import { Sun, Moon } from "lucide-react";
import { useTheme } from "../hooks/useTheme";
import LoginButton from "./LoginButton";

const Header = () => {
  const { theme, toggle } = useTheme();

  return (
    <div className="bg-white dark:bg-[#202f3d] border-b border-gray-400/60 dark:border-[#2d3e4f] shadow-sm dark:shadow-none">
      <div className="max-w-7xl mx-auto px-8 py-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">SoundScope</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            AI-powered reference-based mix analysis
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={toggle}
            className="p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-[#1c2a38] transition-colors"
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
