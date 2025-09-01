# Migração para API de Produção SyncPayments

## Resumo das Alterações

Este documento registra as alterações realizadas para migrar a integração de pagamento PIX da API de mock/teste para a API de produção da SyncPayments.

## Arquivos Modificados

### 1. server.js
**Alterações no Proxy:**
- **Target URL:** `https://syncpay.apidog.io` → `https://api.syncpayments.com.br`
- **Path Rewrite:** `/api/partner/v1` → `/api/v1`

### 2. js/syncpay-integration.js
**Endpoints Atualizados:**

#### Autenticação
- **Antes:** `/api/partner/v1/auth-token`
- **Depois:** `/auth/token`

#### Criação de Cobrança PIX
- **Antes:** `/api/partner/v1/pix/cashin`
- **Depois:** `/pix/cobranca`

#### Consulta de Status
- **Antes:** `/api/partner/v1/transactions/{id}`
- **Depois:** `/pix/cobranca/{id}`

**Estrutura de Dados Atualizada:**

#### Request Body (Criação de Cobrança)
```javascript
// Antes
{
    amount: amount * 100,
    description: description,
    expires_in: 3600
}

// Depois
{
    valor: amount * 100,
    descricao: description,
    expiracao: 3600
}
```

#### Response Fields
```javascript
// Antes
{
    id: transaction.id,
    pix_code: transaction.pix_code,
    status: transaction.status,
    amount: transaction.amount
}

// Depois
{
    id: transaction.id,
    pix_code: transaction.qr_code, // Campo renomeado
    status: transaction.status,
    amount: transaction.valor // Campo renomeado
}
```

#### Status de Pagamento
```javascript
// Antes
if (transaction.status === 'completed') // Pagamento confirmado
if (transaction.status === 'expired')   // PIX expirado

// Depois
if (transaction.status === 'pago')      // Pagamento confirmado
if (transaction.status === 'expirado')  // PIX expirado
```

### 3. js/config.js
- Atualizado comentário para indicar uso da API de produção

## Compatibilidade

A migração mantém a mesma interface pública da classe `SyncPayIntegration`, garantindo que nenhuma alteração seja necessária no código que utiliza esta integração.

## Testes Recomendados

1. **Teste de Autenticação:** Verificar se o token está sendo obtido corretamente
2. **Teste de Criação de PIX:** Confirmar se a cobrança está sendo criada
3. **Teste de Status:** Verificar se a consulta de status está funcionando
4. **Teste de Pagamento:** Simular um pagamento real para validar o fluxo completo

## Rollback

Em caso de problemas, é possível reverter as alterações:
1. Restaurar o target URL no `server.js` para `https://syncpay.apidog.io`
2. Restaurar os endpoints no `syncpay-integration.js` para os originais
3. Restaurar a estrutura de dados para o formato anterior

## Documentação da API

Para referência completa da API de produção, consulte:
https://app.syncpayments.com.br/seller/developer-api
