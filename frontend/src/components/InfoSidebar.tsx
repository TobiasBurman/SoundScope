import { AudioWaveform, Upload, BarChart3, Lightbulb } from "lucide-react";

const cardClass =
  "rounded-2xl p-5 bg-white dark:bg-white/[0.05] border border-gray-200 dark:border-white/[0.10] shadow-lg shadow-gray-200/50 dark:shadow-none dark:backdrop-blur-sm";

const InfoSidebar = () => (
  <div className="space-y-4">
    {/* About */}
    <div className={cardClass}>
      <div className="flex items-center gap-2 mb-3">
        <AudioWaveform size={14} className="text-accent-500" />
        <h3 className="text-[11px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
          About
        </h3>
      </div>
      <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
        SoundScope analyzes your mix against professional standards — loudness,
        dynamics, frequency balance and more.
      </p>
    </div>

    {/* How it works */}
    <div className={cardClass}>
      <div className="flex items-center gap-2 mb-3">
        <BarChart3 size={14} className="text-accent-500" />
        <h3 className="text-[11px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
          How it works
        </h3>
      </div>
      <ol className="space-y-2.5">
        {[
          { icon: Upload, text: "Upload your mix" },
          { icon: BarChart3, text: "Get instant analysis" },
          { icon: AudioWaveform, text: "Improve with AI feedback" },
        ].map(({ icon: Icon, text }) => (
          <li key={text} className="flex items-center gap-2.5">
            <div className="w-5 h-5 rounded-md bg-accent-500/10 flex items-center justify-center shrink-0">
              <Icon size={11} className="text-accent-500" />
            </div>
            <span className="text-xs text-gray-600 dark:text-gray-400">
              {text}
            </span>
          </li>
        ))}
      </ol>
    </div>

    {/* Quick Tips */}
    <div className={cardClass}>
      <div className="flex items-center gap-2 mb-3">
        <Lightbulb size={14} className="text-accent-500" />
        <h3 className="text-[11px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
          Quick Tips
        </h3>
      </div>
      <ul className="space-y-2 text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
        <li>Aim for -14 to -8 LUFS depending on genre</li>
        <li>Keep true peak below 0 dBTP for streaming</li>
        <li>Compare against a reference track you love</li>
      </ul>
    </div>
  </div>
);

export default InfoSidebar;
