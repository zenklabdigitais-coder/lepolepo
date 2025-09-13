# 🎯 Integração UTMify - Sistema de Checkout

## 📋 Visão Geral

Este sistema foi integrado com a **UTMify** para rastreamento completo de conversões, desde o checkout até a compra finalizada. A integração captura automaticamente parâmetros UTM, FBP, FBC e envia eventos de conversão para análise.

## 🔧 Componentes da Integração

### 1. **Scripts do Pixel UTMify**
Adicionados em todas as páginas HTML:

```html
<!-- UTMify Pixel Script -->
<script>
  window.pixelId = "68c5b096c8404930979eef91";
  var a = document.createElement("script");
  a.setAttribute("async", "");
  a.setAttribute("defer", "");
  a.setAttribute("src", "https://cdn.utmify.com.br/scripts/pixel/pixel.js");
  document.head.appendChild(a);
</script>

<!-- UTMify Script -->
<script
  src="https://cdn.utmify.com.br/scripts/utms/latest.js"
  data-utmify-prevent-xcod-sck
  data-utmify-prevent-subids
  async
  defer
></script>
```

### 2. **Sistema de Tracking Frontend**
- **Arquivo:** `public/js/utmify-tracking.js`
- **Funcionalidades:**
  - Captura automática de parâmetros UTM da URL
  - Extração de FBP/FBC dos cookies
  - Preservação de parâmetros em todos os redirects
  - Envio de eventos de conversão para o backend

### 3. **Integração Backend**
- **Arquivo:** `utmifyIntegration.js`
- **Funcionalidades:**
  - Envio de eventos para API UTMify
  - Processamento de webhooks de pagamento
  - Conversão de dados para formato UTMify

### 4. **Rotas da API**
- `POST /api/utmify/initiate-checkout` - Recebe eventos de checkout iniciado
- `POST /api/utmify/purchase` - Recebe eventos de compra finalizada
- `POST /api/utmify/test` - Testa a integração

## 🎯 Fluxo de Conversão

### 1. **Initiate Checkout (PIX Gerado)**
Quando um PIX é gerado:
```javascript
// Frontend envia automaticamente
window.trackInitiateCheckout({
  orderId: transaction.id,
  amount: plan.price,
  productId: 'assinatura-premium',
  productName: plan.description,
  customer: clientData
});
```

### 2. **Purchase (PIX Pago)**
Quando um PIX é pago (via webhook):
```javascript
// Backend processa automaticamente
await utmifyIntegration.handlePixPaid(webhookData, utmParams);
```

## 📊 Dados Capturados

### **Parâmetros UTM**
- `utm_source` - Origem do tráfego
- `utm_campaign` - Campanha específica
- `utm_medium` - Meio de marketing
- `utm_content` - Conteúdo específico
- `utm_term` - Termo/palavra-chave
- `src` - Origem customizada
- `sck` - Chave de rastreamento

### **Parâmetros Facebook**
- `fbp` - Facebook Browser ID
- `fbc` - Facebook Click ID
- `fbclid` - Facebook Click ID da URL

### **Dados do Cliente**
- Nome, email, telefone, documento
- IP do cliente
- Localização (país)

### **Dados da Transação**
- ID do pedido
- Valor total e comissões
- Método de pagamento (PIX)
- Status da transação
- Timestamps (criação, pagamento, reembolso)

## 🔄 Preservação de Parâmetros

O sistema preserva automaticamente todos os parâmetros UTM e Facebook em:

1. **Redirects via JavaScript**
2. **Links clicados na página**
3. **Mudanças de URL programáticas**
4. **Session Storage** para persistência

## 🚀 Como Usar

### **Desenvolvimento**
```bash
# Instalar dependências
npm install

# Iniciar servidor
npm start

# Testar integração UTMify
curl -X POST http://localhost:3000/api/utmify/test
```

### **URLs de Teste**
- Checkout: `http://localhost:3000/`
- Links: `http://localhost:3000/links`
- Anúncio: `http://localhost:3000/anuncio`

### **URL com Parâmetros de Teste**
```
http://localhost:3000/links?utm_source=facebook&utm_campaign=teste_2024&utm_medium=social&utm_content=video_promo&utm_term=assinatura&fbp=fb.1.123456789.987654321&fbc=fb.1.123456789.abcdef
```

## 📈 Monitoramento

### **Logs do Sistema**
- `🛒 Enviando evento initiate_checkout...`
- `💰 Enviando evento purchase...`
- `📊 Evento enviado para UTMify com sucesso`

### **Debug Frontend**
```javascript
// Ver dados capturados
window.utmifyTracker.debug();

// Ver parâmetros atuais
console.log(window.getTrackingParams());
```

## 🔧 Configuração

### **Credenciais**
- **API Token:** `jUEJdzWereOOr25YBXhEfH0d2RZ4MG4CyAyF`
- **Pixel ID:** `68c5b096c8404930979eef91`
- **Endpoint:** `https://api.utmify.com.br/api-credentials/orders`

### **Personalização**
Para alterar produtos ou valores, edite o arquivo `utmifyIntegration.js`:

```javascript
// Configurar produtos
products: [{
  id: 'assinatura-premium',
  name: 'Assinatura Premium',
  // ... outros campos
}]
```

## 🛠️ Resolução de Problemas

### **PIX não está enviando eventos**
1. Verificar se o webhook está configurado
2. Confirmar credenciais da API
3. Verificar logs do servidor

### **Parâmetros UTM não estão sendo capturados**
1. Verificar se o script `utmify-tracking.js` está carregando
2. Testar com URL que contenha parâmetros UTM
3. Verificar localStorage do navegador

### **Eventos não chegam na UTMify**
1. Verificar conexão de internet
2. Confirmar formato dos dados enviados
3. Testar com `/api/utmify/test`

## 📞 Suporte

Para dúvidas sobre a integração UTMify:
- **Documentação:** Arquivo `878608978-Documentac-a-o-API-UTMify.txt`
- **API UTMify:** https://api.utmify.com.br
- **Dashboard UTMify:** https://utmify.com.br

---

✅ **Integração completa e funcional!** 

O sistema agora rastreia toda a jornada do cliente, desde o primeiro clique até a conversão final, com dados precisos para otimização de campanhas.
