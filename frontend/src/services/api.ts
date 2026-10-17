import axios, { AxiosInstance } from 'axios';
import { AnalysisResponse, HealthResponse } from '@/types/analysis';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

export const apiClient: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 120000, // 2 minutes for processing video
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error.response?.data?.detail ||
      error.response?.data?.message ||
      error.message ||
      'An unexpected error occurred during API communication.';
    return Promise.reject(new Error(message));
  }
);

export const apiService = {
  /**
   * Health check to ensure server and model connectivity.
   */
  async checkHealth(): Promise<HealthResponse> {
    const response = await apiClient.get<HealthResponse>('/health');
    return response.data;
  },

  /**
   * Upload video for frame extraction and deepfake analysis.
   */
  async analyzeVideo(
    file: File,
    onProgress?: (percent: number) => void
  ): Promise<AnalysisResponse> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await apiClient.post<AnalysisResponse>('/analyze', formData, {
      onUploadProgress: (progressEvent) => {
        if (progressEvent.total && onProgress) {
          const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(percent);
        }
      },
    });

    return response.data;
  },

  /**
   * Fetch historical analysis by ID (if enabled).
   */
  async getAnalysisById(analysisId: string): Promise<AnalysisResponse> {
    const response = await apiClient.get<AnalysisResponse>(`/analyses/${analysisId}`);
    return response.data;
  },
};
