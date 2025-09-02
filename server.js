require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const fetch = require('node-fetch');
const { syncpayGet, syncpayPost } = require('./syncpayApi');
const WebhookHandler = require('./webhookHandler');

const app = express();
const PORT = process.env.PORT || 3000;

// Configurar CORS
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// Middleware para interpretar JSON no corpo das requisições
app.use(express.json());

// Servir arquivos estáticos do diretório public
app.use(express.static(path.join(__dirname, 'public')));

// Rota para obter token de autenticação
app.post('/api/auth-token', async (req, res) => {
    try {
        console.log('🔐 [DEBUG] Gerando token de autenticação...');
        const response = await fetch('https://api.syncpayments.com.br/api/partner/v1/auth-token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                client_id: process.env.SYNCPAY_CLIENT_ID || '708ddc0b-357d-4548-b158-615684caa616',
                client_secret: process.env.SYNCPAY_CLIENT_SECRET || 'c08d40e5-3049-48c9-85c0-fd3cc6ca502c',
                '01K1259MAXE0TNRXV2C2WQN2MV': process.env.SYNCPAY_EXTRA || 'valor'
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('[Auth] Erro na autenticação:', errorText);
            return res.status(response.status).json({
                message: 'Erro na autenticação',
                details: errorText
            });
        }

        const data = await response.json();
        console.log('✅ [DEBUG] Token gerado com sucesso');
        res.json(data);
    } catch (err) {
        console.error('[Auth] Erro ao obter token:', err.message);
        res.status(500).json({
            message: 'Não foi possível autenticar',
            details: err.message
        });
    }
});

// Rota protegida de exemplo - consulta de saldo
app.get('/api/balance', async (req, res) => {
    try {
        const response = await syncpayGet('/balance');
        res.json(response.data);
    } catch (err) {
        console.error('[Balance] Erro ao obter saldo:', err.response?.data || err.message);
        res.status(500).json({
            message: 'Não foi possível obter o saldo',
            details: err.response?.data || err.message
        });
    }
});

// Rota para criação de transação (cash-in)
app.post('/api/cash-in', async (req, res) => {
    try {
        console.log('💰 [DEBUG] Criando transação PIX:', req.body);
        const response = await syncpayPost('/cash-in', req.body);
        console.log('✅ [DEBUG] Transação criada com sucesso:', response.data);
        res.json(response.data);
    } catch (err) {
        console.error('[Cash-in] Erro ao criar transação:', err.response?.data || err.message);
        res.status(err.response?.status || 500).json({
            message: 'Não foi possível criar a transação',
            details: err.response?.data || err.message
        });
    }
});

// Rota para criação de transação de saque (cash-out)
app.post('/api/cash-out', async (req, res) => {
    try {
        console.log('💸 [DEBUG] Criando saque PIX:', req.body);
        const response = await syncpayPost('/cash-out', req.body);
        console.log('✅ [DEBUG] Saque criado com sucesso:', response.data);
        res.json(response.data);
    } catch (err) {
        console.error('[Cash-out] Erro ao criar saque:', err.response?.data || err.message);
        res.status(err.response?.status || 500).json({
            message: 'Não foi possível criar o saque',
            details: err.response?.data || err.message
        });
    }
});

// Rota para consultar status de transação
app.get('/api/transaction/:identifier', async (req, res) => {
    try {
        const { identifier } = req.params;
        console.log('🔍 [DEBUG] Consultando status da transação:', identifier);
        const response = await syncpayGet(`/transaction/${identifier}`);
        console.log('✅ [DEBUG] Status obtido:', response.data);
        res.json(response.data);
    } catch (err) {
        console.error('[Transaction] Erro ao consultar status:', err.response?.data || err.message);
        res.status(err.response?.status || 500).json({
            message: 'Não foi possível consultar o status da transação',
            details: err.response?.data || err.message
        });
    }
});

// Rota para consultar dados do parceiro
app.get('/api/profile', async (req, res) => {
    try {
        console.log('👤 [DEBUG] Consultando dados do parceiro...');
        const response = await syncpayGet('/profile');
        console.log('✅ [DEBUG] Dados do parceiro obtidos:', response.data);
        res.json(response.data);
    } catch (err) {
        console.error('[Profile] Erro ao consultar perfil:', err.response?.data || err.message);
        res.status(err.response?.status || 500).json({
            message: 'Não foi possível consultar dados do parceiro',
            details: err.response?.data || err.message
        });
    }
});

// Configurar webhooks
const webhookHandler = new WebhookHandler();
webhookHandler.setupRoutes(app);

// Rota para gerenciar webhooks
app.get('/api/webhooks', async (req, res) => {
    try {
        console.log('🔗 [DEBUG] Listando webhooks...');
        const response = await syncpayGet('/webhooks');
        console.log('✅ [DEBUG] Webhooks listados:', response.data);
        res.json(response.data);
    } catch (err) {
        console.error('[Webhooks] Erro ao listar webhooks:', err.response?.data || err.message);
        res.status(err.response?.status || 500).json({
            message: 'Não foi possível listar os webhooks',
            details: err.response?.data || err.message
        });
    }
});

app.post('/api/webhooks', async (req, res) => {
    try {
        console.log('🔗 [DEBUG] Criando webhook:', req.body);
        const response = await syncpayPost('/webhooks', req.body);
        console.log('✅ [DEBUG] Webhook criado:', response.data);
        res.json(response.data);
    } catch (err) {
        console.error('[Webhooks] Erro ao criar webhook:', err.response?.data || err.message);
        res.status(err.response?.status || 500).json({
            message: 'Não foi possível criar o webhook',
            details: err.response?.data || err.message
        });
    }
});

app.put('/api/webhooks/:id', async (req, res) => {
    try {
        const { id } = req.params;
        console.log('🔗 [DEBUG] Atualizando webhook:', id, req.body);
        const response = await syncpayPost(`/webhooks/${id}`, req.body, { method: 'PUT' });
        console.log('✅ [DEBUG] Webhook atualizado:', response.data);
        res.json(response.data);
    } catch (err) {
        console.error('[Webhooks] Erro ao atualizar webhook:', err.response?.data || err.message);
        res.status(err.response?.status || 500).json({
            message: 'Não foi possível atualizar o webhook',
            details: err.response?.data || err.message
        });
    }
});

app.delete('/api/webhooks/:id', async (req, res) => {
    try {
        const { id } = req.params;
        console.log('🔗 [DEBUG] Deletando webhook:', id);
        const response = await syncpayPost(`/webhooks/${id}`, {}, { method: 'DELETE' });
        console.log('✅ [DEBUG] Webhook deletado:', response.data);
        res.json(response.data);
    } catch (err) {
        console.error('[Webhooks] Erro ao deletar webhook:', err.response?.data || err.message);
        res.status(err.response?.status || 500).json({
            message: 'Não foi possível deletar o webhook',
            details: err.response?.data || err.message
        });
    }
});

// Rota de teste para verificar se o servidor está funcionando
app.get('/api/health', (req, res) => {
    res.json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        message: 'Servidor funcionando corretamente'
    });
});

// Rota principal
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Servidor rodando na porta ${PORT}`);
    console.log(`📱 Acesse: http://localhost:${PORT}`);
    console.log(`🌐 Acesse externamente: http://0.0.0.0:${PORT}`);
});
