# 🎉 Sistema SyncPay - Pronto para Teste!

## ✅ Status: CREDENCIAIS CONFIGURADAS

Suas credenciais reais da SyncPay foram configuradas com sucesso:
- **Client ID**: `708ddc0b-357d-4548-b158-615684caa616`
- **Client Secret**: `c08d40e5-3049-48c9-85c0-fd3cc6ca502c`

## 🚀 Como Testar o Sistema

### Passo 1: Instalar Dependências
Execute um dos scripts de instalação:

**Windows (PowerShell):**
```powershell
.\install-dependencies.ps1
```

**Windows (CMD):**
```cmd
install-dependencies.bat
```

**Manual:**
```bash
npm install
```

### Passo 2: Iniciar o Servidor
```bash
npm start
```

### Passo 3: Acessar o Sistema
- **URL**: http://localhost:3000
- **Proxy SyncPay**: http://localhost:3000/api/syncpay

## 🧪 Testes Disponíveis

### 1. Teste de Autenticação
- O sistema tentará obter um token de acesso automaticamente
- Verifique o console do navegador (F12) para logs de debug

### 2. Teste de Geração de PIX
- Clique em qualquer botão de pagamento (1 mês, 3 meses, 6 meses)
- O sistema deve gerar um PIX e mostrar o modal com QR Code

### 3. Teste de Status
- Após gerar o PIX, o sistema verificará o status automaticamente
- Logs serão exibidos no console do navegador

## 🔍 Logs de Debug

### No Console do Navegador (F12):
```
🚀 [DEBUG] DOM carregado, inicializando SyncPay...
✅ [DEBUG] Configuração encontrada
✅ [DEBUG] SyncPay inicializado e disponível globalmente
🔐 [DEBUG] Iniciando autenticação com SyncPay...
✅ [DEBUG] Token obtido com sucesso
💰 [DEBUG] Iniciando criação de transação PIX...
✅ [DEBUG] Transação PIX criada com sucesso
```

### No Terminal do Servidor:
```
🚀 Servidor rodando na porta 3000
📱 Acesse: http://localhost:3000
🔧 Proxy SyncPay: http://localhost:3000/api/syncpay
[PROXY] POST /auth-token -> /api/partner/v1/auth-token
[PROXY] Resposta: 200
```

## 📱 Teste Mobile

Para testar em dispositivos móveis:

1. **Usar ngrok** (se necessário):
   ```bash
   ngrok http 3000
   ```

2. **Acessar via URL do ngrok** no dispositivo móvel

3. **Testar QR Code** com apps de pagamento reais

## 🔧 Variáveis Globais para Debug

No console do navegador, você pode acessar:

```javascript
// Configuração da API
window.SYNCPAY_CONFIG

// Instância do SyncPay
window.syncPay

// Verificar token atual
window.syncPay.authToken

// Verificar validade do token
window.syncPay.isTokenValid()

// Forçar renovação do token
window.syncPay.getAuthToken()

// Teste manual de criação de PIX
window.syncPay.createPixTransaction(19.90, 'Teste Manual')
```

## 🐛 Solução de Problemas

### Se o servidor não iniciar:
1. Verifique se o Node.js está instalado
2. Execute `npm install` novamente
3. Verifique se a porta 3000 está livre

### Se a autenticação falhar:
1. Verifique se as credenciais estão corretas
2. Confirme se a API SyncPay está online
3. Verifique os logs do servidor

### Se o PIX não gerar:
1. Verifique se o token foi obtido com sucesso
2. Confirme se os valores dos planos estão corretos
3. Verifique os logs de erro no console

## 📞 Suporte

Se encontrar problemas:
1. Verifique os logs no console do navegador
2. Verifique os logs do servidor
3. Confirme se todas as dependências estão instaladas
4. Entre em contato com o suporte da SyncPay se necessário

---

**Status**: ✅ Sistema configurado e pronto para teste
**Credenciais**: ✅ Configuradas com sucesso
**Última atualização**: Janeiro 2024
