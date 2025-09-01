@echo off
echo ========================================
echo    Sistema SyncPay - Iniciando ngrok
echo ========================================
echo.
echo Servidor local: http://localhost:3000
echo.
echo Iniciando ngrok...
echo.

ngrok http 3000

echo.
echo ngrok encerrado.
pause
