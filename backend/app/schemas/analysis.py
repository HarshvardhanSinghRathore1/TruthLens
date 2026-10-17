from datetime import datetime
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

class FrameResult(BaseModel):
    frame_index: int
    timestamp_seconds: float
    faces_detected: int = 0
    manipulation_score: Optional[float] = None
    notes: Optional[str] = None

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
    created_at: datetime = Field(default_factory=datetime.utcnow)

class HealthResponse(BaseModel):
    status: str = "ok"
    app_name: str = "TruthLens AI"
    version: str = "1.0.0"
    model_loaded: bool = False
    model_name: str = "TruthLens Detector"
    timestamp: datetime = Field(default_factory=datetime.utcnow)
