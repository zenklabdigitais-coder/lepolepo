/**
 * Integração UTMify - Sistema de Rastreamento e Conversão
 * Autor: Sistema Integrado
 * Data: 2024
 * 
 * Este arquivo gerencia:
 * - Envio de eventos initiate_checkout (PIX gerado)
 * - Envio de eventos purchase (PIX pago)
 * - Captura e preservação de UTMs
 * - Preservação de FBP e FBC nos redirects
 */

const axios = require('axios');

class UTMifyIntegration {
    constructor() {
        this.apiCredential = 'jUEJdzWereOOr25YBXhEfH0d2RZ4MG4CyAyF';
        this.apiEndpoint = 'https://api.utmify.com.br/api-credentials/orders';
        this.platform = 'LepolepoCheckout';
        
        console.log('🎯 UTMify Integration inicializada');
    }

    /**
     * Enviar evento de initiate_checkout (PIX gerado)
     */
    async sendInitiateCheckout(orderData) {
        try {
            console.log('🛒 Enviando evento initiate_checkout para UTMify...');
            
            const utmifyPayload = this.buildUTMifyPayload(orderData, 'waiting_payment');
            
            const response = await axios.post(this.apiEndpoint, utmifyPayload, {
                headers: {
                    'Content-Type': 'application/json',
                    'x-api-token': this.apiCredential
                }
            });

            console.log('✅ Initiate checkout enviado com sucesso:', response.data);
            return response.data;

        } catch (error) {
            console.error('❌ Erro ao enviar initiate_checkout:', error.response?.data || error.message);
            throw error;
        }
    }

    /**
     * Enviar evento de purchase (PIX pago)
     */
    async sendPurchase(orderData) {
        try {
            console.log('💰 Enviando evento purchase para UTMify...');
            
            const utmifyPayload = this.buildUTMifyPayload(orderData, 'paid');
            
            const response = await axios.post(this.apiEndpoint, utmifyPayload, {
                headers: {
                    'Content-Type': 'application/json',
                    'x-api-token': this.apiCredential
                }
            });

            console.log('✅ Purchase enviado com sucesso:', response.data);
            return response.data;

        } catch (error) {
            console.error('❌ Erro ao enviar purchase:', error.response?.data || error.message);
            throw error;
        }
    }

    /**
     * Construir payload para API UTMify
     */
    buildUTMifyPayload(orderData, status) {
        const now = new Date();
        const utcTimestamp = now.toISOString().replace('T', ' ').substring(0, 19);
        
        // Calcular valores em centavos
        const totalPriceInCents = Math.round(orderData.amount * 100);
        const gatewayFeeInCents = Math.round((orderData.amount * 0.05) * 100); // 5% taxa estimada
        const userCommissionInCents = totalPriceInCents - gatewayFeeInCents;

        return {
            orderId: orderData.orderId || orderData.id,
            platform: this.platform,
            paymentMethod: 'pix',
            status: status,
            createdAt: utcTimestamp,
            approvedDate: status === 'paid' ? utcTimestamp : null,
            refundedAt: null,
            customer: {
                name: orderData.customer?.name || 'Cliente',
                email: orderData.customer?.email || 'cliente@exemplo.com',
                phone: orderData.customer?.phone || null,
                document: orderData.customer?.document || null,
                country: 'BR',
                ip: orderData.customer?.ip || null
            },
            products: [{
                id: orderData.productId || 'assinatura-premium',
                name: orderData.productName || 'Assinatura Premium',
                planId: orderData.planId || null,
                planName: orderData.planName || null,
                quantity: 1,
                priceInCents: totalPriceInCents
            }],
            trackingParameters: {
                src: orderData.utmParams?.src || null,
                sck: orderData.utmParams?.sck || null,
                utm_source: orderData.utmParams?.utm_source || null,
                utm_campaign: orderData.utmParams?.utm_campaign || null,
                utm_medium: orderData.utmParams?.utm_medium || null,
                utm_content: orderData.utmParams?.utm_content || null,
                utm_term: orderData.utmParams?.utm_term || null
            },
            commission: {
                totalPriceInCents: totalPriceInCents,
                gatewayFeeInCents: gatewayFeeInCents,
                userCommissionInCents: userCommissionInCents,
                currency: 'BRL'
            },
            isTest: false
        };
    }

