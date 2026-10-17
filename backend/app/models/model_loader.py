import os
import logging
from typing import Optional, Any
from app.core.config import settings
from app.detector import detector

logger = logging.getLogger("truthlens.models")

class ModelLoader:
    """Manages the lifecycle and weight loading for deepfake detection models."""
    
    def __init__(self):
        self.detector = detector
        self._model_name: str = settings.MODEL_NAME

    @property
    def is_loaded(self) -> bool:
        return self.detector.is_loaded

    @property
    def model_name(self) -> str:
        return self._model_name

    def load_model(self) -> bool:
        """Load pretrained model weights via detector adapter."""
        logger.info(f"Loading deepfake detector '{self._model_name}'...")
        success = self.detector.load_model()
        if success:
            logger.info("Detector model loaded and verified ready for inference.")
        else:
            logger.warning("Detector model could not be loaded; running in unassessed mode.")
        return success

    def get_model(self) -> Optional[Any]:
        return self.detector

model_loader = ModelLoader()
