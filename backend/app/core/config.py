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

    # Model Settings
    MODEL_NAME: str = "Vision Transformer (ViT) Deepfake Detector"
    MODEL_ID: str = "dima806/deepfake_vs_real_image_detection"
    MODEL_WEIGHTS_PATH: str = ""
    DEVICE: str = "cpu"
    HIGH_RISK_THRESHOLD: float = 0.65
    LOW_RISK_THRESHOLD: float = 0.40

    # Database Settings (Optional)
    MONGODB_URI: str = ""
    MONGODB_DB_NAME: str = "truthlens"
    ENABLE_DB: bool = False

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )

settings = Settings()
