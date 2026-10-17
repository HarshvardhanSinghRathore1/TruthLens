from fastapi import APIRouter
from app.api.routes import health, analysis, news

api_router = APIRouter(prefix="/api")

api_router.include_router(health.router)
api_router.include_router(analysis.router)
api_router.include_router(news.router)
