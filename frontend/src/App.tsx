import { useState } from 'react';
import axios from 'axios';

interface AnalysisResult {
  duration: number;
  sampleRate: number;
  bitDepth?: number;
  channels: number;
  format: string;
  loudness?: {
    integrated: number;
    range: number;
    truePeak: number;
  };
}

interface UploadResponse {
  message: string;
  userMix: {
    file: {
      originalName: string;
      size: number;
    };
    analysis: AnalysisResult;
  };
  reference: {
    file: {
      originalName: string;
      size: number;
    };
    analysis: AnalysisResult;
  } | null;
  comparison: {
    loudnessDiff: number;
    rangeDiff: number;
    peakDiff: number;
  } | null;
  aiFeedback: string;
}

function App() {
  const [userMixFile, setUserMixFile] = useState<File | null>(null);
  const [referenceFile, setReferenceFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<UploadResponse | null>(null);

  const handleAnalyze = async () => {
    if (!userMixFile) {
      alert('Please upload your mix first');
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append('userMix', userMixFile);
    if (referenceFile) {
      formData.append('reference', referenceFile);
    }

    try {
      const response = await axios.post<UploadResponse>(
        'http://localhost:3000/api/upload',
        formData
      );
      setResult(response.data);
    } catch (err) {
      console.error('Analysis failed:', err);
      alert('Analysis failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <h1 className="text-3xl font-bold text-gray-900">SoundScope</h1>
          <p className="text-gray-500 mt-1">AI Mixing Assistant with Reference Comparison</p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Upload Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Your Mix */}
          <div className="border-2 border-gray-300 rounded-lg p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Your Mix</h3>
            <input
              type="file"
              accept=".mp3,.wav,.flac,.m4a,.aiff"
              onChange={(e) => e.target.files && setUserMixFile(e.target.files[0])}
              className="hidden"
              id="user-mix-upload"
            />
            <label
              htmlFor="user-mix-upload"
              className="block border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-gray-400"
            >
              {userMixFile ? (
                <div>
                  <p className="font-medium text-gray-900">{userMixFile.name}</p>
                  <p className="text-sm text-gray-500 mt-1">
                    {(userMixFile.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              ) : (
                <div>
                  <p className="text-gray-600">Click to upload</p>
                  <p className="text-sm text-gray-400 mt-1">Required</p>
                </div>
              )}
            </label>
          </div>

          {/* Reference Track */}
          <div className="border-2 border-gray-300 rounded-lg p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Reference Track (Optional)</h3>
            <input
              type="file"
              accept=".mp3,.wav,.flac,.m4a,.aiff"
              onChange={(e) => e.target.files && setReferenceFile(e.target.files[0])}
              className="hidden"
              id="reference-upload"
            />
            <label
              htmlFor="reference-upload"
              className="block border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-gray-400"
            >
              {referenceFile ? (
                <div>
                  <p className="font-medium text-gray-900">{referenceFile.name}</p>
                  <p className="text-sm text-gray-500 mt-1">
                    {(referenceFile.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              ) : (
                <div>
                  <p className="text-gray-600">Click to upload</p>
                  <p className="text-sm text-gray-400 mt-1">Optional</p>
                </div>
              )}
            </label>
          </div>
        </div>

        {/* Analyze Button */}
        <button
          onClick={handleAnalyze}
          disabled={!userMixFile || loading}
          className="w-full py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed font-semibold mb-8"
        >
          {loading ? 'ANALYZING...' : 'ANALYZE'}
        </button>

        {/* Results */}
        {result && (
          <div className="space-y-6">
            {/* Comparison Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Your Mix Results */}
              <div className="border border-gray-200 rounded-lg p-6 bg-gray-50">
                <h3 className="font-semibold text-gray-900 mb-4">Your Mix</h3>
                {result.userMix.analysis.loudness && (
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-gray-500">Integrated Loudness</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {result.userMix.analysis.loudness.integrated.toFixed(1)} LUFS
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Dynamic Range</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {result.userMix.analysis.loudness.range.toFixed(1)} LU
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">True Peak</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {result.userMix.analysis.loudness.truePeak.toFixed(1)} dBTP
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Reference Results */}
              {result.reference && (
                <div className="border border-gray-200 rounded-lg p-6 bg-gray-50">
                  <h3 className="font-semibold text-gray-900 mb-4">Reference Track</h3>
                  {result.reference.analysis.loudness && (
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm text-gray-500">Integrated Loudness</p>
                        <p className="text-2xl font-bold text-gray-900">
                          {result.reference.analysis.loudness.integrated.toFixed(1)} LUFS
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Dynamic Range</p>
                        <p className="text-2xl font-bold text-gray-900">
                          {result.reference.analysis.loudness.range.toFixed(1)} LU
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">True Peak</p>
                        <p className="text-2xl font-bold text-gray-900">
                          {result.reference.analysis.loudness.truePeak.toFixed(1)} dBTP
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Comparison Stats */}
            {result.comparison && (
              <div className="border border-gray-900 rounded-lg p-6 bg-gray-900 text-white">
                <h3 className="font-semibold mb-4">Differences</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm text-gray-300">Loudness Difference</p>
                    <p className="text-2xl font-bold">
                      {result.comparison.loudnessDiff > 0 ? '+' : ''}
                      {result.comparison.loudnessDiff.toFixed(1)} LUFS
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-300">Range Difference</p>
                    <p className="text-2xl font-bold">
                      {result.comparison.rangeDiff > 0 ? '+' : ''}
                      {result.comparison.rangeDiff.toFixed(1)} LU
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-300">Peak Difference</p>
                    <p className="text-2xl font-bold">
                      {result.comparison.peakDiff > 0 ? '+' : ''}
                      {result.comparison.peakDiff.toFixed(1)} dB
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* AI Feedback */}
            <div className="border border-gray-200 rounded-lg p-6 bg-gray-50">
              <h3 className="font-semibold text-gray-900 mb-4">🤖 AI Analysis</h3>
              <div className="prose max-w-none">
                <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                  {result.aiFeedback}
                </p>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;