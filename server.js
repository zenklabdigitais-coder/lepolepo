require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const fetch = require('node-fetch');
const { syncpayGet, syncpayPost } = require('./syncpayApi');
const WebhookHandler = require('./webhookHandler');
const PaymentGateway = require('./paymentGateway');

const app = express();
const PORT = process.env.PORT || 3000;

// Instanciar o gateway de pagamento
const paymentGateway = new PaymentGateway('syncpay'); // Padrão SyncPay

// Configurar CORS
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: [
        'Content-Type', 
        'Authorization', 
        'Accept', 
        'Origin', 
        'X-Requested-With',
        'Access-Control-Allow-Origin',
        'Access-Control-Allow-Headers',
        'Access-Control-Allow-Methods'
    ],
    credentials: false,
    preflightContinue: false,
    optionsSuccessStatus: 200
}));

// Middleware para interpretar JSON no corpo das requisições
app.use(express.json());

// Middleware adicional para tratar requisições OPTIONS
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Accept, Origin, X-Requested-With');
    
    if (req.method === 'OPTIONS') {
        res.sendStatus(200);
    } else {
        next();
    }
});

// Servir arquivos estáticos do diretório public
app.use(express.static(path.join(__dirname, 'public')));

// Rota para obter token de autenticação
app.post('/api/auth-token', async (req, res) => {
    try {
        // console.log('🔐 [DEBUG] Gerando token de autenticação...');
        // console.log('📋 [DEBUG] Corpo da requisição:', JSON.stringify(req.body, null, 2));
        
        // Usar o valor do campo obrigatório da requisição ou um valor padrão
        const extraField = req.body['01K1259MAXE0TNRXV2C2WQN2MV'] || 'valor';
        
        // Verificar se as credenciais estão disponíveis
        const clientId = process.env.SYNCPAY_CLIENT_ID || '708ddc0b-357d-4548-b158-615684caa616';
        const clientSecret = process.env.SYNCPAY_CLIENT_SECRET || 'c08d40e5-3049-48c9-85c0-fd3cc6ca502c';
        
        if (!clientId || !clientSecret) {
            console.error('[Auth] Credenciais não configuradas');
            return res.status(500).json({
                message: 'Credenciais da API não configuradas',
                error: 'SYNCPAY_CLIENT_ID ou SYNCPAY_CLIENT_SECRET não definidos'
            });
        }
        
        const authData = {
            client_id: clientId,
            client_secret: clientSecret,
            '01K1259MAXE0TNRXV2C2WQN2MV': extraField
        };
        
        // console.log('📤 [DEBUG] Dados de autenticação:', { 
        //     client_id: authData.client_id,
        //     client_secret: '***',
        //     '01K1259MAXE0TNRXV2C2WQN2MV': extraField
        // });

        // console.log('🌐 [DEBUG] Fazendo requisição para:', 'https://api.syncpayments.com.br/api/partner/v1/auth-token');

        // Adicionar timeout e melhor tratamento de erro
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 segundos timeout

        try {
            const response = await fetch('https://api.syncpayments.com.br/api/partner/v1/auth-token', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'User-Agent': 'SyncPay-Integration/1.0'
                },
                body: JSON.stringify(authData),
                signal: controller.signal
            });
            
            clearTimeout(timeoutId);
            
            // console.log('📥 [DEBUG] Status da resposta:', response.status, response.statusText);
            // console.log('📋 [DEBUG] Headers da resposta:', Object.fromEntries(response.headers.entries()));

            if (!response.ok) {
                const errorText = await response.text();
                console.error('[Auth] Erro na autenticação:', response.status, errorText);
                
                // Tentar parsear como JSON se possível
                let errorData;
                try {
                    errorData = JSON.parse(errorText);
                } catch (e) {
                    errorData = { message: errorText };
                }
                
                return res.status(response.status).json({
                    message: 'Erro na autenticação com a API SyncPayments',
                    status: response.status,
                    statusText: response.statusText,
                    details: errorData
                });
            }

            const data = await response.json();
            // console.log('✅ [DEBUG] Token gerado com sucesso');
            // console.log('📋 [DEBUG] Resposta da API:', JSON.stringify(data, null, 2));
            
            // Validar se a resposta contém os campos obrigatórios
            if (!data.access_token) {
                console.error('[Auth] Token não encontrado na resposta');
                return res.status(500).json({
                    message: 'Resposta inválida da API',
                    error: 'access_token não encontrado na resposta'
                });
            }
            
            res.json(data);
            
        } catch (fetchError) {
            clearTimeout(timeoutId);
            
            if (fetchError.name === 'AbortError') {
                console.error('[Auth] Timeout na requisição para API externa');
                return res.status(504).json({
                    message: 'Timeout na conexão com a API SyncPayments',
                    error: 'A requisição demorou mais de 30 segundos'
                });
            }
            
            console.error('[Auth] Erro de rede:', fetchError.message);
            return res.status(503).json({
                message: 'Erro de conexão com a API SyncPayments',
                error: fetchError.message,
                type: 'NETWORK_ERROR'
            });
        }

        // console.log('📥 [DEBUG] Status da resposta:', response.status, response.statusText);
        // console.log('📋 [DEBUG] Headers da resposta:', Object.fromEntries(response.headers.entries()));

        if (!response.ok) {
            const errorText = await response.text();
            console.error('[Auth] Erro na autenticação:', response.status, errorText);
            
            // Tentar parsear como JSON se possível
            let errorData;
            try {
                errorData = JSON.parse(errorText);
            } catch (e) {
                errorData = { message: errorText };
            }
            
            return res.status(response.status).json({
                message: 'Erro na autenticação com a API SyncPayments',
                status: response.status,
                statusText: response.statusText,
                details: errorData
            });
        }

        const data = await response.json();
        // console.log('✅ [DEBUG] Token gerado com sucesso');
        // console.log('📋 [DEBUG] Resposta da API:', JSON.stringify(data, null, 2));
        
        // Validar se a resposta contém os campos obrigatórios
        if (!data.access_token) {
            console.error('[Auth] Token não encontrado na resposta');
            return res.status(500).json({
                message: 'Resposta inválida da API',
                error: 'access_token não encontrado na resposta'
            });
        }
        
        res.json(data);
    } catch (err) {
        console.error('[Auth] Erro ao obter token:', err.message);
        console.error('[Auth] Stack trace:', err.stack);
        
        res.status(500).json({
            message: 'Erro interno do servidor',
            error: err.message,
            type: err.name
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
        // console.log('💰 [DEBUG] Criando transação PIX:', req.body);
        const response = await syncpayPost('/cash-in', req.body);
        // console.log('✅ [DEBUG] Transação criada com sucesso:', response.data);
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
        // console.log('💸 [DEBUG] Criando saque PIX:', req.body);
        const response = await syncpayPost('/cash-out', req.body);
        // console.log('✅ [DEBUG] Saque criado com sucesso:', response.data);
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
        // console.log('🔍 [DEBUG] Consultando status da transação:', identifier);
        const response = await syncpayGet(`/transaction/${identifier}`);
        // console.log('✅ [DEBUG] Status obtido:', response.data);
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
        // console.log('👤 [DEBUG] Consultando dados do parceiro...');
        const response = await syncpayGet('/profile');
        // console.log('✅ [DEBUG] Dados do parceiro obtidos:', response.data);
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
        // console.log('🔗 [DEBUG] Listando webhooks...');
        const response = await syncpayGet('/webhooks');
        // console.log('✅ [DEBUG] Webhooks listados:', response.data);
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
        // console.log('🔗 [DEBUG] Criando webhook:', req.body);
        const response = await syncpayPost('/webhooks', req.body);
        // console.log('✅ [DEBUG] Webhook criado:', response.data);
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
        // console.log('🔗 [DEBUG] Atualizando webhook:', id, req.body);
        const response = await syncpayPost(`/webhooks/${id}`, req.body, { method: 'PUT' });
        // console.log('✅ [DEBUG] Webhook atualizado:', response.data);
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
        // console.log('🔗 [DEBUG] Deletando webhook:', id);
        const response = await syncpayPost(`/webhooks/${id}`, {}, { method: 'DELETE' });
        // console.log('✅ [DEBUG] Webhook deletado:', response.data);
        res.json(response.data);
    } catch (err) {
        console.error('[Webhooks] Erro ao deletar webhook:', err.response?.data || err.message);
        res.status(err.response?.status || 500).json({
            message: 'Não foi possível deletar o webhook',
            details: err.response?.data || err.message
        });
    }
});

