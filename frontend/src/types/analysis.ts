export type AnalysisResultStatus = 'completed' | 'processing' | 'failed';

export type DetectionOutcome =
  | 'potential_manipulation_detected'
  | 'no_strong_signs_detected'
  | 'unable_to_assess';

export type VideoOutcome =
  | 'potentially_genuine'
  | 'potentially_manipulated'
  | 'unable_to_assess';

export type AudioOutcome =
  | 'potentially_genuine_speech'
  | 'potentially_spoofed_speech'
  | 'unable_to_assess'
  | 'audio_unavailable';

export interface FrameResult {
  frame_index: number;
  timestamp_seconds: number;
  faces_detected: number;
  manipulation_score?: number | null;
  notes?: string | null;
}

export interface VideoAnalysisComponent {
  status: AnalysisResultStatus;
  outcome: VideoOutcome;
  model_name: string;
  frames_analyzed: number;
  faces_detected?: number;
  risk_score: number | null;
  score_explanation?: string | null;
  findings: string[];
  limitations: string[];
}

export interface AudioAnalysisComponent {
  has_audio: boolean;
  status: AnalysisResultStatus | 'no_audio_detected';
  outcome: AudioOutcome;
  model_name: string;
  duration_seconds: number | null;
  segments_analyzed?: number;
  risk_score: number | null;
  score_explanation?: string | null;
  findings: string[];
  limitations: string[];
}

export interface AVConsistencyComponent {
  status: 'completed' | 'unable_to_assess' | 'not_checked';
  sync_score?: number | null;
  active_speaking_frames?: number;
  findings: string[];
  disclaimer: string;
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

  // Multimodal extensions (populated if backend returns them, or derived cleanly)
  video_analysis?: VideoAnalysisComponent;
  audio_analysis?: AudioAnalysisComponent;
  av_consistency?: AVConsistencyComponent;
}

export interface HealthResponse {
  status: string;
  app_name: string;
  version: string;
  model_loaded: boolean;
  model_name: string;
  audio_model_loaded?: boolean;
  audio_model_name?: string;
  timestamp: string;
}
