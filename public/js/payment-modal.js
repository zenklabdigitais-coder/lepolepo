/**
 * MODAL DE PAGAMENTO
 * Exibe tela de pagamento conforme design das imagens
 */

class PaymentModal {
    constructor() {
        this.modal = null;
        this.overlay = null;
        this.isOpen = false;
        this.currentTransaction = null;
        this.statusCheckInterval = null;
        this.init();
    }

    init() {
        this.createModalHTML();
        this.bindEvents();
    }

    createModalHTML() {
        // Criar overlay
        this.overlay = document.createElement('div');
        this.overlay.className = 'payment-modal-overlay';
        this.overlay.id = 'paymentModalOverlay';

        // Criar modal
        this.modal = document.createElement('div');
        this.modal.className = 'payment-modal';
        this.modal.id = 'paymentModal';

        this.modal.innerHTML = `
            <div class="payment-modal-header">
                <button class="payment-modal-close" id="paymentModalClose">
                    ×
                </button>
                <div class="payment-profile">
                    <div class="payment-profile-avatar">
                        <img src="images/perfil.jpg" alt="Perfil">
                    </div>
                    <div class="payment-profile-info">
                        <h3>Stella Beghini</h3>
                        <p>@stella_beghini</p>
                    </div>
                </div>
            </div>
            
            <div class="payment-modal-body">
                <div class="payment-benefits">
                    <h4>Benefícios Exclusivos</h4>
                    <ul class="payment-benefits-list">
                        <li>Acesso ao conteúdo</li>
                        <li>Chat exclusivo com o criador</li>
                        <li>Cancele a qualquer hora</li>
                    </ul>
                </div>
                
                <div class="payment-plan">
                    <p class="payment-plan-label">PLANO</p>
                    <p class="payment-plan-duration">1 mês</p>
                    <p class="payment-plan-price" id="paymentPlanPrice">R$ 15,00</p>
                </div>
                
                <div class="payment-pix">
                    <p class="payment-pix-label">CHAVE PIX</p>
                    <div class="payment-pix-code" id="paymentPixCode">
                        Gerando código PIX...
                    </div>
                    <button class="payment-copy-button" id="paymentCopyButton">
                        COPIAR CHAVE PIX
                    </button>
                </div>
                
                <div class="payment-qr-container" id="paymentQRContainer" style="display: none;">
                    <div class="payment-qr-code" id="paymentQRCode">
                        <!-- QR Code será inserido aqui -->
                    </div>
                </div>
                
                <div class="payment-status" id="paymentStatus">
                    <p class="payment-status-text">Aguardando pagamento...</p>
                </div>
            </div>
        `;

        this.overlay.appendChild(this.modal);
        document.body.appendChild(this.overlay);
    }

