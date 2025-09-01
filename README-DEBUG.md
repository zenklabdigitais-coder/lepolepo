# 🔧 Debug - Problema SyncPay API

## ❌ Problema Identificado

O erro principal é um **problema de CORS (Cross-Origin Resource Sharing)** que está impedindo a comunicação com a API SyncPay.

### Erros no Console:
```
TypeError: Failed to fetch
Response to preflight request doesn't pass access control check: No 'Access-Control-Allow-Origin' header is present on the requested resource.
```

## 🔍 Análise do Problema

### 1. **Erro CORS**
- O navegador está bloqueando requisições para `https://syncpay.apidog.io`
- A API não está configurada para aceitar requisições do seu domínio

### 2. **Credenciais Inválidas**
- As credenciais no `config.js` são exemplos/placeholders
- Precisam ser substituídas pelas credenciais reais da sua conta SyncPay

## ✅ Soluções Implementadas

### 1. **Proxy Local (Solução Imediata)**
- Criado servidor Express com proxy para contornar CORS
- Todas as requisições para SyncPay passam pelo servidor local

### 2. **Configuração Atualizada**
- URL base alterada para usar proxy local
- Credenciais atualizadas (ainda precisam ser substituídas pelas reais)

## 🚀 Como Resolver

### Passo 1: Instalar Dependências
```bash
npm install
```

### Passo 2: Obter Credenciais Reais
1. Acesse o painel administrativo da SyncPay
2. Obtenha seu `client_id` e `client_secret` reais
3. Substitua no arquivo `js/config.js`:

```javascript
client_id: 'SEU_CLIENT_ID_REAL',
client_secret: 'SEU_CLIENT_SECRET_REAL'
```

### Passo 3: Testar Localmente
```bash
npm start
```
- Acesse: `http://localhost:3000`
- Teste os botões de pagamento PIX
- Verifique o console do navegador para logs de debug

### Passo 4: Deploy na Vercel
1. Faça push do código para o GitHub
2. Conecte o repositório na Vercel
3. Configure as variáveis de ambiente se necessário
4. Deploy automático será feito

## 🔧 Configuração do Servidor

O servidor agora inclui:
- **Express.js** para servir arquivos estáticos
- **CORS** configurado para permitir requisições
- **Proxy** para API SyncPay
- **Logs detalhados** para debug

## 📋 Endpoints Disponíveis

- `GET /` - Página principal
- `GET /api/health` - Status do servidor
- `POST /api/syncpay/auth-token` - Proxy para autenticação SyncPay
- `POST /api/syncpay/pix/cashin` - Proxy para criação de PIX

## 🐛 Debug

### Logs do Servidor
O servidor mostra logs detalhados:
```
[PROXY] POST /auth-token -> /partner/v1/auth-token
[PROXY] Resposta: 200
```

### Logs do Cliente
O JavaScript mostra logs no console:
```
🔧 [DEBUG] SyncPay Integration inicializada
🔐 [DEBUG] Iniciando autenticação com SyncPay...
```

## ⚠️ Próximos Passos

1. **Substituir credenciais** pelas reais da SyncPay
2. **Testar integração** com valores reais
3. **Configurar webhooks** se necessário
4. **Implementar tratamento de erros** mais robusto

## 🚀 Deploy na Vercel

### Configuração Automática
O projeto está configurado para deploy automático na Vercel:

1. **Estrutura Pronta**: O `server.js` e `package.json` estão configurados
2. **Proxy Funcional**: O proxy para API SyncPay funciona em produção
3. **Arquivos Estáticos**: Todos os arquivos CSS/JS estão organizados

### Passos para Deploy
1. **GitHub**: Faça push do código para um repositório
2. **Vercel**: Conecte o repositório na Vercel
3. **Configuração**: A Vercel detectará automaticamente que é um projeto Node.js
4. **Deploy**: O deploy será feito automaticamente

### Variáveis de Ambiente (Opcional)
Se necessário, configure na Vercel:
- `PORT`: Porta do servidor (padrão: 3000)
- `NODE_ENV`: Ambiente (production/development)

## 📞 Suporte

Se o problema persistir:
1. Verifique se as credenciais estão corretas
2. Confirme se a API SyncPay está funcionando
3. Verifique os logs do servidor e do navegador
4. Entre em contato com o suporte da SyncPay
