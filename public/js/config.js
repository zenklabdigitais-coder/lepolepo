// Configuração da API SyncPayments
window.SYNCPAY_CONFIG = {
    client_id: '708ddc0b-357d-4548-b158-615684caa616',
    client_secret: 'c08d40e5-3049-48c9-85c0-fd3cc6ca502c',
    baseUrl: 'https://api.syncpayments.com.br/api/partner/v1'
};

// Configurações do servidor local
window.SERVER_CONFIG = {
    baseUrl: 'http://localhost:3000',
    endpoints: {
        auth: '/api/auth-token',
        balance: '/api/balance',
        cashIn: '/api/cash-in',
        cashOut: '/api/cash-out',
        transaction: '/api/transaction',
        profile: '/api/profile'
    }
};
