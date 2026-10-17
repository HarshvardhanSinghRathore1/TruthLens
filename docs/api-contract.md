# TruthLens AI API Contract

This document outlines the standard contracts between the frontend and backend.

## Base URL
Default: `http://localhost:8000/api`

---

## 1. Health Check

### Request
`GET /api/health`

### Response (`200 OK`)
```json
{
  "status": "ok",
  "app_name": "TruthLens AI",
  "version": "1.0.0",
  "model_loaded": false,
  "model_name": "Placeholder Pretrained Model",
  "timestamp": "2026-10-17T10:30:00Z"
}
```

---

## 2. Analyze Video

### Request
`POST /api/analyze`
- Content-Type: `multipart/form-data`
- Body:
  - `file`: Video file (`.mp4`, `.avi`, `.mov`, `.webm`, max 100MB)

### Successful Analysis Response (`200 OK`)
```json
{
  "analysis_id": "tl-8f3b2a1c-99d8-4f21-91ea-42b78b88ce12",
  "status": "completed",
  "filename": "sample_video.mp4",
  "duration_seconds": 12.4,
  "frames_analyzed": 15,
  "result": "no_strong_signs_detected",
  "risk_score": 0.14,
  "score_type": "normalized_risk_index",
  "score_explanation": "Aggregate face anomaly score across analyzed frames (0.00 = low risk, 1.00 = high risk).",
  "summary": "Analysis completed. No strong indications of facial manipulation were detected across the analyzed frames.",
  "findings": [
    "Detected 1 consistent face across 15 extracted frames.",
    "Blink patterns and facial edge gradients are within typical boundaries.",
    "No severe warping artifacts found along face boundaries."
  ],
  "frame_results": [
    {
      "frame_index": 0,
      "timestamp_seconds": 0.0,
      "faces_detected": 1,
      "manipulation_score": 0.12,
      "notes": "Natural facial texture observed."
    }
  ],
  "model_name": "TruthLens Pretrained ResNet/EfficientNet Detector v1.0",
  "limitations": [
    "Automated detection does not constitute definitive proof of authenticity.",
    "Compression artifacts or poor lighting can impact model accuracy.",
    "Audio deepfakes or non-facial body manipulations were not assessed."
  ],
  "error": null
}
```

### Result Types (`result` enum)
- `potential_manipulation_detected`: Confidence threshold exceeded on multiple frames.
- `no_strong_signs_detected`: Bounded low scores across analyzed frames.
- `unable_to_assess`: Video corrupted, no faces found, or model inference unable to execute.

### Error Response (`400 Bad Request` / `422 Unprocessable Entity` / `500 Internal Server Error`)
```json
{
  "analysis_id": "tl-err-382910",
  "status": "failed",
  "filename": "corrupt.mp4",
  "duration_seconds": null,
  "frames_analyzed": 0,
  "result": "unable_to_assess",
  "risk_score": null,
  "score_type": null,
  "score_explanation": null,
  "summary": "Unable to process video.",
  "findings": [],
  "frame_results": [],
  "model_name": "TruthLens Pretrained ResNet/EfficientNet Detector v1.0",
  "limitations": [
    "Video decodability check failed."
  ],
  "error": "The uploaded video could not be decoded. Ensure it is a valid MP4 or WebM video."
}
```

---

## 3. Retrieve Historical Analysis (Optional Module)

### Request
`GET /api/analyses/{analysis_id}`

### Response (`200 OK`)
Returns the cached `AnalysisResponse` object.

### Response (`404 Not Found`)
```json
{
  "detail": "Analysis record tl-unknown-id not found or persistence not enabled."
}
```
