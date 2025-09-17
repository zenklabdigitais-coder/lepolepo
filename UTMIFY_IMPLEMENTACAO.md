# 🎯 Implementação da UTMify - Guia Completo

## 📋 Informações da UTMify

**API Key:** `w4YfjBN1hnS52snJs97wZ0Ii46ef4Um3wsK1`
**Pixel ID:** `68cb37d4f2caf0058e7fc02a`

## 🤔 Sobre Webhooks vs Envio Ativo

**Resposta:** Sim, você tem razão! Não precisa de webhook passivo. Podemos enviar os dados ativamente para a UTMify quando uma venda for aprovada.

### ✅ **Vantagens do Envio Ativo:**
- **Controle total** sobre quando e como enviar os dados
- **Mais confiável** - não depende de webhooks externos
- **Integração mais simples** - usa a API da UTMify diretamente
- **Melhor tratamento de erros** - podemos retry se falhar

### ❌ **Desvantagens do Webhook Passivo:**
- Depende da UTMify enviar para nós
- Pode falhar se nossa URL estiver indisponível
- Menos controle sobre o timing

## 🚀 Plano de Implementação (Envio Ativo)

### 1. **Configuração da API UTMify**
```javascript
const UTMIFY_CONFIG = {
    API_KEY: 'w4YfjBN1hnS52snJs97wZ0Ii46ef4Um3wsK1',
    BASE_URL: 'https://api.utmify.com.br',
    ENDPOINTS: {
        orders: '/api-credentials/orders',
        conversions: '/api-credentials/conversions'
    }
};
```

### 2. **Integração nos Webhooks Existentes**
Modificar os webhooks do SyncPay/PushinPay para enviar dados para UTMify:

```javascript
// No webhookHandler.js - quando pagamento for aprovado
async function sendToUtmify(orderData) {
    try {
        const utmifyData = {
            order_id: orderData.orderId,
            customer_email: orderData.customer.email,
            customer_name: orderData.customer.name,
            product_name: orderData.products[0].name,
            product_price: orderData.products[0].priceInCents / 100,
            platform: orderData.platform,
            utm_source: orderData.trackingParameters.utm_source,
            utm_medium: orderData.trackingParameters.utm_medium,
            utm_campaign: orderData.trackingParameters.utm_campaign,
            utm_content: orderData.trackingParameters.utm_content,
            utm_term: orderData.trackingParameters.utm_term,
            approved_at: orderData.approvedDate
        };

        const response = await fetch(`${UTMIFY_CONFIG.BASE_URL}${UTMIFY_CONFIG.ENDPOINTS.orders}`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${UTMIFY_CONFIG.API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(utmifyData)
        });

        if (response.ok) {
            console.log('✅ Dados enviados para UTMify com sucesso');
        } else {
            console.error('❌ Erro ao enviar para UTMify:', response.status);
        }
    } catch (error) {
        console.error('❌ Erro ao enviar para UTMify:', error.message);
    }
}
```

### 3. **Scripts UTMify nas Páginas**
Adicionar scripts de captura UTM nas páginas do funil:

```html
<!-- Script UTMify para capturar parâmetros UTM -->
<script
  src="https://cdn.utmify.com.br/scripts/utms/latest.js"
  data-utmify-prevent-xcod-sck
  data-utmify-prevent-subids
  async defer>
</script>

<!-- Pixel UTMify -->
<script>
window.pixelId = "68cb37d4f2caf0058e7fc02a";
var a = document.createElement("script");
a.setAttribute("async", "");
a.setAttribute("defer", "");
a.setAttribute("src", "https://cdn.utmify.com.br/scripts/pixel/pixel.js");
document.head.appendChild(a);
</script>
```

## 📁 Arquivos que Precisam ser Modificados

### 1. **`webhookHandler.js`**
- Adicionar função `sendToUtmify()`
- Chamar função quando pagamento for aprovado
- Adicionar tratamento de erros

### 2. **`compra-aprovada/index.html`**
- Adicionar scripts UTMify
- Configurar pixel de tracking

### 3. **`links/index.html`**
- Adicionar scripts UTMify
- Capturar parâmetros UTM

### 4. **`funil_completo/assinatura-premiada.html`**
- Adicionar scripts UTMify

