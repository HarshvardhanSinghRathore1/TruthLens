# TruthLens AI Setup Guide

Follow this guide to get both the frontend and backend running on your development workstation.

---

## 1. System Requirements

- **Operating System:** Windows 10/11, macOS, or Ubuntu 20.04+
- **Node.js:** v18.0.0 or higher
- **npm:** v9.0.0 or higher
- **Python:** 3.10 to 3.12+ (or compatible 3.14 environment)
- **Git**

---

## 2. Backend Setup

### Step 2.1: Navigate and create a virtual environment
```bash
cd backend
python -m venv venv
```

### Step 2.2: Activate the virtual environment
- **Windows (PowerShell):**
  ```powershell
  .\venv\Scripts\Activate.ps1
  ```
- **Windows (CMD):**
  ```cmd
  .\venv\Scripts\activate.bat
  ```
- **macOS / Linux:**
  ```bash
  source venv/bin/activate
  ```

### Step 2.3: Install Python dependencies
```bash
pip install --upgrade pip
pip install -r requirements.txt
```

### Step 2.4: Environment configuration
Copy the template environment file:
```bash
cp .env.example .env
```
Default parameters are tuned for local development (`PORT=8000`, `CORS_ORIGINS=["http://localhost:5173"]`).

### Step 2.5: Launch the backend
```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```
Verify the server is running by opening:
- Health check: [http://localhost:8000/api/health](http://localhost:8000/api/health)
- Swagger docs: [http://localhost:8000/docs](http://localhost:8000/docs)

---

## 3. Frontend Setup

### Step 3.1: Navigate and install dependencies
Open a separate terminal window:
```bash
cd frontend
npm install
```

### Step 3.2: Configure environment
```bash
cp .env.example .env
```
Ensure `VITE_API_BASE_URL` is configured to `http://localhost:8000/api`.

### Step 3.3: Launch Vite dev server
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 4. Running Backend Unit Tests

From the `backend/` directory:
```bash
pytest
```
This runs `tests/test_health.py` and `tests/test_video_validation.py`.
