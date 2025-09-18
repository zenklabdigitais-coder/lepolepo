(function($){
    function attachPlanHandler(buttonId, planKey){
        $(buttonId).on('click', async function(){
            // Verificar se a integração universal está disponível
            if (!window.syncPay && !window.universalPayment) {
                alert('Serviço de pagamento indisponível.');
                return;
            }

            const plans = window.SYNCPAY_CONFIG && window.SYNCPAY_CONFIG.plans;
            const plan = plans && plans[planKey];
            if (!plan) {
                alert('Plano não encontrado.');
                return;
            }

            try {
                // Definir o plano atual para redirecionamento
                window.currentPaymentPlan = planKey;
                
                // 🎯 DISPARAR EVENTO INITIATE_CHECKOUT DA UTMIFY
                if (window.utmify && typeof window.utmify.track === 'function') {
                    window.utmify.track('InitiateCheckout', {
                        value: plan.price,
                        currency: 'BRL',
                        content_name: plan.description,
                        content_category: 'subscription'
                    });
                    console.log('✅ Evento InitiateCheckout disparado para UTMify');
                }
                
                // Usar a integração universal que detecta o gateway automaticamente
                const paymentService = window.universalPayment || window.syncPay;
                
                // Mostrar loading com informação do gateway atual
                if (paymentService.showLoading) {
                    paymentService.showLoading();
                }
                
                // Dados do cliente padrão (pode ser expandido para coletar dados reais)
                const clientData = {
                    name: 'Cliente',
                    cpf: '12345678901',
                    email: 'cliente@exemplo.com',
                    phone: '11999999999'
                };
                
                const transaction = await paymentService.createPixTransaction(plan.price, plan.description, clientData);
                $(this).data('pixTransaction', transaction);
                
                // Mostrar modal com o PIX gerado
                if (paymentService.showPixModal && transaction.pix_code) {
                    paymentService.showPixModal(transaction);
                } else {
                    alert(`PIX gerado com sucesso via ${transaction.gateway?.toUpperCase() || 'Gateway'}!`);
                }
                
            } catch (err) {
                console.error('Erro ao gerar PIX:', err);
                alert(`Erro ao gerar PIX: ${err.message}`);
            } finally {
                // Fechar loading
                if (typeof swal !== 'undefined') {
                    try {
                        swal.close();
                    } catch (error) {
                        console.warn('Erro ao fechar SweetAlert:', error);
                    }
                } else {
                    $('#nativeLoading').remove();
                }
            }
        });
    }

    $(function(){
        // Aguardar um pouco para garantir que as integrações estejam carregadas
        setTimeout(() => {
            attachPlanHandler('#btn-1-mes', 'monthly');
            attachPlanHandler('#btn-3-meses', 'quarterly');
            attachPlanHandler('#btn-6-meses', 'semestrial');
            console.log('🔧 Handlers dos botões PIX configurados com integração universal');
        }, 100);
    });
})(jQuery);
