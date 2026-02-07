import LoginButton from "./LoginButton";

const Header = () => {
  return (
    <div className="bg-[#202f3d] border-b border-[#2d3e4f]">
      <div className="max-w-7xl mx-auto px-8 py-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-white">SoundScope</h1>
          <p className="text-sm text-gray-400">
            AI-powered reference-based mix analysis
          </p>
        </div>

        <LoginButton />
      </div>
    </div>
  );
};

export default Header;
