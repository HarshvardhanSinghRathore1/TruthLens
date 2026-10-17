from datetime import datetime, timezone
from enum import Enum
from typing import List, Optional
from pydantic import BaseModel, Field

class AnalysisResultStatus(str, Enum):
    COMPLETED = "completed"
    PROCESSING = "processing"
    FAILED = "failed"

class DetectionOutcome(str, Enum):
    POTENTIAL_MANIPULATION_DETECTED = "potential_manipulation_detected"
    NO_STRONG_SIGNS_DETECTED = "no_strong_signs_detected"
    UNABLE_TO_ASSESS = "unable_to_assess"

class VideoOutcome(str, Enum):
    POTENTIALLY_GENUINE = "potentially_genuine"
    POTENTIALLY_MANIPULATED = "potentially_manipulated"
    UNABLE_TO_ASSESS = "unable_to_assess"

class AudioOutcome(str, Enum):
    POTENTIALLY_GENUINE_SPEECH = "potentially_genuine_speech"
    POTENTIALLY_SPOOFED_SPEECH = "potentially_spoofed_speech"
    UNABLE_TO_ASSESS = "unable_to_assess"
    AUDIO_UNAVAILABLE = "audio_unavailable"

class FrameResult(BaseModel):
    frame_index: int
    timestamp_seconds: float
    faces_detected: int = 0
    manipulation_score: Optional[float] = None
    preview_image: Optional[str] = None
    notes: Optional[str] = None

class VideoAnalysisComponent(BaseModel):
    status: AnalysisResultStatus = AnalysisResultStatus.COMPLETED
    outcome: VideoOutcome = VideoOutcome.UNABLE_TO_ASSESS
    model_name: str
    frames_analyzed: int
    faces_detected: Optional[int] = 0
    risk_score: Optional[float] = None
    score_explanation: Optional[str] = None
    findings: List[str] = Field(default_factory=list)
    limitations: List[str] = Field(default_factory=list)

class AudioAnalysisComponent(BaseModel):
    has_audio: bool = False
    status: str = "no_audio_detected"
    outcome: AudioOutcome = AudioOutcome.AUDIO_UNAVAILABLE
    model_name: str = "Audio Forensics Module"
    duration_seconds: Optional[float] = None
    segments_analyzed: Optional[int] = 0
    risk_score: Optional[float] = None
    score_explanation: Optional[str] = None
    findings: List[str] = Field(default_factory=list)
    limitations: List[str] = Field(default_factory=list)

class AVConsistencyComponent(BaseModel):
    status: str = "not_checked"
    sync_score: Optional[float] = None
    active_speaking_frames: Optional[int] = None
    findings: List[str] = Field(default_factory=list)
    disclaimer: str = "TruthLens facial detector analyzes spatial video frames. Lip-sync correlation is not computed."

class AnalysisResponse(BaseModel):
    analysis_id: str = Field(..., description="Unique analysis execution identifier")
    status: AnalysisResultStatus = Field(..., description="Processing status of the analysis")
    filename: str = Field(..., description="Name of the uploaded media file")
    duration_seconds: Optional[float] = Field(None, description="Video duration in seconds")
    frames_analyzed: int = Field(0, description="Total number of frames processed by detector")
    result: DetectionOutcome = Field(..., description="Forensic evaluation outcome")
    risk_score: Optional[float] = Field(
        None,
        ge=0.0,
        le=1.0,
        description="Calculated risk score between 0.00 and 1.00 (only when meaningful)"
    )
    score_type: Optional[str] = Field(
        None,
        description="Metric name, e.g. normalized_risk_index"
    )
    score_explanation: Optional[str] = Field(
        None,
        description="Plain-language description of how the risk score was derived"
    )
    summary: str = Field(..., description="Executive conclusion for non-technical users")
    findings: List[str] = Field(default_factory=list, description="List of granular forensic observations")
    frame_results: Optional[List[FrameResult]] = Field(
        default_factory=list,
        description="Frame-level inspection metrics where available"
    )
    model_name: str = Field(..., description="Model architecture identifier used for inference")
    limitations: List[str] = Field(
        default_factory=list,
        description="Methodological limitations, caveats, and disclaimers"
    )
    error: Optional[str] = Field(None, description="Error details if analysis could not be completed")
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    # Multimodal component extensions matching frontend expectations
    video_analysis: Optional[VideoAnalysisComponent] = None
    audio_analysis: Optional[AudioAnalysisComponent] = None
    av_consistency: Optional[AVConsistencyComponent] = None

class HealthResponse(BaseModel):
    status: str = "ok"
    app_name: str = "TruthLens AI"
    version: str = "1.0.0"
    model_loaded: bool = False
    model_name: str = "TruthLens Detector"
    audio_model_loaded: bool = False
    audio_model_name: str = "Audio Forensics (Offline)"
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
