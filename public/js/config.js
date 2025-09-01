// Configuração da API SyncPay - PRODUÇÃO
// ✅ CREDENCIAIS REAIS CONFIGURADAS PARA API DE PRODUÇÃO

const SYNCPAY_CONFIG = {
    // URL base da API SyncPay
    base_url: 'https://api.syncpayments.com.br/api',
    
    // ✅ CREDENCIAIS REAIS DA SYNCPAY
    client_id: '708ddc0b-357d-4548-b158-615684caa616',        // Client ID (público)
    client_secret: 'c08d40e5-3049-48c9-85c0-fd3cc6ca502c', // Client Secret (privado)
    
    // Configurações dos planos de assinatura
    plans: {
        monthly: {
            price: 19.90,
            description: 'Assinatura 1 mês - Stella Beghini'
        },
        quarterly: {
            price: 59.70,
            description: 'Assinatura 3 meses - Stella Beghini'
        },
        semestrial: {
            price: 119.40,
            description: 'Assinatura 6 meses - Stella Beghini'
        }
    },
    
    // Configurações de timeout e retry
    timeouts: {
        auth_token_validity: 3600, // 1 hora em segundos
        payment_check_interval: 5000, // 5 segundos
        pix_expiry: 3600 // 1 hora em segundos
    }
};

// Exportar configuração para uso global
window.SYNCPAY_CONFIG = SYNCPAY_CONFIG;
