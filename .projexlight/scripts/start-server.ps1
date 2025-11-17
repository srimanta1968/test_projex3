# ProjexLight Server Startup Script (Windows PowerShell)
# Generated during CLI Export for cross-platform support
param([string]$Action = "start")

$ErrorActionPreference = "Stop"
$ProjectType = "node"
$Framework = "Express.js"
$Language = "javascript"
$ServerPort = if ($env:SERVER_PORT) { $env:SERVER_PORT } else { "3000" }
$HealthEndpoint = if ($env:HEALTH_ENDPOINT) { $env:HEALTH_ENDPOINT } else { "http://localhost:3000/health" }
$BuildCommand = ""
$StartCommand = "npm run dev || npm start"
$InstallCommand = "npm install"

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$ProjectRoot = Split-Path -Parent (Split-Path -Parent $ScriptDir)
$LogFile = Join-Path $ProjectRoot ".projexlight\logs\server-startup.log"
$PidFile = Join-Path $ProjectRoot ".projexlight\server.pid"

New-Item -ItemType Directory -Path (Split-Path -Parent $LogFile) -Force -ErrorAction SilentlyContinue | Out-Null

function Write-Log { param([string]$Message, [string]$Color = "White"); Write-Host $Message -ForegroundColor $Color; "[$((Get-Date).ToString('yyyy-MM-dd HH:mm:ss'))] $Message" | Out-File -FilePath $LogFile -Append }
function Write-ErrorLog { param([string]$Message); Write-Host $Message -ForegroundColor Red; "[$((Get-Date).ToString('yyyy-MM-dd HH:mm:ss'))] ERROR: $Message" | Out-File -FilePath $LogFile -Append }

function Load-Environment {
    Write-Log "Loading environment variables..." "Cyan"
    @("$ProjectRoot\.env", "$ProjectRoot\server\.env", "$ProjectRoot\.env.local") | ForEach-Object {
        if (Test-Path $_) {
            Write-Log "   Loading: $_"
            Get-Content $_ | ForEach-Object {
                if ($_ -match '^([^#][^=]+)=(.*)$') {
                    [Environment]::SetEnvironmentVariable($matches[1].Trim(), $matches[2].Trim(), "Process")
                }
            }
        }
    }
    if ($env:PORT) { $script:ServerPort = $env:PORT; Write-Log "   Using PORT from .env: $ServerPort" }
}

function Install-Dependencies {
    Write-Log "Installing dependencies..." "Cyan"
    Set-Location $ProjectRoot
    if ([string]::IsNullOrEmpty($InstallCommand)) { Write-Log "   Skipping"; return $true }
    if (($ProjectType -eq "node") -and (Test-Path "node_modules")) { Write-Log "   Already installed"; return $true }
    Write-Log "   Running: $InstallCommand"
    try { Invoke-Expression $InstallCommand 2>&1 | Out-File -FilePath $LogFile -Append; Write-Log "   Dependencies installed" "Green"; return $true }
    catch { Write-ErrorLog "Dependency installation failed!"; return $false }
}

function Build-Project {
    Write-Log "Building project..." "Cyan"
    Set-Location $ProjectRoot
    if ([string]::IsNullOrEmpty($BuildCommand)) { Write-Log "   Skipping"; return $true }
    Write-Log "   Running: $BuildCommand"
    try { Invoke-Expression $BuildCommand 2>&1 | Out-File -FilePath $LogFile -Append; Write-Log "   Build successful" "Green"; return $true }
    catch { Write-ErrorLog "Build failed!"; return $false }
}

function Start-Server {
    Write-Log "Starting server..." "Cyan"
    Set-Location $ProjectRoot
    if ([string]::IsNullOrEmpty($StartCommand)) { Write-ErrorLog "No start command!"; return $false }
    if ((Test-Path $PidFile) -and (Get-Process -Id (Get-Content $PidFile) -ErrorAction SilentlyContinue)) {
        Write-Log "   Server already running"; return $true
    }
    Write-Log "   Running: $StartCommand"
    $process = Start-Process cmd.exe -ArgumentList "/c $StartCommand" -WorkingDirectory $ProjectRoot -PassThru -WindowStyle Hidden -RedirectStandardOutput "$LogFile.out" -RedirectStandardError "$LogFile.err"
    $process.Id | Out-File -FilePath $PidFile
    Write-Log "   Server PID: $($process.Id)"
    $elapsed = 0
    while ($elapsed -lt 60) {
        Start-Sleep -Seconds 2; $elapsed += 2
        if (-not (Get-Process -Id $process.Id -ErrorAction SilentlyContinue)) { Write-ErrorLog "Server died!"; return $false }
        try { $null = Invoke-WebRequest -Uri "http://localhost:$ServerPort" -TimeoutSec 2 -UseBasicParsing -ErrorAction Stop; Write-Log "   Server started ($elapsed s)" "Green"; return $true } catch { }
    }
    Write-ErrorLog "Server timeout"; return $false
}

function Test-ServerHealth {
    Write-Log "Running health check..." "Cyan"
    for ($i = 1; $i -le 5; $i++) {
        try { $response = Invoke-WebRequest -Uri $HealthEndpoint -TimeoutSec 10 -UseBasicParsing -ErrorAction Stop
            if ($response.StatusCode -in @(200, 204)) { Write-Log "   Health check passed" "Green"; return $true }
        } catch { }; Start-Sleep -Seconds 2
    }
    Write-ErrorLog "Health check failed"; return $false
}

function Main {
    Write-Log "ProjexLight Server Startup" "Cyan"
    Write-Log "Project: $ProjectType | Framework: $Framework"
    Load-Environment
    if (-not (Install-Dependencies)) { exit 1 }
    if (-not (Build-Project)) { exit 2 }
    if (-not (Start-Server)) { exit 3 }
    if (-not (Test-ServerHealth)) { exit 4 }
    Write-Log "Server running on port $ServerPort" "Green"
}

switch ($Action) {
    "start" { Main }
    "stop" { if (Test-Path $PidFile) { Stop-Process -Id (Get-Content $PidFile) -Force -ErrorAction SilentlyContinue }; Remove-Item $PidFile -Force -ErrorAction SilentlyContinue; Write-Log "Server stopped" }
    "status" { if ((Test-Path $PidFile) -and (Get-Process -Id (Get-Content $PidFile) -ErrorAction SilentlyContinue)) { Write-Log "Server running"; Test-ServerHealth } else { Write-Log "Server not running" } }
    default { Write-Host "Usage: .\start-server.ps1 [-Action start|stop|status]"; exit 1 }
}
