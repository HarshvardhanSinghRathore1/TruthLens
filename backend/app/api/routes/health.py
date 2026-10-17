from fastapi import APIRouter
from app.schemas.analysis import HealthResponse
from app.core.config import settings
from app.models.model_loader import model_loader

router = APIRouter(tags=["Health"])

@router.get("/health", response_model=HealthResponse)
async def get_health():
    """Health check endpoint indicating server and multimodal model readiness."""
    return HealthResponse(
        status="ok",
        app_name=settings.APP_NAME,
        version="1.0.0",
        model_loaded=model_loader.is_video_loaded,
        model_name=model_loader.video_model_name,
        audio_model_loaded=model_loader.is_audio_loaded,
        audio_model_name=model_loader.audio_model_name if model_loader.is_audio_loaded else "Audio Forensics (Offline)"
    )
