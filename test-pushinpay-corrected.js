const axios = require('axios');

const PUSHINPAY_TOKEN = '36250|MPvURHE0gE6lqsPN0PtwDOUVISoLjSyvqYUvuDPi47f09b29';
const API_BASE = 'https://api.pushinpay.com.br';

/**
 * Teste da API PushinPay seguindo a documentação oficial
 */

async function testCreatePix() {
  console.log('🧪 Testando criação de PIX - PushinPay');
  console.log('📋 Endpoint: POST /api/pix/cashIn');
  
  try {
    const testData = {
      value: 1000,  // R$ 10,00 em centavos
      webhook_url: 'https://webhook.site/unique-id',  // URL de teste
      split_rules: []  // Sem divisão
    };

    console.log('📤 Dados enviados:', JSON.stringify(testData, null, 2));

    const response = await axios.post(`${API_BASE}/api/pix/cashIn`, testData, {
      headers: {
        'Authorization': `Bearer ${PUSHINPAY_TOKEN}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      timeout: 15000
    });

    console.log('✅ PIX criado com sucesso!');
    console.log('📥 Resposta:', JSON.stringify(response.data, null, 2));
    
    return response.data.id; // Retorna o ID para teste de consulta
  } catch (error) {
    console.error('❌ Erro ao criar PIX:');
    console.error('Status:', error.response?.status);
    console.error('Dados:', JSON.stringify(error.response?.data, null, 2));
    console.error('Mensagem:', error.message);
    return null;
  }
}

async function testGetTransaction(transactionId) {
  if (!transactionId) {
    console.log('⚠️ Pulando teste de consulta - sem ID de transação');
    return;
  }

  console.log('\n🔍 Testando consulta de transação - PushinPay');
  console.log('📋 Endpoint: GET /api/transactions/{ID}');
  console.log('🆔 ID da transação:', transactionId);
  
  try {
    const response = await axios.get(`${API_BASE}/api/transactions/${transactionId}`, {
      headers: {
        'Authorization': `Bearer ${PUSHINPAY_TOKEN}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      timeout: 15000
    });

    console.log('✅ Transação consultada com sucesso!');
    console.log('📥 Resposta:', JSON.stringify(response.data, null, 2));
  } catch (error) {
    console.error('❌ Erro ao consultar transação:');
    console.error('Status:', error.response?.status);
    
    if (error.response?.status === 404) {
      console.log('ℹ️ Transação não encontrada (404) - retornando null conforme documentação');
    } else {
      console.error('Dados:', JSON.stringify(error.response?.data, null, 2));
    }
    console.error('Mensagem:', error.message);
  }
}

async function testMinimumValue() {
  console.log('\n💰 Testando valor mínimo - PushinPay');
  console.log('📋 Valor mínimo documentado: 50 centavos');
  
  try {
    const testData = {
      value: 50,  // Valor mínimo: 50 centavos
      split_rules: []
    };

    console.log('📤 Testando com 50 centavos:', JSON.stringify(testData, null, 2));

    const response = await axios.post(`${API_BASE}/api/pix/cashIn`, testData, {
      headers: {
        'Authorization': `Bearer ${PUSHINPAY_TOKEN}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      timeout: 15000
    });

    console.log('✅ Valor mínimo aceito!');
    console.log('📥 Resposta:', JSON.stringify(response.data, null, 2));
  } catch (error) {
    console.error('❌ Erro com valor mínimo:');
    console.error('Status:', error.response?.status);
    console.error('Dados:', JSON.stringify(error.response?.data, null, 2));
  }
}

async function testInvalidValue() {
  console.log('\n⚠️ Testando valor inválido (abaixo do mínimo) - PushinPay');
  
  try {
    const testData = {
      value: 49,  // Abaixo do mínimo
      split_rules: []
    };

    console.log('📤 Testando com 49 centavos (inválido):', JSON.stringify(testData, null, 2));

    const response = await axios.post(`${API_BASE}/api/pix/cashIn`, testData, {
      headers: {
        'Authorization': `Bearer ${PUSHINPAY_TOKEN}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      timeout: 15000
    });

    console.log('⚠️ Valor inválido foi aceito (inesperado)');
    console.log('📥 Resposta:', JSON.stringify(response.data, null, 2));
  } catch (error) {
    console.log('✅ Valor inválido rejeitado corretamente');
    console.error('Status:', error.response?.status);
    console.error('Dados:', JSON.stringify(error.response?.data, null, 2));
  }
}

async function runAllTests() {
  console.log('🚀 Iniciando testes da API PushinPay');
  console.log('🔑 Token:', PUSHINPAY_TOKEN.substring(0, 20) + '...');
  console.log('🌐 API Base:', API_BASE);
  console.log('📚 Seguindo documentação oficial da PushinPay\n');

  // Teste 1: Criar PIX
  const transactionId = await testCreatePix();
  
  // Aguardar um pouco antes do próximo teste
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Teste 2: Consultar transação
  await testGetTransaction(transactionId);
  
  // Aguardar um pouco antes do próximo teste
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Teste 3: Valor mínimo
  await testMinimumValue();
  
  // Aguardar um pouco antes do próximo teste
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Teste 4: Valor inválido
  await testInvalidValue();
  
  console.log('\n🏁 Testes concluídos!');
  console.log('\n📋 Resumo dos campos da resposta esperados:');
  console.log('- id: string (UUID da transação)');
  console.log('- qr_code: string (Código PIX EMV)');
  console.log('- status: string (created, paid, expired)');
  console.log('- value: integer (valor em centavos)');
  console.log('- webhook_url: string (URL informada)');
  console.log('- qr_code_base64: string (QR Code em base64)');
  console.log('- split_rules: array (regras de divisão)');
  console.log('- end_to_end_id: string|null (ID do Banco Central)');
  console.log('- payer_name: string|null (nome do pagador)');
  console.log('- payer_national_registration: string|null (CPF/CNPJ)');
}

// Executar todos os testes
runAllTests().catch(console.error);