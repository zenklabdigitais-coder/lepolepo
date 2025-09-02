/**
 * POPUP PIX ALTERNATIVO
 * Sistema de popup robusto que não depende de bibliotecas externas
 * Implementação alternativa caso o SweetAlert falhe
 */

class PixPopupAlternative {
    constructor() {
        this.isOpen = false;
        this.currentData = null;
        this.init();
    }

    init() {
        // Adicionar estilos CSS dinamicamente
        this.addStyles();
    }

    addStyles() {
        // Verificar se os estilos já foram adicionados
        if (document.getElementById('pix-popup-styles')) {
            return;
        }

        const styles = document.createElement('style');
        styles.id = 'pix-popup-styles';
        styles.textContent = `
            .pix-popup-overlay {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.8);
                z-index: 10000;
                display: flex;
                align-items: center;
                justify-content: center;
                opacity: 0;
                visibility: hidden;
                transition: all 0.3s ease;
            }

            .pix-popup-overlay.show {
                opacity: 1;
                visibility: visible;
            }

            .pix-popup {
                background: #1a1a1a;
                border-radius: 20px;
                padding: 0;
                max-width: 400px;
                width: 90%;
                max-height: 90vh;
                overflow-y: auto;
                transform: scale(0.8);
                transition: transform 0.3s ease;
                color: white;
                position: relative;
            }

            .pix-popup-overlay.show .pix-popup {
                transform: scale(1);
            }

            .pix-popup-header {
                background: linear-gradient(45deg, #F58170, #F9AF77);
                padding: 20px;
                border-radius: 20px 20px 0 0;
                position: relative;
            }

            .pix-popup-close {
                position: absolute;
                top: 15px;
                right: 20px;
                background: none;
                border: none;
                color: white;
                font-size: 24px;
                cursor: pointer;
                width: 30px;
                height: 30px;
                display: flex;
                align-items: center;
                justify-content: center;
                border-radius: 50%;
                transition: background 0.2s ease;
            }

            .pix-popup-close:hover {
                background: rgba(255, 255, 255, 0.2);
            }

            .pix-popup-profile {
                display: flex;
                align-items: center;
                gap: 15px;
                margin-right: 40px;
            }

            .pix-popup-avatar {
                width: 60px;
                height: 60px;
                border-radius: 50%;
                overflow: hidden;
                border: 3px solid rgba(255, 255, 255, 0.3);
            }

            .pix-popup-avatar img {
                width: 100%;
                height: 100%;
                object-fit: cover;
            }

            .pix-popup-info h3 {
                margin: 0;
                font-size: 18px;
                font-weight: 600;
            }

            .pix-popup-info p {
                margin: 5px 0 0 0;
                opacity: 0.8;
                font-size: 14px;
            }

            .pix-popup-body {
                padding: 25px;
            }

            .pix-popup-benefits {
                margin-bottom: 25px;
            }

            .pix-popup-benefits h4 {
                color: #F58170;
                margin: 0 0 15px 0;
                font-size: 16px;
                font-weight: 600;
            }

            .pix-popup-benefits ul {
                list-style: none;
                padding: 0;
                margin: 0;
            }

            .pix-popup-benefits li {
                padding: 8px 0;
                padding-left: 25px;
                position: relative;
                font-size: 14px;
                color: #ccc;
            }

            .pix-popup-benefits li:before {
                content: '✓';
                position: absolute;
                left: 0;
                color: #F58170;
                font-weight: bold;
            }

            .pix-popup-plan {
                text-align: center;
                margin-bottom: 25px;
                padding: 20px;
                background: rgba(245, 129, 112, 0.1);
                border-radius: 15px;
                border: 1px solid rgba(245, 129, 112, 0.3);
            }

            .pix-popup-plan-label {
                color: #F58170;
                font-size: 12px;
                font-weight: 600;
                margin: 0 0 5px 0;
                letter-spacing: 1px;
            }

            .pix-popup-plan-duration {
                font-size: 16px;
                margin: 0 0 10px 0;
                color: white;
            }

            .pix-popup-plan-price {
                font-size: 28px;
                font-weight: 700;
                margin: 0;
                color: #F58170;
            }

            .pix-popup-pix {
                margin-bottom: 20px;
            }

            .pix-popup-pix-label {
                color: #F58170;
                font-size: 12px;
                font-weight: 600;
                margin: 0 0 10px 0;
                letter-spacing: 1px;
            }

            .pix-popup-pix-code {
                background: #333;
                padding: 15px;
                border-radius: 10px;
                font-family: monospace;
                font-size: 12px;
                word-break: break-all;
                margin-bottom: 15px;
                border: 1px solid #555;
                color: #fff;
                max-height: 100px;
                overflow-y: auto;
            }

            .pix-popup-copy-button {
                width: 100%;
                background: linear-gradient(45deg, #F58170, #F9AF77);
                color: white;
                border: none;
                padding: 15px;
                border-radius: 10px;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.2s ease;
                font-size: 14px;
                letter-spacing: 0.5px;
            }

            .pix-popup-copy-button:hover {
                transform: translateY(-2px);
                box-shadow: 0 5px 15px rgba(245, 129, 112, 0.4);
            }

            .pix-popup-copy-button:active {
                transform: translateY(0);
            }

            .pix-popup-qr-container {
                text-align: center;
                margin: 20px 0;
                padding: 20px;
                background: white;
                border-radius: 15px;
            }

            .pix-popup-status {
                text-align: center;
                padding: 15px;
                border-radius: 10px;
                background: rgba(23, 162, 184, 0.1);
                border: 1px solid rgba(23, 162, 184, 0.3);
            }

            .pix-popup-status.success {
                background: rgba(40, 167, 69, 0.1);
                border-color: rgba(40, 167, 69, 0.3);
            }

            .pix-popup-status.error {
                background: rgba(220, 53, 69, 0.1);
                border-color: rgba(220, 53, 69, 0.3);
            }

            .pix-popup-status-text {
                margin: 0;
                font-size: 14px;
                color: #17a2b8;
            }

            .pix-popup-status.success .pix-popup-status-text {
                color: #28a745;
            }

            .pix-popup-status.error .pix-popup-status-text {
                color: #dc3545;
            }

            @media (max-width: 480px) {
                .pix-popup {
                    width: 95%;
                    margin: 10px;
                }

                .pix-popup-header {
                    padding: 15px;
                }

                .pix-popup-body {
                    padding: 20px;
                }
            }
        `;

        document.head.appendChild(styles);
    }

