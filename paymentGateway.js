const { createPixPayment, getPaymentStatus, listPayments } = require('./pushinpayApi');
const { syncpayGet, syncpayPost } = require('./syncpayApi');
const { getToken } = require('./authService');

class PaymentGateway {
  constructor(gateway = 'syncpay') {
    this.gateway = gateway.toLowerCase();
  }

  // Método para definir qual gateway usar
  setGateway(gateway) {
    this.gateway = gateway.toLowerCase();
    console.log(`🎯 Gateway de pagamento alterado para: ${this.gateway}`);
  }

  // Método para obter o gateway atual
  getCurrentGateway() {
    return this.gateway;
  }

  // Método para criar pagamento PIX
  async createPixPayment(paymentData) {
    try {
      if (this.gateway === 'pushinpay') {
        console.log('🚀 Criando pagamento via PushinPay...');
        return await createPixPayment(paymentData);
      } else if (this.gateway === 'syncpay') {
        console.log('🚀 Criando pagamento via SyncPay...');
        return await this.createSyncPayPixPayment(paymentData);
      } else {
        throw new Error(`Gateway não suportado: ${this.gateway}`);
      }
    } catch (error) {
      console.error(`❌ Erro ao criar pagamento via ${this.gateway}:`, error.message);
      throw error;
    }
  }

  // Método para consultar status do pagamento
  async getPaymentStatus(paymentId) {
    try {
      if (this.gateway === 'pushinpay') {
        console.log('🔍 Consultando status via PushinPay...');
        return await getPaymentStatus(paymentId);
      } else if (this.gateway === 'syncpay') {
        console.log('🔍 Consultando status via SyncPay...');
        return await this.getSyncPayPaymentStatus(paymentId);
      } else {
        throw new Error(`Gateway não suportado: ${this.gateway}`);
      }
    } catch (error) {
      console.error(`❌ Erro ao consultar status via ${this.gateway}:`, error.message);
      throw error;
    }
  }

  // Método para listar pagamentos
  async listPayments(filters = {}) {
    try {
      if (this.gateway === 'pushinpay') {
        console.log('📋 Listando pagamentos via PushinPay...');
        return await listPayments(filters);
      } else if (this.gateway === 'syncpay') {
        console.log('📋 Listando pagamentos via SyncPay...');
        return await this.listSyncPayPayments(filters);
      } else {
        throw new Error(`Gateway não suportado: ${this.gateway}`);
      }
    } catch (error) {
      console.error(`❌ Erro ao listar pagamentos via ${this.gateway}:`, error.message);
      throw error;
    }
  }

  // Métodos específicos do SyncPay
  async createSyncPayPixPayment(paymentData) {
    try {
      const token = await getToken();
      
      const syncPayData = {
        amount: paymentData.amount,
        description: paymentData.description || 'Pagamento via PIX',
        client: {
          name: paymentData.customer_name,
          cpf: paymentData.customer_document,
          email: paymentData.customer_email,
          phone: paymentData.customer_phone || '11999999999'
        }
      };

      const response = await syncpayPost('/cash-in', syncPayData);
      return response.data;
    } catch (error) {
      console.error('Erro ao criar pagamento SyncPay:', error.response?.data || error.message);
      throw error;
    }
  }

  async getSyncPayPaymentStatus(paymentId) {
    try {
      const response = await syncpayGet(`/transaction/${paymentId}`);
      return response.data;
    } catch (error) {
      console.error('Erro ao consultar status SyncPay:', error.response?.data || error.message);
      throw error;
    }
  }

  async listSyncPayPayments(filters = {}) {
    try {
      const queryParams = new URLSearchParams(filters).toString();
      const response = await syncpayGet(`/transactions?${queryParams}`);
      return response.data;
    } catch (error) {
      console.error('Erro ao listar pagamentos SyncPay:', error.response?.data || error.message);
      throw error;
    }
  }

  // Método para obter informações dos gateways disponíveis
  getAvailableGateways() {
    return [
      {
        id: 'pushinpay',
        name: 'PushinPay',
        description: 'Gateway de pagamento PushinPay (Configuração pendente)',
        features: ['PIX', 'Cartão de Crédito', 'Boleto'],
        status: 'configuring'
      },
      {
        id: 'syncpay',
        name: 'SyncPay',
        description: 'Gateway de pagamento SyncPay',
        features: ['PIX', 'Cartão de Crédito', 'Boleto'],
        status: 'active'
      }
    ];
  }

  // Método para validar dados do pagamento
  validatePaymentData(paymentData) {
    const requiredFields = ['amount', 'customer_name', 'customer_email'];
    const missingFields = requiredFields.filter(field => !paymentData[field]);
    
    if (missingFields.length > 0) {
      throw new Error(`Campos obrigatórios ausentes: ${missingFields.join(', ')}`);
    }

    if (paymentData.amount <= 0) {
      throw new Error('Valor do pagamento deve ser maior que zero');
    }

    return true;
  }
}

module.exports = PaymentGateway;