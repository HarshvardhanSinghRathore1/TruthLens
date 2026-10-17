[CmdletBinding()]
param(
    [int]$Port = 5173
)

$host.UI.RawUI.WindowTitle = "TruthLens AI - Frontend ($Port)"
$ScriptRoot = $PSScriptRoot
Set-Location $ScriptRoot

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  TruthLens AI - Frontend (Vite / React)" -ForegroundColor Cyan
Write-Host "  Port: $Port" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

npm run dev
