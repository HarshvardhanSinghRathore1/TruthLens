import logging
from typing import List, Dict, Any, Optional
from app.models.model_loader import model_loader
from app.detector import detector
from app.schemas.analysis import FrameResult

logger = logging.getLogger("truthlens.model_service")

class ModelService:
    """Coordinates deepfake detector inference across sampled frames."""

    def __init__(self):
        self.loader = model_loader
        self.detector = detector

    @property
    def is_ready(self) -> bool:
        return self.loader.is_loaded

    @property
    def model_name(self) -> str:
        return self.loader.model_name

    def infer_frames(self, extracted_frames: List[Dict[str, Any]]) -> List[FrameResult]:
        """
        Runs model inference on localized facial crops from each frame.
        When multiple faces exist in a frame, the primary anomaly score is recorded.
        Returns FrameResult objects with genuine model output.
        """
        results: List[FrameResult] = []

        if not self.is_ready:
            logger.warning("Detector model is not ready. Returning unassessed frame metadata.")
            for frame_data in extracted_frames:
                results.append(
                    FrameResult(
                        frame_index=frame_data["frame_index"],
                        timestamp_seconds=frame_data["timestamp_seconds"],
                        faces_detected=frame_data["faces_detected"],
                        manipulation_score=None,
                        preview_image=frame_data.get("preview_image"),
                        notes="Model uninitialized. No fabricated scores generated."
                    )
                )
            return results

        for frame_data in extracted_frames:
            faces_detected = frame_data["faces_detected"]
            face_crops = frame_data.get("face_crops", [])
            preview_b64 = frame_data.get("preview_image")
            ts = frame_data["timestamp_seconds"]
            idx = frame_data["frame_index"]

            if faces_detected == 0 or len(face_crops) == 0:
                results.append(
                    FrameResult(
                        frame_index=idx,
                        timestamp_seconds=ts,
                        faces_detected=0,
                        manipulation_score=None,
                        preview_image=preview_b64,
                        notes="No human face localized in this sampled frame."
                    )
                )
                continue

            # Run inference on each detected face crop
            crop_scores = []
            for crop in face_crops:
                pred = self.detector.predict_image(crop)
                if pred.get("success") and pred.get("manipulation_score") is not None:
                    crop_scores.append(pred["manipulation_score"])

            if not crop_scores:
                results.append(
                    FrameResult(
                        frame_index=idx,
                        timestamp_seconds=ts,
                        faces_detected=faces_detected,
                        manipulation_score=None,
                        preview_image=preview_b64,
                        notes="Facial crop inference failed due to image decoding error."
                    )
                )
            else:
                # In forensic analysis of multi-person scenes, the maximum anomaly face represents
                # the highest likelihood of a localized face-swap.
                max_score = max(crop_scores)
                
                if max_score >= 0.65:
                    status_note = f"High manipulation indicators detected on facial region ({max_score:.2f})."
                elif max_score <= 0.40:
                    status_note = f"Facial texture and boundary features appear consistent ({max_score:.2f})."
                else:
                    status_note = f"Borderline anomaly score ({max_score:.2f}); potential compression noise."

                results.append(
                    FrameResult(
                        frame_index=idx,
                        timestamp_seconds=ts,
                        faces_detected=faces_detected,
                        manipulation_score=round(max_score, 4),
                        preview_image=preview_b64,
                        notes=status_note
                    )
                )

        return results

model_service = ModelService()
