@echo off
REM ProjexLight Server Startup Script (Windows Batch Wrapper)
SET SCRIPT_DIR=%~dp0
SET ACTION=%1
IF "%ACTION%"=="" SET ACTION=start
powershell -ExecutionPolicy Bypass -File "%SCRIPT_DIR%start-server.ps1" -Action %ACTION%
exit /b %ERRORLEVEL%
