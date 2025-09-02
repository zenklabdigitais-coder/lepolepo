const axios = require('axios');

const PUSHINPAY_TOKEN = '36250|MPvURHE0gE6lqsPN0PtwDOUVISoLjSyvqYUvuDPi47f09b29';

// URLs alternativas para testar
const apiUrls = [
    'https://api.pushinpay.com.br',
    'https://pushinpay.com.br/api',
    'https://api.pushinpay.com.br/api',
    'https://pushinpay.com.br'
];

// Endpoints para testar
const endpoints = [
    '/pix',
    '/v1/pix',
    '/api/pix',
    '/api/v1/pix',
    '/payments/pix',
    '/payments',
    '/',
    '/health',
    '/status'
];

async function testEndpoint(baseUrl, endpoint) {
    try {
        console.log(`\n🔍 Testando: ${baseUrl}${endpoint}`);
        
        // Teste GET
        try {
            const response = await axios.get(`${baseUrl}${endpoint}`, {
                headers: {
                    'Authorization': `Bearer ${PUSHINPAY_TOKEN}`,
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                timeout: 10000
            });
            console.log(`✅ GET ${endpoint}: ${response.status} - ${response.statusText}`);
            if (response.data) {
                console.log(`📄 Resposta:`, JSON.stringify(response.data, null, 2).substring(0, 200) + '...');
            }
        } catch (error) {
            console.log(`❌ GET ${endpoint}: ${error.response?.status || error.code} - ${error.message}`);
        }

        // Teste POST
        try {
            const testData = {
                amount: 10.00,
                description: 'Teste de pagamento',
                customer_name: 'Teste',
                customer_email: 'teste@exemplo.com',
                customer_document: '12345678901'
            };

            const response = await axios.post(`${baseUrl}${endpoint}`, testData, {
                headers: {
                    'Authorization': `Bearer ${PUSHINPAY_TOKEN}`,
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                timeout: 10000
            });
            console.log(`✅ POST ${endpoint}: ${response.status} - ${response.statusText}`);
            if (response.data) {
                console.log(`📄 Resposta:`, JSON.stringify(response.data, null, 2).substring(0, 200) + '...');
            }
        } catch (error) {
            console.log(`❌ POST ${endpoint}: ${error.response?.status || error.code} - ${error.message}`);
            if (error.response?.data) {
                console.log(`📄 Erro:`, JSON.stringify(error.response.data, null, 2).substring(0, 200) + '...');
            }
        }

    } catch (error) {
        console.log(`❌ Erro geral para ${endpoint}:`, error.message);
    }
}

async function testAllEndpoints() {
    console.log('🚀 Iniciando testes dos endpoints da PushinPay...');
    console.log(`🔑 Token: ${PUSHINPAY_TOKEN.substring(0, 20)}...`);
    
    for (const baseUrl of apiUrls) {
        console.log(`\n🌐 Testando URL base: ${baseUrl}`);
        for (const endpoint of endpoints) {
            await testEndpoint(baseUrl, endpoint);
            // Aguardar um pouco entre as requisições
            await new Promise(resolve => setTimeout(resolve, 500));
        }
    }
    
    console.log('\n✅ Testes concluídos!');
}

// Executar os testes
testAllEndpoints().catch(console.error);