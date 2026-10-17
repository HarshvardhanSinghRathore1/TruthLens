# TruthLens AI — Multimodal Video & Audio Deepfake Detection Backend

**Tagline:** See Beyond the Fake.  
**Role:** Multimodal Media Forensics Pipeline (Vision Transformer Video + Wav2Vec2 Audio Anti-Spoofing) with FastAPI Services.

---

## 1. Architecture Overview

TruthLens AI provides genuine, dual-modal deepfake screening for video and audio. It enforces a strict policy of forensic honesty:
- **No fabricated scores:** Confidence and risk scores are derived strictly from real pretrained model inference.
- **Independent modalities:** Video and audio are analyzed separately. A video manipulation does not imply audio spoofing, and vice-versa.
- **Fail-safe isolation:** Missing audio, silent audio, or unreadable frames are handled gracefully and reported with transparent forensic evidence.

```
                  [ Uploaded Video Media File ]
                                │
                 ┌──────────────┴──────────────┐
                 ▼                             ▼
    [ Video Forensics Stream ]       [ Audio Demuxing Stream ]
                 │                             │
    OpenCV Uniform Sampling          FFmpeg Stream Probe
    (8–16 keyframes across duration) (Codec, sample rate, channels)
                 │                             │
    Haar Cascade Face Detection      Extract 16 kHz Mono PCM WAV
    (20% bounding box margin)        (Silence & length validation)
                 │                             │
    Vision Transformer (ViT)         Wav2Vec2 Audio Classifier
    (dima806/deepfake_vs_real)       (Vansh180/deepfake-audio-wav2vec2)
                 │                             │
    Weighted Anomaly Aggregator      Chunked Temporal Aggregator
                 │                             │
                 └──────────────┬──────────────┘
                                ▼
              [ Multimodal Analysis Response ]
                 - Video Analysis Dossier
                 - Audio Speech Anti-Spoofing Dossier
                 - AV Consistency Notice
```

---

## 2. Pretrained Models & Forensic Specifications

### 2.1 Video Model: Vision Transformer (ViT)
- **Model ID:** `dima806/deepfake_vs_real_image_detection`
- **Architecture:** Vision Transformer (`google/vit-base-patch16-224-in21k` backbone fine-tuned for facial deepfake detection)
- **License:** Apache 2.0
- **Input Specifications:** 224x224 RGB image tensor, normalized by ImageNet statistics.
- **Classification Head:** Binary Softmax Classifier
  - Index 0: `Real` (Authentic facial features)
  - Index 1: `Fake` (Synthetic / manipulated artifacts)
- **Score Definition:**
  - `manipulation_score`: Softmax probability of Class 1 (`Fake`).
  - Range: `0.00` (low anomaly) to `1.00` (high anomaly).
- **Video-Level Aggregation:**
  - $0.65 \times \text{top\_3\_mean} + 0.35 \times \text{mean\_score}$
- **Outcome Categories:**
  - `potentially_manipulated`: Aggregated risk $\ge 0.65$
  - `potentially_genuine`: Aggregated risk $\le 0.40$
  - `unable_to_assess`: $0.40 < \text{risk} < 0.65$ or 0 faces localized

### 2.2 Audio Model: Wav2Vec2 Speech Anti-Spoofing
- **Model ID:** `Vansh180/deepfake-audio-wav2vec2`
- **Architecture:** Wav2Vec2 feature encoder + sequence classification head (`AutoModelForAudioClassification`)
- **License:** Apache 2.0
- **Input Specifications:** 16,000 Hz single-channel (mono) float32 waveform tensor.
- **Classification Head:** Binary Softmax Classifier
  - Index 0: `real` (Human vocal tract acoustics)
  - Index 1: `fake` (Synthetic speech, neural vocoder artifacts)
- **Audio-Level Aggregation:**
  - Audio is partitioned into 5.0s evaluation windows.
  - $0.60 \times \text{peak\_segment\_score} + 0.40 \times \text{mean\_segment\_score}$
- **Outcome Categories:**
  - `potentially_spoofed_speech`: Aggregated risk $\ge 0.65$
  - `potentially_genuine_speech`: Aggregated risk $\le 0.40$
  - `unable_to_assess`: $0.40 < \text{risk} < 0.65$ or audio duration $< 0.5\text{s}$
  - `audio_unavailable`: No audio stream or near-silent waveform (energy $< 0.0001$)

