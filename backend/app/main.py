from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.core.logging_config import setup_logging
from app.api.router import api_router
from app.database.connection import database
from app.models.model_loader import model_loader

# Initialize logging
logger = setup_logging(debug=settings.DEBUG)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    logger.info(f"Starting {settings.APP_NAME} in {settings.APP_ENV} mode...")
    
    # Try connecting to optional MongoDB
    await database.connect()
    
    # Try loading model weights
    model_loader.load_model()
    
    yield
    
    # Shutdown
    logger.info("Shutting down application...")
    await database.disconnect()

app = FastAPI(
    title=settings.APP_NAME,
    description="TruthLens AI Deepfake Video Forensics API",
    version="1.0.0",
    lifespan=lifespan
)

# Configure CORS
origins = settings.CORS_ORIGINS if isinstance(settings.CORS_ORIGINS, list) else [settings.CORS_ORIGINS]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routes
app.include_router(api_router)

@app.get("/", tags=["Root"])
async def root():
    return {
        "message": f"Welcome to {settings.APP_NAME} API",
        "tagline": "See Beyond the Fake",
        "docs_url": "/docs",
        "health_check": "/api/health"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host=settings.HOST, port=settings.PORT, reload=settings.DEBUG)
