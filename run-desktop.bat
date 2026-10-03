@echo off
echo ========================================================
echo CareerPilot AI -- Windows Desktop Launcher
echo ========================================================
echo Checking backend at http://127.0.0.1:8000/api/v1/health...
curl -s http://127.0.0.1:8000/api/v1/health > nul
if %errorlevel% neq 0 (
    echo [WARNING] FastAPI backend does not appear to be running!
    echo Please start the backend in another terminal:
    echo   python -m uvicorn backend.app.main:app --host 127.0.0.1 --port 8000
    echo.
) else (
    echo [OK] Backend is healthy and responding.
)

echo Starting CareerPilot AI Desktop Application...
cd desktop
if not exist node_modules (
    echo Installing desktop dependencies...
    call npm install
)
call npm start
cd ..
