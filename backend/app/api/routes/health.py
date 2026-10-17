from fastapi import APIRouter
from app.schemas.analysis import HealthResponse
from app.core.config import settings
from app.services.model_service import model_service

router = APIRouter(tags=["Health"])

@router.get("/health", response_model=HealthResponse)
async def get_health():
    """Health check endpoint indicating server and model readiness."""
    return HealthResponse(
        status="ok",
        app_name=settings.APP_NAME,
        version="1.0.0",
        model_loaded=model_service.is_ready,
        model_name=model_service.model_name
    )
