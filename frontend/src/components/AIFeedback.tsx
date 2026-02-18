import { AlertTriangle, AlertCircle, Info } from "lucide-react";
import type { AIFeedbackResult } from "../types/analysis";

interface AIFeedbackProps {
  feedback: AIFeedbackResult;
}

const severityConfig = {
  critical: {
    icon: AlertTriangle,
    color: "text-red-400",
    bg: "bg-red-400/5",
    border: "border-red-400/20",
    badge: "bg-red-400/15 text-red-300",
    label: "Fix",
  },
  warning: {
    icon: AlertCircle,
    color: "text-yellow-400",
    bg: "bg-yellow-400/5",
    border: "border-yellow-400/20",
    badge: "bg-yellow-400/15 text-yellow-300",
    label: "Improve",
  },
  info: {
    icon: Info,
    color: "text-blue-400",
    bg: "bg-blue-400/5",
    border: "border-blue-400/20",
    badge: "bg-blue-400/15 text-blue-300",
    label: "Tip",
  },
};

const AIFeedback = ({ feedback }: AIFeedbackProps) => {
  return (
    <div className="space-y-5">
      {/* Verdict + Summary */}
      <div>
        <p className="text-base text-gray-900 dark:text-white font-medium leading-snug">
          {feedback.verdict}
        </p>
        <p className="text-sm text-gray-400 mt-2 leading-relaxed">
          {feedback.summary}
        </p>
      </div>

      {/* Issues grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {feedback.issues.map((issue, i) => {
          const config = severityConfig[issue.severity];
          const Icon = config.icon;

          return (
            <div
              key={i}
              className={`rounded-lg border p-4 ${config.bg} ${config.border}`}
            >
              <div className="flex items-start gap-2.5 mb-2">
                <Icon size={16} className={`shrink-0 mt-0.5 ${config.color}`} />
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
                      {issue.title}
                    </h4>
                    <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${config.badge}`}>
                      {config.label}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 mt-1 leading-relaxed">
                    {issue.detail}
                  </p>
                </div>
              </div>
              <div className="ml-6 mt-2 px-2.5 py-1.5 rounded bg-gray-50 dark:bg-[#1c2a38] border border-gray-200 dark:border-[#2d3e4f]">
                <p className="text-xs text-gray-600 dark:text-gray-300">
                  {issue.action}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AIFeedback;
