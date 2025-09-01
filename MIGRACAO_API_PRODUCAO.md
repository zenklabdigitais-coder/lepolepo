# Migração para API de Produção SyncPayments

## Resumo das Alterações

Este documento registra as alterações realizadas para migrar a integração de pagamento PIX da API de mock/teste para a API de produção da SyncPayments e remover dependências do ngrok para deploy na Vercel.

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

### 4. Arquivos Removidos (ngrok)
- `ngrok.exe` - Executável do ngrok
- `ngrok.zip` - Arquivo compactado do ngrok
- `ngrok-config.yml` - Configuração do ngrok
- `ngrok-info.txt` - Informações do ngrok
- `start-ngrok.bat` - Script para iniciar ngrok (Windows)
- `start-ngrok.ps1` - Script para iniciar ngrok (PowerShell)
- `test-ngrok.js` - Script de teste do ngrok
- `test-ngrok-simple.js` - Script de teste simples do ngrok
- `diagnostico-ngrok.js` - Script de diagnóstico do ngrok
- `INSTRUCOES-NGROK.md` - Instruções de uso do ngrok

### 5. Arquivos Atualizados
- `test-status.html` - Removidas referências ao ngrok, adicionadas informações sobre Vercel
- `README-DEBUG.md` - Adicionadas instruções para deploy na Vercel
- `README-MIGRACAO.md` - Atualizado para refletir remoção do ngrok
- `CONFIGURACAO_SYNCPAY.md` - Adicionadas instruções para deploy na Vercel

## Compatibilidade

A migração mantém a mesma interface pública da classe `SyncPayIntegration`, garantindo que nenhuma alteração seja necessária no código que utiliza esta integração.

## Testes Recomendados

1. **Teste de Autenticação:** Verificar se o token está sendo obtido corretamente
2. **Teste de Criação de PIX:** Confirmar se a cobrança está sendo criada
3. **Teste de Status:** Verificar se a consulta de status está funcionando
4. **Teste de Pagamento:** Simular um pagamento real para validar o fluxo completo
5. **Teste Local:** Executar `npm start` e testar em `http://localhost:3000`
6. **Teste Vercel:** Fazer deploy e testar na URL fornecida pela Vercel

## Rollback

Em caso de problemas, é possível reverter as alterações:
1. Restaurar o target URL no `server.js` para `https://syncpay.apidog.io`
2. Restaurar os endpoints no `syncpay-integration.js` para os originais
3. Restaurar a estrutura de dados para o formato anterior

## Documentação da API

Para referência completa da API de produção, consulte:
https://app.syncpayments.com.br/seller/developer-api
