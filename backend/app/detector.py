import logging
import math
import os
from typing import Optional, Dict, Any, List, Union
from PIL import Image
import numpy as np
import torch
import torch.nn as nn
from torchvision.models import efficientnet_b4
from torchvision import transforms
from huggingface_hub import hf_hub_download

from app.core.config import settings

logger = logging.getLogger("truthlens.detector")


class EfficientNetB4DeepfakeModel(nn.Module):
    """
    EfficientNet-B4 Architecture for Deepfake Classification matching honi05/deepfake-detection.
    
    Backbone: torchvision.models.efficientnet_b4
    Features: Blocks 0 to 8 (1792 output channels)
    AdaptiveAvgPool2d(1) -> Flatten
    Classifier Head:
      Dropout(p=0.4)
      Linear(1792 -> 256)
      ReLU(inplace=True)
      Dropout(p=0.2)
      Linear(256 -> 1)
      
    Output:
      Single logit z. Sigmoid(z) gives probability [0.0 - 1.0] of synthetic/manipulated face (Fake).
    """

    def __init__(self, dropout: float = 0.4):
        super().__init__()
        base = efficientnet_b4(weights=None)
        self.features = base.features
        self.avgpool = nn.AdaptiveAvgPool2d(1)
        self.classifier = nn.Sequential(
            nn.Dropout(p=dropout),
            nn.Linear(1792, 256),
            nn.ReLU(inplace=True),
            nn.Dropout(p=0.2),
            nn.Linear(256, 1)
        )

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        x = self.features(x)
        x = self.avgpool(x)
        x = torch.flatten(x, 1)
        x = self.classifier(x)
        return x


