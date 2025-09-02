# Integração SyncPayments - Documentação Completa

## 📋 Visão Geral

Esta integração implementa todas as funcionalidades da API SyncPayments seguindo os requisitos especificados. O código está estruturado de forma modular e reutilizável, com tratamento adequado de erros e logs detalhados.

## 🚀 Funcionalidades Implementadas

### 1. **Autenticação** ✅
- **Endpoint**: `POST https://api.syncpayments.com.br/api/partner/v1/auth-token`
- **Função**: `SyncPayIntegration.getAuthToken()`
- **Recursos**:
  - Validação de credenciais
  - Armazenamento em memória
  - Renovação automática quando expira
  - Campo obrigatório `01K1259MAXE0TNRXV2C2WQN2MV` incluído

### 2. **Consulta de Saldo** ✅
- **Endpoint**: `GET https://api.syncpayments.com.br/api/partner/v1/balance`
- **Função**: `SyncPayIntegration.getBalance()`
- **Recursos**:
  - Header de autorização automático
  - Exibição do saldo retornado
  - Tratamento de erros HTTP

### 3. **Cash-in (Depósito via Pix)** ✅
- **Endpoint**: `POST https://api.syncpayments.com.br/api/partner/v1/cash-in`
- **Função**: `SyncPayIntegration.createCashIn(data)`
- **Recursos**:
  - Validação completa dos dados obrigatórios
  - Validação de CPF (11 dígitos)
  - Validação de telefone (10-11 dígitos)
  - Validação de email
  - Validação de split (percentage 1-100)
  - Rota correta com hífen (`/cash-in`)

### 4. **Consulta de Status de Transação** ✅
- **Endpoint**: `GET https://api.syncpayments.com.br/api/partner/v1/transaction/{identifier}`
- **Função**: `SyncPayIntegration.getTransactionStatus(identifier)`
- **Recursos**:
  - Consulta por identificador único
  - Exibição de status e demais campos
  - Tratamento de transações não encontradas

## 📁 Arquivos da Integração

### 1. `syncpay-integration.js`
Arquivo principal com todas as funções da integração.

**Funções Disponíveis**:
```javascript
// Funções principais
SyncPayIntegration.getAuthToken()           // Autenticação
SyncPayIntegration.getBalance()             // Consulta de saldo
SyncPayIntegration.createCashIn(data)       // Criar cash-in
SyncPayIntegration.getTransactionStatus(id) // Consultar status

// Funções utilitárias
SyncPayIntegration.isTokenValid()           // Verificar validade do token
SyncPayIntegration.getValidToken()          // Obter token válido
SyncPayIntegration.logInfo(message, data)   // Log informativo
SyncPayIntegration.logError(message, error) // Log de erro
SyncPayIntegration.exemploUso()             // Exemplo completo
```

### 2. `exemplo-uso-syncpay.js`
Interface de teste interativa para demonstrar todas as funcionalidades.

**Recursos**:
- Interface visual no canto superior direito
- Botões para testar cada funcionalidade
- Logs em tempo real
- Exemplo completo automatizado

### 3. `config.js`
Configuração das credenciais e parâmetros da API.

## 🔧 Como Usar

### 1. Configuração Inicial
```javascript
// As credenciais já estão configuradas no config.js
window.SYNCPAY_CONFIG = {
    client_id: '708ddc0b-357d-4548-b158-615684caa616',
    client_secret: 'c08d40e5-3049-48c9-85c0-fd3cc6ca502c'
};
```

### 2. Autenticação
```javascript
try {
    const token = await SyncPayIntegration.getAuthToken();
    console.log('Token obtido:', token.substring(0, 20) + '...');
} catch (error) {
    console.error('Erro na autenticação:', error.message);
}
```

### 3. Consultar Saldo
```javascript
try {
    const saldo = await SyncPayIntegration.getBalance();
    console.log('Saldo atual:', saldo);
} catch (error) {
    console.error('Erro ao consultar saldo:', error.message);
}
```

### 4. Criar Cash-in
```javascript
const dadosCashIn = {
    amount: 50.00,
    description: 'Pagamento de teste',
    client: {
        name: 'João Silva',
        cpf: '12345678901',
        email: 'joao@exemplo.com',
        phone: '11987654321'
    },
    split: [
        { percentage: 100, user_id: '708ddc0b-357d-4548-b158-615684caa616' }
    ]
};

try {
    const resultado = await SyncPayIntegration.createCashIn(dadosCashIn);
    console.log('Cash-in criado:', resultado);
} catch (error) {
    console.error('Erro ao criar cash-in:', error.message);
}
```

### 5. Consultar Status
```javascript
try {
    const status = await SyncPayIntegration.getTransactionStatus('identifier-da-transacao');
    console.log('Status da transação:', status);
} catch (error) {
    console.error('Erro ao consultar status:', error.message);
}
```