### 5. **`funil_completo/obrigado.html`**
- Adicionar scripts UTMify

## 🔧 Implementação Passo a Passo

### **Passo 1: Configurar API UTMify**
```javascript
// Adicionar no webhookHandler.js
const UTMIFY_CONFIG = {
    API_KEY: 'w4YfjBN1hnS52snJs97wZ0Ii46ef4Um3wsK1',
    BASE_URL: 'https://api.utmify.com.br',
    ENDPOINTS: {
        orders: '/api-credentials/orders'
    }
};
```

### **Passo 2: Modificar Webhook Handler**
```javascript
// No método handleCashInUpdate quando status for 'approved'
if (data.status === 'approved') {
    // ... código existente ...
    
    // Enviar para UTMify
    await this.sendToUtmify(data);
}
```

### **Passo 3: Adicionar Scripts nas Páginas**
```html
<!-- Adicionar no <head> das páginas -->
<script
  src="https://cdn.utmify.com.br/scripts/utms/latest.js"
  data-utmify-prevent-xcod-sck
  data-utmify-prevent-subids
  async defer>
</script>
```

## 🎯 Benefícios da Implementação

1. **Rastreamento Completo** - Todas as vendas serão enviadas para UTMify
2. **Attribution Preciso** - Parâmetros UTM capturados automaticamente
3. **Analytics Avançado** - Dashboard da UTMify com métricas detalhadas
4. **Otimização de Campanhas** - Dados para otimizar anúncios
5. **ROI Tracking** - Acompanhar retorno sobre investimento

## ⚠️ Próximos Passos

1. **Confirmar Pixel ID** - Precisa do ID do pixel da UTMify
2. **Testar API** - Validar se a API key funciona
3. **Implementar Código** - Adicionar scripts e webhook
4. **Testar Integração** - Fazer teste de venda completa
5. **Configurar Anúncios** - Adicionar UTMs nos anúncios

## ✅ Informações Confirmadas

- **Pixel ID da UTMify:** `68c82ef8a21cee3362d76eee` ✅
- **API Key:** `6EPVqN7rtImQQOHcH1AAm0Txy6bq1stHWKlB` ✅
- **Scripts UTMify:** Configurados ✅

## ✅ **IMPLEMENTAÇÃO CONCLUÍDA!**

### 🎯 **O que foi implementado:**

1. **✅ Scripts UTMify adicionados em todas as páginas:**
   - `compra-aprovada/index.html`
   - `links/index.html` (com preservação de parâmetros UTM nos links)
   - `funil_completo/assinatura-premiada.html`
   - `funil_completo/obrigado.html`

2. **✅ Pixel de tracking configurado:**
   - Pixel ID: `68c82ef8a21cee3362d76eee`
   - Carregamento assíncrono e defer

3. **✅ Webhook handlers atualizados:**
   - `webhookHandler.js` (SyncPay) - Envia dados quando status = 'completed'
   - `pushinpayWebhook.js` (PushinPay) - Envia dados quando status = 'paid'

4. **✅ Integração com API UTMify:**
   - API Key configurada: `6EPVqN7rtImQQOHcH1AAm0Txy6bq1stHWKlB`
   - Endpoint: `https://api.utmify.com.br/api-credentials/orders`
   - Envio automático de dados de conversão

### 🚀 **Como funciona agora:**

1. **Usuário acessa `/links` com UTMs** → Scripts UTMify capturam parâmetros UTM
2. **Usuário clica em "Privacy"** → Link é automaticamente atualizado com parâmetros UTM
3. **Usuário acessa `/privacy`** → Parâmetros UTM são preservados
4. **Usuário faz pagamento** → Webhook recebe confirmação
5. **Pagamento aprovado** → Sistema envia dados automaticamente para UTMify
6. **UTMify processa** → Dados aparecem no dashboard da UTMify

### 📊 **Dados enviados para UTMify:**
- ID do pedido
- Email e nome do cliente
- Nome e preço do produto
- Plataforma (SyncPay/PushinPay)
- Parâmetros UTM (source, medium, campaign, content, term)
- Data de aprovação
- Status da transação

---

**🎉 INTEGRAÇÃO COMPLETA!** A UTMify está totalmente integrada ao seu sistema!