class DeepfakeDetector:
    """
    Forensic Deepfake Detection Adapter wrapping honi05/deepfake-detection (EfficientNet-B4).
    
    Model: honi05/deepfake-detection
    Checkpoint: best_model.pt
    Architecture: EfficientNet-B4 fine-tuned on Celeb-DF v2
    Classification Semantics:
      - Raw Output: Single logit scalar z
      - Activation: Sigmoid(z) = 1 / (1 + exp(-z))
      - Fake Probability:
          >= 0.50: Synthetic / manipulated artifacts (Fake)
          < 0.50: Authentic facial features (Real)
    
    Score Definition:
      manipulation_score: Sigmoid fake probability [0.0 - 1.0].
      - 0.00 - 0.39: Low probability of manipulation / consistent facial features.
      - 0.40 - 0.64: Ambiguous / borderline anomaly level (compression, lighting, subtle artifacts).
      - 0.65 - 1.00: High probability of synthetic artifacts or digital manipulation.
    """

    def __init__(self):
        self.model_id: str = settings.MODEL_ID
        self.model_name: str = settings.MODEL_NAME
        self.checkpoint_file: str = getattr(settings, "MODEL_CHECKPOINT_FILE", "best_model.pt")
        self.weights_path: str = getattr(settings, "MODEL_WEIGHTS_PATH", "")
        self.device_str: str = settings.DEVICE
        self.device = torch.device("cuda" if self.device_str == "cuda" and torch.cuda.is_available() else "cpu")
        self._model: Optional[EfficientNetB4DeepfakeModel] = None
        self._transform: Optional[transforms.Compose] = None
        self._is_loaded: bool = False
        self._checkpoint_path: Optional[str] = None

    @property
    def is_loaded(self) -> bool:
        return self._is_loaded

    def load_model(self) -> bool:
        """
        Loads the pretrained model weights into memory once.
        Reuses cached weights from huggingface_hub or local directory.
        """
        if self._is_loaded and self._model is not None:
            return True

        try:
            logger.info(f"Loading pretrained visual detector '{self.model_id}' on device '{self.device}'...")

            # 1. Locate checkpoint file (local override or Hugging Face Hub cache)
            if self.weights_path and os.path.exists(self.weights_path):
                ckpt_path = self.weights_path
                logger.info(f"Using explicitly configured weights path: {ckpt_path}")
            else:
                ckpt_path = hf_hub_download(
                    repo_id=self.model_id,
                    filename=self.checkpoint_file
                )
                logger.info(f"Downloaded / resolved weights from Hugging Face Hub: {ckpt_path}")

            self._checkpoint_path = ckpt_path

            # 2. Load PyTorch checkpoint
            checkpoint = torch.load(ckpt_path, map_location=self.device, weights_only=False)
            if isinstance(checkpoint, dict) and "model_state_dict" in checkpoint:
                state_dict = checkpoint["model_state_dict"]
            elif isinstance(checkpoint, dict):
                state_dict = checkpoint
            else:
                state_dict = checkpoint.state_dict()

            # 3. Instantiate EfficientNet-B4 model architecture
            model = EfficientNetB4DeepfakeModel(dropout=0.4)
            load_result = model.load_state_dict(state_dict, strict=True)
            logger.info(f"EfficientNet-B4 state dict loaded successfully: {load_result}")

            # 4. Set to evaluation mode and transfer to target device
            model.to(self.device)
            model.eval()
            self._model = model

            # 5. Define standard ImageNet validation transforms (224x224 RGB)
            self._transform = transforms.Compose([
                transforms.Resize((224, 224)),
                transforms.ToTensor(),
                transforms.Normalize(
                    mean=[0.485, 0.456, 0.406],
                    std=[0.229, 0.224, 0.225]
                ),
            ])

            self._is_loaded = True
            logger.info(f"DeepfakeDetector initialized successfully ({self.model_name} from {self.model_id}).")
            return True

        except Exception as e:
            logger.error(f"Failed to load pretrained detector model '{self.model_id}': {e}", exc_info=True)
            self._is_loaded = False
            self._model = None
            self._transform = None
            return False

    def predict_image(self, image_input: Union[Image.Image, np.ndarray]) -> Dict[str, Any]:
        """
        Runs inference on a single image (PIL Image or BGR/RGB numpy array).
        Returns a dictionary with raw logit, sigmoid fake score, and authenticity score.
        """
        if not self._is_loaded or self._model is None or self._transform is None:
            raise RuntimeError("Detector model is not loaded. Call load_model() first.")

        # Convert numpy array to RGB PIL Image if needed
        if isinstance(image_input, np.ndarray):
            if len(image_input.shape) == 3 and image_input.shape[2] == 3:
                # Assume BGR from OpenCV, convert to RGB
                import cv2
                rgb_arr = cv2.cvtColor(image_input, cv2.COLOR_BGR2RGB)
                pil_img = Image.fromarray(rgb_arr)
            else:
                pil_img = Image.fromarray(image_input).convert("RGB")
        elif isinstance(image_input, Image.Image):
            pil_img = image_input.convert("RGB")
        else:
            raise ValueError(f"Unsupported image input type: {type(image_input)}")

        try:
            tensor = self._transform(pil_img).unsqueeze(0).to(self.device)

            with torch.no_grad():
                logit_tensor = self._model(tensor)
                raw_logit = float(logit_tensor.squeeze().item())
                fake_prob = float(torch.sigmoid(torch.tensor(raw_logit)).item())

            # Validate numerical sanity
            if math.isnan(fake_prob) or math.isinf(fake_prob):
                logger.warning(f"Model returned non-finite score for image: logit={raw_logit}")
                return {
                    "success": False,
                    "manipulation_score": None,
                    "authenticity_score": None,
                    "error": "Non-finite model score encountered during inference."
                }

            fake_score = max(0.0, min(1.0, fake_prob))
            real_score = max(0.0, min(1.0, 1.0 - fake_score))

            return {
                "success": True,
                "manipulation_score": round(fake_score, 4),
                "authenticity_score": round(real_score, 4),
                "raw_logits": [round(raw_logit, 4)],
                "fake_class_index": 1,
                "model_architecture": "EfficientNet-B4"
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