// ===== ROTAS DO GATEWAY DE PAGAMENTO =====

// Rota para obter gateways disponíveis
app.get('/api/gateways', (req, res) => {
    try {
        const gateways = paymentGateway.getAvailableGateways();
        res.json({
            success: true,
            gateways: gateways,
            current: paymentGateway.getCurrentGateway()
        });
    } catch (error) {
        console.error('[Gateways] Erro ao listar gateways:', error.message);
        res.status(500).json({
            success: false,
            message: 'Erro ao listar gateways disponíveis',
            error: error.message
        });
    }
});

// Rota para alterar gateway
app.post('/api/gateways/switch', (req, res) => {
    try {
        const { gateway } = req.body;
        
        if (!gateway) {
            return res.status(400).json({
                success: false,
                message: 'Gateway deve ser especificado'
            });
        }

        paymentGateway.setGateway(gateway);
        
        res.json({
            success: true,
            message: `Gateway alterado para ${gateway}`,
            current: paymentGateway.getCurrentGateway()
        });
    } catch (error) {
        console.error('[Gateways] Erro ao alterar gateway:', error.message);
        res.status(500).json({
            success: false,
            message: 'Erro ao alterar gateway',
            error: error.message
        });
    }
});

// Rota para obter gateway atual
app.get('/api/gateways/current', (req, res) => {
    try {
        res.json({
            success: true,
            gateway: paymentGateway.getCurrentGateway()
        });
    } catch (error) {
        console.error('[Gateways] Erro ao obter gateway atual:', error.message);
        res.status(500).json({
            success: false,
            message: 'Erro ao obter gateway atual',
            error: error.message
        });
    }
});

