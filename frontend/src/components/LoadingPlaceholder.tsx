const LoadingPlaceholder = () => {
    return (
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 mt-12 animate-pulse">
        <div className="h-64 rounded-xl bg-gray-200 dark:bg-white/[0.03] border border-transparent dark:border-white/[0.04]" />
        <div className="h-64 rounded-xl bg-gray-200 dark:bg-white/[0.03] border border-transparent dark:border-white/[0.04]" />
        <div className="xl:col-span-2 h-64 rounded-xl bg-gray-200 dark:bg-white/[0.03] border border-transparent dark:border-white/[0.04]" />
      </div>
    );
  };
  
  export default LoadingPlaceholder;
  