@echo off
echo ========================================
echo    Instalando Dependencias SyncPay
echo ========================================
echo.

echo [1/3] Verificando Node.js...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js nao encontrado!
    echo Por favor, instale o Node.js de: https://nodejs.org/
    pause
    exit /b 1
)
echo ✅ Node.js encontrado

echo.
echo [2/3] Instalando dependencias...
npm install
if %errorlevel% neq 0 (
    echo ❌ Erro ao instalar dependencias!
    pause
    exit /b 1
)
echo ✅ Dependencias instaladas com sucesso!

echo.
echo [3/3] Verificando arquivos de configuracao...
if not exist "js\config.js" (
    echo ❌ Arquivo config.js nao encontrado!
    pause
    exit /b 1
)
echo ✅ Arquivo config.js encontrado

echo.
echo ========================================
echo    Instalacao Concluida!
echo ========================================
echo.
echo Para iniciar o servidor, execute:
echo   npm start
echo.
echo Para acessar: http://localhost:3000
echo.
pause
