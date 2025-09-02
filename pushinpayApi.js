const axios = require('axios');

const PUSHINPAY_TOKEN = '36250|MPvURHE0gE6lqsPN0PtwDOUVISoLjSyvqYUvuDPi47f09b29';
const API_BASE = 'https://api.pushinpay.com.br';

async function pushinpayGet(endpoint, config = {}) {
  return axios.get(`${API_BASE}${endpoint}`, {
    ...config,
    headers: {
      'Authorization': `Bearer ${PUSHINPAY_TOKEN}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...(config.headers || {})
    }
  });
}

async function pushinpayPost(endpoint, data, config = {}) {
  return axios.post(`${API_BASE}${endpoint}`, data, {
    ...config,
    headers: {
      'Authorization': `Bearer ${PUSHINPAY_TOKEN}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...(config.headers || {})
    }
  });
}

// Função para criar um pagamento PIX
async function createPixPayment(paymentData) {
  try {
    // Validar valor mínimo (50 centavos)
    const valueInCents = Math.round(paymentData.amount * 100);
    if (valueInCents < 50) {
      throw new Error('Valor mínimo é de 50 centavos (R$ 0,50)');
    }

    // Estrutura de dados conforme documentação oficial da PushinPay
    const requestData = {
      value: valueInCents,  // Valor em centavos
      webhook_url: paymentData.webhook_url || undefined,  // Opcional
      split_rules: paymentData.split_rules || []  // Array para divisão
    };

    // Remover campos undefined para não enviar na requisição
    Object.keys(requestData).forEach(key => 
      requestData[key] === undefined && delete requestData[key]
    );

    console.log('📤 Enviando dados para PushinPay:', requestData);

    // Endpoint correto conforme documentação: POST /api/pix/cashIn
    const response = await pushinpayPost('/api/pix/cashIn', requestData);
    
    console.log('📥 Resposta da PushinPay:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Erro ao criar pagamento PIX PushinPay:', error.response?.data || error.message);
    throw error;
  }
}

// Função para consultar status do pagamento
async function getPaymentStatus(paymentId) {
  try {
    console.log('🔍 Consultando status do pagamento:', paymentId);
    
    // Endpoint correto conforme documentação: GET /api/transactions/{ID}
    const response = await pushinpayGet(`/api/transactions/${paymentId}`);
    
    console.log('📥 Status recebido da PushinPay:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Erro ao consultar status do pagamento PushinPay:', error.response?.data || error.message);
    
    // Se retornar 404, a documentação menciona que retorna null
    if (error.response?.status === 404) {
      return null;
    }
    
    throw error;
  }
}

// Função para listar pagamentos
// NOTA: A documentação da PushinPay não fornece endpoint para listar pagamentos
// Esta funcionalidade pode não estar disponível na API atual
async function listPayments(filters = {}) {
  try {
    console.warn('⚠️ Endpoint de listagem não documentado na PushinPay');
    throw new Error('Funcionalidade de listagem de pagamentos não disponível na API PushinPay');
    
    // Código comentado - endpoint não existe na documentação oficial
    /*
    const queryParams = new URLSearchParams(filters).toString();
    const response = await pushinpayGet(`/api/payments?${queryParams}`);
    return response.data;
    */
  } catch (error) {
    console.error('❌ Erro ao listar pagamentos PushinPay:', error.response?.data || error.message);
    throw error;
  }
}

module.exports = { 
  pushinpayGet, 
  pushinpayPost, 
  createPixPayment, 
  getPaymentStatus, 
  listPayments 
};