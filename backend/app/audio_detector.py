import logging
import torch
import numpy as np
from typing import Optional, Dict, Any, List, Union

from app.core.config import settings
from app.schemas.analysis import (
    AudioAnalysisComponent,
    AudioOutcome,
    AnalysisResultStatus
)

logger = logging.getLogger("truthlens.audio_detector")

class AudioDeepfakeDetector:
    """
    Forensic Speech Anti-Spoofing & Deepfake Audio Adapter wrapping a pretrained Wav2Vec2 model.
    
    Model: Vansh180/deepfake-audio-wav2vec2
    Architecture: Wav2Vec2ForSequenceClassification
    Classification Labels:
      - Class 0: 'real' (Natural human vocal tract articulation)
      - Class 1: 'fake' (Synthetic voice cloning, vocoder artifacts, or AI speech synthesis)
    
    Score Definition:
      spoof_risk_score: Softmax probability [0.0 - 1.0] of Class 1 ('fake').
      - 0.00 - 0.39: Low probability of speech synthesis / natural vocal tract characteristics.
      - 0.40 - 0.64: Inconclusive acoustic confidence (ambient noise, compression, or vocoder ambiguity).
      - 0.65 - 1.00: High probability of synthetic vocoder artifacts or voice conversion.
    """

    def __init__(self):
        self.model_id: str = settings.AUDIO_MODEL_ID
        self.model_name: str = settings.AUDIO_MODEL_NAME
        self.device_str: str = settings.DEVICE
        self.device = torch.device("cuda" if self.device_str == "cuda" and torch.cuda.is_available() else "cpu")
        self._processor = None
        self._model = None
        self._is_loaded: bool = False
        self._fake_class_idx: int = 1
        self._real_class_idx: int = 0
        self.high_threshold: float = settings.AUDIO_HIGH_RISK_THRESHOLD
        self.low_threshold: float = settings.AUDIO_LOW_RISK_THRESHOLD

    @property
    def is_loaded(self) -> bool:
        return self._is_loaded

    def load_model(self) -> bool:
        """
        Loads the pretrained Wav2Vec2 model and feature extractor once.
        Reuses cached weights from huggingface_hub.
        """
        if self._is_loaded and self._model is not None:
            return True

        try:
            logger.info(f"Loading pretrained audio model '{self.model_id}' on device '{self.device}'...")
            from transformers import AutoFeatureExtractor, AutoModelForAudioClassification

            self._processor = AutoFeatureExtractor.from_pretrained(self.model_id)
            self._model = AutoModelForAudioClassification.from_pretrained(self.model_id)

            id2label = getattr(self._model.config, "id2label", {0: "real", 1: "fake"})
            logger.info(f"Audio model labels mapped: {id2label}")

            for idx, label in id2label.items():
                if "fake" in str(label).lower() or "spoof" in str(label).lower():
                    self._fake_class_idx = int(idx)
                elif "real" in str(label).lower() or "bonafide" in str(label).lower():
                    self._real_class_idx = int(idx)

            self._model.to(self.device)
            self._model.eval()
            self._is_loaded = True
            logger.info(
                f"AudioDeepfakeDetector initialized successfully. Fake class index: {self._fake_class_idx}"
            )
            return True

        except Exception as e:
            logger.error(f"Failed to load audio deepfake detector model: {e}", exc_info=True)
            self._is_loaded = False
            self._model = None
            self._processor = None
            return False

    def predict_waveform(self, waveform: np.ndarray, sampling_rate: int = 16000) -> Dict[str, Any]:
        """
        Runs model inference on a 1D float32 audio waveform.
        Returns: {success, spoof_score, bonafide_score, raw_logits}
        """
        if not self._is_loaded or self._model is None or self._processor is None:
            raise RuntimeError("Audio detector is not loaded. Call load_model() first.")

        try:
            inputs = self._processor(waveform, sampling_rate=sampling_rate, return_tensors="pt")
            inputs = {k: v.to(self.device) for k, v in inputs.items()}

            with torch.no_grad():
                outputs = self._model(**inputs)
                logits = outputs.logits
                probs = torch.nn.functional.softmax(logits, dim=-1)[0]

            spoof_score = float(probs[self._fake_class_idx].item())
            real_score = float(probs[self._real_class_idx].item())

            return {
                "success": True,
                "spoof_score": round(spoof_score, 4),
                "bonafide_score": round(real_score, 4),
                "raw_logits": [round(float(x), 4) for x in logits[0].tolist()]
            }

        except Exception as e:
            logger.error(f"Audio waveform inference error: {e}", exc_info=True)
            return {
                "success": False,
                "spoof_score": None,
                "bonafide_score": None,
                "error": str(e)
            }

    def analyze_audio_segments(
        self,
        segments: List[np.ndarray],
        duration: float,
        notes: Optional[str] = None
    ) -> AudioAnalysisComponent:
        """
        Runs model inference across segmented audio chunks and compiles an
        AudioAnalysisComponent with documented aggregation and plain-language interpretation.
        """
        if not self._is_loaded:
            return AudioAnalysisComponent(
                has_audio=True,
                status="failed",
                outcome=AudioOutcome.UNABLE_TO_ASSESS,
                model_name=self.model_name,
                duration_seconds=duration,
                segments_analyzed=0,
                risk_score=None,
                score_explanation="Audio deepfake detector model is offline.",
                findings=["Pretrained speech model could not be loaded."],
                limitations=["Audio analysis unavailable."]
            )

        # Handle silent audio
        if notes == "near_silent":
            return AudioAnalysisComponent(
                has_audio=True,
                status="completed",
                outcome=AudioOutcome.UNABLE_TO_ASSESS,
                model_name=self.model_name,
                duration_seconds=duration,
                segments_analyzed=len(segments),
                risk_score=None,
                score_explanation="Extracted audio track is near-silent or background noise only.",
                findings=[
                    f"Analyzed {duration:.1f}s audio track.",
                    "Audio energy is near-silent; insufficient vocal formant energy for speech anti-spoofing."
                ],
                limitations=[
                    "Vocal anti-spoofing requires active human speech or vocal harmonics."
                ]
            )

        segment_scores = []
        for i, chunk in enumerate(segments):
            pred = self.predict_waveform(chunk)
            if pred.get("success") and pred.get("spoof_score") is not None:
                segment_scores.append(pred["spoof_score"])

        if not segment_scores:
            return AudioAnalysisComponent(
                has_audio=True,
                status="failed",
                outcome=AudioOutcome.UNABLE_TO_ASSESS,
                model_name=self.model_name,
                duration_seconds=duration,
                segments_analyzed=0,
                risk_score=None,
                score_explanation="Inference failed on all audio segments.",
                findings=["Speech model forward pass encountered an error."],
                limitations=["Audio processing error."]
            )

        # Aggregation: 60% peak segment + 40% mean segment
        mean_score = sum(segment_scores) / len(segment_scores)
        peak_score = max(segment_scores)
        aggregate_spoof = round((0.60 * peak_score) + (0.40 * mean_score), 4)

        if aggregate_spoof >= self.high_threshold:
            outcome = AudioOutcome.POTENTIALLY_SPOOFED_SPEECH
            summary_msg = f"Potential synthetic speech or voice cloning indicators detected (anomaly index: {aggregate_spoof:.2f})."
            score_expl = (
                f"Speech risk score {aggregate_spoof:.2f} reflects elevated synthetic vocoder characteristics "
                f"across {len(segment_scores)} evaluated audio segments (peak segment anomaly: {peak_score:.2f})."
            )
        elif aggregate_spoof <= self.low_threshold:
            outcome = AudioOutcome.POTENTIALLY_GENUINE_SPEECH
            summary_msg = f"No strong signs of speech synthesis detected; natural vocal acoustic traits observed (anomaly index: {aggregate_spoof:.2f})."
            score_expl = (
                f"Speech risk score {aggregate_spoof:.2f} reflects low acoustic anomaly across "
                f"{len(segment_scores)} evaluated audio segments."
            )
        else:
            outcome = AudioOutcome.UNABLE_TO_ASSESS
            summary_msg = f"Inconclusive speech analysis. Anomaly index ({aggregate_spoof:.2f}) is in the borderline zone."
            score_expl = (
                f"Borderline acoustic score {aggregate_spoof:.2f}. Ambient acoustics or compression "
                f"cannot be conclusively distinguished from synthetic speech."
            )

        findings = [
            f"Evaluated {duration:.1f}s extracted speech audio across {len(segment_scores)} segments.",
            f"Mean acoustic anomaly index: {mean_score:.2f}; peak segment anomaly index: {peak_score:.2f}.",
            f"Speech anti-spoofing model: Pretrained Wav2Vec2 ({self.model_name})."
        ]

        limitations = [
            "Speech anti-spoofing models detect vocoder and neural synthesis cues; background noise and compression may affect scores.",
            "Analysis does not prove identity or verify whether the speaker committed fraud.",
            "Short clips under 2 seconds provide limited acoustic formant context."
        ]

        return AudioAnalysisComponent(
            has_audio=True,
            status=AnalysisResultStatus.COMPLETED,
            outcome=outcome,
            model_name=self.model_name,
            duration_seconds=duration,
            segments_analyzed=len(segment_scores),
            risk_score=aggregate_spoof,
            score_explanation=score_expl,
            findings=findings,
            limitations=limitations
        )

audio_detector = AudioDeepfakeDetector()
