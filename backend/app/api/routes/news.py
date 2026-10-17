import logging
import os
import uuid
import shutil
from typing import Optional
from fastapi import APIRouter, HTTPException, Query, status
import httpx

from app.schemas.news import (
    NewsResponse,
    NewsStory,
    NewsStatusResponse,
    AnalyzeRemoteVideoRequest
)
from app.schemas.analysis import AnalysisResponse
from app.services.news_service import news_service
from app.services.analysis_service import analysis_service
from app.utils.security import is_safe_remote_url
from app.utils.file_validation import (
    validate_video_size,
    check_video_decodable
)
from app.core.config import settings

logger = logging.getLogger("truthlens.routes.news")

router = APIRouter(prefix="/news", tags=["Deepfake Radar"])

@router.get("", response_model=NewsResponse)
async def get_deepfake_news(
    q: Optional[str] = Query(None, description="Search keyword in headline, summary, or source"),
    category: Optional[str] = Query("All", description="Topical category filter"),
    evidence_status: Optional[str] = Query("All", description="Verification trust status filter"),
    sort: str = Query("latest", description="Sort order: 'latest' or 'relevant'"),
    page: int = Query(1, ge=1, description="Page number"),
    limit: int = Query(12, ge=1, le=50, description="Items per page"),
):
    """
    Retrieves filtered, categorized, and deduplicated trending news
    concerning viral suspected and confirmed deepfake media.
    """
    try:
        return await news_service.get_stories(
            query=q,
            category=category,
            evidence_status=evidence_status,
            sort_by=sort,
            page=page,
            limit=limit
        )
    except Exception as e:
        logger.error(f"Failed to retrieve news stories: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to query news provider. Please try again shortly."
        )

@router.get("/status", response_model=NewsStatusResponse)
async def get_news_status():
    """
    Returns news discovery cache health, provider availability, and last update timestamp.
    """
    return news_service.get_status()

@router.post("/refresh")
async def refresh_news_manually(force: bool = False):
    """
    Triggers a controlled refresh of external deepfake news feeds.
    Includes rate-limit debounce protection.
    """
    try:
        total = await news_service.ingest_news(force=force)
        return {
            "status": "success",
            "message": f"Deepfake Radar successfully refreshed with {total} stories.",
            "total_stories": total
        }
    except Exception as e:
        logger.error(f"Manual news refresh error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to refresh news feed. Rate limit or connection timeout."
        )

@router.get("/{story_id}", response_model=NewsStory)
async def get_single_story(story_id: str):
    """
    Returns full metadata, source links, and evidence analysis for a specific story.
    """
    story = await news_service.get_story_by_id(story_id)
    if not story:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Story not found or expired from cache."
        )
    return story

@router.post("/analyze-url", response_model=AnalysisResponse)
async def analyze_remote_video(payload: AnalyzeRemoteVideoRequest):
    """
    Downloads and analyzes a direct, lawfully accessible video file linked to a news story.
    Enforces strict SSRF protection, size caps, and content-type validation.
    """
    video_url = payload.video_url.strip()

    # 1. SSRF and URL validation
    is_safe, error_msg = is_safe_remote_url(video_url)
    if not is_safe:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Security rejection: {error_msg}"
        )

    # 2. Download media securely with size streaming cap
    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
    temp_filename = f"remote_{uuid.uuid4().hex}.mp4"
    temp_path = os.path.join(settings.UPLOAD_DIR, temp_filename)
    max_bytes = settings.MAX_FILE_SIZE_MB * 1024 * 1024

    try:
        async with httpx.AsyncClient(timeout=30.0, follow_redirects=True) as client:
            async with client.stream("GET", video_url) as resp:
                if resp.status_code != 200:
                    raise HTTPException(
                        status_code=status.HTTP_400_BAD_REQUEST,
                        detail=f"Remote media server returned HTTP {resp.status_code}. The video file may be private or unavailable."
                    )

                content_type = resp.headers.get("content-type", "").lower()
                if "video" not in content_type and "application/octet-stream" not in content_type:
                    raise HTTPException(
                        status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
                        detail="The provided URL does not point to a direct video media stream (HTML or unsupported format returned)."
                    )

                total_downloaded = 0
                with open(temp_path, "wb") as f:
                    async for chunk in resp.aiter_bytes(chunk_size=65536):
                        total_downloaded += len(chunk)
                        if total_downloaded > max_bytes:
                            raise HTTPException(
                                status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                                detail=f"Remote video exceeds maximum size of {settings.MAX_FILE_SIZE_MB}MB."
                            )
                        f.write(chunk)

        # 3. Check video decodability
        is_decodable, video_info, decode_err = check_video_decodable(temp_path)
        if not is_decodable:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail=f"Downloaded media could not be decoded as a valid video: {decode_err}"
            )

        # 4. Run through existing forensics pipeline
        analysis_result = await analysis_service.process_video(
            file_path=temp_path,
            original_filename=f"radar_{payload.news_id or 'media'}.mp4"
        )
        return analysis_result

    except HTTPException:
        if os.path.exists(temp_path):
            os.remove(temp_path)
        raise
    except Exception as e:
        if os.path.exists(temp_path):
            os.remove(temp_path)
        logger.error(f"Error analyzing remote video: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch and analyze remote video: {str(e)}"
        )
