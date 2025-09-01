// Sistema de Pagamento SyncPay - Integração PIX
class SyncPayIntegration {
    constructor(config) {
        console.log('🔧 [DEBUG] SyncPay Integration inicializada com config:', config);
        this.config = config;
        this.authToken = null;
        this.tokenExpiry = null;
        this.debugMode = true; // Ativar modo debug
    }

    // Função para log de debug
    log(message, data = null) {
        if (this.debugMode) {
            const timestamp = new Date().toLocaleTimeString();
            console.log(`🔍 [${timestamp}] ${message}`, data || '');
        }
    }

    // Função para obter token de autenticação
    async getAuthToken() {
        this.log('🔐 [DEBUG] Iniciando autenticação com SyncPay...');
        try {
            this.log('📡 [DEBUG] Fazendo requisição para:', `${this.config.base_url}/api/partner/v1/auth-token`);
            this.log('🔑 [DEBUG] Credenciais:', { client_id: this.config.client_id, client_secret: '***' });
            
            const response = await fetch(`${this.config.base_url}/api/partner/v1/auth-token`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    client_id: this.config.client_id,
                    client_secret: this.config.client_secret
                })
            });

            this.log('📊 [DEBUG] Status da resposta:', response.status);
            this.log('📋 [DEBUG] Headers da resposta:', Object.fromEntries(response.headers.entries()));

            if (!response.ok) {
                const errorText = await response.text();
                this.log('❌ [DEBUG] Erro na resposta:', errorText);
                throw new Error(`Erro na autenticação: ${response.status} - ${errorText}`);
            }

            const data = await response.json();
            this.log('✅ [DEBUG] Token obtido com sucesso:', { 
                access_token: data.access_token ? '***' : 'null',
                expires_at: data.expires_at 
            });
            
            this.authToken = data.access_token;
            this.tokenExpiry = new Date(data.expires_at);
            
            this.log('⏰ [DEBUG] Token expira em:', this.tokenExpiry);
            return this.authToken;
        } catch (error) {
            this.log('💥 [DEBUG] Erro ao obter token:', error);
            console.error('Erro ao obter token:', error);
            this.showError('Erro de conexão. Tente novamente.');
            return null;
        }
    }

    // Função para verificar se o token ainda é válido
    isTokenValid() {
        const isValid = this.authToken && this.tokenExpiry && new Date() < this.tokenExpiry;
        this.log('🔍 [DEBUG] Verificando validade do token:', { 
            hasToken: !!this.authToken, 
            hasExpiry: !!this.tokenExpiry, 
            isValid: isValid,
            currentTime: new Date(),
            expiryTime: this.tokenExpiry
        });
        return isValid;
    }

    // Função para criar transação PIX
    async createPixTransaction(amount, description, clientData) {
        this.log('💰 [DEBUG] Iniciando criação de transação PIX...');
        this.log('📊 [DEBUG] Dados da transação:', { amount, description, clientData });
        
        try {
            // Verificar/obter token
            if (!this.isTokenValid()) {
                this.log('🔄 [DEBUG] Token inválido, obtendo novo token...');
                await this.getAuthToken();
            } else {
                this.log('✅ [DEBUG] Token válido, usando token existente');
            }

            if (!this.authToken) {
                this.log('❌ [DEBUG] Falha na autenticação');
                throw new Error('Não foi possível autenticar');
            }

            const requestBody = {
                amount: amount,
                description: description,
                client: {
                    name: clientData.name,
                    cpf: clientData.cpf,
                    email: clientData.email,
                    phone: clientData.phone
                },
                split: [
                    {
                        percentage: 100,
                        user_id: this.config.user_id || "9f3c5b3a-41bc-4322-90e6-a87a98eefeca"
                    }
                ]
            };
            
            this.log('📡 [DEBUG] Fazendo requisição PIX para:', `${this.config.base_url}/api/partner/v1/cash-in`);
            this.log('📦 [DEBUG] Dados da requisição:', requestBody);

            // Criar transação PIX
            const response = await fetch(`${this.config.base_url}/api/partner/v1/cash-in`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${this.authToken}`,
                    'User-Agent': 'SyncPay-Integration/1.0',
                    'Cache-Control': 'no-cache'
                },
                body: JSON.stringify(requestBody)
            });

            this.log('📊 [DEBUG] Status da resposta PIX:', response.status);
            this.log('📋 [DEBUG] Headers da resposta PIX:', Object.fromEntries(response.headers.entries()));

            if (!response.ok) {
                const errorText = await response.text();
                this.log('❌ [DEBUG] Erro na resposta PIX:', errorText);
                throw new Error(`Erro ao criar transação PIX: ${response.status} - ${errorText}`);
            }

            const transaction = await response.json();
            this.log('✅ [DEBUG] Transação PIX criada com sucesso:', {
                identifier: transaction.identifier,
                pix_code: transaction.pix_code ? '***' : 'null',
                amount: transaction.amount,
                status: 'pending'
            });
            
            return {
                identifier: transaction.identifier,
                pix_code: transaction.pix_code,
                amount: transaction.amount,
                status: 'pending'
            };

        } catch (error) {
            this.log('💥 [DEBUG] Erro ao criar transação PIX:', error);
            console.error('Erro ao criar transação PIX:', error);
            this.showError('Erro ao gerar PIX. Tente novamente.');
            return null;
        }
    }

    // Função para mostrar modal de PIX
    showPixModal(pixData) {
        this.log('🖥️ [DEBUG] Exibindo modal PIX com dados:', {
            transaction_id: pixData.id,
            pix_code: pixData.pix_code ? '***' : 'null'
        });
        
        const modal = `
            <div id="pixModal" class="pix-modal-overlay">
                <div class="pix-modal">
                    <div class="pix-modal-header">
                        <h3>Pagamento via PIX</h3>
                        <button class="pix-modal-close" onclick="closePixModal()">&times;</button>
                    </div>
                    <div class="pix-modal-body">
                        <div class="pix-qr-container">
                            <div id="pixQRCode"></div>
                            <p class="pix-instructions">
                                Escaneie o QR Code com seu app de pagamentos
                            </p>
                        </div>
                        <div class="pix-copy-container">
                            <p>Ou copie o código PIX:</p>
                            <div class="pix-copy-input">
                                <input type="text" id="pixCode" value="${pixData.pix_code}" readonly>
                                <button onclick="copyPixCode()">Copiar</button>
                            </div>
                        </div>
                        <div class="pix-status">
                            <div class="pix-status-indicator">
                                <div class="pix-status-dot"></div>
                                <span>Aguardando pagamento...</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        $('body').append(modal);
        this.log('✅ [DEBUG] Modal PIX adicionado ao DOM');
        
        // Gerar QR Code
        this.generateQRCode(pixData.pix_code);
        
        // Iniciar verificação de status
        this.checkPaymentStatus(pixData.id);
    }

    // Função para gerar QR Code
    generateQRCode(pixCode) {
        this.log('📱 [DEBUG] Gerando QR Code para PIX:', pixCode ? '***' : 'null');
        
        // Usando QRCode.js
        if (typeof QRCode !== 'undefined') {
            this.log('✅ [DEBUG] QRCode.js disponível, gerando QR Code...');
            new QRCode(document.getElementById("pixQRCode"), {
                text: pixCode,
                width: 200,
                height: 200,
                colorDark: "#000000",
                colorLight: "#ffffff",
                correctLevel: QRCode.CorrectLevel.H
            });
            this.log('✅ [DEBUG] QR Code gerado com sucesso');
        } else {
            this.log('⚠️ [DEBUG] QRCode.js não disponível, usando fallback');
            // Fallback se QRCode.js não estiver disponível
            document.getElementById("pixQRCode").innerHTML = `
                <div style="text-align: center; padding: 20px;">
                    <p>QR Code não disponível</p>
                    <p>Use o código PIX abaixo</p>
                </div>
            `;
        }
    }

    // Função para verificar status do pagamento
    checkPaymentStatus(transactionId) {
        this.log('🔄 [DEBUG] Iniciando verificação de status para transação:', transactionId);
        
        const checkStatus = async () => {
            try {
                this.log('🔍 [DEBUG] Verificando status da transação:', transactionId);
                
                if (!this.isTokenValid()) {
                    this.log('🔄 [DEBUG] Token expirado, renovando...');
                    await this.getAuthToken();
                }

                this.log('📡 [DEBUG] Fazendo requisição de status para:', `${this.config.base_url}/api/partner/v1/transactions/${transactionId}`);

                const response = await fetch(`${this.config.base_url}/api/partner/v1/transactions/${transactionId}`, {
                    headers: {
                        'Authorization': `Bearer ${this.authToken}`
                    }
                });

                this.log('📊 [DEBUG] Status da resposta de verificação:', response.status);

                if (response.ok) {
                    const transaction = await response.json();
                    this.log('📋 [DEBUG] Dados da transação:', {
                        id: transaction.id,
                        status: transaction.status,
                        amount: transaction.amount,
                        created_at: transaction.created_at
                    });
                    
                    if (transaction.status === 'completed') {
                        this.log('✅ [DEBUG] Pagamento confirmado!');
                        this.showPaymentSuccess();
                        return;
                    } else if (transaction.status === 'expired') {
                        this.log('⏰ [DEBUG] PIX expirado!');
                        this.showPaymentExpired();
                        return;
                    } else {
                        this.log('⏳ [DEBUG] Status atual:', transaction.status);
                    }
                } else {
                    const errorText = await response.text();
                    this.log('❌ [DEBUG] Erro ao verificar status:', errorText);
                }
            } catch (error) {
                this.log('💥 [DEBUG] Erro ao verificar status:', error);
                console.error('Erro ao verificar status:', error);
            }

            // Continuar verificando a cada 5 segundos
            this.log('⏰ [DEBUG] Agendando próxima verificação em 5 segundos...');
            setTimeout(checkStatus, 5000);
        };

        checkStatus();
    }

    // Função para mostrar sucesso
    showPaymentSuccess() {
        this.log('🎉 [DEBUG] Exibindo sucesso do pagamento');
        $('.pix-status-indicator').html(`
            <div class="pix-status-dot success"></div>
            <span>Pagamento confirmado!</span>
        `);
        
        setTimeout(() => {
            this.closePixModal();
            this.showSuccessMessage('Pagamento realizado com sucesso! Sua assinatura foi ativada.');
        }, 2000);
    }

    // Função para mostrar expirado
    showPaymentExpired() {
        this.log('⏰ [DEBUG] Exibindo expiração do PIX');
        $('.pix-status-indicator').html(`
            <div class="pix-status-dot expired"></div>
            <span>PIX expirado</span>
        `);
        
        setTimeout(() => {
            this.closePixModal();
            this.showError('O PIX expirou. Tente gerar um novo.');
        }, 2000);
    }

    // Função para fechar modal
    closePixModal() {
        this.log('❌ [DEBUG] Fechando modal PIX');
        $('#pixModal').remove();
    }

    // Função para mostrar mensagem de sucesso
    showSuccessMessage(message) {
        this.log('✅ [DEBUG] Exibindo mensagem de sucesso:', message);
        if (typeof swal !== 'undefined') {
            swal({
                icon: 'success',
                title: 'Sucesso!',
                text: message,
                button: 'OK'
            });
        } else {
            this.log('⚠️ [DEBUG] SweetAlert não disponível, usando alert nativo');
            alert('Sucesso! ' + message);
        }
    }

    // Função para mostrar erro
    showError(message) {
        this.log('❌ [DEBUG] Exibindo mensagem de erro:', message);
        if (typeof swal !== 'undefined') {
            swal({
                icon: 'error',
                title: 'Erro',
                text: message,
                button: 'OK'
            });
        } else {
            this.log('⚠️ [DEBUG] SweetAlert não disponível, usando alert nativo');
            alert('Erro: ' + message);
        }
    }

    // Função para mostrar loading
    showLoading() {
        this.log('⏳ [DEBUG] Exibindo loading...');
        if (typeof swal !== 'undefined') {
            swal({
                title: 'Gerando PIX...',
                text: 'Aguarde um momento...',
                allowOutsideClick: false,
                showConfirmButton: false,
                willOpen: () => {
                    swal.showLoading();
                }
            });
        } else {
            this.log('⚠️ [DEBUG] SweetAlert não disponível, usando loading nativo');
            // Criar loading nativo se SweetAlert não estiver disponível
            const loadingDiv = document.createElement('div');
            loadingDiv.id = 'nativeLoading';
            loadingDiv.innerHTML = `
                <div style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; 
                     background: rgba(0,0,0,0.7); z-index: 9999; display: flex; 
                     align-items: center; justify-content: center;">
                    <div style="background: white; padding: 30px; border-radius: 10px; text-align: center;">
                        <div style="width: 40px; height: 40px; border: 4px solid #f3f3f3; 
                             border-top: 4px solid #3498db; border-radius: 50%; 
                             animation: spin 1s linear infinite; margin: 0 auto 15px;"></div>
                        <p>Gerando PIX...</p>
                    </div>
                </div>
                <style>
                    @keyframes spin {
                        0% { transform: rotate(0deg); }
                        100% { transform: rotate(360deg); }
                    }
                </style>
            `;
            document.body.appendChild(loadingDiv);
        }
    }
}

// Funções globais para o modal
window.closePixModal = function() {
    console.log('🔧 [DEBUG] Função global closePixModal chamada');
    $('#pixModal').remove();
}

window.copyPixCode = function() {
    console.log('🔧 [DEBUG] Função global copyPixCode chamada');
    const pixCode = document.getElementById('pixCode');
    pixCode.select();
    document.execCommand('copy');
    
    // Feedback visual
    const button = event.target;
    const originalText = button.textContent;
    button.textContent = 'Copiado!';
    button.style.backgroundColor = '#28a745';
    
    setTimeout(() => {
        button.textContent = originalText;
        button.style.backgroundColor = '';
    }, 2000);
}

// Inicializar SyncPay quando a página carregar
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 [DEBUG] DOM carregado, inicializando SyncPay...');
    
    // Verificar se a configuração está disponível
    if (!window.SYNCPAY_CONFIG) {
        console.error('❌ [DEBUG] SYNCPAY_CONFIG não encontrada!');
        return;
    }
    
    console.log('✅ [DEBUG] Configuração encontrada:', window.SYNCPAY_CONFIG);
    
    // Usar configuração externa
    const syncPay = new SyncPayIntegration(window.SYNCPAY_CONFIG);
    
    // Exportar para uso global
    window.syncPay = syncPay;
    
    console.log('✅ [DEBUG] SyncPay inicializado e disponível globalmente');
});
