/**
 * Webhook Handler para PushinPay
 * Gerencia os webhooks recebidos da API PushinPay
 */

const express = require('express');

// Configuração da UTMify
const UTMIFY_CONFIG = {
    API_KEY: '6EPVqN7rtImQQOHcH1AAm0Txy6bq1stHWKlB',
    BASE_URL: 'https://api.utmify.com.br',
    ENDPOINTS: {
        orders: '/api-credentials/orders'
    }
};

class PushinPayWebhookHandler {
    constructor() {
        console.log('🔔 PushinPay Webhook Handler inicializado');
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
            const utmParams = await this.getUtmParameters(orderData.id);
            
            // Preparar dados para UTMify (formato PushinPay)
            const utmifyData = {
                orderId: orderData.id || 'TEST-' + Date.now(),
                paymentMethod: 'pix',
                status: 'paid', // UTMify espera: waiting_payment, paid, refused, refunded, chargedback
                createdAt: new Date().toISOString(),
                approvedDate: new Date().toISOString(),
                platform: 'PushinPay',
                customer: {
                    name: orderData.payer_name || 'Cliente Teste',
                    email: orderData.payer_email || 'teste@exemplo.com',
                    phone: orderData.payer_phone || '11999999999',
                    document: null
                },
                trackingParameters: {
                    utm_campaign: utmParams?.utm_campaign || orderData.utm_campaign || null,
                    utm_content: utmParams?.utm_content || orderData.utm_content || null,
                    utm_medium: utmParams?.utm_medium || orderData.utm_medium || null,
                    utm_source: utmParams?.utm_source || orderData.utm_source || null,
                    utm_term: utmParams?.utm_term || orderData.utm_term || null
                },
                commission: {
                    totalPriceInCents: orderData.value || 1990,
                    gatewayFeeInCents: Math.round((orderData.value || 1990) * 0.05), // 5% taxa
                    userCommissionInCents: Math.round((orderData.value || 1990) * 0.95) // 95% para usuário
                },
                product: {
                    id: 'prod_pushinpay_001',
                    planId: 'plan_pushinpay_001',
                    planName: 'Produto PushinPay',
                    name: 'Produto PushinPay',
                    priceInCents: orderData.value || 1990,
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
     * Processar webhook da PushinPay
     * Conforme documentação: webhook é enviado quando status é alterado
     */
    handleWebhook(req, res) {
        try {
            console.log('🔔 Webhook PushinPay recebido');
            console.log('📋 Headers:', JSON.stringify(req.headers, null, 2));
            console.log('📦 Body:', JSON.stringify(req.body, null, 2));

            const webhookData = req.body;

            // Validar estrutura do webhook
            if (!webhookData || !webhookData.id) {
                console.error('❌ Webhook inválido - sem ID da transação');
                return res.status(400).json({ 
                    error: 'Webhook inválido',
                    message: 'ID da transação não encontrado'
                });
            }

            // Processar webhook baseado no status
            this.processWebhookByStatus(webhookData);

            // Confirmar recebimento (importante para evitar reenvios)
            res.status(200).json({ 
                success: true,
                message: 'Webhook processado com sucesso',
                transaction_id: webhookData.id
            });

        } catch (error) {
            console.error('❌ Erro ao processar webhook PushinPay:', error.message);
            res.status(500).json({ 
                error: 'Erro interno',
                message: 'Falha ao processar webhook'
            });
        }
    }

    /**
     * Processar webhook baseado no status da transação
     */
    processWebhookByStatus(webhookData) {
        const { id, status, value, payer_name, payer_national_registration, end_to_end_id } = webhookData;

        console.log(`📊 Processando webhook para transação ${id} com status: ${status}`);

        switch (status) {
            case 'created':
                this.handleCreatedStatus(webhookData);
                break;
            
            case 'paid':
                this.handlePaidStatus(webhookData);
                break;
            
            case 'expired':
                this.handleExpiredStatus(webhookData);
                break;
            
            default:
                console.warn(`⚠️ Status desconhecido recebido: ${status}`);
                this.handleUnknownStatus(webhookData);
        }
    }

    /**
     * Processar status 'created'
     */
    handleCreatedStatus(webhookData) {
        console.log('✅ PIX criado:', {
            id: webhookData.id,
            value: webhookData.value,
            qr_code: webhookData.qr_code ? 'Presente' : 'Ausente'
        });

        // Aqui você pode:
        // - Atualizar banco de dados local
        // - Notificar o usuário que o PIX foi criado
        // - Enviar email/SMS com QR Code
        // - Log para auditoria
    }

    /**
     * Processar status 'paid'
     */
    handlePaidStatus(webhookData) {
        console.log('💰 PIX pago:', {
            id: webhookData.id,
            value: webhookData.value,
            payer_name: webhookData.payer_name,
            payer_document: webhookData.payer_national_registration,
            end_to_end_id: webhookData.end_to_end_id
        });

        // Aqui você pode:
        // - Confirmar pagamento no sistema
        // - Liberar produto/serviço
        // - Enviar confirmação ao cliente
        // - Processar split_rules se houver
        // - Atualizar estoque
        // - Enviar nota fiscal
        
        // Enviar dados para UTMify
        this.sendToUtmify(webhookData).then(result => {
            if (result.success) {
                console.log('🎯 UTMify: Dados de conversão enviados com sucesso');
            } else {
                console.error('🎯 UTMify: Erro ao enviar dados:', result.error);
            }
        });
    }

    /**
     * Processar status 'expired'
     */
    handleExpiredStatus(webhookData) {
        console.log('⏰ PIX expirado:', {
            id: webhookData.id,
            value: webhookData.value
        });

        // Aqui você pode:
        // - Marcar transação como expirada
        // - Notificar cliente sobre expiração
        // - Liberar estoque reservado
        // - Log para relatórios
    }

    /**
     * Processar status desconhecido
     */
    handleUnknownStatus(webhookData) {
        console.log('❓ Status desconhecido:', {
            id: webhookData.id,
            status: webhookData.status,
            data: webhookData
        });

        // Log para investigação
    }

    /**
     * Middleware para validar webhook (opcional)
     * A PushinPay permite headers customizados para autenticação
     */
    validateWebhook(req, res, next) {
        // Implementar validação se necessário
        // Exemplo: verificar header customizado configurado no painel PushinPay
        
        const customHeader = req.headers['x-pushinpay-signature'];
        if (customHeader) {
            // Validar assinatura customizada
            console.log('🔐 Header customizado detectado:', customHeader);
        }

        next();
    }

    /**
     * Configurar rotas do webhook
     */
    setupRoutes(app) {
        // Rota principal do webhook
        app.post('/webhook/pushinpay', 
            this.validateWebhook.bind(this),
            this.handleWebhook.bind(this)
        );

        console.log('🛣️ Rota do webhook PushinPay configurada: POST /webhook/pushinpay');
    }

    /**
     * Testar webhook com dados simulados
     */
    testWebhook() {
        console.log('🧪 Testando webhook PushinPay com dados simulados');

        const mockWebhookData = {
            id: "9c29870c-9f69-4bb6-90d3-2dce9453bb45",
            qr_code: "00020101021226770014BR.GOV.BCB.PIX2555api...",
            status: "paid",
            value: 1000,
            webhook_url: "http://localhost:3000/webhook/pushinpay",
            qr_code_base64: "data:image/png;base64,iVBORw0KGgoAA.....",
            webhook: null,
            split_rules: [],
            end_to_end_id: "E12345678202412071234567890123456",
            payer_name: "João da Silva",
            payer_national_registration: "12345678901"
        };

        this.processWebhookByStatus(mockWebhookData);
    }
}

module.exports = PushinPayWebhookHandler;