// Rota para testar configuração dos gateways
app.get('/api/gateways/test', (req, res) => {
    try {
        const gateways = paymentGateway.getAvailableGateways();
        const currentGateway = paymentGateway.getCurrentGateway();
        
        res.json({
            success: true,
            message: 'Configuração dos gateways',
            current_gateway: currentGateway,
            gateways: gateways,
            environment_vars: {
                pushinpay_token: process.env.PUSHINPAY_TOKEN ? 'Configurado' : 'Não configurado',
                pushinpay_environment: process.env.PUSHINPAY_ENVIRONMENT || 'production (padrão)',
                syncpay_client_id: process.env.SYNCPAY_CLIENT_ID ? 'Configurado' : 'Usando padrão',
                syncpay_client_secret: process.env.SYNCPAY_CLIENT_SECRET ? 'Configurado' : 'Usando padrão'
            }
        });
    } catch (error) {
        console.error('[Gateways] Erro ao testar configuração:', error.message);
        res.status(500).json({
            success: false,
            message: 'Erro ao testar configuração dos gateways',
            error: error.message
        });
    }
});

// ===== ROTAS DE PAGAMENTO UNIFICADAS =====

// Rota para criar pagamento PIX (funciona com ambos os gateways)
app.post('/api/payments/pix/create', async (req, res) => {
    try {
        console.log('💰 [DEBUG] Criando pagamento PIX...');
        console.log('📋 [DEBUG] Dados recebidos:', JSON.stringify(req.body, null, 2));
        
        // Validar dados do pagamento
        paymentGateway.validatePaymentData(req.body);
        
        const paymentResult = await paymentGateway.createPixPayment(req.body);
        
        console.log('✅ [DEBUG] Pagamento criado com sucesso:', paymentResult);
        
        res.json({
            success: true,
            message: 'Pagamento PIX criado com sucesso',
            gateway: paymentGateway.getCurrentGateway(),
            data: paymentResult
        });
    } catch (error) {
        console.error('❌ [DEBUG] Erro ao criar pagamento PIX:', error.message);
        res.status(error.response?.status || 500).json({
            success: false,
            message: 'Erro ao criar pagamento PIX',
            gateway: paymentGateway.getCurrentGateway(),
            error: error.response?.data || error.message
        });
    }
});

// Rota para consultar status do pagamento
app.get('/api/payments/:paymentId/status', async (req, res) => {
    try {
        const { paymentId } = req.params;
        console.log(`🔍 [DEBUG] Consultando status do pagamento ${paymentId}...`);
        
        const statusResult = await paymentGateway.getPaymentStatus(paymentId);
        
        console.log('✅ [DEBUG] Status consultado com sucesso:', statusResult);
        
        res.json({
            success: true,
            message: 'Status do pagamento consultado com sucesso',
            gateway: paymentGateway.getCurrentGateway(),
            data: statusResult
        });
    } catch (error) {
        console.error('❌ [DEBUG] Erro ao consultar status:', error.message);
        res.status(error.response?.status || 500).json({
            success: false,
            message: 'Erro ao consultar status do pagamento',
            gateway: paymentGateway.getCurrentGateway(),
            error: error.response?.data || error.message
        });
    }
});

// Rota para listar pagamentos
app.get('/api/payments', async (req, res) => {
    try {
        const filters = req.query;
        console.log('📋 [DEBUG] Listando pagamentos com filtros:', filters);
        
        const paymentsResult = await paymentGateway.listPayments(filters);
        
        console.log('✅ [DEBUG] Pagamentos listados com sucesso');
        
        res.json({
            success: true,
            message: 'Pagamentos listados com sucesso',
            gateway: paymentGateway.getCurrentGateway(),
            data: paymentsResult
        });
    } catch (error) {
        console.error('❌ [DEBUG] Erro ao listar pagamentos:', error.message);
        res.status(error.response?.status || 500).json({
            success: false,
            message: 'Erro ao listar pagamentos',
            gateway: paymentGateway.getCurrentGateway(),
            error: error.response?.data || error.message
        });
    }
});

// Rota de teste para verificar se o servidor está funcionando
app.get('/api/health', (req, res) => {
    res.json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        message: 'Servidor funcionando corretamente',
        currentGateway: paymentGateway.getCurrentGateway()
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
