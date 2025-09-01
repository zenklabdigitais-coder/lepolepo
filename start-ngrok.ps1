# Script para iniciar ngrok e expor o servidor local
Write-Host "🚀 Iniciando ngrok para expor o servidor..." -ForegroundColor Green

# Verificar se o servidor está rodando
$serverRunning = Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue
if (-not $serverRunning) {
    Write-Host "❌ Servidor não está rodando na porta 3000!" -ForegroundColor Red
    Write-Host "💡 Execute 'node server.js' primeiro" -ForegroundColor Yellow
    exit 1
}

Write-Host "✅ Servidor detectado na porta 3000" -ForegroundColor Green

# Iniciar ngrok
Write-Host "🌐 Iniciando ngrok..." -ForegroundColor Cyan
Write-Host "📋 URL pública será exibida abaixo:" -ForegroundColor Yellow
Write-Host "🔗 Interface web: http://127.0.0.1:4040" -ForegroundColor Cyan
Write-Host ""

# Comando ngrok para expor a porta 3000
ngrok http 3000

Write-Host ""
Write-Host "✅ ngrok iniciado com sucesso!" -ForegroundColor Green
Write-Host "🌍 Use a URL pública para testar a integração externamente" -ForegroundColor Yellow
