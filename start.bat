@echo off
echo ========================================
echo    Starting Aspiro Application
echo ========================================
echo.
echo Installing dependencies...
call npm run install-all
echo.
echo Training ML models...
cd ml-service
call python train_models.py
cd ..
echo.
echo Starting all services...
echo - Backend API: http://localhost:5000
echo - Frontend: http://localhost:5173
echo - ML Service: http://localhost:5001
echo.
call npm run dev