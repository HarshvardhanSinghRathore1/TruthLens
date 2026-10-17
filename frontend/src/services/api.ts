import axios, { AxiosInstance } from 'axios';
import { AnalysisResponse, HealthResponse } from '@/types/analysis';
import {
  NewsResponse,
  NewsStatusResponse,
  NewsStory,
  NewsQueryParams,
} from '@/types/news';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

export const apiClient: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 600000, // 10 minutes for processing large/high-res video on CPU
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

  /**
   * Retrieve filtered and paginated Deepfake Radar news stories.
   */
  async getNews(params: NewsQueryParams = {}): Promise<NewsResponse> {
    const response = await apiClient.get<NewsResponse>('/news', { params });
    return response.data;
  },

  /**
   * Query status and health of the news discovery engine.
   */
  async getNewsStatus(): Promise<NewsStatusResponse> {
    const response = await apiClient.get<NewsStatusResponse>('/news/status');
    return response.data;
  },

  /**
   * Trigger controlled manual refresh of the news feeds.
   */
  async refreshNews(force: boolean = false): Promise<{ status: string; message: string; total_stories: number }> {
    const response = await apiClient.post('/news/refresh', null, { params: { force } });
    return response.data;
  },

  /**
   * Fetch details for a specific story by its ID.
   */
  async getNewsStory(storyId: string): Promise<NewsStory> {
    const response = await apiClient.get<NewsStory>(`/news/${storyId}`);
    return response.data;
  },

  /**
   * Submit a remote video URL linked to a news story for forensic analysis.
   */
  async analyzeRemoteVideo(videoUrl: string, newsId?: string): Promise<AnalysisResponse> {
    const response = await apiClient.post<AnalysisResponse>('/news/analyze-url', {
      video_url: videoUrl,
      news_id: newsId,
    });
    return response.data;
  },
};

