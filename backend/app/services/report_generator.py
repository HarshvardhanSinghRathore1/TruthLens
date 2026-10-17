import logging
from typing import List, Optional, Dict, Any, Tuple
from app.schemas.analysis import (
    AnalysisResponse,
    AnalysisResultStatus,
    DetectionOutcome,
    FrameResult
)
from app.core.config import settings

logger = logging.getLogger("truthlens.report_generator")

class ReportGenerator:
    """
    Compiles forensic analysis reports from frame-level detector outputs.
    
    Documented Aggregation Strategy:
      1. Collects valid manipulation scores from frames with detected faces.
      2. If 0 valid face scores are found -> Result: UNABLE_TO_ASSESS (No faces found).
      3. For videos with detected faces:
         - mean_score: Average manipulation score across all evaluated face frames.
         - top_k_mean: Average of the top 3 (or top 25%) highest risk scores. Deepfakes
           often affect specific keyframes or facial transitions rather than all frames uniformly.
         - Aggregate Risk Score = (0.65 * top_k_mean) + (0.35 * mean_score).
      4. Decision Thresholds:
         - Aggregate Risk Score >= HIGH_RISK_THRESHOLD (0.65): POTENTIAL_MANIPULATION_DETECTED.
         - Aggregate Risk Score <= LOW_RISK_THRESHOLD (0.40): NO_STRONG_SIGNS_DETECTED.
         - 0.40 < Aggregate Risk Score < 0.65: UNABLE_TO_ASSESS (Ambiguous / Inconclusive borderline).
    """

    def __init__(self):
        self.high_threshold = settings.HIGH_RISK_THRESHOLD
        self.low_threshold = settings.LOW_RISK_THRESHOLD

    def generate_report(
        self,
        analysis_id: str,
        filename: str,
        duration_seconds: Optional[float],
        frames_analyzed: int,
        frame_results: List[FrameResult],
        model_name: str,
        is_model_ready: bool
    ) -> AnalysisResponse:
        """Assembles a full AnalysisResponse based on actual model inference results."""

        # Handle uninitialized / offline model
        if not is_model_ready:
            return AnalysisResponse(
                analysis_id=analysis_id,
                status=AnalysisResultStatus.COMPLETED,
                filename=filename,
                duration_seconds=duration_seconds,
                frames_analyzed=frames_analyzed,
                result=DetectionOutcome.UNABLE_TO_ASSESS,
                risk_score=None,
                score_type="uncalibrated_offline_detector",
                score_explanation="Pretrained detector weights are not loaded. TruthLens does not fabricate detection scores.",
                summary="The video was processed for frame extraction and facial localization, but deepfake model inference was unavailable.",
                findings=[
                    f"Video duration: {duration_seconds}s." if duration_seconds else "Video duration: Not available.",
                    f"Sampled {frames_analyzed} frames across playback duration.",
                    "Detector adapter offline; awaiting model weights."
                ],
                frame_results=frame_results,
                model_name=model_name,
                limitations=[
                    "Inference could not be executed because model weights were uninitialized.",
                    "Analysis was limited to frame extraction and face localization."
                ],
                error="Model weights unavailable or failed to initialize."
            )

        # Extract scored frames
        valid_scores = [fr.manipulation_score for fr in frame_results if fr.manipulation_score is not None]
        total_faces_found = sum(fr.faces_detected for fr in frame_results)

        # Case 1: No faces detected in video
        if not valid_scores or total_faces_found == 0:
            return AnalysisResponse(
                analysis_id=analysis_id,
                status=AnalysisResultStatus.COMPLETED,
                filename=filename,
                duration_seconds=duration_seconds,
                frames_analyzed=frames_analyzed,
                result=DetectionOutcome.UNABLE_TO_ASSESS,
                risk_score=None,
                score_type="facial_region_anomaly_index",
                score_explanation="No human facial regions were localized in the sampled frames.",
                summary="Unable to assess video: TruthLens AI forensic detection requires localized human faces, but no faces were identified in the sampled frames.",
                findings=[
                    f"Evaluated {frames_analyzed} sampled frames across {duration_seconds or 0:.1f}s playback.",
                    "Haar cascade facial localization identified 0 human face regions.",
                    "Non-facial visual media or abstract content cannot be assessed by facial forensics models."
                ],
                frame_results=frame_results,
                model_name=model_name,
                limitations=[
                    "The current detector is specialized for facial manipulation and cannot evaluate full-scene diffusion without visible faces.",
                    "Heavy occlusions, extreme profile angles, or low lighting may prevent face detection."
                ],
                error=None
            )

        # Compute aggregate metrics
        mean_score = sum(valid_scores) / len(valid_scores)
        sorted_scores = sorted(valid_scores, reverse=True)
        top_k_count = min(3, len(sorted_scores))
        top_k_mean = sum(sorted_scores[:top_k_count]) / top_k_count
        peak_score = sorted_scores[0]

        # Weighted heuristic risk index
        aggregate_risk = round((0.65 * top_k_mean) + (0.35 * mean_score), 4)

        # Find timestamp of peak anomaly
        peak_frame = max(frame_results, key=lambda f: f.manipulation_score if f.manipulation_score is not None else -1.0)
        peak_ts = peak_frame.timestamp_seconds

        # Determine forensic outcome
        if aggregate_risk >= self.high_threshold:
            outcome = DetectionOutcome.POTENTIAL_MANIPULATION_DETECTED
            summary = (
                f"Potential facial manipulation detected. Visual artifacts consistent with AI synthesis "
                f"or face swapping were identified across sampled keyframes (aggregate risk score: {aggregate_risk:.2f})."
            )
            score_explanation = (
                f"Heuristic risk score {aggregate_risk:.2f} is an aggregate weighted index derived from Vision "
                f"Transformer feature anomalies, with peak anomaly ({peak_score:.2f}) observed near {peak_ts:.1f}s."
            )
        elif aggregate_risk <= self.low_threshold:
            outcome = DetectionOutcome.NO_STRONG_SIGNS_DETECTED
            summary = (
                f"No strong signs of facial manipulation detected. Sampled facial textures and boundary "
                f"transitions appear consistent with authentic camera captures (aggregate risk score: {aggregate_risk:.2f})."
            )
            score_explanation = (
                f"Heuristic risk score {aggregate_risk:.2f} reflects low anomaly indices across "
                f"{len(valid_scores)} evaluated facial regions."
            )
        else:
            outcome = DetectionOutcome.UNABLE_TO_ASSESS
            summary = (
                f"Inconclusive analysis. The aggregate anomaly score ({aggregate_risk:.2f}) falls in the ambiguous "
                f"borderline range ({self.low_threshold:.2f} - {self.high_threshold:.2f}), where compression noise "
                f"or low resolution cannot be conclusively distinguished from synthetic manipulation."
            )
            score_explanation = (
                f"Borderline score {aggregate_risk:.2f} indicates inconclusive forensic confidence. "
                f"Neither authenticity nor manipulation can be strongly asserted."
            )

        # Compile granular findings
        high_risk_count = sum(1 for s in valid_scores if s >= self.high_threshold)
        findings = [
            f"Analyzed {frames_analyzed} uniform frames over {duration_seconds or 0:.1f}s video duration.",
            f"Localized human faces in {len(valid_scores)} of {frames_analyzed} sampled frames.",
            f"Average facial anomaly score: {mean_score:.2f}; peak anomaly score: {peak_score:.2f} (at {peak_ts:.1f}s).",
            f"Frames exceeding high-risk threshold ({self.high_threshold:.2f}): {high_risk_count} of {len(valid_scores)}.",
            f"Model architecture: Pretrained Vision Transformer ({model_name})."
        ]

        limitations = [
            "Automated model inference provides a forensic risk estimate, not mathematical or legal proof of authenticity.",
            "Re-encoding, social media compression, motion blur, and low lighting can mimic or mask manipulation artifacts.",
            "Audio-video synchronization and voice synthesis are not analyzed by this image-based detector.",
            "Predictions should be evaluated alongside chain-of-custody and corroborating context."
        ]

        return AnalysisResponse(
            analysis_id=analysis_id,
            status=AnalysisResultStatus.COMPLETED,
            filename=filename,
            duration_seconds=duration_seconds,
            frames_analyzed=frames_analyzed,
            result=outcome,
            risk_score=aggregate_risk,
            score_type="aggregate_face_anomaly_score",
            score_explanation=score_explanation,
            summary=summary,
            findings=findings,
            frame_results=frame_results,
            model_name=model_name,
            limitations=limitations,
            error=None
        )

report_generator = ReportGenerator()
