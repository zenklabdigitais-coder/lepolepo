// Gateway Selector - Sistema de seleção de gateway de pagamento
class GatewaySelector {
    constructor() {
        this.currentGateway = 'syncpay';
        this.init();
    }

    async init() {
        await this.loadCurrentGateway();
        this.setupEventListeners();
        this.updateUI();
    }

    async loadCurrentGateway() {
        try {
            const response = await fetch('/api/gateways/current');
            const data = await response.json();
            if (data.success) {
                this.currentGateway = data.gateway;
            }
        } catch (error) {
            console.error('Erro ao carregar gateway atual:', error);
        }
    }

    setupEventListeners() {
        // Adicionar listener para mudança de gateway
        const gatewaySelect = document.getElementById('gateway-select');
        if (gatewaySelect) {
            gatewaySelect.addEventListener('change', (e) => {
                this.switchGateway(e.target.value);
            });
        }

        // Adicionar listener para botão de teste
        const testButton = document.getElementById('test-gateway');
        if (testButton) {
            testButton.addEventListener('click', () => {
                this.testCurrentGateway();
            });
        }
    }

    async switchGateway(gateway) {
        try {
            const response = await fetch('/api/gateways/switch', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ gateway })
            });

            const data = await response.json();
            
            if (data.success) {
                this.currentGateway = data.current;
                this.updateUI();
                this.showNotification(`Gateway alterado para ${gateway}`, 'success');
            } else {
                this.showNotification('Erro ao alterar gateway', 'error');
            }
        } catch (error) {
            console.error('Erro ao alterar gateway:', error);
            this.showNotification('Erro ao alterar gateway', 'error');
        }
    }

    async testCurrentGateway() {
        try {
            const testData = {
                amount: 10.00,
                description: 'Teste de pagamento',
                customer_name: 'Cliente Teste',
                customer_email: 'teste@exemplo.com',
                customer_document: '12345678901'
            };

            const response = await fetch('/api/payments/pix/create', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(testData)
            });

            const data = await response.json();
            
            if (data.success) {
                this.showNotification(`Teste realizado com sucesso via ${this.currentGateway}`, 'success');
                console.log('Resultado do teste:', data);
            } else {
                this.showNotification(`Erro no teste: ${data.error}`, 'error');
            }
        } catch (error) {
            console.error('Erro no teste:', error);
            this.showNotification('Erro ao realizar teste', 'error');
        }
    }

    updateUI() {
        // Atualizar select
        const gatewaySelect = document.getElementById('gateway-select');
        if (gatewaySelect) {
            gatewaySelect.value = this.currentGateway;
        }

        // Atualizar indicador visual
        const gatewayIndicator = document.getElementById('gateway-indicator');
        if (gatewayIndicator) {
            gatewayIndicator.textContent = this.currentGateway.toUpperCase();
            gatewayIndicator.className = `gateway-indicator ${this.currentGateway}`;
        }

        // Atualizar informações do gateway
        this.updateGatewayInfo();
    }

    async updateGatewayInfo() {
        try {
            const response = await fetch('/api/gateways');
            const data = await response.json();
            
            if (data.success) {
                const currentGatewayInfo = data.gateways.find(g => g.id === this.currentGateway);
                const gatewayInfo = document.getElementById('gateway-info');
                
                if (gatewayInfo && currentGatewayInfo) {
                    gatewayInfo.innerHTML = `
                        <h4>${currentGatewayInfo.name}</h4>
                        <p>${currentGatewayInfo.description}</p>
                        <ul>
                            ${currentGatewayInfo.features.map(feature => `<li>${feature}</li>`).join('')}
                        </ul>
                    `;
                }
            }
        } catch (error) {
            console.error('Erro ao carregar informações do gateway:', error);
        }
    }

    showNotification(message, type = 'info') {
        // Criar notificação usando SweetAlert2 se disponível
        if (typeof Swal !== 'undefined') {
            Swal.fire({
                title: type === 'success' ? 'Sucesso!' : type === 'error' ? 'Erro!' : 'Informação',
                text: message,
                icon: type,
                timer: 3000,
                showConfirmButton: false
            });
        } else {
            // Fallback para alert simples
            alert(`${type.toUpperCase()}: ${message}`);
        }
    }

    // Método para obter gateway atual
    getCurrentGateway() {
        return this.currentGateway;
    }

    // Método para verificar se é PushinPay
    isPushinPay() {
        return this.currentGateway === 'pushinpay';
    }

    // Método para verificar se é SyncPay
    isSyncPay() {
        return this.currentGateway === 'syncpay';
    }
}

// Inicializar quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
    window.gatewaySelector = new GatewaySelector();
});

// Exportar para uso global
if (typeof module !== 'undefined' && module.exports) {
    module.exports = GatewaySelector;
}