/**
 * Webhook Handler para SyncPayments
 * Gerencia os webhooks recebidos da API SyncPayments
 */

const express = require('express');
const crypto = require('crypto');
const { getConfig } = require('./loadConfig');

// Configuração da UTMify
const UTMIFY_CONFIG = {
    API_KEY: 'w4YfjBN1hnS52snJs97wZ0Ii46ef4Um3wsK1',
    BASE_URL: 'https://api.utmify.com.br',
    ENDPOINTS: {
        orders: '/api-credentials/orders'
    }
};

class WebhookHandler {
    constructor() {
        const cfg = getConfig();
        this.webhookSecret = cfg.webhook?.secret || 'default_secret';
    }

    /**
     * Recuperar parâmetros UTM dos dados armazenados
     */
    async getUtmParameters(orderId) {
        try {
            const fs = require('fs');
            const path = require('path');
            const orderDetailsPath = path.join(__dirname, 'order_details.json');
            
            if (fs.existsSync(orderDetailsPath)) {
                const orderDetails = JSON.parse(fs.readFileSync(orderDetailsPath, 'utf8'));
                if (orderDetails.trackingParameters) {
                    console.log('📊 Parâmetros UTM recuperados:', orderDetails.trackingParameters);
                    return orderDetails.trackingParameters;
                }
            }
            
            // Tentar recuperar do localStorage do navegador (se disponível)
            console.log('⚠️ Parâmetros UTM não encontrados nos dados armazenados');
            return null;
        } catch (error) {
            console.error('❌ Erro ao recuperar parâmetros UTM:', error.message);
            return null;
        }
    }

