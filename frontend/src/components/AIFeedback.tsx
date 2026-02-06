interface AIFeedbackProps {
  feedback: string;
}

const Section = ({ title, content }: { title: string; content: string }) => (
  <div className="bg-[#1c2a38] border border-[#2d3e4f] rounded-lg p-5">
    <h4 className="text-sm font-semibold text-[#a2e4f4] mb-3">
      {title}
    </h4>

    <div className="text-sm text-gray-300 leading-relaxed whitespace-pre-wrap">
      {content}
    </div>
  </div>
);

const parseSections = (text: string) => {
  const cleaned = text.replace(/#+\s*/g, "");

  const parts = cleaned.split(/\n(?=\d+\.\s|\bOverall\b|\bPriority\b)/);

  return parts.map((block) => {
    const lines = block.trim().split("\n");
    const title = lines[0];
    const content = lines.slice(1).join("\n");
    return { title, content };
  });
};

const AIFeedback = ({ feedback }: AIFeedbackProps) => {
  const sections = parseSections(feedback);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {sections.map((s, i) => (
        <Section key={i} title={s.title} content={s.content} />
      ))}
    </div>
  );
};

export default AIFeedback;
