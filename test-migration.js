// Script de Teste para Validação da Migração para API de Produção
// Execute este script para testar se a integração está funcionando

console.log('🧪 Iniciando testes de validação da migração para API de produção...');

// Função para testar a configuração
function testConfig() {
    console.log('📋 Testando configuração...');
    
    if (typeof window.SYNCPAY_CONFIG === 'undefined') {
        console.error('❌ SYNCPAY_CONFIG não encontrada!');
        return false;
    }
    
    const config = window.SYNCPAY_CONFIG;
    console.log('✅ Configuração encontrada:', {
        base_url: config.base_url,
        client_id: config.client_id ? '***' : 'null',
        client_secret: config.client_secret ? '***' : 'null'
    });
    
    return true;
}

// Função para testar a classe de integração
function testIntegration() {
    console.log('🔧 Testando classe de integração...');
    
    if (typeof SyncPayIntegration === 'undefined') {
        console.error('❌ Classe SyncPayIntegration não encontrada!');
        return false;
    }
    
    console.log('✅ Classe SyncPayIntegration disponível');
    return true;
}

// Função para testar endpoints
async function testEndpoints() {
    console.log('🌐 Testando endpoints...');
    
    const endpoints = [
        { url: '/balance', method: 'GET' },
        { url: '/cash-in', method: 'POST', body: { test: true } }
    ];

    for (const ep of endpoints) {
        try {
            console.log(`🔍 Testando endpoint: ${ep.url}`);
            const options = {
                method: ep.method,
                headers: { 'Content-Type': 'application/json' }
            };
            if (ep.body) options.body = JSON.stringify(ep.body);
            const response = await fetch(ep.url, options);
            
            console.log(`📊 Status: ${response.status}`);
            
            if (response.status === 401) {
                console.log('✅ Endpoint responde (erro 401 esperado para credenciais inválidas)');
            } else if (response.status === 404) {
                console.log('⚠️ Endpoint não encontrado - verificar URL');
            } else {
                console.log(`✅ Endpoint responde com status: ${response.status}`);
            }
        } catch (error) {
            console.error(`❌ Erro ao testar ${ep.url}:`, error.message);
        }
    }
}

// Função principal de teste
async function runTests() {
    console.log('🚀 Iniciando bateria de testes...\n');
    
    // Teste 1: Configuração
    const configOk = testConfig();
    console.log('');
    
    // Teste 2: Classe de integração
    const integrationOk = testIntegration();
    console.log('');
    
    // Teste 3: Endpoints do servidor
    await testEndpoints();
    console.log('');

    // Resumo
    console.log('📊 Resumo dos testes:');
    console.log(`✅ Configuração: ${configOk ? 'OK' : 'FALHOU'}`);
    console.log(`✅ Integração: ${integrationOk ? 'OK' : 'FALHOU'}`);
    console.log('✅ Endpoints: Testados');
    
    if (configOk && integrationOk) {
        console.log('\n🎉 Migração parece estar funcionando corretamente!');
        console.log('💡 Execute um teste real de pagamento para confirmar.');
    } else {
        console.log('\n⚠️ Alguns testes falharam. Verifique a configuração.');
    }
}

// Executar testes quando a página carregar
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', runTests);
} else {
    runTests();
}
