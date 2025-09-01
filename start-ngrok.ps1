Write-Host "========================================" -ForegroundColor Cyan
Write-Host "    Sistema SyncPay - Iniciando ngrok" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Servidor local: http://localhost:3000" -ForegroundColor Green
Write-Host ""
Write-Host "Iniciando ngrok..." -ForegroundColor Yellow
Write-Host ""

# Verificar se o ngrok está instalado
try {
    $ngrokVersion = ngrok version 2>$null
    Write-Host "✅ ngrok encontrado: $ngrokVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ ngrok não encontrado!" -ForegroundColor Red
    Write-Host "Instale o ngrok em: https://ngrok.com/download" -ForegroundColor Yellow
    Write-Host "Ou execute: npm install -g ngrok" -ForegroundColor Yellow
    Read-Host "Pressione Enter para sair"
    exit 1
}

# Iniciar ngrok
Write-Host "🚀 Iniciando túnel ngrok..." -ForegroundColor Green
ngrok http 3000

Write-Host ""
Write-Host "ngrok encerrado." -ForegroundColor Yellow
Read-Host "Pressione Enter para sair"
