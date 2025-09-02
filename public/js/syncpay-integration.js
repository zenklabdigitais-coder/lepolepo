/**
 * SyncPay Integration - Cliente completo para API SyncPayments
 * Implementa autenticação, consulta de saldo, cash-in e consulta de status
 */

(function() {
    'use strict';

    // Configuração da API
    const API_CONFIG = {
        baseUrl: 'https://api.syncpayments.com.br/api/partner/v1',
        authEndpoint: '/auth-token',
        balanceEndpoint: '/balance',
        cashInEndpoint: '/cash-in',
        transactionEndpoint: '/transaction'
    };

    // Armazenamento do token em memória
    let authToken = null;
    let tokenExpiry = null;

    /**
     * 1. AUTENTICAÇÃO
     * Endpoint: POST https://api.syncpayments.com.br/api/partner/v1/auth-token
     */
    async function getAuthToken() {
        console.log('🔐 Iniciando autenticação SyncPayments...');

        // Verificar se já existe um token válido
        if (isTokenValid()) {
            console.log('✅ Token válido encontrado em memória');
            return authToken;
        }

        // Validar configuração
        if (!window.SYNCPAY_CONFIG) {
            throw new Error('Configuração SYNCPAY_CONFIG não encontrada');
        }

        const { client_id, client_secret } = window.SYNCPAY_CONFIG;

        if (!client_id || !client_secret) {
            throw new Error('client_id ou client_secret não configurados');
        }

        // Preparar dados da requisição
        const authData = {
            client_id: client_id,
            client_secret: client_secret,
            '01K1259MAXE0TNRXV2C2WQN2MV': 'auth_request_' + Date.now()
        };

        try {
            console.log('📤 Enviando requisição de autenticação...');
            
            const response = await fetch(`${API_CONFIG.baseUrl}${API_CONFIG.authEndpoint}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(authData)
            });

            console.log('📥 Resposta recebida:', response.status, response.statusText);

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`HTTP ${response.status}: ${response.statusText} - ${errorText}`);
            }

            const data = await response.json();
            console.log('✅ Autenticação bem-sucedida:', data);

            // Armazenar token em memória
            if (data.access_token) {
                authToken = data.access_token;
                tokenExpiry = new Date(Date.now() + (data.expires_in * 1000));
                
                console.log('💾 Token armazenado em memória');
                console.log('⏰ Token expira em:', tokenExpiry.toLocaleString());
                
                return authToken;
            } else {
                throw new Error('Token de acesso não encontrado na resposta');
            }

        } catch (error) {
            console.error('❌ Erro na autenticação:', error);
            throw error;
        }
    }

    /**
     * Verificar se o token atual é válido
     */
    function isTokenValid() {
        if (!authToken || !tokenExpiry) {
            return false;
        }
        
        // Verificar se o token não expirou (com margem de 5 minutos)
        const now = new Date();
        const margin = 5 * 60 * 1000; // 5 minutos em ms
        
        return now < new Date(tokenExpiry.getTime() - margin);
    }

    /**
     * Obter token válido (renova automaticamente se necessário)
     */
    async function getValidToken() {
        if (!isTokenValid()) {
            console.log('🔄 Token expirado ou inexistente, renovando...');
            await getAuthToken();
        }
        return authToken;
    }

    /**
     * 2. CONSULTA DE SALDO
     * Endpoint: GET https://api.syncpayments.com.br/api/partner/v1/balance
     */
    async function getBalance() {
        console.log('💰 Consultando saldo...');

        try {
            const token = await getValidToken();

            const response = await fetch(`${API_CONFIG.baseUrl}${API_CONFIG.balanceEndpoint}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json'
                }
            });

            console.log('📥 Resposta do saldo:', response.status, response.statusText);

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`HTTP ${response.status}: ${response.statusText} - ${errorText}`);
            }

            const data = await response.json();
            console.log('✅ Saldo consultado:', data);

            return data;

        } catch (error) {
            console.error('❌ Erro ao consultar saldo:', error);
            throw error;
        }
    }

    /**
     * 3. CASH-IN (DEPÓSITO VIA PIX)
     * Endpoint: POST https://api.syncpayments.com.br/api/partner/v1/cash-in
     */
    async function createCashIn(cashInData) {
        console.log('💳 Criando cash-in (depósito via Pix)...');

        // Validar dados obrigatórios
        if (!cashInData.amount || cashInData.amount <= 0) {
            throw new Error('Valor (amount) é obrigatório e deve ser maior que zero');
        }

        if (!cashInData.client) {
            throw new Error('Dados do cliente são obrigatórios');
        }

        const { name, cpf, email, phone } = cashInData.client;
        if (!name || !cpf || !email || !phone) {
            throw new Error('Todos os dados do cliente são obrigatórios: name, cpf, email, phone');
        }

        // Validar CPF (11 dígitos)
        if (cpf.length !== 11 || !/^\d+$/.test(cpf)) {
            throw new Error('CPF deve ter exatamente 11 dígitos numéricos');
        }

        // Validar telefone (10-11 dígitos)
        if (phone.length < 10 || phone.length > 11 || !/^\d+$/.test(phone)) {
            throw new Error('Telefone deve ter 10 ou 11 dígitos numéricos');
        }

        // Validar email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            throw new Error('Email inválido');
        }

        // Validar split se fornecido
        if (cashInData.split && Array.isArray(cashInData.split)) {
            for (const splitItem of cashInData.split) {
                if (!splitItem.percentage || !splitItem.user_id) {
                    throw new Error('Split deve conter percentage e user_id');
                }
                if (splitItem.percentage < 1 || splitItem.percentage > 100) {
                    throw new Error('Percentage deve estar entre 1 e 100');
                }
            }
        }

        try {
            const token = await getValidToken();

            const requestData = {
                amount: cashInData.amount,
                description: cashInData.description || null,
                client: {
                    name: name,
                    cpf: cpf,
                    email: email,
                    phone: phone
                }
            };

            // Adicionar split se fornecido
            if (cashInData.split) {
                requestData.split = cashInData.split;
            }

            console.log('📤 Enviando dados do cash-in:', requestData);

            const response = await fetch(`${API_CONFIG.baseUrl}${API_CONFIG.cashInEndpoint}`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(requestData)
            });

            console.log('📥 Resposta do cash-in:', response.status, response.statusText);

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`HTTP ${response.status}: ${response.statusText} - ${errorText}`);
            }

            const data = await response.json();
            console.log('✅ Cash-in criado com sucesso:', data);

            return data;

        } catch (error) {
            console.error('❌ Erro ao criar cash-in:', error);
            throw error;
        }
    }

    /**
     * 4. CONSULTA DE STATUS DE TRANSAÇÃO
     * Endpoint: GET https://api.syncpayments.com.br/api/partner/v1/transaction/{identifier}
     */
    async function getTransactionStatus(identifier) {
        console.log('🔍 Consultando status da transação:', identifier);

        if (!identifier) {
            throw new Error('Identificador da transação é obrigatório');
        }

        try {
            const token = await getValidToken();

            const response = await fetch(`${API_CONFIG.baseUrl}${API_CONFIG.transactionEndpoint}/${identifier}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json'
                }
            });

            console.log('📥 Resposta do status:', response.status, response.statusText);

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`HTTP ${response.status}: ${response.statusText} - ${errorText}`);
            }

            const data = await response.json();
            console.log('✅ Status da transação consultado:', data);

            return data;

        } catch (error) {
            console.error('❌ Erro ao consultar status da transação:', error);
            throw error;
        }
    }

    /**
     * Função utilitária para exibir logs formatados
     */
    function logInfo(message, data = null) {
        const timestamp = new Date().toLocaleString('pt-BR');
        console.log(`[${timestamp}] ℹ️ ${message}`);
        if (data) {
            console.log('📊 Dados:', data);
        }
    }

    /**
     * Função utilitária para exibir erros formatados
     */
    function logError(message, error = null) {
        const timestamp = new Date().toLocaleString('pt-BR');
        console.error(`[${timestamp}] ❌ ${message}`);
        if (error) {
            console.error('🔍 Detalhes do erro:', error);
        }
    }

    /**
     * Exemplo de uso das funções
     */
    async function exemploUso() {
        try {
            logInfo('🚀 Iniciando exemplo de uso da integração SyncPayments');

            // 1. Autenticação
            const token = await getAuthToken();
            logInfo('✅ Autenticação realizada', { token: token.substring(0, 20) + '...' });

            // 2. Consultar saldo
            const balance = await getBalance();
            logInfo('💰 Saldo consultado', balance);

            // 3. Criar cash-in
            const cashInData = {
                amount: 50.00,
                description: 'Teste de integração',
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

            const cashInResult = await createCashIn(cashInData);
            logInfo('💳 Cash-in criado', cashInResult);

            // 4. Consultar status da transação
            if (cashInResult.identifier) {
                const status = await getTransactionStatus(cashInResult.identifier);
                logInfo('🔍 Status da transação', status);
            }

        } catch (error) {
            logError('❌ Erro no exemplo de uso', error);
        }
    }

    // Expor funções para uso global
    window.SyncPayIntegration = {
        // Funções principais
        getAuthToken,
        getBalance,
        createCashIn,
        getTransactionStatus,
        
        // Funções utilitárias
        isTokenValid,
        getValidToken,
        logInfo,
        logError,
        
        // Exemplo de uso
        exemploUso
    };

    console.log('🔧 SyncPayIntegration carregado e disponível globalmente');
    console.log('📚 Funções disponíveis:');
    console.log('  - SyncPayIntegration.getAuthToken()');
    console.log('  - SyncPayIntegration.getBalance()');
    console.log('  - SyncPayIntegration.createCashIn(data)');
    console.log('  - SyncPayIntegration.getTransactionStatus(identifier)');
    console.log('  - SyncPayIntegration.exemploUso()');

})();