    /**
     * Enviar dados de venda para UTMify
     */
    async sendToUtmify(orderData) {
        try {
            console.log('📤 Enviando dados para UTMify...');
            
            // Recuperar parâmetros UTM dos dados armazenados
            const utmParams = await this.getUtmParameters(orderData.id || orderData.orderId);
            
            // Preparar dados para UTMify conforme schema da API
            const utmifyData = {
                orderId: orderData.id || orderData.orderId || 'TEST-' + Date.now(),
                paymentMethod: orderData.paymentMethod || 'pix',
                status: 'paid', // UTMify espera: waiting_payment, paid, refused, refunded, chargedback
                createdAt: orderData.createdAt || new Date().toISOString(),
                approvedDate: orderData.approvedDate || new Date().toISOString(),
                platform: orderData.platform || 'SyncPay',
                customer: {
                    name: orderData.customer?.name || 'Cliente Teste',
                    email: orderData.customer?.email || 'teste@exemplo.com',
                    phone: orderData.customer?.phone || '11999999999',
                    document: orderData.customer?.document || null
                },
                trackingParameters: {
                    utm_campaign: utmParams?.utm_campaign || orderData.trackingParameters?.utm_campaign || null,
                    utm_content: utmParams?.utm_content || orderData.trackingParameters?.utm_content || null,
                    utm_medium: utmParams?.utm_medium || orderData.trackingParameters?.utm_medium || null,
                    utm_source: utmParams?.utm_source || orderData.trackingParameters?.utm_source || null,
                    utm_term: utmParams?.utm_term || orderData.trackingParameters?.utm_term || null
                },
                commission: {
                    totalPriceInCents: orderData.products?.[0]?.priceInCents || 1990,
                    gatewayFeeInCents: Math.round((orderData.products?.[0]?.priceInCents || 1990) * 0.05), // 5% taxa
                    userCommissionInCents: Math.round((orderData.products?.[0]?.priceInCents || 1990) * 0.95) // 95% para usuário
                },
                product: {
                    id: orderData.products?.[0]?.id || 'prod_assinatura_mensal',
                    planId: orderData.products?.[0]?.planId || 'plan_mensal_001',
                    planName: orderData.products?.[0]?.planName || 'Assinatura Mensal',
                    name: orderData.products?.[0]?.name || 'Assinatura Mensal',
                    priceInCents: orderData.products?.[0]?.priceInCents || 1990,
                    quantity: 1
                }
            };

            console.log('📋 Dados UTMify:', JSON.stringify(utmifyData, null, 2));

            const response = await fetch(`${UTMIFY_CONFIG.BASE_URL}${UTMIFY_CONFIG.ENDPOINTS.orders}`, {
                method: 'POST',
                headers: {
                    'x-api-token': UTMIFY_CONFIG.API_KEY,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(utmifyData)
            });

            if (response.ok) {
                const responseData = await response.json();
                console.log('✅ Dados enviados para UTMify com sucesso:', responseData);
                return { success: true, data: responseData };
            } else {
                const errorData = await response.text();
                console.error('❌ Erro ao enviar para UTMify:', response.status, errorData);
                return { success: false, error: `HTTP ${response.status}: ${errorData}` };
            }
        } catch (error) {
            console.error('❌ Erro ao enviar para UTMify:', error.message);
            return { success: false, error: error.message };
        }
    }

    /**
     * Middleware para verificar assinatura do webhook
     */
    verifySignature(req, res, next) {
        const signature = req.headers['x-syncpay-signature'];
        const payload = JSON.stringify(req.body);
        
        if (!signature) {
            console.warn('⚠️ Webhook sem assinatura recebido');
            return res.status(401).json({ error: 'Assinatura não fornecida' });
        }

        const expectedSignature = crypto
            .createHmac('sha256', this.webhookSecret)
            .update(payload)
            .digest('hex');

        if (signature !== expectedSignature) {
            console.warn('⚠️ Assinatura de webhook inválida');
            return res.status(401).json({ error: 'Assinatura inválida' });
        }

        console.log('✅ Assinatura de webhook válida');
        next();
    }

    /**
     * Processar webhook de criação de cash-in
     */
    handleCashInCreate(req, res) {
        try {
            const { data } = req.body;
            const event = req.headers['event'] || 'cashin.create';

            console.log('🔔 Webhook Cash-In Create recebido:', {
                event,
                transactionId: data.id,
                amount: data.amount,
                status: data.status,
                client: data.client.name
            });

            // Aqui você pode implementar sua lógica de negócio
            // Por exemplo: atualizar banco de dados, enviar notificação, etc.
            
            this.processCashInEvent(data, event);

            res.status(200).json({ received: true });
        } catch (error) {
            console.error('❌ Erro ao processar webhook cash-in create:', error);
            res.status(500).json({ error: 'Erro interno do servidor' });
        }
    }

    /**
     * Processar webhook de atualização de cash-in
     */
    handleCashInUpdate(req, res) {
        try {
            const { data } = req.body;
            const event = req.headers['event'] || 'cashin.update';

            console.log('🔔 Webhook Cash-In Update recebido:', {
                event,
                transactionId: data.id,
                amount: data.amount,
                status: data.status,
                client: data.client.name
            });

            // Aqui você pode implementar sua lógica de negócio
            this.processCashInEvent(data, event);

            res.status(200).json({ received: true });
        } catch (error) {
            console.error('❌ Erro ao processar webhook cash-in update:', error);
            res.status(500).json({ error: 'Erro interno do servidor' });
        }
    }

    /**
     * Processar webhook de criação de cash-out
     */
    handleCashOutCreate(req, res) {
        try {
            const { data } = req.body;
            const event = req.headers['event'] || 'cashout.create';

            console.log('🔔 Webhook Cash-Out Create recebido:', {
                event,
                transactionId: data.id,
                amount: data.amount,
                status: data.status,
                pixKey: data.pix_key
            });

            // Aqui você pode implementar sua lógica de negócio
            this.processCashOutEvent(data, event);

            res.status(200).json({ received: true });
        } catch (error) {
            console.error('❌ Erro ao processar webhook cash-out create:', error);
            res.status(500).json({ error: 'Erro interno do servidor' });
        }
    }

    /**
     * Processar webhook de atualização de cash-out
     */
    handleCashOutUpdate(req, res) {
        try {
            const { data } = req.body;
            const event = req.headers['event'] || 'cashout.update';

            console.log('🔔 Webhook Cash-Out Update recebido:', {
                event,
                transactionId: data.id,
                amount: data.amount,
                status: data.status,
                pixKey: data.pix_key
            });

            // Aqui você pode implementar sua lógica de negócio
            this.processCashOutEvent(data, event);

            res.status(200).json({ received: true });
        } catch (error) {
            console.error('❌ Erro ao processar webhook cash-out update:', error);
            res.status(500).json({ error: 'Erro interno do servidor' });
        }
    }

    /**
     * Processar eventos de cash-in
     */
    processCashInEvent(data, event) {
        console.log(`🔄 Processando evento ${event} para cash-in ${data.id}`);

        switch (data.status) {
            case 'pending':
                console.log('⏳ Transação pendente - aguardando pagamento');
                // Implementar lógica para transação pendente
                break;
            
            case 'completed':
                console.log('✅ Transação completada - pagamento confirmado');
                // Implementar lógica para transação completada
                // Ex: liberar produto, enviar confirmação, etc.
                
                // Enviar dados para UTMify
                this.sendToUtmify(data).then(result => {
                    if (result.success) {
                        console.log('🎯 UTMify: Dados de conversão enviados com sucesso');
                    } else {
                        console.error('🎯 UTMify: Erro ao enviar dados:', result.error);
                    }
                });
                break;
            
            case 'failed':
                console.log('❌ Transação falhou - pagamento não realizado');
                // Implementar lógica para transação falhada
                break;
            
            case 'refunded':
                console.log('↩️ Transação estornada - reembolso realizado');
                // Implementar lógica para transação estornada
                break;
            
            case 'med':
                console.log('⚠️ Transação em análise - MED');
                // Implementar lógica para transação em análise
                break;
            
            default:
                console.log(`❓ Status desconhecido: ${data.status}`);
        }
    }

    /**
     * Processar eventos de cash-out
     */
    processCashOutEvent(data, event) {
        console.log(`🔄 Processando evento ${event} para cash-out ${data.id}`);

        switch (data.status) {
            case 'pending':
                console.log('⏳ Saque pendente - aguardando processamento');
                // Implementar lógica para saque pendente
                break;
            
            case 'completed':
                console.log('✅ Saque completado - transferência realizada');
                // Implementar lógica para saque completado
                break;
            
            case 'failed':
                console.log('❌ Saque falhou - transferência não realizada');
                // Implementar lógica para saque falhado
                break;
            
            case 'refunded':
                console.log('↩️ Saque estornado - reembolso realizado');
                // Implementar lógica para saque estornado
                break;
            
            case 'med':
                console.log('⚠️ Saque em análise - MED');
                // Implementar lógica para saque em análise
                break;
            
            default:
                console.log(`❓ Status desconhecido: ${data.status}`);
        }
    }

    /**
     * Configurar rotas de webhook
     */
    setupRoutes(app) {
        // Middleware para verificar assinatura em todas as rotas de webhook
        app.use('/webhooks/syncpay', this.verifySignature.bind(this));

        // Rotas de webhook
        app.post('/webhooks/syncpay/cashin/create', this.handleCashInCreate.bind(this));
        app.post('/webhooks/syncpay/cashin/update', this.handleCashInUpdate.bind(this));
        app.post('/webhooks/syncpay/cashout/create', this.handleCashOutCreate.bind(this));
        app.post('/webhooks/syncpay/cashout/update', this.handleCashOutUpdate.bind(this));

        // Rota genérica para todos os webhooks (legacy)
        app.post('/webhooks/syncpay', (req, res) => {
            const event = req.headers['event'];
            
            if (event === 'cashin.create') {
                this.handleCashInCreate(req, res);
            } else if (event === 'cashin.update') {
                this.handleCashInUpdate(req, res);
            } else if (event === 'cashout.create') {
                this.handleCashOutCreate(req, res);
            } else if (event === 'cashout.update') {
                this.handleCashOutUpdate(req, res);
            } else {
                console.log('🔔 Webhook genérico recebido:', event);
                res.status(200).json({ received: true });
            }
        });

        console.log('🔗 Rotas de webhook configuradas:');
        console.log('  - POST /webhooks/syncpay/cashin/create');
        console.log('  - POST /webhooks/syncpay/cashin/update');
        console.log('  - POST /webhooks/syncpay/cashout/create');
        console.log('  - POST /webhooks/syncpay/cashout/update');
        console.log('  - POST /webhooks/syncpay (genérico)');
    }
}

module.exports = WebhookHandler;
