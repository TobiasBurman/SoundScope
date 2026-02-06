const LoadingPlaceholder = () => {
    return (
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 mt-12 animate-pulse">
        <div className="h-64 rounded-xl bg-[#202f3d]" />
        <div className="h-64 rounded-xl bg-[#202f3d]" />
        <div className="xl:col-span-2 h-64 rounded-xl bg-[#202f3d]" />
      </div>
    );
  };
  
  export default LoadingPlaceholder;
  