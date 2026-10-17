import os
import logging
from typing import Optional, Any
from app.core.config import settings

logger = logging.getLogger("truthlens.models")

class ModelLoader:
    """Manages the lifecycle and weight loading for deepfake detection models."""
    
    def __init__(self):
        self._model: Optional[Any] = None
        self._is_loaded: bool = False
        self._model_name: str = settings.MODEL_NAME

    @property
    def is_loaded(self) -> bool:
        return self._is_loaded

    @property
    def model_name(self) -> str:
        return self._model_name

    def load_model(self) -> bool:
        """Load pretrained model weights if file exists, or configure inference adapter."""
        weights_path = settings.MODEL_WEIGHTS_PATH
        if not os.path.exists(weights_path):
            logger.warning(
                f"Model weights not found at '{weights_path}'. "
                "Detector will remain uninitialized until weights are supplied."
            )
            self._is_loaded = False
            return False

        try:
            logger.info(f"Loading deepfake detector from {weights_path}...")
            # Placeholder for PyTorch weight loading in model integration step
            # torch.load(weights_path, map_location=settings.DEVICE)
            self._is_loaded = True
            logger.info("Model loaded successfully.")
            return True
        except Exception as e:
            logger.error(f"Failed to load model weights: {e}", exc_info=True)
            self._is_loaded = False
            return False

    def get_model(self) -> Optional[Any]:
        return self._model

model_loader = ModelLoader()
