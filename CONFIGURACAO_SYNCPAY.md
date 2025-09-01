# 🔧 Configuração da Integração SyncPay

## 📋 Instruções de Configuração

### 1. **Obter Credenciais SyncPay**
Para usar a integração PIX, você precisa:

1. Criar uma conta na [SyncPay](https://syncpay.apidog.io/)
2. Obter suas credenciais no painel administrativo:
   - `client_id`
   - `client_secret`

### 2. **Configurar as Credenciais**
Edite o arquivo `js/config.js` e substitua:

```javascript
// Suas credenciais da SyncPay (obtidas no painel administrativo)
client_id: 'SEU_CLIENT_ID_AQUI',        // Substitua pelo seu client_id real
client_secret: 'SEU_CLIENT_SECRET_AQUI', // Substitua pelo seu client_secret real
```

Por suas credenciais reais:

```javascript
// Suas credenciais da SyncPay (obtidas no painel administrativo)
client_id: '89210cff-1a37-4cd0-825d-45fecd8e77bb',        // Exemplo
client_secret: 'dadc1b2c-86ee-4256-845a-d1511de315bb',   // Exemplo
```

### 3. **Como Funciona**

#### **Fluxo de Pagamento:**
1. **Usuário clica** em um dos botões de assinatura (1, 3 ou 6 meses)
2. **Sistema gera** token de autenticação na SyncPay
3. **Cria transação PIX** com valor e descrição
4. **Exibe modal** com QR Code e código PIX para cópia
5. **Monitora status** do pagamento em tempo real
6. **Confirma pagamento** automaticamente quando detectado

#### **Recursos Implementados:**
- ✅ **Geração automática de PIX** via API SyncPay
- ✅ **QR Code dinâmico** para escaneamento
- ✅ **Código PIX copiável** com um clique
- ✅ **Monitoramento em tempo real** do status do pagamento
- ✅ **Interface responsiva** para mobile e desktop
- ✅ **Notificações visuais** de sucesso/erro
- ✅ **Renovação automática** de token de autenticação

### 4. **Personalização**

#### **Alterar Valores dos Planos:**
No arquivo `js/config.js`, modifique os preços:

```javascript
plans: {
    monthly: {
        price: 19.90,           // Altere o valor aqui
        description: 'Assinatura 1 mês - Stella Beghini'
    },
    quarterly: {
        price: 59.70,           // Altere o valor aqui
        description: 'Assinatura 3 meses - Stella Beghini'
    },
    biannual: {
        price: 119.40,          // Altere o valor aqui
        description: 'Assinatura 6 meses - Stella Beghini'
    }
}
```

#### **Alterar Descrições:**
Modifique o campo `description` para personalizar a descrição que aparece na transação.

### 5. **Arquivos Modificados**

- ✅ `index.html` - Integração principal e botões de pagamento
- ✅ `js/config.js` - Configurações da API
- ✅ `js/syncpay-integration.js` - Classe de integração SyncPay
- ✅ `css/pix-modal.css` - Estilos do modal de pagamento

### 6. **Teste de Funcionamento**

1. **Configure suas credenciais** no `js/config.js`
2. **Teste localmente:**
   - Execute `npm start`
   - Acesse `http://localhost:3000`
3. **Clique em qualquer botão** de assinatura
4. **Verifique se:**
   - Modal de PIX abre corretamente
   - QR Code é gerado
   - Código PIX pode ser copiado
   - Status é monitorado

### 7. **Deploy na Vercel**

1. **Faça push** do código para GitHub
2. **Conecte** o repositório na Vercel
3. **Configure** as variáveis de ambiente se necessário
4. **Deploy automático** será feito
5. **Acesse** a URL fornecida pela Vercel

### 8. **Solução de Problemas**

#### **Erro de Autenticação:**
- Verifique se `client_id` e `client_secret` estão corretos
- Confirme se sua conta SyncPay está ativa

#### **QR Code não aparece:**
- Verifique se a biblioteca QRCode.js foi carregada
- Abra o console do navegador para ver erros

#### **Modal não abre:**
- Verifique se todos os arquivos JS e CSS foram incluídos
- Confirme se não há erros JavaScript no console

### 9. **Suporte**

Para suporte técnico da SyncPay, consulte:
- 📖 [Documentação oficial](https://syncpay.apidog.io/)
- 💬 Suporte da SyncPay

---

**✨ Agora seu sistema de pagamento está integrado e funcionando com PIX próprio!**
