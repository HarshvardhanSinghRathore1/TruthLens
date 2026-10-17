# TruthLens AI — Backend Service & Pretrained Detector

**Tagline:** See Beyond the Fake.  
**Role:** Backend, Video Forensics Pipeline, Pretrained Deepfake Detector, and API Services.

---

## 1. Architecture Overview

The TruthLens AI backend is built with FastAPI, PyTorch, and OpenCV to perform genuine model-based deepfake video forensics. It implements a strict policy of forensic honesty: scores are only generated through actual pretrained Vision Transformer inference over verified facial regions, and unprocessable or inconclusive media are reported with clear evidence.

```
   [ Uploaded Video: multipart/form-data ]
                     │
                     ▼
      [ Video File & Format Validation ]  ──► Rejects corrupted / unsupported files
                     │
                     ▼
       [ OpenCV Uniform Frame Sampler ]   ──► Extracts 8–16 representative keyframes
                     │
                     ▼
      [ Haar Cascade Face Localization ]  ──► Identifies face bounds + 20% margin
                     │
                     ▼
   [ Pretrained Vision Transformer (ViT) ] ──► Runs inference on detected face crops
                     │
                     ▼
    [ Forensic Report & Score Aggregator ]──► Weighted top-anomaly scoring & thresholding
                     │
                     ▼
       [ Standardized JSON Response ]
```

---

## 2. Pretrained Model Details

- **Model ID:** `dima806/deepfake_vs_real_image_detection`
- **Architecture:** Vision Transformer (`google/vit-base-patch16-224-in21k` fine-tuned)
- **License:** Apache 2.0
- **Classification Head:** Binary Softmax Classifier
  - Label 0: `Real` (Authentic facial features)
  - Label 1: `Fake` (Synthetic / manipulated artifacts)
- **Score Definition:**
  - `manipulation_score`: Softmax probability of Class 1 (`Fake`).
  - Range: `0.00` (low anomaly) to `1.00` (high anomaly).
- **Aggregation Strategy:**
  - `mean_score`: Average manipulation score across sampled facial frames.
  - `top_k_mean`: Average of the top 3 highest risk frames (sensitive to localized keyframe swaps).
  - `aggregate_risk = round(0.65 * top_k_mean + 0.35 * mean_score, 4)`
- **Decision Thresholds:**
  - `aggregate_risk >= 0.65`: `potential_manipulation_detected`
  - `aggregate_risk <= 0.40`: `no_strong_signs_detected`
  - `0.40 < aggregate_risk < 0.65`: `unable_to_assess` (Borderline / Inconclusive)
  - 0 detected faces: `unable_to_assess` (`risk_score: null`)

---

## 3. Setup & Running Locally

### Prerequisites
- Python 3.10+ (Tested on Python 3.13)
- PyTorch 2.x and OpenCV

### Install Dependencies
```bash
cd backend
pip install -r requirements.txt
```

### Configure Environment
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

### Start the Server
```bash
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```
The server will be available at `http://localhost:8000`.
Interactive Swagger API documentation: `http://localhost:8000/docs`.

### Run Test Suite
```bash
python -m pytest tests/
```

---

## 4. API Endpoints Contract

### Health Check
- **Endpoint:** `GET /api/health`
- **Response:**
```json
{
  "status": "ok",
  "app_name": "TruthLens AI",
  "version": "1.0.0",
  "model_loaded": true,
  "model_name": "Vision Transformer (ViT) Deepfake Detector",
  "timestamp": "2026-10-17T06:20:48.128851Z"
}
```

### Video Forensics Analysis
- **Endpoint:** `POST /api/analyze`
- **Content-Type:** `multipart/form-data`
- **Payload Field:** `file` (Video file, supported: `.mp4`, `.avi`, `.mov`, `.webm`, `.mkv`)
- **Successful Response:**
```json
{
  "analysis_id": "tl-4b66cc86ead1",
  "status": "completed",
  "filename": "interview_clip.mp4",
  "duration_seconds": 14.5,
  "frames_analyzed": 12,
  "result": "no_strong_signs_detected",
  "risk_score": 0.0827,
  "score_type": "aggregate_face_anomaly_score",
  "score_explanation": "Heuristic risk score 0.08 reflects low anomaly indices across 12 evaluated facial regions.",
  "summary": "No strong signs of facial manipulation detected. Sampled facial textures and boundary transitions appear consistent with authentic camera captures (aggregate risk score: 0.08).",
  "findings": [
    "Analyzed 12 uniform frames over 14.5s video duration.",
    "Localized human faces in 12 of 12 sampled frames.",
    "Average facial anomaly score: 0.04; peak anomaly score: 0.17 (at 1.9s).",
    "Frames exceeding high-risk threshold (0.65): 0 of 12.",
    "Model architecture: Pretrained Vision Transformer (Vision Transformer (ViT) Deepfake Detector)."
  ],
  "frame_results": [
    {
      "frame_index": 0,
      "timestamp_seconds": 0.0,
      "faces_detected": 1,
      "manipulation_score": 0.0118,
      "preview_image": "data:image/jpeg;base64,...",
      "notes": "Facial texture and boundary features appear consistent (0.01)."
    }
  ],
  "model_name": "Vision Transformer (ViT) Deepfake Detector",
  "limitations": [
    "Automated model inference provides a forensic risk estimate, not mathematical or legal proof of authenticity.",
    "Re-encoding, social media compression, motion blur, and low lighting can mimic or mask manipulation artifacts.",
    "Audio-video synchronization and voice synthesis are not analyzed by this image-based detector."
  ],
  "error": null,
  "created_at": "2026-10-17T06:28:24.300Z"
}
```

### History Persistence (Optional MongoDB)
- **Endpoint:** `GET /api/analyses`
- **Endpoint:** `GET /api/analyses/{analysis_id}`

---

## 5. Sample Demonstration Videos

Located in `backend/samples/`:
1. `demo_authentic.mp4` — Authentic portrait video demonstrating consistent facial geometry.
2. `demo_manipulated.mp4` — Video with synthetic boundary and frequency manipulation.
3. `demo_no_face.mp4` — Media without detectable human faces; demonstrates honest `unable_to_assess` handling.
