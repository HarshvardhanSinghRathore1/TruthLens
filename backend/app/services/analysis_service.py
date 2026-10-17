import uuid
import logging
from typing import Optional
from app.schemas.analysis import (
    AnalysisResponse,
    AnalysisResultStatus,
    DetectionOutcome,
    FrameResult,
    AudioAnalysisComponent,
    AudioOutcome
)
from app.services.video_processor import video_processor
from app.services.model_service import model_service
from app.services.audio_model_service import audio_model_service
from app.services.report_generator import report_generator
from app.core.config import settings

logger = logging.getLogger("truthlens.analysis_service")

class AnalysisService:
    """Coordinates multimodal video ingestion, frame extraction, audio extraction, model inference, and report compilation."""

    async def process_video(self, file_path: str, original_filename: str) -> AnalysisResponse:
        analysis_id = f"tl-{uuid.uuid4().hex[:12]}"
        logger.info(f"Initiating multimodal analysis {analysis_id} for file '{original_filename}'")

        try:
            # 1. Video Stream: Extract frames and locate faces using OpenCV
            frames, video_stats = video_processor.extract_sampled_frames(file_path)
            duration = video_stats.get("duration_seconds", 0.0)
            frames_count = len(frames)

            # 2. Video Model: Run Vision Transformer inference on facial crops
            frame_results = model_service.infer_frames(frames)

            # 3. Audio Stream: Extract and run Wav2Vec2 speech anti-spoofing
            audio_result = None
            if settings.ENABLE_AUDIO_DETECTION:
                try:
                    audio_result = audio_model_service.analyze_video_audio(file_path)
                    logger.info(
                        f"Audio analysis for {analysis_id} completed: status={audio_result.status}, "
                        f"outcome={audio_result.outcome}, score={audio_result.risk_score}"
                    )
                except Exception as audio_err:
                    logger.warning(f"Audio analysis failed for {analysis_id}: {audio_err}", exc_info=True)
                    audio_result = AudioAnalysisComponent(
                        has_audio=True,
                        status=AnalysisResultStatus.FAILED,
                        outcome=AudioOutcome.UNABLE_TO_ASSESS,
                        model_name=audio_model_service.model_name,
                        duration_seconds=duration,
                        segments_analyzed=0,
                        risk_score=None,
                        score_explanation="Audio analysis encountered an unexpected error.",
                        findings=[f"Audio processing error: {str(audio_err)}"],
                        limitations=["Audio could not be evaluated due to an internal error."]
                    )
            else:
                audio_result = AudioAnalysisComponent(
                    has_audio=False,
                    status="no_audio_detected",
                    outcome=AudioOutcome.AUDIO_UNAVAILABLE,
                    model_name="Audio Forensics (Disabled in Config)",
                    duration_seconds=duration,
                    findings=["Audio forensics is disabled in settings."]
                )

            # 4. Compile multimodal report with documented aggregation strategy
            report = report_generator.generate_report(
                analysis_id=analysis_id,
                filename=original_filename,
                duration_seconds=duration,
                frames_analyzed=frames_count,
                frame_results=frame_results,
                model_name=model_service.model_name,
                is_model_ready=model_service.is_ready,
                audio_analysis=audio_result
            )

            logger.info(
                f"Multimodal Analysis {analysis_id} completed: result={report.result}, "
                f"risk_score={report.risk_score}, frames={frames_count}"
            )
            return report

        except Exception as e:
            logger.error(f"Analysis error for {original_filename}: {e}", exc_info=True)
            return AnalysisResponse(
                analysis_id=analysis_id,
                status=AnalysisResultStatus.FAILED,
                filename=original_filename,
                duration_seconds=None,
                frames_analyzed=0,
                result=DetectionOutcome.UNABLE_TO_ASSESS,
                risk_score=None,
                score_type=None,
                score_explanation=None,
                summary=f"Video analysis could not be completed: {str(e)}",
                findings=[],
                frame_results=[],
                model_name=model_service.model_name,
                limitations=[
                    "An unexpected error occurred during frame extraction or model inference.",
                    "Ensure the video is valid and not corrupted or formatted with unsupported codecs."
                ],
                error=str(e)
            )

analysis_service = AnalysisService()