    show(data) {
        if (!data) {
            console.error('Dados do PIX são obrigatórios');
            return;
        }

        this.currentData = data;
        this.createModal(data);
        this.isOpen = true;
    }

    createModal(data) {
        // Remover modal anterior se existir
        this.close();

        // Criar overlay
        const overlay = document.createElement('div');
        overlay.className = 'pix-popup-overlay';
        overlay.id = 'pixPopupOverlay';

        // Criar modal
        const modal = document.createElement('div');
        modal.className = 'pix-popup';
        modal.id = 'pixPopup';

        const pixCode = data.pix_code || data.pix_qr_code || data.pix_copy_paste || 'Código não disponível';
        const amount = data.amount || 0;
        const formattedPrice = this.formatCurrency(amount);

        modal.innerHTML = `
            <div class="pix-popup-header">
                <button class="pix-popup-close" onclick="window.PixPopupAlternative.close()">
                    ×
                </button>
                <div class="pix-popup-profile">
                    <div class="pix-popup-avatar">
                        <img src="images/perfil.jpg" alt="Perfil" onerror="this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMzAiIGZpbGw9IiNGNTgxNzAiLz4KPHN2ZyB4PSIxNSIgeT0iMTUiIHdpZHRoPSIzMCIgaGVpZ2h0PSIzMCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJ3aGl0ZSI+CjxwYXRoIGQ9Ik0xMiAyQzEzLjEgMiAxNCAyLjkgMTQgNEMxNCA1LjEgMTMuMSA2IDEyIDZDMTAuOSA2IDEwIDUuMSAxMCA0QzEwIDIuOSAxMC45IDIgMTIgMlpNMjEgOVYyMkgxNVYxM0g5VjIySDNWOUgwVjdIMjRWOUgyMVoiLz4KPHN2Zz4KPC9zdmc+'">
                    </div>
                    <div class="pix-popup-info">
                        <h3>Stella Beghini</h3>
                        <p>@stella_beghini</p>
                    </div>
                </div>
            </div>
            
            <div class="pix-popup-body">
                <div class="pix-popup-benefits">
                    <h4>Benefícios Exclusivos</h4>
                    <ul>
                        <li>Acesso ao conteúdo</li>
                        <li>Chat exclusivo com o criador</li>
                        <li>Cancele a qualquer hora</li>
                    </ul>
                </div>
                
                <div class="pix-popup-plan">
                    <p class="pix-popup-plan-label">FORMAS DE PAGAMENTO</p>
                    <p class="pix-popup-plan-duration">Valor</p>
                    <p class="pix-popup-plan-price">${formattedPrice}</p>
                </div>
                
                <div class="pix-popup-pix">
                    <p class="pix-popup-pix-label">CHAVE PIX</p>
                    <div class="pix-popup-pix-code" id="pixPopupCode">
                        ${pixCode}
                    </div>
                    <button class="pix-popup-copy-button" onclick="window.PixPopupAlternative.copyPixCode()">
                        COPIAR CHAVE PIX
                    </button>
                </div>
                
                <div class="pix-popup-qr-container" id="pixPopupQRContainer" style="display: none;">
                    <div id="pixPopupQRCode"></div>
                </div>
                
                <div class="pix-popup-status" id="pixPopupStatus">
                    <p class="pix-popup-status-text">Aguardando pagamento...</p>
                </div>
            </div>
        `;

        overlay.appendChild(modal);
        document.body.appendChild(overlay);

        // Mostrar modal com animação
        setTimeout(() => {
            overlay.classList.add('show');
        }, 50);

        // Gerar QR Code se possível
        if (typeof QRCode !== 'undefined' && pixCode !== 'Código não disponível') {
            this.generateQRCode(pixCode);
        }

        // Fechar clicando no overlay
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                this.close();
            }
        });

        // Fechar com ESC
        document.addEventListener('keydown', this.handleKeyDown.bind(this));
    }

    handleKeyDown(e) {
        if (e.key === 'Escape' && this.isOpen) {
            this.close();
        }
    }

    async generateQRCode(pixCode) {
        try {
            const qrContainer = document.getElementById('pixPopupQRContainer');
            const qrCodeElement = document.getElementById('pixPopupQRCode');
            
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
        const pixCodeElement = document.getElementById('pixPopupCode');
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
        const copyBtn = document.querySelector('.pix-popup-copy-button');
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

    close() {
        const overlay = document.getElementById('pixPopupOverlay');
        if (overlay) {
            overlay.classList.remove('show');
            setTimeout(() => {
                if (overlay.parentNode) {
                    overlay.parentNode.removeChild(overlay);
                }
            }, 300);
        }
        
        this.isOpen = false;
        document.removeEventListener('keydown', this.handleKeyDown.bind(this));
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
}

// Instância global
window.PixPopupAlternative = new PixPopupAlternative();

// Função global para mostrar o popup
window.showPixPopup = function(data) {
    window.PixPopupAlternative.show(data);
};

console.log('🎨 PixPopupAlternative carregado e disponível globalmente');