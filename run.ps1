<#
.SYNOPSIS
    TruthLens AI - One-Command Startup System for Windows.
.DESCRIPTION
    Validates prerequisites, checks dependencies, boots FastAPI backend and Vite frontend,
    waits for health checks, displays actual port URLs, and launches the browser.
.EXAMPLE
    .\run.ps1
    powershell -ExecutionPolicy Bypass -File .\run.ps1
#>

[CmdletBinding()]
param(
    [switch]$NoBrowser
)

$ErrorActionPreference = "Stop"
$ScriptRoot = $PSScriptRoot

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "        TRUTHLENS AI STARTUP" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# -----------------------------------------------------------------------------
# 1. Check Node.js and npm
# -----------------------------------------------------------------------------
$nodeCmd = Get-Command "node" -ErrorAction SilentlyContinue
$npmCmd = Get-Command "npm" -ErrorAction SilentlyContinue

if (-not $nodeCmd) {
    Write-Host "[ERROR] Node.js is not installed or not in PATH." -ForegroundColor Red
    Write-Host "Please install Node.js (v18+) from https://nodejs.org" -ForegroundColor Yellow
    exit 1
}

if (-not $npmCmd) {
    Write-Host "[ERROR] npm is not installed or not in PATH." -ForegroundColor Red
    exit 1
}

# -----------------------------------------------------------------------------
# 2. Check Python Environment
# -----------------------------------------------------------------------------
$venvPython = Join-Path $ScriptRoot "backend\.venv\Scripts\python.exe"
$rootVenvPython = Join-Path $ScriptRoot ".venv\Scripts\python.exe"

$selectedPython = $null
if (Test-Path $venvPython) {
    $selectedPython = $venvPython
} elseif (Test-Path $rootVenvPython) {
    $selectedPython = $rootVenvPython
} else {
    $sysPython = Get-Command "python" -ErrorAction SilentlyContinue
    if ($sysPython) {
        $selectedPython = $sysPython.Source
    }
}

if (-not $selectedPython) {
    Write-Host "[ERROR] No Python interpreter found in backend\.venv or system PATH." -ForegroundColor Red
    Write-Host "Please create a virtual environment in backend\.venv using Python 3.10-3.12." -ForegroundColor Yellow
    exit 1
}

# -----------------------------------------------------------------------------
# 3. Verify Environment Configuration (.env)
# -----------------------------------------------------------------------------
$backendEnvPath = Join-Path $ScriptRoot "backend\.env"
$backendEnvExample = Join-Path $ScriptRoot "backend\.env.example"

if (-not (Test-Path $backendEnvPath)) {
    if (Test-Path $backendEnvExample) {
        Copy-Item $backendEnvExample $backendEnvPath
        Write-Host "[INFO] Created backend\.env from template (.env.example)" -ForegroundColor Gray
    } else {
        Write-Host "[ERROR] Missing backend\.env configuration file." -ForegroundColor Red
        exit 1
    }
}

# -----------------------------------------------------------------------------
# 4. Detect Configured Ports Dynamically
# -----------------------------------------------------------------------------
# Parse backend port from backend/.env
$backendPort = 8000
if (Test-Path $backendEnvPath) {
    $envContent = Get-Content $backendEnvPath -Raw
    if ($envContent -match '(?m)^\s*PORT\s*=\s*(\d+)') {
        $backendPort = [int]$matches[1]
    }
}

# Parse frontend port from frontend/vite.config.ts
$frontendPort = 5173
$viteConfigPath = Join-Path $ScriptRoot "frontend\vite.config.ts"
if (Test-Path $viteConfigPath) {
    $viteContent = Get-Content $viteConfigPath -Raw
    if ($viteContent -match 'port\s*:\s*(\d+)') {
        $frontendPort = [int]$matches[1]
    }
}

$backendUrl = "http://localhost:$backendPort"
$frontendUrl = "http://localhost:$frontendPort"
$apiDocsUrl = "$backendUrl/docs"

# -----------------------------------------------------------------------------
# 5. Check and Prepare Dependencies
# -----------------------------------------------------------------------------
# Frontend node_modules check
$frontendDir = Join-Path $ScriptRoot "frontend"
$frontendModules = Join-Path $frontendDir "node_modules"

if (-not (Test-Path $frontendModules)) {
    Write-Host "[INFO] Installing frontend dependencies (npm install)..." -ForegroundColor Gray
    Push-Location $frontendDir
    try {
        & npm install --no-audit --no-fund
        if ($LASTEXITCODE -ne 0) {
            Write-Host "[ERROR] npm install failed." -ForegroundColor Red
            exit 1
        }
    } finally {
        Pop-Location
    }
}
Write-Host "[OK] Frontend dependencies ready" -ForegroundColor Green

# Backend packages verification
$testScript = "import fastapi, uvicorn, PIL, cv2, torch, httpx; print('OK')"
$pkgCheck = & $selectedPython -c $testScript 2>&1
if ($pkgCheck -notmatch "OK") {
    Write-Host "[WARNING] Some backend packages may be missing: $pkgCheck" -ForegroundColor Yellow
}
Write-Host "[OK] Backend environment ready" -ForegroundColor Green

# -----------------------------------------------------------------------------
# 6. Check for Already Running Instances or Port Conflicts
# -----------------------------------------------------------------------------
function Test-PortOpen ($port) {
    $client = New-Object System.Net.Sockets.TcpClient
    try {
        $asyncResult = $client.BeginConnect("127.0.0.1", $port, $null, $null)
        $success = $asyncResult.AsyncWaitHandle.WaitOne(400, $false)
        if ($success -and $client.Connected) {
            $client.EndConnect($asyncResult)
            return $true
        }
        return $false
    } catch {
        return $false
    } finally {
        $client.Close()
    }
}

