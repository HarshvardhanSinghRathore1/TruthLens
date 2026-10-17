import logging
import torch
from typing import Optional, Dict, Any, List, Union
from PIL import Image
import numpy as np

from app.core.config import settings

logger = logging.getLogger("truthlens.detector")

class DeepfakeDetector:
    """
    Forensic Deepfake Detection Adapter wrapping a pretrained Vision Transformer (ViT).
    
    Model: dima806/deepfake_vs_real_image_detection
    Architecture: ViT (google/vit-base-patch16-224-in21k fine-tuned on real and synthetic face datasets)
    Classification Labels:
      - Class 0: 'Real' (Authentic human facial features)
      - Class 1: 'Fake' (Synthetic, swapped, or AI-generated facial artifacts)
    
    Score Definition:
      manipulation_score: Softmax probability [0.0 - 1.0] of Class 1 ('Fake').
      - 0.00 - 0.39: Low probability of manipulation / consistent facial features.
      - 0.40 - 0.64: Ambiguous / borderline anomaly level (compression, lighting, or subtle artifacts).
      - 0.65 - 1.00: High probability of synthetic artifacts or digital manipulation.
    """

    def __init__(self):
        self.model_id: str = settings.MODEL_ID
        self.model_name: str = settings.MODEL_NAME
        self.device_str: str = settings.DEVICE
        self.device = torch.device("cuda" if self.device_str == "cuda" and torch.cuda.is_available() else "cpu")
        self._processor = None
        self._model = None
        self._is_loaded: bool = False
        self._fake_class_idx: int = 1
        self._real_class_idx: int = 0

    @property
    def is_loaded(self) -> bool:
        return self._is_loaded

    def load_model(self) -> bool:
        """
        Loads the pretrained model weights and image processor into memory once.
        Reuses cached weights from huggingface_hub or local directory.
        """
        if self._is_loaded and self._model is not None:
            return True

        try:
            logger.info(f"Loading pretrained model '{self.model_id}' on device '{self.device}'...")
            from transformers import AutoImageProcessor, AutoModelForImageClassification

            # Load processor and model
            self._processor = AutoImageProcessor.from_pretrained(self.model_id)
            self._model = AutoModelForImageClassification.from_pretrained(self.model_id)
            
            # Verify class labels
            id2label = getattr(self._model.config, "id2label", {0: "Real", 1: "Fake"})
            logger.info(f"Model labels mapped: {id2label}")
            
            # Map the exact fake index
            for idx, label in id2label.items():
                if "fake" in str(label).lower() or "manipulat" in str(label).lower():
                    self._fake_class_idx = int(idx)
                elif "real" in str(label).lower() or "authentic" in str(label).lower():
                    self._real_class_idx = int(idx)

            self._model.to(self.device)
            self._model.eval()
            self._is_loaded = True
            logger.info(f"DeepfakeDetector initialized successfully. Fake class index: {self._fake_class_idx}")
            return True

        except Exception as e:
            logger.error(f"Failed to load pretrained detector model: {e}", exc_info=True)
            self._is_loaded = False
            self._model = None
            self._processor = None
            return False

    def predict_image(self, image_input: Union[Image.Image, np.ndarray]) -> Dict[str, Any]:
        """
        Runs inference on a single image (PIL Image or BGR/RGB numpy array).
        Returns a dictionary with raw logits, softmax probabilities, and the manipulation score.
        """
        if not self._is_loaded or self._model is None or self._processor is None:
            raise RuntimeError("Detector model is not loaded. Call load_model() first.")

        # Convert numpy array to RGB PIL Image if needed
        if isinstance(image_input, np.ndarray):
            if len(image_input.shape) == 3 and image_input.shape[2] == 3:
                # Assume BGR from OpenCV, convert to RGB
                import cv2
                rgb_arr = cv2.cvtColor(image_input, cv2.COLOR_BGR2RGB)
                pil_img = Image.fromarray(rgb_arr)
            else:
                pil_img = Image.fromarray(image_input)
        elif isinstance(image_input, Image.Image):
            pil_img = image_input.convert("RGB")
        else:
            raise ValueError(f"Unsupported image input type: {type(image_input)}")

        try:
            inputs = self._processor(images=pil_img, return_tensors="pt")
            inputs = {k: v.to(self.device) for k, v in inputs.items()}

            with torch.no_grad():
                outputs = self._model(**inputs)
                logits = outputs.logits
                probs = torch.nn.functional.softmax(logits, dim=-1)[0]

            fake_score = float(probs[self._fake_class_idx].item())
            real_score = float(probs[self._real_class_idx].item())

            return {
                "success": True,
                "manipulation_score": round(fake_score, 4),
                "authenticity_score": round(real_score, 4),
                "raw_logits": [round(float(x), 4) for x in logits[0].tolist()],
                "fake_class_index": self._fake_class_idx
            }

        except Exception as e:
            logger.error(f"Inference error on image: {e}", exc_info=True)
            return {
                "success": False,
                "manipulation_score": None,
                "authenticity_score": None,
                "error": str(e)
            }

detector = DeepfakeDetector()
