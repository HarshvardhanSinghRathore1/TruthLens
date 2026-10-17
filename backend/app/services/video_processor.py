import os
import cv2
import numpy as np
from typing import List, Dict, Any, Tuple, Optional
import logging
from app.core.config import settings

logger = logging.getLogger("truthlens.video_processor")

class VideoProcessor:
    """Extracts sampled frames and identifies facial bounding regions using OpenCV."""

    def __init__(self):
        # Initialize OpenCV Haar Cascade for starter face localization
        cascade_path = cv2.data.haarcascades + "haarcascade_frontalface_default.xml"
        self.face_cascade = cv2.CascadeClassifier(cascade_path)

    def extract_sampled_frames(
        self,
        video_path: str,
        max_frames: Optional[int] = None,
        sample_interval_sec: Optional[float] = None
    ) -> Tuple[List[Dict[str, Any]], Dict[str, Any]]:
        """
        Samples frames from the input video at regular intervals.
        Returns a list of extracted frame metadata and the overall video stats.
        """
        max_frames = max_frames or settings.MAX_FRAMES_TO_EXTRACT
        interval_sec = sample_interval_sec or settings.FRAME_SAMPLE_INTERVAL_SEC

        cap = cv2.VideoCapture(video_path)
        if not cap.isOpened():
            raise ValueError(f"Cannot open video at {video_path}")

        extracted_frames = []
        fps = cap.get(cv2.CAP_PROP_FPS) or 25.0
        total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
        duration = total_frames / fps if fps > 0 else 0.0

        step_frames = max(1, int(fps * interval_sec))

        frame_idx = 0
        while cap.isOpened() and len(extracted_frames) < max_frames and frame_idx < total_frames:
            cap.set(cv2.CAP_PROP_POS_FRAMES, frame_idx)
            ret, frame = cap.read()
            if not ret or frame is None:
                break

            timestamp = frame_idx / fps if fps > 0 else 0.0

            # Detect faces in frame
            gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
            faces = self.face_cascade.detectMultiScale(
                gray,
                scaleFactor=1.1,
                minNeighbors=5,
                minSize=(60, 60)
            )

            extracted_frames.append({
                "frame_index": frame_idx,
                "timestamp_seconds": round(timestamp, 2),
                "faces_detected": len(faces),
                "frame_bgr": frame,
                "face_boxes": [
                    {"x": int(x), "y": int(y), "w": int(w), "h": int(h)}
                    for (x, y, w, h) in faces
                ]
            })

            frame_idx += step_frames

        cap.release()

        video_stats = {
            "fps": fps,
            "total_frames": total_frames,
            "duration_seconds": round(duration, 2),
            "sampled_count": len(extracted_frames)
        }

        logger.info(
            f"Extracted {len(extracted_frames)} frames from video (duration: {duration:.1f}s, fps: {fps:.1f})"
        )
        return extracted_frames, video_stats

video_processor = VideoProcessor()
