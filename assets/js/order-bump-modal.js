/**
 * MODAL ORDER BUMP
 * Modal que exibe Order Bump ou PIX direto conforme necessário
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
            <!-- CONTAINER HEADER + IDENTIDADE -->
            <div class="payment-modal-header-container">
                <!-- CAPA (mesma da /privacy) -->
                <div class="payment-modal-header" style="background-image:url('images/banner.jpg')">
                    <button class="payment-modal-close el-dialog__headerbtn" onclick="closeCheckoutModal()" aria-label="Fechar">
                        <i class="el-dialog__close">✕</i>
                    </button>
                    <div class="pm-header__avatar">
                        <img src="images/perfil.jpg" alt="Avatar" onerror="this.src='images/default-avatar.jpg'">
                    </div>
                </div>

                <!-- IDENTIDADE FIXA (ao lado do avatar) -->
                <div class="pm-identity">
                    <p class="pm-name" data-config="model.name">Stella Beghini</p>
                    <p class="pm-handle" data-config="model.handle">@stella_beghini</p>
                </div>
            </div>

            <!-- CORPO (tudo que rola fica aqui dentro) -->
            <div class="payment-modal-body">

                <!-- BENEFÍCIOS -->
                <section class="pm-benefits">
                    <h4>Benefícios exclusivos</h4>
                    <ul>
                        <li>Acesso ao conteúdo</li>
                        <li>Chat exclusivo com o criador</li>
                        <li>Cancele a qualquer hora</li>
                    </ul>
                </section>

                <!-- ORDEM BUMP (2 itens) -->
                <section class="ob-section" id="order-bump-root" data-base-name="Privacidade - 1 mês" data-base-amount="19.90">

                    <!-- BUMP 1 -->
                    <div class="bump-product-card" data-id="bump-1" tabindex="0">
                        <div class="bump-product-image">
                            <img src="images/galeria-completa.jpg" alt="Galeria Completa" onerror="this.src='https://via.placeholder.com/160x160/f97316/ffffff?text=Galeria'">
                        </div>
                        <div class="bump-product-content">
                            <div class="bump-product-info">
                                <h4>Galeria Completa</h4>
                                <p>Todos meus vídeos transando com clientes reais.</p>
                            </div>
                        </div>
                        <div class="bump-product-main">
                            <p class="bump-product-price"><span class="price-symbol">+ R$ </span><span class="price-value">27,00</span></p>
                            <div class="bump-product-checkbox">
                                <input id="bump-1" type="checkbox" class="bump-checkbox" data-price="27.00" data-name="Galeria Completa">
                                <label for="bump-1">Quero comprar também!</label>
                            </div>
                        </div>
                    </div>

                    <!-- BUMP 2 -->
                    <div class="bump-product-card" data-id="bump-2" tabindex="0">
                        <div class="bump-product-image">
                            <img src="images/chamada-video.jpg" alt="Chamada de Vídeo" onerror="this.src='https://via.placeholder.com/160x160/f97316/ffffff?text=Chamada'">
                        </div>
                        <div class="bump-product-content">
                            <div class="bump-product-info">
                                <h4>Chamada de Vídeo</h4>
                                <p>Chamada de vídeo até gozar no meu WhatsApp.</p>
                            </div>
                        </div>
                        <div class="bump-product-main">
                            <p class="bump-product-price"><span class="price-symbol">+ R$ </span><span class="price-value">47,00</span></p>
                            <div class="bump-product-checkbox">
                                <input id="bump-2" type="checkbox" class="bump-checkbox" data-price="47.00" data-name="Chamada de Vídeo">
                                <label for="bump-2">Quero comprar também!</label>
                            </div>
                        </div>
                    </div>

                    <!-- RESUMO -->
                    <div class="order-summary">
                        <div class="summary-header"><h4>Resumo do Pedido</h4></div>
                        <div class="summary-items" id="summary-items"></div>
                        <div class="summary-total">
                            <div class="total-line">
                                <span class="total-label">Total</span>
                                <span class="total-price" id="summary-total">R$ 0,00</span>
                            </div>
                        </div>
                    </div>

                    <button class="pay-now-button" id="pay-now">Efetuar Pagamento</button>
                </section>

                <!-- SEÇÃO PIX (inicialmente oculta) -->
                <section class="pix-section" id="pix-payment-section" style="display: none;">
                    <div class="pix-header">
                        <h3>Formas de pagamento</h3>
                        <p class="pix-subtitle">Valor</p>
                        <p class="pix-amount" id="paymentPlanPrice">R$ 19,90</p>
                    </div>

                    <div class="pix-content">
                        <!-- QR Code -->
                        <div class="pix-qr-container" id="paymentQRContainer">
                            <div class="pix-qr-code" id="paymentQRCode">
                                <div class="qr-loading">Gerando QR Code...</div>
                            </div>
                        </div>

                        <!-- Chave PIX -->
                        <div class="pix-key-section">
                            <h4>CHAVE PIX</h4>
                            <div class="pix-key-container">
                                <input type="text" id="paymentPixCode" class="pix-key-input" readonly value="Gerando chave PIX..." />
                                <button type="button" id="paymentCopyButton" class="pix-copy-button">
                                    COPIAR CHAVE PIX
                                </button>
                            </div>
                        </div>
                    </div>
                </section>

            </div><!-- /.payment-modal-body -->
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
            console.error('❌ Dados da transação são obrigatórios');
            return;
        }

        console.log('💳 Dados da transação recebidos:', transactionData);
        this.currentTransaction = transactionData;
        this.updateModalContent(transactionData);
        
        // Mostrar modal
        this.overlay.classList.add('show');
        this.isOpen = true;
        
        // Controlar exibição: Order Bump ou PIX direto
        if (!transactionData.skipOrderBump) {
            console.log('🛒 Modal Order Bump: Exibindo Order Bump...');
            this.showOrderBump(transactionData);
            return; // Não gerar PIX ainda, aguardar Order Bump
        } else {
            console.log('💳 Modal Order Bump: Exibindo PIX direto (skipOrderBump = true)...');
            this.showDirectPix(transactionData);
        }
    }

    updateModalContent(data) {
        // Atualizar preço
        const priceElement = document.getElementById('paymentPlanPrice');
        if (priceElement && data.amount != null) {
            const formattedPrice = this.formatCurrency(data.amount);
            priceElement.textContent = formattedPrice;
        }

        // Atualizar código PIX
        const pixCodeElement = document.getElementById('paymentPixCode');
        const copyBtn = document.getElementById('paymentCopyButton');
        
        if (pixCodeElement) {
            let pixCode = data.pix_qr_code || data.pix_copy_paste || data.pix_code || data.qr_code || data.qrCode;
            
            console.log('🔍 Código PIX para input:', pixCode);
            
            if (!pixCode) {
                pixCode = 'Código PIX será gerado em breve...';
            }

            // Garantir que o código PIX esteja em uma única linha
            pixCode = pixCode.replace(/\s+/g, ' ').trim();
            // Se for input, use value; senão, textContent
            if (typeof pixCodeElement.value !== 'undefined') {
                pixCodeElement.value = pixCode;
            } else {
                pixCodeElement.textContent = pixCode;
            }
            
            if (copyBtn) {
                copyBtn.disabled = !pixCode || pixCode.includes('será gerado');
            }
        }

        // Atualizar status sem mensagem inicial
        this.updateStatus('', '');
        
        console.log('Modal atualizado com dados:', data);
    }

    // Atualiza valores da seção PIX (preço, chave e estado do botão)
    updatePixData(data) {
        if (!data) return;
        this.currentTransaction = { ...(this.currentTransaction || {}), ...data };

        const priceElement = document.getElementById('paymentPlanPrice');
        if (priceElement && data.amount != null) {
            priceElement.textContent = this.formatCurrency(data.amount);
        }

        const pixCodeElement = document.getElementById('paymentPixCode');
        const copyBtn = document.getElementById('paymentCopyButton');
        let pixCode = data.pix_copy_paste || data.pix_qr_code || data.pix_code || data.qr_code || data.qrCode || '';
        if (pixCode) {
            pixCode = pixCode.replace(/\s+/g, ' ').trim();
        }

        if (pixCodeElement) {
            if (typeof pixCodeElement.value !== 'undefined') {
                pixCodeElement.value = pixCode || '';
            } else {
                pixCodeElement.textContent = pixCode || '';
            }
        }

        if (copyBtn) {
            copyBtn.disabled = !pixCode;
        }
    }

    async generateQRCode(pixCode) {
        try {
            const qrContainer = document.getElementById('paymentQRContainer');
            const qrCodeElement = document.getElementById('paymentQRCode');
            
            if (!qrContainer || !qrCodeElement) {
                console.warn('⚠️ Elemento QR Code não encontrado');
                return;
            }

            const isMobile = window.innerWidth <= 768;
            
            // Sempre mostrar QR Code, mas ajustar tamanho para mobile
            if (qrContainer) {
                qrContainer.style.display = 'block';
            }

            // Limpar QR Code anterior
            qrCodeElement.innerHTML = '';

            // Tentar usar a biblioteca QRCode disponível
            if (typeof QRCode !== 'undefined' && QRCode.CorrectLevel) {
                const qrSize = isMobile ? 220 : 250;
                new QRCode(qrCodeElement, {
                    text: pixCode,
                    width: qrSize,
                    height: qrSize,
                    colorDark: '#000000',
                    colorLight: '#FFFFFF',
                    correctLevel: QRCode.CorrectLevel.M
                });
            } else if (typeof QRCode !== 'undefined') {
                // Usar biblioteca alternativa qrcode-generator
                const qr = QRCode(0, 'M');
                qr.addData(pixCode);
                qr.make();
                const qrSize = isMobile ? 220 : 250;
                qrCodeElement.innerHTML = qr.createImgTag(8, 8);
                const img = qrCodeElement.querySelector('img');
                if (img) {
                    img.style.width = qrSize + 'px';
                    img.style.height = qrSize + 'px';
                    img.style.maxWidth = '100%';
                    img.style.height = 'auto';
                    img.style.borderRadius = '8px';
                    img.style.touchAction = 'manipulation';
                }
                console.log('✅ QR Code gerado com QRCode.js');
            } else {
                // Fallback para API externa
                const qrSize = isMobile ? 220 : 250;
                const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=${qrSize}x${qrSize}&data=${encodeURIComponent(pixCode)}`;
                const img = document.createElement('img');
                img.src = qrUrl;
                img.alt = 'QR Code PIX';
                img.style.maxWidth = '100%';
                img.style.height = 'auto';
                img.style.borderRadius = '8px';
                img.style.touchAction = 'manipulation';
                qrCodeElement.appendChild(img);
                console.log('✅ QR Code gerado com API fallback');
            }
        } catch (error) {
            console.error('❌ Erro ao gerar QR Code:', error);
            // Esconder container em caso de erro
            if (qrContainer) {
                qrContainer.style.display = 'none';
            }
        }
    }

    copyPixCode() {
        const pixCodeElement = document.getElementById('paymentPixCode');
        if (!pixCodeElement) return;

        const pixCode = pixCodeElement.textContent.trim();
        if (!pixCode || pixCode.includes('será gerado')) return;

        // Tracking UTMify
        if (typeof fbq !== 'undefined') {
            fbq('track', 'CopyPixCode', {
                value: this.currentTransaction?.amount || 0,
                currency: 'BRL'
            });
        } else {
            console.warn('⚠️ fbq() não está disponível - UTMify pode não ter carregado');
        }

        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(pixCode).then(() => {
                this.showCopyFeedback();
            }).catch(() => {
                this.fallbackCopy(pixCode);
            });
        } else {
            this.fallbackCopy(pixCode);
        }
    }

    fallbackCopy(text) {
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
            copyBtn.textContent = 'COPIADO!';
            copyBtn.style.background = 'linear-gradient(45deg, #28a745, #20c997)';
            
            setTimeout(() => {
                copyBtn.textContent = 'COPIAR CHAVE PIX';
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
            
            // Controlar visibilidade conforme mensagem
            statusElement.style.display = message ? 'block' : 'none';
            
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
        if (!this.currentTransaction) {
            console.log('⚠️ Nenhuma transação atual para verificar status');
            return;
        }

        const transactionId = this.currentTransaction.id || this.currentTransaction.identifier || this.currentTransaction.payment_id;
        console.log('🆔 ID da transação extraído:', transactionId);
        console.log('💳 Transação atual:', this.currentTransaction);
        
        if (!transactionId) {
            console.log('⚠️ ID da transação não encontrado');
            return;
        }

        // Verificar status a cada 5 segundos
        this.statusCheckInterval = setInterval(async () => {
            try {
                console.log('🔍 Verificando status da transação:', transactionId);
                const status = await this.checkTransactionStatus(transactionId);
                console.log('🔍 Status recebido:', status);
                
                if (status) {
                    if (status.status === 'approved' || status.status === 'paid') {
                        console.log('✅ Pagamento aprovado!');
                        this.updateStatus('success', 'Pagamento aprovado! Redirecionando...');
                        this.stopStatusCheck();
                        
                        // Redirecionar após 2 segundos
                        setTimeout(() => {
                            const redirectUrl = this.getRedirectUrlForPlan();
                            if (redirectUrl) {
                                window.location.href = redirectUrl;
                            }
                        }, 2000);
                    } else if (status.status === 'rejected' || status.status === 'cancelled') {
                        console.log('❌ Pagamento rejeitado ou cancelado');
                        this.updateStatus('error', 'Pagamento não foi aprovado. Tente novamente.');
                        this.stopStatusCheck();
                    } else {
                        console.log('⏳ Status pendente:', status.status);
                    }
                } else {
                    console.log('⚠️ Nenhum status recebido');
                }
            } catch (error) {
                console.error('❌ Erro ao verificar status:', error);
            }
        }, 5000);
    }

    getRedirectUrlForPlan() {
        const planKey = this.currentTransaction?.planKey || window.currentPaymentPlan;
        console.log('🔗 Plano para redirecionamento:', planKey);
        
        let redirectUrl = 'https://stellabeghini.com/assinatura-premiada/';
        
        if (planKey) {
            const planUrls = {
                'monthly': 'https://stellabeghini.com/assinatura-premiada/',
                'quarterly': 'https://stellabeghini.com/assinatura-premiada/',
                'semestrial': 'https://stellabeghini.com/assinatura-premiada/'
            };
            
            if (planUrls[planKey]) {
                redirectUrl = planUrls[planKey];
            }
        }
        
        console.log('🔗 URL de redirecionamento:', redirectUrl);
        return redirectUrl;
    }

    async checkTransactionStatus(transactionId) {
        if (!transactionId) {
            console.log('⚠️ ID da transação não fornecido');
            return null;
        }

        try {
            const response = await fetch(`/api/transaction-status/${transactionId}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }
            const result = await response.json();
            console.log('📡 Resultado da API:', result);
            return result;
        } catch (error) {
            console.error('❌ Erro ao consultar status da transação:', error);
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
        if (this.overlay) {
            this.overlay.classList.remove('show');
        }
        this.isOpen = false;
        this.stopStatusCheck();
    }

    // Método para fazer transição para a seção PIX
    showPixSection(transactionData) {
        console.log('⚙️ Fazendo transição para seção PIX...');
        
        // Esconder seção order bump
        const orderSection = document.getElementById('order-bump-section');
        if (orderSection) {
            orderSection.style.display = 'none';
        }
        
        // Mostrar seção PIX
        const pixSection = document.getElementById('pix-payment-section');
        if (pixSection) {
            pixSection.style.display = 'block';
        }
        
        // Atualizar dados do PIX e iniciar fluxo
        this.updatePixData(transactionData);
        this.proceedWithPixFlow(transactionData);
    }

    formatCurrency(amount) {
        if (typeof amount !== 'number') {
            amount = parseFloat(amount) || 0;
        }
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(amount);
    }
    
    // ===== MÉTODOS DO ORDER BUMP =====
    
    showOrderBump(transactionData) {
        // Esconder conteúdo PIX original
        const originalContent = document.getElementById('original-payment-content');
        const orderBumpRoot = document.getElementById('order-bump-root');
        
        if (originalContent) {
            originalContent.style.display = 'none';
        }
        
        if (orderBumpRoot) {
            orderBumpRoot.style.display = 'block';
            
            // Configurar dados base do Order Bump
            const baseName = transactionData.description || 'Privacidade - 1 mês';
            const baseAmount = transactionData.amount || transactionData.price || 19.90;
            
            orderBumpRoot.dataset.baseName = baseName;
            orderBumpRoot.dataset.baseAmount = baseAmount.toString();
            
            // Inicializar Order Bump
            if (window.OrderBump) {
                window.OrderBump.setBaseProduct(baseName, baseAmount);
            }
            
            console.log('✅ Modal Order Bump: Order Bump configurado:', { baseName, baseAmount });
        }
    }
    
    showDirectPix(transactionData) {
        console.log('🎯 showDirectPix chamado com:', transactionData);
        
        // Esconder Order Bump
        const orderBumpRoot = document.getElementById('order-bump-root');
        const pixSection = document.getElementById('pix-payment-section');
        
        if (orderBumpRoot) {
            console.log('📦 Escondendo Order Bump');
            orderBumpRoot.style.display = 'none';
        }
        
        if (pixSection) {
            console.log('💳 Mostrando seção PIX');
            pixSection.style.display = 'block';
            
            // Rebind eventos da seção PIX
            setTimeout(() => {
                const copyBtn = document.getElementById('paymentCopyButton');
                if (copyBtn && !copyBtn.hasAttribute('data-bound')) {
                    copyBtn.addEventListener('click', () => this.copyPixCode());
                    copyBtn.setAttribute('data-bound', 'true');
                    console.log('✅ Evento copiar PIX rebindado');
                }
            }, 100);
        }
        
        // Garantir que preço e chave sejam refletidos no input
        this.updatePixData(transactionData);

        // Continuar com fluxo PIX normal
        this.proceedWithPixFlow(transactionData);
    }
    
    async proceedWithPixFlow(transactionData) {
        console.log('🔍 Dados recebidos para PIX:', transactionData);
        
        // Gerar QR Code se houver dados PIX - verificar todas as possíveis propriedades
        const pixCode = transactionData.pix_qr_code || transactionData.pix_copy_paste || transactionData.pix_code || transactionData.qr_code || transactionData.qrCode;
        
        console.log('🎯 Código PIX encontrado:', pixCode);
        
        if (pixCode && pixCode !== 'Código PIX será gerado em breve...') {
            console.log('📱 Gerando QR Code...');
            await this.generateQRCode(pixCode);
        } else {
            console.warn('⚠️ Código PIX não encontrado ou inválido');
        }

        // Iniciar verificação de status (desativado em file:// para evitar travar o loading)
        const isFile = typeof window !== 'undefined' && window.location && window.location.protocol === 'file:';
        if (!isFile) {
            console.log('🔄 Iniciando verificação de status...');
            this.startStatusCheck();
        }
        
        console.log('✅ Modal Order Bump: Fluxo PIX direto iniciado');
    }
}

// Instância global do modal order bump
window.PaymentModal = new PaymentModal();

// Função para abrir o modal order bump
window.showPaymentModal = function(transactionData) {
    if (window.PaymentModal) {
        window.PaymentModal.show(transactionData);
    } else {
        console.error('Modal Order Bump não está disponível');
    }
};

// Função PIX Modal simples (compatibilidade com integrações existentes)
window.showPixPopup = function(pixData) {
    console.log('🎯 showPixPopup chamado com:', pixData);
    
    if (!pixData) {
        console.error('❌ Dados PIX não fornecidos');
        return;
    }
    
    // Preparar dados da transação para o modal
    const transactionData = {
        amount: pixData.amount || 19.90,
        pix_code: pixData.pix_code || pixData.qr_code || pixData.qrCode || pixData.pix_qr_code || pixData.pix_copy_paste || '',
        qr_code: pixData.pix_code || pixData.qr_code || pixData.qrCode || pixData.pix_qr_code || pixData.pix_copy_paste || '',
        qrCode: pixData.pix_code || pixData.qr_code || pixData.qrCode || pixData.pix_qr_code || pixData.pix_copy_paste || '',
        pix_qr_code: pixData.pix_code || pixData.qr_code || pixData.qrCode || pixData.pix_qr_code || pixData.pix_copy_paste || '',
        pix_copy_paste: pixData.pix_code || pixData.qr_code || pixData.qrCode || pixData.pix_qr_code || pixData.pix_copy_paste || '',
        id: pixData.id || pixData.payment_id || 'pix-' + Date.now(),
        skipOrderBump: true, // Pular order bump e ir direto para PIX
        description: pixData.description || 'Pagamento PIX'
    };
    
    // Usar o modal existente para mostrar PIX
    if (window.PaymentModal) {
        window.PaymentModal.show(transactionData);
        console.log('✅ Modal PIX exibido via PaymentModal');
    } else {
        console.error('❌ PaymentModal não disponível');
    }
};

// Debug: verificar se foi criado corretamente
console.log('✅ Modal Order Bump criado:', window.PaymentModal);
console.log('✅ showPixPopup definido:', typeof window.showPixPopup);

// ===== FUNÇÕES DE CONTROLE DO MODAL =====

// abrir/fechar modal travando o scroll da página
function openCheckoutModal(){
    document.querySelector('.payment-modal-overlay')?.classList.add('show');
    document.body.classList.add('modal-open');
}
function closeCheckoutModal(){
    document.querySelector('.payment-modal-overlay')?.classList.remove('show');
    document.body.classList.remove('modal-open');
}

// Tornar funções globais
window.openCheckoutModal = openCheckoutModal;
window.closeCheckoutModal = closeCheckoutModal;

// ORDEM BUMP — cálculo do resumo (2 itens, mas funciona p/ mais)
(function(){
    const root = document.getElementById('order-bump-root'); 
    if(!root) return;
    
    const baseName   = root.dataset.baseName || 'Plano';
    const baseAmount = Number(root.dataset.baseAmount || '0');
    const list  = document.getElementById('summary-items');
    const total = document.getElementById('summary-total');

    const fmt = v => {
        try { return v.toLocaleString('pt-BR',{style:'currency',currency:'BRL'}); }
        catch { return 'R$ '+Number(v).toFixed(2).replace('.',','); }
    };

    function render(){
        if (!list || !total) return;
        
        list.innerHTML = `<div class="summary-item main-product">
            <span class="item-name">${baseName}</span>
            <span class="item-price">${fmt(baseAmount)}</span>
        </div>`;
        let t = baseAmount;

        document.querySelectorAll('.bump-checkbox').forEach(inp=>{
            const card = inp.closest('.bump-product-card');
            if(inp.checked){
                card?.classList.add('selected');
                const name=inp.dataset.name||'Item', price=Number(inp.dataset.price||'0'); t+=price;
                list.insertAdjacentHTML('beforeend',
                    `<div class="summary-item bump-item"><span class="item-name">${name}</span><span class="item-price">${fmt(price)}</span></div>`);
            }else{
                card?.classList.remove('selected');
            }
        });
        total.textContent = fmt(t);
    }

    document.querySelectorAll('.bump-checkbox').forEach(inp=>{
        const card = inp.closest('.bump-product-card');
        inp.addEventListener('change', render);
        card?.addEventListener('click', e=>{
            if(['input','label'].includes(e.target.tagName.toLowerCase())) return;
            inp.checked = !inp.checked; inp.dispatchEvent(new Event('change'));
        });
    });

    document.getElementById('pay-now')?.addEventListener('click', async ()=>{
        // Calcular valor total com order bumps selecionados
        let totalAmount = baseAmount;
        const selectedBumps = [];
        
        document.querySelectorAll('.bump-checkbox:checked').forEach(inp => {
            const price = Number(inp.dataset.price || '0');
            const name = inp.dataset.name || 'Item';
            totalAmount += price;
            selectedBumps.push({ name, price });
        });
        
        console.log('🛒 Total calculado:', totalAmount, 'Bumps:', selectedBumps);
        
        try {
            console.log('🔄 Iniciando processo de pagamento...');
            
            // Verificar se a integração universal está disponível
            if (!window.syncPay && !window.universalPayment) {
                console.error('❌ Nenhum serviço de pagamento disponível');
                alert('Serviço de pagamento indisponível.');
                return;
            }
            
            const paymentService = window.universalPayment || window.syncPay;
            console.log('✅ Serviço de pagamento encontrado:', paymentService.constructor.name);
            
            // Mostrar loading
            if (paymentService.showLoading) {
                console.log('🔄 Mostrando loading...');
                paymentService.showLoading();
            }
            
            // Dados do cliente padrão
            const clientData = {
                name: 'Cliente',
                cpf: '12345678901',
                email: 'cliente@exemplo.com',
                phone: '11999999999'
            };
            
            // Criar descrição com order bumps
            let description = baseName;
            if (selectedBumps.length > 0) {
                const bumpNames = selectedBumps.map(b => b.name).join(', ');
                description += ` + ${bumpNames}`;
            }
            
            // Gerar PIX com valor total
            console.log('💳 Gerando PIX com valor:', totalAmount, 'Descrição:', description);
            const transaction = await paymentService.createPixTransaction(totalAmount, description, clientData);
            console.log('✅ PIX gerado:', transaction);
            
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
            
            // Fazer transição para seção PIX no mesmo modal
            console.log('🎯 Fazendo transição para seção PIX...');
            transaction.planKey = window.currentPaymentPlan;
            this.showPixSection(transaction);
            
            console.log('✅ PIX gerado com Order Bump - Total:', totalAmount);
            
        } catch (err) {
            console.error('❌ Erro ao gerar PIX:', err);
            alert(`Erro ao gerar PIX: ${err.message}`);
            
            // Fechar loading em caso de erro
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

    render();
})();
