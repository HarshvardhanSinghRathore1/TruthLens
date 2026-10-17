"""
TruthLens AI Detector Module (root alias).
Exposes the DeepfakeDetector adapter.
"""
from app.detector import DeepfakeDetector, detector

__all__ = ["DeepfakeDetector", "detector"]