## 🛡️ Tratamento de Erros

A integração inclui tratamento robusto de erros:

### Erros HTTP Comuns
- **401 Unauthorized**: Token inválido ou expirado
- **422 Unprocessable Entity**: Dados inválidos
- **500 Internal Server Error**: Erro interno do servidor

### Validações Implementadas
- ✅ Credenciais obrigatórias
- ✅ CPF com 11 dígitos numéricos
- ✅ Telefone com 10-11 dígitos numéricos
- ✅ Email válido
- ✅ Valor maior que zero
- ✅ Percentage entre 1-100
- ✅ Dados do cliente completos

## 📊 Logs e Debug

### Logs Automáticos
- 🔐 Autenticação iniciada/concluída
- 💰 Consulta de saldo
- 💳 Criação de cash-in
- 🔍 Consulta de status
- ⏰ Expiração de token
- 🔄 Renovação automática

### Exemplo de Log
```
[15:30:45] 🔐 Iniciando autenticação SyncPayments...
[15:30:46] 📤 Enviando requisição de autenticação...
[15:30:47] 📥 Resposta recebida: 200 OK
[15:30:47] ✅ Autenticação bem-sucedida
[15:30:47] 💾 Token armazenado em memória
[15:30:47] ⏰ Token expira em: 16:30:47
```

## 🧪 Testes

### Interface de Teste
Acesse a página e use a interface de teste no canto superior direito:

1. **🔐 Autenticar**: Testa a autenticação
2. **💰 Consultar Saldo**: Verifica o saldo atual
3. **💳 Criar Cash-in**: Cria uma transação de teste
4. **🔍 Consultar Status**: Verifica o status da última transação
5. **🎯 Executar Exemplo Completo**: Roda todos os testes em sequência

### Teste Manual no Console
```javascript
// Executar exemplo completo
await SyncPayIntegration.exemploUso();

// Testar funções individuais
await SyncPayIntegration.getAuthToken();
await SyncPayIntegration.getBalance();
```

## 🔒 Segurança

### Boas Práticas Implementadas
- ✅ Tokens armazenados em memória (não localStorage)
- ✅ Renovação automática antes da expiração
- ✅ Validação rigorosa de dados de entrada
- ✅ Tratamento seguro de erros
- ✅ Logs sem exposição de dados sensíveis

### Configuração de Produção
Para produção, recomenda-se:
1. Remover o arquivo `exemplo-uso-syncpay.js`
2. Configurar credenciais via variáveis de ambiente
3. Implementar rate limiting
4. Adicionar monitoramento de logs

## 📝 Estrutura de Respostas

### Autenticação
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "Bearer",
  "expires_in": 3600,
  "expires_at": "2024-01-01T16:30:47Z"
}
```

### Saldo
```json
{
  "balance": 1500.75,
  "currency": "BRL"
}
```

### Cash-in
```json
{
  "identifier": "txn_123456789",
  "amount": 50.00,
  "status": "pending",
  "pix_code": "00020126580014br.gov.bcb.pix0136...",
  "expires_at": "2024-01-01T16:30:47Z"
}
```

### Status da Transação
```json
{
  "identifier": "txn_123456789",
  "amount": 50.00,
  "status": "completed",
  "created_at": "2024-01-01T15:30:47Z",
  "completed_at": "2024-01-01T15:35:12Z"
}
```

## 🚀 Próximos Passos

### Melhorias Sugeridas
1. **Webhooks**: Implementar notificações em tempo real
2. **Cache**: Armazenar dados frequentemente consultados
3. **Retry**: Implementar retry automático para falhas temporárias
4. **Métricas**: Adicionar monitoramento de performance
5. **Testes Unitários**: Implementar suite de testes automatizados

### Integração com Frontend
Para integrar com formulários de pagamento:

```javascript
// Exemplo de integração com formulário
document.getElementById('form-pagamento').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    
    const dadosCashIn = {
        amount: parseFloat(formData.get('valor')),
        description: formData.get('descricao'),
        client: {
            name: formData.get('nome'),
            cpf: formData.get('cpf'),
            email: formData.get('email'),
            phone: formData.get('telefone')
        }
    };
    
    try {
        const resultado = await SyncPayIntegration.createCashIn(dadosCashIn);
        // Exibir QR Code ou código PIX
        exibirPixModal(resultado);
    } catch (error) {
        alert('Erro ao gerar PIX: ' + error.message);
    }
});
```

## 📞 Suporte

Para dúvidas ou problemas:
1. Verifique os logs no console do navegador
2. Teste as funcionalidades usando a interface de exemplo
3. Consulte a documentação da API SyncPayments
4. Entre em contato com o suporte técnico

---

**Versão**: 1.0.0  
**Data**: Janeiro 2024  
**Autor**: Desenvolvedor Experiente em APIs REST
