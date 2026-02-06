interface LoudnessCardProps {
  title: string;
  integrated: number;
  range: number;
  truePeak: number;
}

export default function LoudnessCard({ title, integrated, range, truePeak }: LoudnessCardProps) {
  return (
    <div>
      <h3 className="text-sm font-medium text-gray-300 mb-4">{title}</h3>
      <div className="space-y-6">
        <div>
          <p className="text-xs text-gray-400 mb-1">Integrated Loudness</p>
          <p className="text-3xl font-bold text-white">{integrated.toFixed(1)}</p>
          <p className="text-xs text-gray-500 mt-1">LUFS</p>
        </div>
        <div>
          <p className="text-xs text-gray-400 mb-1">Dynamic Range</p>
          <p className="text-3xl font-bold text-white">{range.toFixed(1)}</p>
          <p className="text-xs text-gray-500 mt-1">LU</p>
        </div>
        <div>
          <p className="text-xs text-gray-400 mb-1">True Peak</p>
          <p className="text-3xl font-bold text-white">{truePeak.toFixed(1)}</p>
          <p className="text-xs text-gray-500 mt-1">dBTP</p>
        </div>
      </div>
    </div>
  );
}