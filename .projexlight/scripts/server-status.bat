@echo off
powershell -ExecutionPolicy Bypass -File "%~dp0start-server.ps1" -Action status
