import os
import shutil
import uuid
import logging
from fastapi import APIRouter, UploadFile, File, HTTPException, status
from app.schemas.analysis import AnalysisResponse
from app.services.analysis_service import analysis_service
from app.database.repository import analysis_repository
from app.utils.file_validation import (
    validate_video_file_metadata,
    validate_video_size,
    check_video_decodable
)
from app.core.config import settings

logger = logging.getLogger("truthlens.routes.analysis")
router = APIRouter(tags=["Analysis"])

@router.post("/analyze", response_model=AnalysisResponse)
async def analyze_video(file: UploadFile = File(...)):
    """
    Accepts a video file upload, runs decodability validation,
    extracts facial frames, runs deepfake model inference,
    and returns a structured forensics report.
    """
    # 1. Validate metadata
    is_valid_meta, meta_err = validate_video_file_metadata(file)
    if not is_valid_meta:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=meta_err
        )

    # 2. Save to temporary buffer
    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
    temp_filename = f"{uuid.uuid4().hex}_{file.filename}"
    temp_path = os.path.join(settings.UPLOAD_DIR, temp_filename)

    try:
        with open(temp_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        # 3. Validate file size on disk
        is_valid_size, size_err = validate_video_size(temp_path)
        if not is_valid_size:
            raise HTTPException(
                status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                detail=size_err
            )

        # 4. Check decodability
        is_decodable, video_info, decode_err = check_video_decodable(temp_path)
        if not is_decodable:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail=decode_err
            )

        # 5. Process video and generate forensic report
        analysis_result = await analysis_service.process_video(
            file_path=temp_path,
            original_filename=file.filename
        )

        # Optional persistence
        await analysis_repository.save_analysis(analysis_result)

        return analysis_result

    finally:
        # Ensure temporary video file is purged
        if os.path.exists(temp_path):
            try:
                os.remove(temp_path)
            except OSError as e:
                logger.warning(f"Could not remove temp file {temp_path}: {e}")

@router.get("/analyses", response_model=list[AnalysisResponse])
async def list_analyses(limit: int = 20):
    """
    Retrieve recent historical analysis reports if MongoDB persistence is enabled.
    """
    records = await analysis_repository.list_analyses(limit=limit)
    return records

@router.get("/analyses/{analysis_id}", response_model=AnalysisResponse)
async def get_analysis_by_id(analysis_id: str):
    """
    Retrieve historical analysis metadata by ID if MongoDB persistence is enabled.
    """
    record = await analysis_repository.get_analysis(analysis_id)
    if not record:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Analysis '{analysis_id}' not found or history persistence is disabled."
        )
    return record

