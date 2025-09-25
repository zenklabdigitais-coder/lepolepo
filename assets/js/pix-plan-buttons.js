(function($){
    function attachPlanHandler(buttonId, planKey){
        $(buttonId).on('click', async function(){
            const plans = window.SYNCPAY_CONFIG && window.SYNCPAY_CONFIG.plans;
            const plan = plans && plans[planKey];
            if (!plan) {
                alert('Plano não encontrado.');
                return;
            }

            try {
                // Definir o plano atual para redirecionamento
                window.currentPaymentPlan = planKey;
                
                // ✅ CORREÇÃO: Mostrar Order Bump PRIMEIRO (não gerar PIX ainda)
                window.showPaymentModal({
                    amount: plan.price,
                    description: plan.description,
                    planKey: planKey,
                    skipOrderBump: false  // ← Garante que Order Bump seja exibido primeiro
                });
                
                console.log('🛒 Order Bump exibido para plano:', planKey, 'Valor:', plan.price);
                
            } catch (err) {
                console.error('Erro ao abrir Order Bump:', err);
                alert(`Erro ao abrir checkout: ${err.message}`);
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
