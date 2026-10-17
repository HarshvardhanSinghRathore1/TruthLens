import logging
from typing import Optional
from app.audio_detector import audio_detector
from app.services.audio_processor import audio_processor
from app.schemas.analysis import (
    AudioAnalysisComponent,
    AudioOutcome,
    AnalysisResultStatus
)

logger = logging.getLogger("truthlens.audio_model_service")

class AudioModelService:
    """Coordinates audio stream extraction, segmentation, and Wav2Vec2 inference."""

    def __init__(self):
        self.detector = audio_detector
        self.processor = audio_processor

    @property
    def is_ready(self) -> bool:
        return self.detector.is_loaded

    @property
    def model_name(self) -> str:
        return self.detector.model_name

    def analyze_video_audio(self, video_path: str) -> AudioAnalysisComponent:
        """
        Extracts audio from video_path, validates waveform, performs segmented
        Wav2Vec2 deepfake inference, and guarantees temporary file cleanup.
        """
        # Step 1: Probe for audio stream
        if not self.processor.has_audio_stream(video_path):
            logger.info(f"Video {video_path} does not contain an audio stream.")
            return AudioAnalysisComponent(
                has_audio=False,
                status="no_audio_detected",
                outcome=AudioOutcome.AUDIO_UNAVAILABLE,
                model_name=self.model_name,
                duration_seconds=0.0,
                segments_analyzed=0,
                risk_score=None,
                score_explanation="No audio stream detected in the uploaded video file.",
                findings=[
                    "Video container was analyzed with FFmpeg; no audio stream was found.",
                    "Audio-based speech anti-spoofing was bypassed."
                ],
                limitations=[
                    "Audio forensics requires an audio stream. Silent video tracks cannot be evaluated for vocal synthesis."
                ]
            )

        # Step 2: Extract 16kHz mono audio WAV
        success, wav_path, duration, notes = self.processor.extract_audio_wav(video_path)

        if not success or not wav_path:
            logger.warning(f"Audio extraction failed for {video_path}: {notes}")
            return AudioAnalysisComponent(
                has_audio=True,
                status=AnalysisResultStatus.FAILED,
                outcome=AudioOutcome.UNABLE_TO_ASSESS,
                model_name=self.model_name,
                duration_seconds=duration,
                segments_analyzed=0,
                risk_score=None,
                score_explanation=f"Audio extraction failed: {notes}",
                findings=[
                    f"FFmpeg reported an issue reading audio stream: {notes}"
                ],
                limitations=[
                    "Audio track was unreadable, corrupted, or used an unsupported audio compression format."
                ]
            )

        try:
            # Step 3: Load waveform and slice into 5s segments
            _, segments, actual_duration = self.processor.load_and_segment_audio(wav_path)

            # Step 4: Run Wav2Vec2 inference
            result = self.detector.analyze_audio_segments(segments, actual_duration, notes=notes)
            return result

        except Exception as e:
            logger.error(f"Error during audio inference for {video_path}: {e}", exc_info=True)
            return AudioAnalysisComponent(
                has_audio=True,
                status=AnalysisResultStatus.FAILED,
                outcome=AudioOutcome.UNABLE_TO_ASSESS,
                model_name=self.model_name,
                duration_seconds=duration,
                segments_analyzed=0,
                risk_score=None,
                score_explanation="Audio inference encountered an internal error.",
                findings=[f"Inference error: {str(e)}"],
                limitations=["An unexpected error occurred during audio tensor evaluation."]
            )

        finally:
            # Step 5: Guaranteed temporary audio file removal
            self.processor.cleanup(wav_path)

audio_model_service = AudioModelService()
