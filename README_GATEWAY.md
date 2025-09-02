# Sistema de Gateway de Pagamento - Privacy

Este projeto agora suporta dois gateways de pagamento: **PushinPay** e **SyncPay**, permitindo que você escolha qual usar dinamicamente.

## 🚀 Funcionalidades

- ✅ **Seleção dinâmica de gateway** entre PushinPay e SyncPay
- ✅ **Interface visual** para escolher o gateway
- ✅ **Teste de gateway** integrado
- ✅ **APIs unificadas** para ambos os gateways
- ✅ **Validação de dados** automática
- ✅ **Logs detalhados** para debugging

## 🎯 Como Usar

### 1. Acessar o Seletor de Gateway

- Clique no botão **"🎯 Gateway"** no canto inferior direito da tela
- O painel de seleção aparecerá no canto superior direito

### 2. Escolher o Gateway

- Use o dropdown para selecionar entre:
  - **SyncPay** (padrão)
  - **PushinPay**

### 3. Testar o Gateway

- Clique no botão **"🧪 Testar Gateway"** para fazer um teste de pagamento
- O sistema criará um pagamento de teste de R$ 10,00

## 🔧 Configuração

### PushinPay
- **Token**: `36250|MPvURHE0gE6lqsPN0PtwDOUVISoLjSyvqYUvuDPi47f09b29`
- **API Base**: `https://api.pushinpay.com.br`

### SyncPay
- **Client ID**: `708ddc0b-357d-4548-b158-615684caa616`
- **Client Secret**: `c08d40e5-3049-48c9-85c0-fd3cc6ca502c`
- **API Base**: `https://api.syncpayments.com.br/api/partner/v1`

## 📡 APIs Disponíveis

### Endpoints Unificados

#### 1. Criar Pagamento PIX
```http
POST /api/payments/pix/create
Content-Type: application/json

{
  "amount": 19.90,
  "description": "Assinatura Mensal",
  "customer_name": "João Silva",
  "customer_email": "joao@exemplo.com",
  "customer_document": "12345678901"
}
```

#### 2. Consultar Status do Pagamento
```http
GET /api/payments/{paymentId}/status
```

#### 3. Listar Pagamentos
```http
GET /api/payments?status=paid&limit=10
```

### Endpoints de Gateway

#### 1. Listar Gateways Disponíveis
```http
GET /api/gateways
```

#### 2. Alterar Gateway
```http
POST /api/gateways/switch
Content-Type: application/json

{
  "gateway": "pushinpay"
}
```

#### 3. Obter Gateway Atual
```http
GET /api/gateways/current
```

## 🛠️ Arquivos Principais

### Backend
- `pushinpayApi.js` - API da PushinPay
- `syncpayApi.js` - API da SyncPay (existente)
- `paymentGateway.js` - Sistema unificado de gateway
- `server.js` - Servidor principal (atualizado)

### Frontend
- `public/js/gatewaySelector.js` - Controle do seletor
- `public/css/gateway-selector.css` - Estilos do seletor
- `public/index.html` - Interface principal (atualizada)

## 🔍 Debugging

### Logs do Servidor
O servidor mostra logs detalhados:
```
🚀 Criando pagamento via PushinPay...
✅ Pagamento criado com sucesso: { ... }
🔍 Consultando status via SyncPay...
```

### Verificação de Dependências
No console do navegador:
```javascript
window.pixDebug.checkDependencies();
```

## 🧪 Testes

### Teste Automático
- Use o botão **"🧪 Testar Gateway"** no painel
- Sistema criará um pagamento de teste automaticamente

### Teste Manual via API
```bash
curl -X POST http://localhost:3000/api/payments/pix/create \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 10.00,
    "description": "Teste Manual",
    "customer_name": "Teste",
    "customer_email": "teste@exemplo.com",
    "customer_document": "12345678901"
  }'
```

## 🚨 Tratamento de Erros

O sistema inclui tratamento robusto de erros:
- Validação de dados obrigatórios
- Timeout de 30 segundos para requisições
- Logs detalhados de erros
- Fallback para gateway alternativo (em desenvolvimento)

## 🔐 Segurança

- Tokens armazenados de forma segura
- Validação de entrada em todas as APIs
- CORS configurado adequadamente
- Headers de segurança implementados

## 📱 Interface

### Seletor de Gateway
- **Posição**: Canto superior direito (quando ativo)
- **Botão de toggle**: Canto inferior direito
- **Design**: Gradiente moderno com animações
- **Responsivo**: Funciona em mobile e desktop

### Indicadores Visuais
- **SyncPay**: Azul/roxo
- **PushinPay**: Vermelho/laranja
- **Status**: Verde para ativo, vermelho para erro

## 🔄 Próximas Atualizações

- [ ] Fallback automático entre gateways
- [ ] Dashboard de analytics
- [ ] Webhooks para ambos os gateways
- [ ] Suporte a mais métodos de pagamento
- [ ] Interface de administração completa

## 📞 Suporte

Para dúvidas ou problemas:
1. Verifique os logs do servidor
2. Use `window.pixDebug.checkDependencies()`
3. Teste ambos os gateways
4. Verifique a conectividade com as APIs

---

**Desenvolvido para o projeto Privacy** 🚀