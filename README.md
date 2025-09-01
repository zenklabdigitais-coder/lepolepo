# 🚀 Sistema de Checkout SyncPay

Sistema de pagamento PIX integrado com a API SyncPay, pronto para deploy na Vercel.

## ✨ Funcionalidades

- ✅ **Pagamento PIX** via API SyncPay
- ✅ **QR Code dinâmico** para escaneamento
- ✅ **Código PIX copiável** com um clique
- ✅ **Monitoramento em tempo real** do status do pagamento
- ✅ **Interface responsiva** para mobile e desktop
- ✅ **Notificações visuais** de sucesso/erro
- ✅ **Renovação automática** de token de autenticação
- ✅ **Proxy configurado** para contornar CORS
- ✅ **Pronto para Vercel** - deploy automático

## 🚀 Deploy Rápido na Vercel

### 1. Preparar o Repositório
```bash
# Clone o repositório
git clone <seu-repositorio>
cd checkout

# Instale as dependências
npm install

# Teste localmente
npm start
```

### 2. Deploy na Vercel
1. **Faça push** para o GitHub
2. **Acesse** [vercel.com](https://vercel.com)
3. **Conecte** seu repositório
4. **Deploy automático** será feito
5. **Acesse** a URL fornecida pela Vercel

## 🔧 Configuração

### Credenciais SyncPay
Edite `js/config.js` e configure suas credenciais:

```javascript
const SYNCPAY_CONFIG = {
    base_url: window.location.origin + '/api/syncpay',
    client_id: 'SEU_CLIENT_ID_REAL',
    client_secret: 'SEU_CLIENT_SECRET_REAL',
    // ... outras configurações
};
```

### Planos de Assinatura
Configure os valores em `js/config.js`:

```javascript
plans: {
    monthly: {
        price: 19.90,
        description: 'Assinatura 1 mês - Stella Beghini'
    },
    quarterly: {
        price: 59.70,
        description: 'Assinatura 3 meses - Stella Beghini'
    },
    biannual: {
        price: 119.40,
        description: 'Assinatura 6 meses - Stella Beghini'
    }
}
```

## 🧪 Teste Local

```bash
# Instalar dependências
npm install

# Iniciar servidor
npm start

# Acessar
# http://localhost:3000
```

## 📁 Estrutura do Projeto

```
checkout/
├── server.js                 # Servidor Express com proxy
├── vercel.json              # Configuração Vercel
├── package.json             # Dependências Node.js
├── index.html               # Página principal
├── js/
│   ├── config.js            # Configuração SyncPay
│   ├── syncpay-integration.js # Integração principal
│   └── ...                  # Outras bibliotecas
├── css/
│   ├── pix-modal.css        # Estilos do modal PIX
│   ├── checkout.css         # Estilos do checkout
│   └── ...                  # Outros estilos
└── images/                  # Imagens do projeto
```

## 🔍 Debug

### Logs do Servidor
```bash
npm start
# Verá logs como:
# 🚀 Servidor rodando na porta 3000
# 🔧 Proxy SyncPay: http://localhost:3000/api/syncpay
```

### Logs do Cliente
Abra o console do navegador (F12) para ver logs detalhados:
```
🔧 [DEBUG] SyncPay Integration inicializada
🔐 [DEBUG] Iniciando autenticação com SyncPay...
✅ [DEBUG] Token obtido com sucesso
💰 [DEBUG] Iniciando criação de transação PIX...
```

## 📱 Teste Mobile

### Opção 1: Vercel (Recomendado)
- Deploy na Vercel
- Use a URL fornecida em qualquer dispositivo

### Opção 2: Rede Local
- Use o IP da sua máquina
- Exemplo: `http://192.168.1.100:3000`

## 🐛 Solução de Problemas

### Erro de Autenticação
- Verifique se `client_id` e `client_secret` estão corretos
- Confirme se sua conta SyncPay está ativa

### Erro de CORS
- O proxy local resolve automaticamente
- Em produção, a Vercel gerencia isso

### QR Code não aparece
- Verifique se a biblioteca QRCode.js foi carregada
- Abra o console do navegador para ver erros

## 📚 Documentação

- [Configuração SyncPay](./CONFIGURACAO_SYNCPAY.md)
- [Debug e Troubleshooting](./README-DEBUG.md)
- [Migração para API de Produção](./MIGRACAO_API_PRODUCAO.md)
- [Instruções de Teste](./INSTRUCOES-TESTE.md)

## 🚀 Status do Projeto

- ✅ **API SyncPay**: Integrada e funcionando
- ✅ **Proxy CORS**: Configurado e testado
- ✅ **Interface**: Responsiva e moderna
- ✅ **Deploy Vercel**: Configurado e pronto
- ✅ **ngrok**: Removido (não necessário com Vercel)

## 📞 Suporte

Para suporte técnico:
- **SyncPay**: [Documentação oficial](https://app.syncpayments.com.br/seller/developer-api)
- **Vercel**: [Documentação oficial](https://vercel.com/docs)

---

**✨ Sistema pronto para produção na Vercel!**
