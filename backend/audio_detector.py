"""
TruthLens AI Audio Detector Module (root alias).
Exposes the AudioDeepfakeDetector adapter.
"""
from app.audio_detector import AudioDeepfakeDetector, audio_detector

__all__ = ["AudioDeepfakeDetector", "audio_detector"]