    bindEvents() {
        // Fechar modal
        const closeBtn = document.getElementById('paymentModalClose');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.close());
        }

        // Fechar clicando no overlay
        this.overlay.addEventListener('click', (e) => {
            if (e.target === this.overlay) {
                this.close();
            }
        });

        // Copiar chave PIX
        const copyBtn = document.getElementById('paymentCopyButton');
        if (copyBtn) {
            copyBtn.addEventListener('click', () => this.copyPixCode());
        }

        // Fechar com ESC
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isOpen) {
                this.close();
            }
        });
    }

    async show(transactionData) {
        if (!transactionData) {
            console.error('Dados da transação são obrigatórios');
            return;
        }

        this.currentTransaction = transactionData;
        this.updateModalContent(transactionData);
        
        // Mostrar modal
        this.overlay.classList.add('show');
        this.isOpen = true;
        
        // Gerar QR Code se houver dados PIX
        if (transactionData.pix_qr_code) {
            await this.generateQRCode(transactionData.pix_qr_code);
        }

        // Iniciar verificação de status
        this.startStatusCheck();
    }

    updateModalContent(data) {
        // Atualizar preço
        const priceElement = document.getElementById('paymentPlanPrice');
        if (priceElement && data.amount) {
            const formattedPrice = this.formatCurrency(data.amount);
            priceElement.textContent = formattedPrice;
        }

        // Atualizar código PIX
        const pixCodeElement = document.getElementById('paymentPixCode');
        if (pixCodeElement) {
            let pixCode = '';
            if (data.pix_qr_code) {
                pixCode = data.pix_qr_code;
            } else if (data.pix_copy_paste) {
                pixCode = data.pix_copy_paste;
            } else if (data.qr_code) {
                pixCode = data.qr_code;
            } else {
                pixCode = 'Código PIX será gerado em breve...';
            }
            
            pixCodeElement.textContent = pixCode;
            
            // Habilitar/desabilitar botão de copiar
            const copyBtn = document.getElementById('paymentCopyButton');
            if (copyBtn) {
                copyBtn.disabled = !pixCode || pixCode.includes('será gerado');
            }
        }

        // Atualizar status
        this.updateStatus('pending', 'Aguardando pagamento...');
        
        console.log('Modal atualizado com dados:', data);
    }

    async generateQRCode(pixCode) {
        try {
            const qrContainer = document.getElementById('paymentQRContainer');
            const qrCodeElement = document.getElementById('paymentQRCode');
            
            if (typeof QRCode !== 'undefined' && qrCodeElement) {
                // Limpar QR Code anterior
                qrCodeElement.innerHTML = '';
                
                // Gerar novo QR Code
                await QRCode.toCanvas(qrCodeElement, pixCode, {
                    width: 200,
                    height: 200,
                    margin: 2,
                    color: {
                        dark: '#333333',
                        light: '#FFFFFF'
                    }
                });
                
                qrContainer.style.display = 'block';
            }
        } catch (error) {
            console.error('Erro ao gerar QR Code:', error);
        }
    }

    copyPixCode() {
        const pixCodeElement = document.getElementById('paymentPixCode');
        if (pixCodeElement) {
            const pixCode = pixCodeElement.textContent;
            
            navigator.clipboard.writeText(pixCode).then(() => {
                // Feedback visual
                const copyBtn = document.getElementById('paymentCopyButton');
                const originalText = copyBtn.textContent;
                
                copyBtn.textContent = 'COPIADO!';
                copyBtn.style.background = 'linear-gradient(45deg, #28a745, #20c997)';
                
                setTimeout(() => {
                    copyBtn.textContent = originalText;
                    copyBtn.style.background = 'linear-gradient(45deg, #F58170, #F9AF77)';
                }, 2000);
                
                // Mostrar toast
                this.showToast('Código PIX copiado!', 'success');
            }).catch(err => {
                console.error('Erro ao copiar:', err);
                this.showToast('Erro ao copiar código', 'error');
            });
        }
    }

    updateStatus(status, message) {
        const statusElement = document.getElementById('paymentStatus');
        const statusText = document.querySelector('.payment-status-text');
        
        if (statusElement && statusText) {
            // Remover classes de status anteriores
            statusElement.classList.remove('success', 'error');
            
            // Adicionar nova classe de status
            if (status === 'success') {
                statusElement.classList.add('success');
            } else if (status === 'error') {
                statusElement.classList.add('error');
            }
            
            statusText.textContent = message;
        }
    }

    startStatusCheck() {
        if (!this.currentTransaction || !this.currentTransaction.identifier) {
            return;
        }

        // Verificar status a cada 5 segundos
        this.statusCheckInterval = setInterval(async () => {
            try {
                const status = await this.checkTransactionStatus();
                
                if (status) {
                    if (status.status === 'paid' || status.status === 'completed') {
                        this.updateStatus('success', 'Pagamento confirmado! ✓');
                        this.stopStatusCheck();
                        
                        // Fechar modal após 3 segundos
                        setTimeout(() => {
                            this.close();
                            this.showToast('Pagamento realizado com sucesso!', 'success');
                        }, 3000);
                        
                    } else if (status.status === 'expired' || status.status === 'cancelled') {
                        this.updateStatus('error', 'Pagamento expirado ou cancelado');
                        this.stopStatusCheck();
                    }
                }
            } catch (error) {
                console.error('Erro ao verificar status:', error);
            }
        }, 5000);
    }

    async checkTransactionStatus() {
        if (!this.currentTransaction || !this.currentTransaction.identifier) {
            return null;
        }

        try {
            if (window.SyncPayIntegration && window.SyncPayIntegration.getTransactionStatus) {
                return await window.SyncPayIntegration.getTransactionStatus(this.currentTransaction.identifier);
            }
        } catch (error) {
            console.error('Erro ao consultar status da transação:', error);
            return null;
        }
    }

    stopStatusCheck() {
        if (this.statusCheckInterval) {
            clearInterval(this.statusCheckInterval);
            this.statusCheckInterval = null;
        }
    }

    close() {
        this.overlay.classList.remove('show');
        this.isOpen = false;
        this.stopStatusCheck();
        
        // Remover modal do DOM após animação
        setTimeout(() => {
            if (this.overlay && this.overlay.parentNode) {
                this.overlay.parentNode.removeChild(this.overlay);
            }
        }, 300);
    }

    formatCurrency(amount) {
        // Se amount já está em reais (formato decimal)
        if (amount < 100) {
            return new Intl.NumberFormat('pt-BR', {
                style: 'currency',
                currency: 'BRL'
            }).format(amount);
        }
        // Se amount está em centavos
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(amount / 100);
    }

    showToast(message, type = 'info') {
        // Usar SweetAlert se disponível
        if (typeof swal !== 'undefined') {
            swal({
                title: message,
                icon: type === 'success' ? 'success' : type === 'error' ? 'error' : 'info',
                timer: 3000,
                buttons: false
            });
        } else {
            // Fallback para alert simples
            alert(message);
        }
    }
}

// Instância global do modal de pagamento
window.PaymentModal = new PaymentModal();

// Função para abrir o modal de pagamento
window.showPaymentModal = function(transactionData) {
    if (window.PaymentModal) {
        window.PaymentModal.show(transactionData);
    } else {
        console.error('PaymentModal não está disponível');
    }
};

// Integração com SyncPay - aguardar carregamento completo
document.addEventListener('DOMContentLoaded', function() {
    // Aguardar um pouco para garantir que SyncPayIntegration foi carregado
    setTimeout(() => {
        if (window.SyncPayIntegration) {
            // Sobrescrever a função createCashIn para mostrar o modal
            const originalCreateCashIn = window.SyncPayIntegration.createCashIn;
            
            if (originalCreateCashIn) {
                window.SyncPayIntegration.createCashIn = async function(cashInData) {
                    try {
                        const result = await originalCreateCashIn.call(this, cashInData);
                        
                        // Mostrar modal de pagamento após sucesso
                        if (result && (result.pix_qr_code || result.pix_copy_paste)) {
                            setTimeout(() => {
                                window.showPaymentModal({
                                    ...result,
                                    amount: cashInData.amount
                                });
                            }, 500);
                        }
                        
                        return result;
                    } catch (error) {
                        console.error('Erro no cash-in:', error);
                        throw error;
                    }
                };
            }
        }
    }, 1000);
});