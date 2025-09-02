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
    // Por enquanto, retornar erro informativo até a API estar configurada corretamente
    throw new Error('PushinPay API não está configurada corretamente. Por favor, verifique a documentação da API e configure os endpoints corretos.');
    
    // Código original comentado até a API estar funcionando
    /*
    const response = await pushinpayPost('/v1/pix', {
      amount: paymentData.amount,
      description: paymentData.description || 'Pagamento via PIX',
      external_id: paymentData.external_id || `payment_${Date.now()}`,
      expires_in: paymentData.expires_in || 3600, // 1 hora por padrão
      customer: {
        name: paymentData.customer_name,
        email: paymentData.customer_email,
        document: paymentData.customer_document
      }
    });
    
    return response.data;
    */
  } catch (error) {
    console.error('Erro ao criar pagamento PIX:', error.response?.data || error.message);
    throw error;
  }
}

// Função para consultar status do pagamento
async function getPaymentStatus(paymentId) {
  try {
    const response = await pushinpayGet(`/v1/pix/${paymentId}`);
    return response.data;
  } catch (error) {
    console.error('Erro ao consultar status do pagamento:', error.response?.data || error.message);
    throw error;
  }
}

// Função para listar pagamentos
async function listPayments(filters = {}) {
  try {
    const queryParams = new URLSearchParams(filters).toString();
    const response = await pushinpayGet(`/v1/pix?${queryParams}`);
    return response.data;
  } catch (error) {
    console.error('Erro ao listar pagamentos:', error.response?.data || error.message);
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