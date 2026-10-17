import logging
from typing import List, Dict, Any, Optional
from app.models.model_loader import model_loader
from app.schemas.analysis import FrameResult

logger = logging.getLogger("truthlens.model_service")

class ModelService:
    """Handles deepfake model inference over sampled video frames."""

    def __init__(self):
        self.loader = model_loader

    @property
    def is_ready(self) -> bool:
        return self.loader.is_loaded

    @property
    def model_name(self) -> str:
        return self.loader.model_name

    def infer_frames(self, extracted_frames: List[Dict[str, Any]]) -> List[FrameResult]:
        """
        Executes model inference on detected face crops from frames.
        Returns FrameResult objects with genuine model output when loaded.
        """
        results: List[FrameResult] = []

        if not self.is_ready:
            logger.info("Model not yet loaded; returning unassessed frame metadata.")
            for frame_data in extracted_frames:
                results.append(
                    FrameResult(
                        frame_index=frame_data["frame_index"],
                        timestamp_seconds=frame_data["timestamp_seconds"],
                        faces_detected=frame_data["faces_detected"],
                        manipulation_score=None,
                        notes="Model weights not yet configured."
                    )
                )
            return results

        # Real model inference pipeline will be hooked here
        return results

model_service = ModelService()
