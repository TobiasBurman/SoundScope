import { useMutation } from '@tanstack/react-query';
import axios from 'axios';
import type { AnalysisResponse } from '../types/analysis';
import type { PresetId } from "../types";

interface AnalyzeAudioParams {
  userMix: File;
  reference?: File;
  preset?: PresetId;
}

async function analyzeAudio({ userMix, reference, preset }: AnalyzeAudioParams): Promise<AnalysisResponse> {
  const formData = new FormData();
  formData.append('userMix', userMix);
  if (reference) {
    formData.append('reference', reference);
  }
  if (preset) {
    formData.append("preset", preset);
  }
  

  const response = await axios.post<AnalysisResponse>(
    'http://localhost:3000/api/upload',
    formData
  );

  return response.data;
}

export function useAnalyzeAudio() {
  return useMutation({
    mutationFn: analyzeAudio,
  });
}
