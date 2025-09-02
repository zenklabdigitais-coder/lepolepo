(function($){
    function attachPlanHandler(buttonId, planKey){
        $(buttonId).on('click', async function(){
            if (!window.syncPay) {
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
                window.syncPay.showLoading();
                const transaction = await window.syncPay.createPixTransaction(plan.price, plan.description);
                $(this).data('pixTransaction', transaction);
                alert('PIX gerado com sucesso!');
            } catch (err) {
                console.error(err);
                alert('Erro ao gerar PIX.');
            } finally {
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
        attachPlanHandler('#btn-1-mes', 'monthly');
        attachPlanHandler('#btn-3-meses', 'quarterly');
        attachPlanHandler('#btn-6-meses', 'semestrial');
    });
})(jQuery);