    /**
     * Extrair parâmetros UTM de URL
     */
    extractUTMParams(url) {
        try {
            const urlObj = new URL(url);
            const params = urlObj.searchParams;
            
            return {
                src: params.get('src'),
                sck: params.get('sck'),
                utm_source: params.get('utm_source'),
                utm_campaign: params.get('utm_campaign'),
                utm_medium: params.get('utm_medium'),
                utm_content: params.get('utm_content'),
                utm_term: params.get('utm_term'),
                fbp: params.get('fbp'),
                fbc: params.get('fbc')
            };
        } catch (error) {
            console.error('❌ Erro ao extrair parâmetros UTM:', error.message);
            return {};
        }
    }

    /**
     * Processar webhook de PIX criado
     */
    async handlePixCreated(pixData, utmParams = {}) {
        const orderData = {
            orderId: pixData.id,
            amount: pixData.value ? pixData.value / 100 : 0, // Converter de centavos para reais
            productId: 'assinatura-premium',
            productName: 'Assinatura Premium',
            customer: {
                name: pixData.customer_name || 'Cliente',
                email: pixData.customer_email || 'cliente@exemplo.com',
                phone: pixData.customer_phone,
                document: pixData.customer_document,
                ip: pixData.customer_ip
            },
            utmParams: utmParams
        };

        return await this.sendInitiateCheckout(orderData);
    }

    /**
     * Processar webhook de PIX pago
     */
    async handlePixPaid(pixData, utmParams = {}) {
        const orderData = {
            orderId: pixData.id,
            amount: pixData.value ? pixData.value / 100 : 0,
            productId: 'assinatura-premium',
            productName: 'Assinatura Premium',
            customer: {
                name: pixData.payer_name || pixData.customer_name || 'Cliente',
                email: pixData.customer_email || 'cliente@exemplo.com',
                phone: pixData.customer_phone,
                document: pixData.payer_national_registration || pixData.customer_document,
                ip: pixData.customer_ip
            },
            utmParams: utmParams
        };

        return await this.sendPurchase(orderData);
    }

    /**
     * Processar webhook de reembolso
     */
    async handlePixRefunded(pixData, utmParams = {}) {
        try {
            console.log('🔄 Enviando evento de reembolso para UTMify...');
            
            const orderData = {
                orderId: pixData.id,
                amount: pixData.value ? pixData.value / 100 : 0,
                productId: 'assinatura-premium',
                productName: 'Assinatura Premium',
                customer: {
                    name: pixData.payer_name || pixData.customer_name || 'Cliente',
                    email: pixData.customer_email || 'cliente@exemplo.com',
                    phone: pixData.customer_phone,
                    document: pixData.payer_national_registration || pixData.customer_document,
                    ip: pixData.customer_ip
                },
                utmParams: utmParams
            };

            const utmifyPayload = this.buildUTMifyPayload(orderData, 'refunded');
            utmifyPayload.refundedAt = new Date().toISOString().replace('T', ' ').substring(0, 19);
            
            const response = await axios.post(this.apiEndpoint, utmifyPayload, {
                headers: {
                    'Content-Type': 'application/json',
                    'x-api-token': this.apiCredential
                }
            });

            console.log('✅ Reembolso enviado com sucesso:', response.data);
            return response.data;

        } catch (error) {
            console.error('❌ Erro ao enviar reembolso:', error.response?.data || error.message);
            throw error;
        }
    }

    /**
     * Testar integração com dados simulados
     */
    async testIntegration() {
        console.log('🧪 Testando integração UTMify...');
        
        const mockUTMParams = {
            utm_source: 'facebook',
            utm_campaign: 'campanha_teste',
            utm_medium: 'social',
            utm_content: 'video_promocional',
            utm_term: 'assinatura_premium'
        };

        const mockPixData = {
            id: 'test-' + Date.now(),
            value: 1990, // R$ 19,90 em centavos
            customer_name: 'João da Silva',
            customer_email: 'joao@teste.com',
            customer_phone: '11999999999',
            customer_document: '12345678901',
            customer_ip: '192.168.1.1'
        };

        try {
            // Testar initiate_checkout
            await this.handlePixCreated(mockPixData, mockUTMParams);
            
            // Aguardar 2 segundos e testar purchase
            setTimeout(async () => {
                await this.handlePixPaid(mockPixData, mockUTMParams);
            }, 2000);

            console.log('✅ Teste de integração concluído com sucesso');
            
        } catch (error) {
            console.error('❌ Erro no teste de integração:', error.message);
        }
    }
}

module.exports = UTMifyIntegration;
