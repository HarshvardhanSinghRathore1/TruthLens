import logging
from typing import Optional, Any, Tuple
from app.core.config import settings
from app.detector import detector as video_detector
from app.audio_detector import audio_detector

logger = logging.getLogger("truthlens.models")

class ModelLoader:
    """Manages the lifecycle and weight loading for multimodal detection models."""
    
    def __init__(self):
        self.video_detector = video_detector
        self.audio_detector = audio_detector
        self._video_model_name: str = settings.MODEL_NAME
        self._audio_model_name: str = settings.AUDIO_MODEL_NAME

    @property
    def is_loaded(self) -> bool:
        """True if primary video model is loaded."""
        return self.video_detector.is_loaded

    @property
    def is_video_loaded(self) -> bool:
        return self.video_detector.is_loaded

    @property
    def is_audio_loaded(self) -> bool:
        return self.audio_detector.is_loaded

    @property
    def model_name(self) -> str:
        return self._video_model_name

    @property
    def video_model_name(self) -> str:
        return self._video_model_name

    @property
    def audio_model_name(self) -> str:
        return self._audio_model_name

    def load_model(self) -> bool:
        """Loads both video and audio model weights once at startup."""
        logger.info(f"Loading video detector '{self._video_model_name}'...")
        v_ok = self.video_detector.load_model()
        if v_ok:
            logger.info("Video detector model verified ready for inference.")
        else:
            logger.warning("Video detector model could not be loaded.")

        if settings.ENABLE_AUDIO_DETECTION:
            logger.info(f"Loading audio detector '{self._audio_model_name}'...")
            a_ok = self.audio_detector.load_model()
            if a_ok:
                logger.info("Audio detector model verified ready for inference.")
            else:
                logger.warning("Audio detector model could not be loaded; video mode remains active.")
        else:
            logger.info("Audio detection is disabled in configuration.")
            a_ok = False

        return v_ok

    def get_video_model(self) -> Optional[Any]:
        return self.video_detector

    def get_audio_model(self) -> Optional[Any]:
        return self.audio_detector

model_loader = ModelLoader()