$backendAlreadyRunning = $false
$frontendAlreadyRunning = $false

if (Test-PortOpen $backendPort) {
    try {
        $resp = Invoke-RestMethod -Uri "$backendUrl/api/health" -Method Get -TimeoutSec 2 -ErrorAction Stop
        if ($resp -and ($resp.status -eq "ok" -or $resp.app)) {
            $backendAlreadyRunning = $true
            Write-Host "[INFO] Backend is already running at $backendUrl" -ForegroundColor Gray
        }
    } catch {
        Write-Host "[WARNING] Port $backendPort is in use by another process." -ForegroundColor Yellow
    }
}

if (Test-PortOpen $frontendPort) {
    try {
        $resp = Invoke-WebRequest -Uri $frontendUrl -Method Get -TimeoutSec 2 -ErrorAction Stop
        if ($resp.StatusCode -eq 200) {
            $frontendAlreadyRunning = $true
            Write-Host "[INFO] Frontend is already running at $frontendUrl" -ForegroundColor Gray
        }
    } catch {
        Write-Host "[WARNING] Port $frontendPort is in use by another process." -ForegroundColor Yellow
    }
}

# State file to track started processes for stop.ps1
$pidFile = Join-Path $ScriptRoot ".truthlens_pids.json"
$startedPids = @()
if (Test-Path $pidFile) {
    try {
        $startedPids = @(Get-Content $pidFile | ConvertFrom-Json)
    } catch {
        $startedPids = @()
    }
}

# -----------------------------------------------------------------------------
# 7. Start Backend Process (if not already running)
# -----------------------------------------------------------------------------
$backendDir = Join-Path $ScriptRoot "backend"
if (-not $backendAlreadyRunning) {
    $backendScript = Join-Path $backendDir "run_backend.ps1"
    $backendProcess = Start-Process powershell.exe -WorkingDirectory $backendDir -ArgumentList @(
        "-NoExit",
        "-ExecutionPolicy", "Bypass",
        "-File", "`"$backendScript`"",
        "-Port", "$backendPort"
    ) -PassThru

    $startedPids += $backendProcess.Id
}

# -----------------------------------------------------------------------------
# 8. Start Frontend Process (if not already running)
# -----------------------------------------------------------------------------
if (-not $frontendAlreadyRunning) {
    $frontendScript = Join-Path $frontendDir "run_frontend.ps1"
    $frontendProcess = Start-Process powershell.exe -WorkingDirectory $frontendDir -ArgumentList @(
        "-NoExit",
        "-ExecutionPolicy", "Bypass",
        "-File", "`"$frontendScript`"",
        "-Port", "$frontendPort"
    ) -PassThru

    $startedPids += $frontendProcess.Id
}

# Save PIDs to file for cleanup
$startedPids | ConvertTo-Json | Set-Content $pidFile -Force

# -----------------------------------------------------------------------------
# 9. Wait for Backend Readiness (Health Check)
# -----------------------------------------------------------------------------
$backendReady = $false
$maxRetries = 35
$retry = 0

while (-not $backendReady -and $retry -lt $maxRetries) {
    Start-Sleep -Seconds 1
    try {
        $resp = Invoke-RestMethod -Uri "$backendUrl/api/health" -Method Get -TimeoutSec 2 -ErrorAction Stop
        if ($resp -and ($resp.status -eq "ok" -or $resp.app)) {
            $backendReady = $true
            break
        }
    } catch {
        $retry++
    }
}

if (-not $backendReady) {
    Write-Host "[ERROR] Backend server failed to respond at $backendUrl/api/health" -ForegroundColor Red
    Write-Host "Check the opened 'TruthLens AI - Backend Server' console window for error details." -ForegroundColor Yellow
    exit 1
}
Write-Host "[OK] Backend health check passed" -ForegroundColor Green

# -----------------------------------------------------------------------------
# 10. Wait for Frontend Readiness
# -----------------------------------------------------------------------------
$frontendReady = $false
$retry = 0
while (-not $frontendReady -and $retry -lt $maxRetries) {
    Start-Sleep -Milliseconds 600
    try {
        $resp = Invoke-WebRequest -Uri $frontendUrl -Method Get -TimeoutSec 2 -ErrorAction Stop
        if ($resp.StatusCode -eq 200) {
            $frontendReady = $true
            break
        }
    } catch {
        $retry++
    }
}

if (-not $frontendReady) {
    Write-Host "[ERROR] Frontend development server failed to respond at $frontendUrl" -ForegroundColor Red
    Write-Host "Check the opened 'TruthLens AI - Frontend' console window for error details." -ForegroundColor Yellow
    exit 1
}
Write-Host "[OK] Frontend ready" -ForegroundColor Green
Write-Host ""

# -----------------------------------------------------------------------------
# 11. Display Connection URLs and Launch Browser
# -----------------------------------------------------------------------------
Write-Host "Frontend: $frontendUrl" -ForegroundColor Cyan
Write-Host "Backend:  $backendUrl" -ForegroundColor Cyan
Write-Host "API Docs: $apiDocsUrl" -ForegroundColor Cyan
Write-Host ""

if (-not $NoBrowser) {
    Write-Host "Opening TruthLens AI in your browser..." -ForegroundColor Green
    Start-Process $frontendUrl
}

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "[TIP] To stop all servers, run: .\stop.ps1" -ForegroundColor Gray
