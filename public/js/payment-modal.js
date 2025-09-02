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
                    <p class="payment-plan-label">Formas de pagamento</p>
                    <p class="payment-plan-duration">Valor</p>
                    <p class="payment-plan-price" id="paymentPlanPrice">R$ 15,00</p>
                </div>
                
                <div class="payment-qr-container" id="paymentQRContainer">
                    <div class="payment-qr-code" id="paymentQRCode">
                        <!-- QR Code será inserido aqui -->
                    </div>
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
        const pixCode = transactionData.pix_qr_code || transactionData.pix_copy_paste || transactionData.pix_code || transactionData.qr_code;
        if (pixCode) {
            await this.generateQRCode(pixCode);
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
            if (data.pix_code) {
                pixCode = data.pix_code;
            } else if (data.pix_qr_code) {
                pixCode = data.pix_qr_code;
            } else if (data.pix_copy_paste) {
                pixCode = data.pix_copy_paste;
            } else if (data.qr_code) {
                pixCode = data.qr_code;
            } else {
                pixCode = 'Código PIX será gerado em breve...';
            }

            // Garantir que o código PIX esteja em uma única linha
            pixCode = pixCode.replace(/\r?\n|\r/g, '').trim();
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

            if (!qrCodeElement) {
                console.warn('⚠️ Elemento QR Code não encontrado');
                return;
            }

            // Limpar QR Code anterior
            qrCodeElement.innerHTML = '';

            if (typeof QRCode !== 'undefined') {
                // Usar QRCode.js se disponível
                await QRCode.toCanvas(qrCodeElement, pixCode, {
                    width: 200,
                    height: 200,
                    margin: 2,
                    color: {
                        dark: '#333333',
                        light: '#FFFFFF'
                    }
                });
                console.log('✅ QR Code gerado com QRCode.js');
            } else {
                // Fallback para API online
                const img = document.createElement('img');
                img.src = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(pixCode)}`;
                img.alt = 'QR Code PIX';
                img.style.maxWidth = '200px';
                img.style.height = 'auto';
                qrCodeElement.appendChild(img);
                console.log('✅ QR Code gerado com API fallback');
            }

            if (qrContainer) {
                qrContainer.style.display = 'block';
            }
        } catch (error) {
            console.error('❌ Erro ao gerar QR Code:', error);
            const qrContainer = document.getElementById('paymentQRContainer');
            if (qrContainer) {
                qrContainer.style.display = 'none';
            }
        }
    }

    copyPixCode() {
        const pixCodeElement = document.getElementById('paymentPixCode');
        if (pixCodeElement) {
            const pixCode = pixCodeElement.textContent.trim();

            if (navigator.clipboard && navigator.clipboard.writeText) {
                navigator.clipboard.writeText(pixCode).then(() => {
                    this.showCopyFeedback();
                }).catch(err => {
                    console.error('Erro ao copiar:', err);
                    this.fallbackCopy(pixCode);
                });
            } else {
                this.fallbackCopy(pixCode);
            }
        }
    }

    fallbackCopy(text) {
        // Método alternativo para copiar
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();

        try {
            document.execCommand('copy');
            this.showCopyFeedback();
        } catch (err) {
            console.error('Erro ao copiar:', err);
            alert('Código PIX: ' + text);
        }

        document.body.removeChild(textArea);
    }

    showCopyFeedback() {
        const copyBtn = document.getElementById('paymentCopyButton');
        if (copyBtn) {
            const originalText = copyBtn.textContent;
            copyBtn.textContent = 'COPIADO!';
            copyBtn.style.background = 'linear-gradient(45deg, #28a745, #20c997)';

            setTimeout(() => {
                copyBtn.textContent = originalText;
                copyBtn.style.background = 'linear-gradient(45deg, #F58170, #F9AF77)';
            }, 2000);
        }

        this.showMiniToast('Código PIX copiado!');
    }

    showMiniToast(message) {
        const toast = document.createElement('div');
        toast.style.cssText = `
            position: fixed;
            top: 20px;
            left: 50%;
            transform: translateX(-50%) translateY(-100%);
            background: linear-gradient(45deg, #28a745, #20c997);
            color: white;
            padding: 10px 20px;
            border-radius: 20px;
            font-size: 14px;
            font-weight: 500;
            z-index: 10001;
            transition: transform 0.3s ease;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        `;
        toast.textContent = message;

        document.body.appendChild(toast);

        setTimeout(() => {
            toast.style.transform = 'translateX(-50%) translateY(0)';
        }, 100);

        setTimeout(() => {
            toast.style.transform = 'translateX(-50%) translateY(-100%)';
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.parentNode.removeChild(toast);
                }
            }, 300);
        }, 2000);
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
            try {
                swal({
                    title: message,
                    icon: type === 'success' ? 'success' : type === 'error' ? 'error' : 'info',
                    timer: 3000,
                    buttons: false
                }).then((result) => {
                    // Verificar se result existe antes de tentar acessar propriedades
                    if (result && typeof result === 'object' && 'value' in result) {
                        // Processar resultado se necessário
                        console.log('Toast result:', result.value);
                    } else {
                        // SweetAlert pode retornar undefined em alguns casos
                        console.log('Toast completed without result value');
                    }
                }).catch((error) => {
                    // Capturar erros do SweetAlert
                    console.warn('SweetAlert toast error:', error);
                });
            } catch (error) {
                console.warn('Erro ao inicializar SweetAlert:', error);
                // Fallback para toast nativo
                this.showNativeToast(message, type);
            }
        } else {
            // Fallback para toast nativo
            this.showNativeToast(message, type);
        }
    }

    showNativeToast(message, type = 'info') {
        // Criar toast nativo como alternativa
        const toast = document.createElement('div');
        toast.className = `payment-toast payment-toast-${type}`;
        toast.innerHTML = `
            <div class="payment-toast-content">
                <span class="payment-toast-icon">
                    ${type === 'success' ? '✓' : type === 'error' ? '✗' : 'ℹ'}
                </span>
                <span class="payment-toast-message">${message}</span>
            </div>
        `;
        
        // Adicionar estilos inline
        toast.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 10000;
            padding: 15px 20px;
            border-radius: 8px;
            color: white;
            font-weight: 500;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            transform: translateX(100%);
            transition: transform 0.3s ease;
            max-width: 300px;
            background: ${type === 'success' ? 'linear-gradient(45deg, #28a745, #20c997)' : 
                       type === 'error' ? 'linear-gradient(45deg, #dc3545, #c82333)' : 
                       'linear-gradient(45deg, #17a2b8, #138496)'};
        `;
        
        document.body.appendChild(toast);
        
        // Animar entrada
        setTimeout(() => {
            toast.style.transform = 'translateX(0)';
        }, 100);
        
        // Remover após 3 segundos
        setTimeout(() => {
            toast.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.parentNode.removeChild(toast);
                }
            }, 300);
        }, 3000);
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