---

## 3. Setup & Running Locally (Windows PowerShell)

### Prerequisites
- Python 3.10+ (Verified on Python 3.13 on Windows 11)
- FFmpeg (bundled automatically via `imageio-ffmpeg` or system PATH)

### 1. Install Backend Dependencies
```powershell
cd backend
pip install -r requirements.txt
```

### 2. Configure Environment
```powershell
Copy-Item .env.example .env
```

### 3. Start the FastAPI Server
```powershell
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000
```
Interactive Swagger API documentation is available at `http://127.0.0.1:8000/docs`.

### 4. Run Automated Test Suite
```powershell
python -m pytest tests/
```

---

## 4. API Endpoints Contract

### Health Check: `GET /api/health`
Returns readiness status for both server and individual models:
```json
{
  "status": "ok",
  "app_name": "TruthLens AI",
  "version": "1.0.0",
  "model_loaded": true,
  "model_name": "Vision Transformer (ViT) Deepfake Detector",
  "audio_model_loaded": true,
  "audio_model_name": "Wav2Vec2 Speech Anti-Spoofing Detector",
  "timestamp": "2026-10-17T07:35:05.661Z"
}
```

### Multimodal Video & Audio Analysis: `POST /api/analyze`
Accepts `multipart/form-data` with form field `file`:
```json
{
  "analysis_id": "tl-93c4e03f0545",
  "status": "completed",
  "filename": "interview_clip.mp4",
  "duration_seconds": 12.5,
  "frames_analyzed": 12,
  "result": "no_strong_signs_detected",
  "risk_score": 0.124,
  "summary": "Forensic screening completed across video and audio modalities.",
  "video_analysis": {
    "status": "completed",
    "outcome": "potentially_genuine",
    "model_name": "Vision Transformer (ViT) Deepfake Detector",
    "frames_analyzed": 12,
    "faces_detected": 12,
    "risk_score": 0.124,
    "score_explanation": "Visual risk score 0.12 reflects low anomaly indices across 12 evaluated facial regions.",
    "findings": [
      "Analyzed 12 uniform frames over 12.5s duration.",
      "Localized human faces in 12 of 12 sampled frames."
    ],
    "limitations": [
      "Image-level classifier evaluating spatial facial frames; does not assess cross-frame temporal continuity.",
      "Compression artifacts and lighting can mimic or mask anomalies."
    ]
  },
  "audio_analysis": {
    "has_audio": true,
    "status": "completed",
    "outcome": "potentially_genuine_speech",
    "model_name": "Wav2Vec2 Speech Anti-Spoofing Detector",
    "duration_seconds": 12.5,
    "segments_analyzed": 3,
    "risk_score": 0.218,
    "score_explanation": "Speech risk score 0.22 reflects low acoustic anomaly across 3 evaluated audio segments.",
    "findings": [
      "Demuxed 12.5s 16 kHz mono audio stream via FFmpeg.",
      "Evaluated 3 temporal acoustic segments using Wav2Vec2."
    ],
    "limitations": [
      "Acoustic anti-spoofing evaluates vocoder cues; background noise and compression may affect scores.",
      "Does not verify speaker identity or semantic truthfulness."
    ]
  },
  "av_consistency": {
    "status": "not_checked",
    "sync_score": null,
    "active_speaking_frames": null,
    "findings": [
      "Audio-video synchronization and lip-sync analysis is not implemented in this version.",
      "Facial visual forensics and speech forensics are evaluated as independent modalities."
    ],
    "disclaimer": "TruthLens facial detector analyzes spatial video frames. Lip-sync correlation is not computed."
  }
}
```

---

## 5. Sample Demonstration Media

Located in `backend/samples/`:
1. `demo_video_with_audio.mp4` — Multimodal media containing both facial animation and synthesized speech waveform.
2. `demo_authentic.mp4` — Authentic portrait video demonstrating consistent facial geometry.
3. `demo_manipulated.mp4` — Video with synthetic boundary and frequency manipulation.
4. `demo_no_face.mp4` — Media without detectable human faces; demonstrates honest `unable_to_assess` and silent audio handling.
