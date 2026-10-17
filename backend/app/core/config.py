import os
from typing import List, Union
from pydantic import Field, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict
import json

class Settings(BaseSettings):
    APP_NAME: str = "TruthLens AI"
    APP_ENV: str = "development"
    DEBUG: bool = True
    PORT: int = 8000
    HOST: str = "0.0.0.0"

    # CORS
    CORS_ORIGINS: Union[List[str], str] = ["http://localhost:5173", "http://localhost:3000", "http://127.0.0.1:5173"]

    @field_validator("CORS_ORIGINS", mode="before")
    def parse_cors_origins(cls, v):
        if isinstance(v, str):
            try:
                return json.loads(v)
            except Exception:
                return [origin.strip() for origin in v.split(",") if origin.strip()]
        return v

    # Storage & Processing
    UPLOAD_DIR: str = "uploads"
    MAX_FILE_SIZE_MB: int = 100
    MAX_FRAMES_TO_EXTRACT: int = 12
    MAX_VIDEO_DURATION_SEC: int = 300
    FRAME_SAMPLE_INTERVAL_SEC: float = 0.5
    FACE_PADDING_PERCENT: float = 0.20
    ALLOWED_EXTENSIONS: List[str] = [".mp4", ".avi", ".mov", ".webm", ".mkv"]

    # Video Model Settings
    MODEL_NAME: str = "EfficientNet-B4 Deepfake Detector"
    MODEL_ID: str = "honi05/deepfake-detection"
    MODEL_CHECKPOINT_FILE: str = "best_model.pt"
    MODEL_WEIGHTS_PATH: str = ""
    DEVICE: str = "cpu"
    HIGH_RISK_THRESHOLD: float = 0.50
    LOW_RISK_THRESHOLD: float = 0.25
    AUTO_DOWNLOAD_MODELS: bool = False

    # Audio Model Settings
    ENABLE_AUDIO_DETECTION: bool = True
    AUDIO_MODEL_NAME: str = "Wav2Vec2 Speech Anti-Spoofing Detector"
    AUDIO_MODEL_ID: str = "Vansh180/deepfake-audio-wav2vec2"
    AUDIO_SAMPLE_RATE: int = 16000
    AUDIO_SEGMENT_DURATION_SEC: float = 5.0
    AUDIO_MAX_DURATION_SEC: float = 60.0
    AUDIO_HIGH_RISK_THRESHOLD: float = 0.65
    AUDIO_LOW_RISK_THRESHOLD: float = 0.40

    # Database Settings (Optional)
    MONGODB_URI: str = ""
    MONGODB_DB_NAME: str = "truthlens"
    ENABLE_DB: bool = False

    # Deepfake Radar / News Settings
    NEWS_CACHE_TTL_MINUTES: int = 30
    NEWS_API_KEY: str = ""
    GNEWS_API_KEY: str = ""
    NEWS_REFRESH_COOLDOWN_SEC: int = 30

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )

settings = Settings()
