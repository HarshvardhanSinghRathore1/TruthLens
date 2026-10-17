<#
.SYNOPSIS
    TruthLens AI - Process Cleanup Script for Windows.
.DESCRIPTION
    Stops all backend and frontend processes launched by run.ps1.
.EXAMPLE
    .\stop.ps1
    powershell -ExecutionPolicy Bypass -File .\stop.ps1
#>

[CmdletBinding()]
param()

$ScriptRoot = $PSScriptRoot

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "        TRUTHLENS AI SHUTDOWN" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$pidFile = Join-Path $ScriptRoot ".truthlens_pids.json"
$stoppedCount = 0

if (Test-Path $pidFile) {
    try {
        $raw = Get-Content $pidFile -Raw -ErrorAction SilentlyContinue
        if ($raw -and $raw.Trim()) {
            $pids = @($raw | ConvertFrom-Json)
            foreach ($p in $pids) {
                $proc = Get-Process -Id $p -ErrorAction SilentlyContinue
                if ($proc) {
                    # Stop child processes as well (cmd, python, node)
                    Get-CimInstance Win32_Process | Where-Object { $_.ParentProcessId -eq $p } | ForEach-Object {
                        Stop-Process -Id $_.ProcessId -Force -ErrorAction SilentlyContinue
                    }
                    Stop-Process -Id $p -Force -ErrorAction SilentlyContinue
                    Write-Host "[OK] Stopped process $p ($($proc.ProcessName))" -ForegroundColor Green
                    $stoppedCount++
                }
            }
        }
    } catch {}
    finally {
        Remove-Item $pidFile -Force -ErrorAction SilentlyContinue
    }
}

# Also verify ports and kill stray uvicorn or vite processes if left orphaned
$backendPort = 8000
$frontendPort = 5173
$backendEnvPath = Join-Path $ScriptRoot "backend\.env"
if (Test-Path $backendEnvPath) {
    $envContent = Get-Content $backendEnvPath -Raw
    if ($envContent -match '(?m)^\s*PORT\s*=\s*(\d+)') {
        $backendPort = [int]$matches[1]
    }
}

$viteConfigPath = Join-Path $ScriptRoot "frontend\vite.config.ts"
if (Test-Path $viteConfigPath) {
    $viteContent = Get-Content $viteConfigPath -Raw
    if ($viteContent -match 'port\s*:\s*(\d+)') {
        $frontendPort = [int]$matches[1]
    }
}

foreach ($port in @($backendPort, $frontendPort)) {
    try {
        $conns = Get-NetTCPConnection -LocalPort $port -State Listen -ErrorAction SilentlyContinue
        foreach ($conn in $conns) {
            $ownerProc = Get-Process -Id $conn.OwningProcess -ErrorAction SilentlyContinue
            if ($ownerProc -and ($ownerProc.ProcessName -match "python|node|powershell|cmd")) {
                Stop-Process -Id $ownerProc.Id -Force -ErrorAction SilentlyContinue
                Write-Host "[OK] Freed port $port by stopping process $($ownerProc.Id) ($($ownerProc.ProcessName))" -ForegroundColor Green
                $stoppedCount++
            }
        }
    } catch {}
}

if ($stoppedCount -eq 0) {
    Write-Host "[INFO] No active TruthLens AI processes found running." -ForegroundColor Gray
} else {
    Write-Host ""
    Write-Host "[OK] All TruthLens AI processes stopped." -ForegroundColor Green
}

Write-Host "========================================" -ForegroundColor Cyan
