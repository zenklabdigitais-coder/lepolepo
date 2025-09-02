/**
 * AuthProxyClient.js - Cliente de autenticação para API SyncPay
 * Gerencia autenticação e tokens de acesso
 */

(function() {
    'use strict';

    // Função principal de autenticação
    function authenticateSyncPay() {
        console.log('🔐 Iniciando autenticação SyncPay...');

        // 1. Validar se as credenciais existem
        if (!window.SYNCPAY_CONFIG) {
            alert('❌ ERRO: Configuração SYNCPAY_CONFIG não encontrada!');
            console.error('SYNCPAY_CONFIG não está definida');
            return;
        }

        const { client_id, client_secret } = window.SYNCPAY_CONFIG;

        if (!client_id || !client_secret) {
            alert('❌ ERRO: client_id ou client_secret não configurados!\n\nVerifique o arquivo config.js');
            console.error('Credenciais ausentes:', { client_id: !!client_id, client_secret: !!client_secret });
            return;
        }

        console.log('✅ Credenciais validadas com sucesso');

        // 2. Preparar dados da requisição
        const authData = {
            client_id: client_id,
            client_secret: client_secret,
            '01K1259MAXE0TNRXV2C2WQN2MV': 'auth_request_' + Date.now() // Campo obrigatório com timestamp
        };

        console.log('📤 Enviando requisição de autenticação...');

        // 3. Fazer requisição POST para /api/auth-token
        fetch('/api/auth-token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify(authData)
        })
        .then(response => {
            console.log('📥 Resposta recebida:', response.status, response.statusText);
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            return response.json();
        })
        .then(data => {
            console.log('✅ Autenticação bem-sucedida:', data);
            
            // 4. Salvar access_token no sessionStorage
            if (data.access_token) {
                sessionStorage.setItem('access_token', data.access_token);
                console.log('💾 Token salvo no sessionStorage');
                
                alert('✅ Autenticação realizada com sucesso!\n\nToken de acesso salvo.');
            } else {
                throw new Error('Token de acesso não encontrado na resposta');
            }
        })
        .catch(error => {
            console.error('❌ Erro na autenticação:', error);
            alert('❌ ERRO na autenticação:\n\n' + error.message);
        });
    }

    // Função para verificar se já existe um token válido
    function checkExistingToken() {
        const existingToken = sessionStorage.getItem('access_token');
        if (existingToken) {
            console.log('🔍 Token existente encontrado no sessionStorage');
            return existingToken;
        }
        return null;
    }

    // Função para limpar token (logout)
    function clearAuthToken() {
        sessionStorage.removeItem('access_token');
        console.log('🗑️ Token removido do sessionStorage');
    }

    // Função para obter token atual
    function getCurrentToken() {
        return sessionStorage.getItem('access_token');
    }

    // Função para verificar se está autenticado
    function isAuthenticated() {
        return !!getCurrentToken();
    }

    // Auto-inicialização quando o DOM estiver pronto
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            console.log('🚀 AuthProxyClient carregado e pronto');
            
            // Verificar se já existe um token
            const existingToken = checkExistingToken();
            if (!existingToken) {
                console.log('🔐 Nenhum token encontrado, iniciando autenticação...');
                // Aguardar um pouco para garantir que tudo está carregado
                setTimeout(authenticateSyncPay, 1000);
            } else {
                console.log('✅ Token existente encontrado, autenticação não necessária');
            }
        });
    } else {
        // DOM já está pronto
        console.log('🚀 AuthProxyClient carregado (DOM já pronto)');
        
        const existingToken = checkExistingToken();
        if (!existingToken) {
            setTimeout(authenticateSyncPay, 1000);
        }
    }

    // Expor funções para uso global
    window.AuthProxyClient = {
        authenticate: authenticateSyncPay,
        checkToken: checkExistingToken,
        clearToken: clearAuthToken,
        getToken: getCurrentToken,
        isAuthenticated: isAuthenticated
    };

    console.log('🔧 AuthProxyClient inicializado e disponível globalmente');

})();
