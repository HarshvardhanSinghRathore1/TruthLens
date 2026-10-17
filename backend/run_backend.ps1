[CmdletBinding()]
param(
    [int]$Port = 8000
)

$host.UI.RawUI.WindowTitle = "TruthLens AI - Backend Server ($Port)"
$ScriptRoot = $PSScriptRoot
Set-Location $ScriptRoot

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  TruthLens AI - Backend (FastAPI)" -ForegroundColor Cyan
Write-Host "  Port: $Port" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$pythonExe = Join-Path $ScriptRoot ".venv\Scripts\python.exe"
if (-not (Test-Path $pythonExe)) {
    $pythonExe = "python"
}

& $pythonExe -m uvicorn app.main:app --host 0.0.0.0 --port $Port
