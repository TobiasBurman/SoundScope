interface ProgressBarProps {
    active: boolean;
  }
  
  const ProgressBar = ({ active }: ProgressBarProps) => {
    if (!active) return null;
  
    return (
      <div className="w-full h-2 bg-[#1c2a38] rounded-full overflow-hidden mt-6">
        <div className="h-full w-1/3 bg-gradient-to-r from-blue-400 to-blue-600 animate-progress" />
      </div>
    );
  };
  
  export default ProgressBar;
  