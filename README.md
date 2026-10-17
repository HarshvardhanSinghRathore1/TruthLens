# TruthLens AI

> **See Beyond the Fake.**

TruthLens AI is an AI-powered digital media forensics platform. It allows users to upload videos, extract facial frames, run them through deepfake detection models, monitor live deepfake news via Deepfake Radar, and view an interpretable forensics report detailing findings, risk indicators, and methodological limitations.

---

## Table of Contents

- [Overview](#overview)
- [Quick Start (One Command)](#quick-start-one-command)
- [Key Features](#key-features)
- [Architecture & Tech Stack](#architecture--tech-stack)
- [Repository Structure](#repository-structure)
- [Prerequisites](#prerequisites)
- [Getting Started](#getting-started)
  - [Backend Setup](#backend-setup)
  - [Frontend Setup](#frontend-setup)
- [API Contract Summary](#api-contract-summary)
- [Testing](#testing)
- [Safety, Ethics & Limitations](#safety-ethics--limitations)
- [License](#license)

---

## Overview

In an era of generative AI and synthetic media, determining whether video content is authentic is an urgent cybersecurity challenge. TruthLens AI provides:
1. Frame extraction and face isolation using OpenCV.
2. Inference utilizing pretrained deepfake detection architectures.
3. Transparent score aggregation and plain-language risk interpretation.
4. Clear ethical disclaimers—never fabricating certainty or claiming mathematical proof of authenticity.

---

## Key Features

- **Video Ingestion:** Drag-and-drop video upload with format, size, and duration validation.
- **Forensic Pipeline:** OpenCV backend processing, intelligent frame sampling, and face detection.
- **Model Inference:** Pretrained deepfake detector integration with dedicated isolation adapters.
- **Three Core Outcomes:**
  - `potential_manipulation_detected`
  - `no_strong_signs_detected`
  - `unable_to_assess`
- **Transparent Forensics Report:** Displays analyzed frames, model risk interpretation, and technical limitations.
- **Modular Data Persistence:** Optional MongoDB integration for historical audit logs without hard dependencies.

---

## Architecture & Tech Stack

### Frontend
- **Framework:** React 18 / 19 with Vite & TypeScript
- **Styling:** Tailwind CSS (Dark forensic theme with `#0B1020` base, `#38D9FF` cyan accent, `#8B5CF6` violet accent)
- **Routing:** React Router v6
- **Icons:** Lucide React
- **HTTP Client:** Axios

### Backend
- **Framework:** FastAPI (Python 3.10+)
- **ASGI Server:** Uvicorn
- **Computer Vision:** OpenCV (`opencv-python-headless`), Pillow, NumPy
- **Deep Learning:** PyTorch, Torchvision
- **Validation:** Pydantic v2
- **File Handling:** `python-multipart`

---

## Repository Structure

```text
TruthLens/
├── backend/
│   ├── app/
│   │   ├── api/
│   │   │   ├── routes/
│   │   │   │   ├── health.py        # Health probe endpoint
│   │   │   │   └── analysis.py      # Video analysis endpoints
│   │   │   └── router.py            # Central API router
│   │   ├── core/
│   │   │   ├── config.py            # Application settings & env vars
│   │   │   └── logging_config.py    # Structured logging configuration
│   │   ├── database/
│   │   │   ├── connection.py        # Optional MongoDB client
│   │   │   └── repository.py        # Analysis metadata persistence
│   │   ├── models/
│   │   │   └── model_loader.py      # Pretrained model loader adapter
│   │   ├── schemas/
│   │   │   └── analysis.py          # Shared Pydantic response models
│   │   ├── services/
│   │   │   ├── analysis_service.py  # Orchestrates extraction & inference
│   │   │   ├── model_service.py     # Deepfake inference service
│   │   │   └── video_processor.py   # OpenCV frame extraction & face cropping
│   │   ├── utils/
│   │   │   └── file_validation.py   # File type, size, and integrity checks
│   │   └── main.py                  # FastAPI application entry point
│   ├── tests/
│   │   ├── test_health.py           # Health check unit test
│   │   └── test_video_validation.py # Video validation unit tests
│   ├── uploads/                     # Temporary upload buffer (gitignored)
│   ├── .env.example
│   ├── .gitignore
│   └── requirements.txt
│
├── frontend/
│   ├── public/
│   │   ├── favicon.svg
│   │   └── images/
│   ├── src/
│   │   ├── assets/
│   │   ├── components/
│   │   │   ├── common/
│   │   │   ├── layout/
│   │   │   ├── upload/
│   │   │   ├── analysis/
│   │   │   └── results/
│   │   ├── constants/
│   │   ├── hooks/
│   │   ├── pages/
│   │   │   ├── HomePage.tsx
│   │   │   ├── AnalyzePage.tsx
│   │   │   ├── ResultsPage.tsx
│   │   │   └── NotFoundPage.tsx
│   │   ├── services/
│   │   │   └── api.ts               # Axios client with env config
│   │   ├── types/
│   │   │   └── analysis.ts          # TypeScript interfaces matching backend
│   │   ├── utils/
│   │   ├── App.tsx
│   │   ├── index.css                # Forensic theme styling
│   │   └── main.tsx
│   ├── .env.example
│   ├── .gitignore
│   ├── package.json
│   ├── postcss.config.js
│   ├── tailwind.config.js
│   ├── tsconfig.json
│   └── vite.config.ts
│
├── docs/
│   ├── architecture.md
│   ├── api-contract.md
│   └── setup.md
├── .gitignore
├── LICENSE
└── README.md
```

---

## Quick Start (One Command)

The easiest way to start both the backend and frontend on Windows with automatic dependency checking, port detection, and browser launch:

```powershell
# In PowerShell (root directory):
.\run.ps1
```

If your PowerShell execution policy is restricted, run:
```powershell
powershell -ExecutionPolicy Bypass -File .\run.ps1
```
Or simply double-click / run:
```cmd
.\run.bat
```

To stop all running TruthLens AI processes:
```powershell
.\stop.ps1
# or
.\stop.bat
```

---

## Prerequisites

- **Node.js:** v18+ or v20+ recommended (verified on v24)
- **Python:** 3.10 to 3.12+ (or 3.14 where compatible wheels exist)
- **Git**

---

## Getting Started

### Backend Setup

1. Open a terminal and navigate to `backend/`:
   ```bash
   cd backend
   ```

2. Create and activate a Python virtual environment:
   ```bash
   python -m venv venv
   # On Windows (PowerShell):
   .\venv\Scripts\Activate.ps1
   # On Linux/macOS:
   source venv/bin/activate
   ```

3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Configure environment:
   ```bash
   cp .env.example .env
   ```

5. Run the development server:
   ```bash
   uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
   ```
   The backend API will be live at `http://localhost:8000`. Test the health check at `http://localhost:8000/api/health` and docs at `http://localhost:8000/docs`.

### Frontend Setup

1. Open a new terminal and navigate to `frontend/`:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment:
   ```bash
   cp .env.example .env
   ```

4. Start the Vite development server:
   ```bash
   npm run dev
   ```
   The application will be accessible at `http://localhost:5173`.

---

## API Contract Summary

- `GET /api/health` — System status and model readiness.
- `POST /api/analyze` — Upload video for frame extraction and inference.
- `GET /api/analyses/{analysis_id}` — Retrieve historical analysis (reserved for MongoDB module).

Refer to [docs/api-contract.md](docs/api-contract.md) for full schema specifications.

---

## Testing

Run backend tests using `pytest`:
```bash
cd backend
pytest
```

---

## Safety, Ethics & Limitations

TruthLens AI enforces responsible AI reporting:
- Automated analysis produces risk indicators, not definitive legal proof of manipulation or authenticity.
- No video is retained permanently without explicit configuration.
- We never fabricate predictions or confidence values if inference fails.

---

## License

This project is licensed under the [MIT License](LICENSE).
