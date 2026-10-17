import os
import cv2
import numpy as np
import base64
from typing import List, Dict, Any, Tuple, Optional
import logging
from app.core.config import settings

logger = logging.getLogger("truthlens.video_processor")

class VideoProcessor:
    """
    Handles video validation, frame sampling, facial localization, and cropping.
    """

    def __init__(self):
        # OpenCV Haar Cascade for facial landmark localization
        cascade_path = cv2.data.haarcascades + "haarcascade_frontalface_default.xml"
        self.face_cascade = cv2.CascadeClassifier(cascade_path)
        self.padding_percent = settings.FACE_PADDING_PERCENT

    def validate_video_file(self, file_path: str) -> Tuple[bool, Optional[str]]:
        """Validates file existence, format, and size limit."""
        if not os.path.exists(file_path):
            return False, "Video file does not exist on disk."

        file_size_mb = os.path.getsize(file_path) / (1024 * 1024)
        if file_size_mb > settings.MAX_FILE_SIZE_MB:
            return False, f"Video size ({file_size_mb:.1f}MB) exceeds limit of {settings.MAX_FILE_SIZE_MB}MB."
        if file_size_mb == 0:
            return False, "Video file is empty (0 bytes)."

        ext = os.path.splitext(file_path)[1].lower()
        if ext not in settings.ALLOWED_EXTENSIONS:
            return False, f"Unsupported format '{ext}'. Allowed: {', '.join(settings.ALLOWED_EXTENSIONS)}"

        return True, None

    def _extract_padded_face(
        self,
        frame: np.ndarray,
        x: int,
        y: int,
        w: int,
        h: int,
        height: int,
        width: int
    ) -> Tuple[np.ndarray, Dict[str, int]]:
        """Expands facial bounding box by padding percentage to capture hairline and blend seams."""
        pad_x = int(w * self.padding_percent)
        pad_y = int(h * self.padding_percent)

        x1 = max(0, x - pad_x)
        y1 = max(0, y - pad_y)
        x2 = min(width, x + w + pad_x)
        y2 = min(height, y + h + pad_y)

        face_crop = frame[y1:y2, x1:x2].copy()
        crop_box = {"x": x1, "y": y1, "w": x2 - x1, "h": y2 - y1}
        return face_crop, crop_box

    def _create_thumbnail_base64(self, frame: np.ndarray, faces: List[Any], max_width: int = 360) -> str:
        """Draws forensic face overlays and encodes a compact base64 JPEG preview."""
        h, w = frame.shape[:2]
        preview_frame = frame.copy()

        # Draw subtle forensic cyan bounding box for detected faces
        for (x, y, fw, fh) in faces:
            cv2.rectangle(
                preview_frame,
                (int(x), int(y)),
                (int(x + fw), int(y + fh)),
                (255, 217, 56), # BGR for cyan #38D9FF (56, 217, 255)
                2
            )

        # Scale down for efficient frontend payload
        if w > max_width:
            scale = max_width / float(w)
            new_h = int(h * scale)
            preview_frame = cv2.resize(preview_frame, (max_width, new_h), interpolation=cv2.INTER_AREA)

        _, buffer = cv2.imencode(".jpg", preview_frame, [cv2.IMWRITE_JPEG_QUALITY, 75])
        encoded = base64.b64encode(buffer).decode("utf-8")
        return f"data:image/jpeg;base64,{encoded}"

    def extract_sampled_frames(
        self,
        video_path: str,
        max_frames: Optional[int] = None
    ) -> Tuple[List[Dict[str, Any]], Dict[str, Any]]:
        """
        Samples frames uniformly across video duration and identifies faces.
        Returns sampled frame data with face crops and overall video statistics.
        """
        max_frames = max_frames or settings.MAX_FRAMES_TO_EXTRACT
        cap = cv2.VideoCapture(video_path)

        if not cap.isOpened():
            raise ValueError(f"OpenCV cannot decode video at: {video_path}")

        try:
            fps = cap.get(cv2.CAP_PROP_FPS) or 25.0
            total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
            width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
            height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
            duration = total_frames / fps if fps > 0 else 0.0

            if duration > settings.MAX_VIDEO_DURATION_SEC:
                raise ValueError(
                    f"Video duration ({duration:.1f}s) exceeds limit of {settings.MAX_VIDEO_DURATION_SEC}s."
                )

            if total_frames <= 0:
                raise ValueError("Video contains no readable frames.")

            # Calculate uniform sampling indices across duration
            num_samples = min(max_frames, total_frames)
            sample_indices = np.linspace(0, total_frames - 1, num=num_samples, dtype=int)

            extracted_frames = []

            for frame_idx in sample_indices:
                cap.set(cv2.CAP_PROP_POS_FRAMES, int(frame_idx))
                ret, frame = cap.read()
                if not ret or frame is None:
                    continue

                timestamp = frame_idx / fps if fps > 0 else 0.0

                # Detect faces using Haar Cascade
                gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
                detected_faces = self.face_cascade.detectMultiScale(
                    gray,
                    scaleFactor=1.15,
                    minNeighbors=5,
                    minSize=(50, 50)
                )

                face_crops = []
                face_boxes = []

                if len(detected_faces) > 0:
                    for (fx, fy, fw, fh) in detected_faces:
                        crop, crop_box = self._extract_padded_face(frame, fx, fy, fw, fh, height, width)
                        face_crops.append(crop)
                        face_boxes.append(crop_box)

                # Generate lightweight base64 preview with forensic overlay
                preview_b64 = self._create_thumbnail_base64(frame, detected_faces)

                extracted_frames.append({
                    "frame_index": int(frame_idx),
                    "timestamp_seconds": round(float(timestamp), 2),
                    "faces_detected": len(detected_faces),
                    "face_crops": face_crops,
                    "face_boxes": face_boxes,
                    "full_frame_bgr": frame,
                    "preview_image": preview_b64
                })

            video_stats = {
                "fps": round(float(fps), 2),
                "total_frames": total_frames,
                "duration_seconds": round(float(duration), 2),
                "width": width,
                "height": height,
                "sampled_count": len(extracted_frames)
            }

            logger.info(
                f"Successfully extracted {len(extracted_frames)} frames "
                f"(duration: {duration:.1f}s, resolution: {width}x{height}, fps: {fps:.1f})"
            )
            return extracted_frames, video_stats

        finally:
            cap.release()

video_processor = VideoProcessor()
