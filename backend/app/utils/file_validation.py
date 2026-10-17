import os
import cv2
from typing import Tuple, Optional
from fastapi import UploadFile
from app.core.config import settings

def validate_video_file_metadata(file: UploadFile) -> Tuple[bool, Optional[str]]:
    """Validate file extension and basic attributes."""
    if not file.filename:
        return False, "Filename cannot be empty."
    
    ext = os.path.splitext(file.filename)[1].lower()
    if ext not in settings.ALLOWED_EXTENSIONS:
        allowed = ", ".join(settings.ALLOWED_EXTENSIONS)
        return False, f"Unsupported file format '{ext}'. Allowed formats: {allowed}"
    
    return True, None

def validate_video_size(file_path: str) -> Tuple[bool, Optional[str]]:
    """Validate that the file on disk does not exceed the maximum allowed size."""
    try:
        size_bytes = os.path.getsize(file_path)
        max_bytes = settings.MAX_FILE_SIZE_MB * 1024 * 1024
        if size_bytes > max_bytes:
            return False, f"File size exceeds maximum limit of {settings.MAX_FILE_SIZE_MB}MB."
        if size_bytes == 0:
            return False, "Uploaded file is empty (0 bytes)."
        return True, None
    except OSError as e:
        return False, f"Failed to check file size: {str(e)}"

def check_video_decodable(file_path: str) -> Tuple[bool, Optional[dict], Optional[str]]:
    """Check if the video can be opened and decoded using OpenCV."""
    cap = cv2.VideoCapture(file_path)
    if not cap.isOpened():
        return False, None, "Video file cannot be decoded or is corrupted."

    try:
        frame_count = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
        fps = cap.get(cv2.CAP_PROP_FPS) or 25.0
        width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
        height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
        duration = frame_count / fps if fps > 0 else 0.0

        ret, frame = cap.read()
        if not ret or frame is None:
            return False, None, "Could not decode initial frame from video."

        metadata = {
            "frame_count": frame_count,
            "fps": fps,
            "width": width,
            "height": height,
            "duration_seconds": round(duration, 2)
        }
        return True, metadata, None
    finally:
        cap.release()
