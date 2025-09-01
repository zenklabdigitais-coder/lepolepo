Write-Host "========================================" -ForegroundColor Cyan
Write-Host "    Instalando Dependencias SyncPay" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "[1/3] Verificando Node.js..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js encontrado: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js não encontrado!" -ForegroundColor Red
    Write-Host "Por favor, instale o Node.js de: https://nodejs.org/" -ForegroundColor Red
    Read-Host "Pressione Enter para sair"
    exit 1
}

Write-Host ""
Write-Host "[2/3] Instalando dependências..." -ForegroundColor Yellow
try {
    npm install
    Write-Host "✅ Dependências instaladas com sucesso!" -ForegroundColor Green
} catch {
    Write-Host "❌ Erro ao instalar dependências!" -ForegroundColor Red
    Read-Host "Pressione Enter para sair"
    exit 1
}

Write-Host ""
Write-Host "[3/3] Verificando arquivos de configuração..." -ForegroundColor Yellow
if (Test-Path "js\config.js") {
    Write-Host "✅ Arquivo config.js encontrado" -ForegroundColor Green
} else {
    Write-Host "❌ Arquivo config.js não encontrado!" -ForegroundColor Red
    Read-Host "Pressione Enter para sair"
    exit 1
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "    Instalação Concluída!" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Para iniciar o servidor, execute:" -ForegroundColor White
Write-Host "  npm start" -ForegroundColor Yellow
Write-Host ""
Write-Host "Para acessar: http://localhost:3000" -ForegroundColor White
Write-Host ""
Read-Host "Pressione Enter para sair"
