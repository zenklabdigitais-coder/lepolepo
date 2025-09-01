# 🚀 Instruções para Usar ngrok com SyncPay

## 📋 Pré-requisitos

1. **Servidor rodando** na porta 3000
2. **ngrok instalado** e configurado
3. **Node.js** instalado

## 🔧 Configuração Rápida

### 1. Iniciar o Servidor
```bash
# No diretório do projeto
node server.js
```

### 2. Iniciar ngrok
```bash
# Em um novo terminal
ngrok http 3000
```

### 3. Usar a URL Pública
- Copie a URL HTTPS fornecida pelo ngrok
- Exemplo: `https://8f298a9ff705.ngrok-free.app`
- Use esta URL para acessar o sistema externamente

## 🧪 Testes Automáticos

### Teste via Script
```bash
# Após iniciar o ngrok, execute:
node test-ngrok.js https://SUA_URL_NGROK.ngrok-free.app
```

### Teste Manual
1. Acesse a URL do ngrok no navegador
2. Abra o console do navegador (F12)
3. Execute o script de teste:
```javascript
// Carregar script de teste
const script = document.createElement('script');
script.src = '/test-migration.js';
document.head.appendChild(script);
```

## 📊 Monitoramento

### Interface Web do ngrok
- **URL:** `http://127.0.0.1:4040`
- **Funcionalidades:**
  - Visualizar todas as requisições
  - Inspecionar headers e body
  - Reenviar requisições
  - Ver logs em tempo real

### Logs Importantes
- **Requisições HTTP:** Todas as chamadas para a API
- **Status Codes:** 200, 401, 404, etc.
- **Headers:** CORS, Content-Type, Authorization
- **Body:** Dados enviados e recebidos

## 🔍 Troubleshooting

### Problema: ngrok não inicia
```bash
# Verificar se está instalado
ngrok version

# Verificar se a porta 3000 está livre
netstat -an | findstr :3000
```

### Problema: Erro de CORS
```javascript
// Verificar se o proxy está funcionando
fetch('/api/test-syncpay').then(r => r.json()).then(console.log);
```

### Problema: URL não acessível
1. Verificar se o ngrok está rodando
2. Verificar se a URL está correta
3. Verificar se não há firewall bloqueando

## 🎯 Casos de Uso

### 1. Teste Externo
- Compartilhar URL com outros desenvolvedores
- Testar em diferentes dispositivos
- Simular ambiente de produção

### 2. Debug de API
- Monitorar requisições em tempo real
- Inspecionar headers e payloads
- Identificar problemas de CORS

### 3. Demonstração
- Apresentar o sistema para clientes
- Testar fluxo completo de pagamento
- Validar integração com SyncPayments

## 📱 URLs de Teste

### Endpoints Principais
- **Página Principal:** `https://SUA_URL.ngrok-free.app/`
- **Health Check:** `https://SUA_URL.ngrok-free.app/api/health`
- **Teste Proxy:** `https://SUA_URL.ngrok-free.app/api/test-syncpay`
- **Autenticação:** `https://SUA_URL.ngrok-free.app/api/syncpay/auth/token`

### Exemplo de Teste
```bash
# Testar health check
curl https://SUA_URL.ngrok-free.app/api/health

# Testar proxy
curl https://SUA_URL.ngrok-free.app/api/test-syncpay

# Testar autenticação (deve retornar 401)
curl -X POST https://SUA_URL.ngrok-free.app/api/syncpay/auth/token \
  -H "Content-Type: application/json" \
  -d '{"client_id":"test","client_secret":"test"}'
```

## 🔒 Segurança

### ⚠️ Importante
- A URL do ngrok é **pública** e temporária
- **Não use** credenciais reais em testes
- **Monitore** as requisições na interface web
- **Encerre** o ngrok após os testes

### Boas Práticas
1. Use apenas para desenvolvimento/teste
2. Não compartilhe URLs com dados sensíveis
3. Monitore as requisições na interface web
4. Use credenciais de teste quando possível

## 📞 Suporte

### Comandos Úteis
```bash
# Verificar status do ngrok
ngrok status

# Ver logs detalhados
ngrok http 3000 --log=stdout

# Configurar região
ngrok http 3000 --region=sa
```

### Links Úteis
- **Documentação ngrok:** https://ngrok.com/docs
- **Interface Web:** http://127.0.0.1:4040
- **Status:** https://status.ngrok.com

---

**Última atualização:** $(date)
**Versão:** 1.0.0
