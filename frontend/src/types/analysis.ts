export type AnalysisResultStatus = 'completed' | 'processing' | 'failed';

export type DetectionOutcome =
  | 'potential_manipulation_detected'
  | 'no_strong_signs_detected'
  | 'unable_to_assess';

export interface FrameResult {
  frame_index: number;
  timestamp_seconds: number;
  faces_detected: number;
  manipulation_score?: number | null;
  notes?: string | null;
}

export interface AnalysisResponse {
  analysis_id: string;
  status: AnalysisResultStatus;
  filename: string;
  duration_seconds: number | null;
  frames_analyzed: number;
  result: DetectionOutcome;
  risk_score: number | null;
  score_type: string | null;
  score_explanation: string | null;
  summary: string;
  findings: string[];
  frame_results?: FrameResult[];
  model_name: string;
  limitations: string[];
  error?: string | null;
  created_at?: string;
}

export interface HealthResponse {
  status: string;
  app_name: string;
  version: string;
  model_loaded: boolean;
  model_name: string;
  timestamp: string;
}
