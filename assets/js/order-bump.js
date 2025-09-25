/**
 * ORDER BUMP SYSTEM
 * Sistema de Order Bump integrado ao modal de pagamento
 */

class OrderBump {
    constructor() {
        this.root = null;
        this.baseName = '';
        this.baseAmount = 0;
        this.summaryList = null;
        this.summaryTotal = null;
        this.payButton = null;
        
        this.init();
    }
    
    init() {
        console.log('🛒 Order Bump inicializado');
        
        // Aguardar DOM estar pronto
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setup());
        } else {
            this.setup();
        }
    }
    
    setup() {
        this.root = document.getElementById('order-bump-root');
        if (!this.root) {
            console.log('⚠️ Order Bump root não encontrado');
            return;
        }
        
        // Obter dados base
        this.baseName = this.root.dataset.baseName || 'Plano';
        this.baseAmount = Number(this.root.dataset.baseAmount || '0');
        
        // Obter elementos
        this.summaryList = document.getElementById('summary-items');
        this.summaryTotal = document.getElementById('summary-total');
        this.payButton = document.getElementById('pay-now');
        
        if (!this.summaryList || !this.summaryTotal) {
            console.error('❌ Elementos do resumo não encontrados');
            return;
        }
        
        this.bindEvents();
        this.updateSummary();
        
        console.log('✅ Order Bump configurado com sucesso');
    }
    
    bindEvents() {
        // Listeners para checkboxes
        document.querySelectorAll('.bump-checkbox').forEach(input => {
            input.addEventListener('change', () => this.updateSummary());
            
            // Clique no card também alterna o checkbox
            const card = input.closest('.bump-product-card');
            if (card) {
            card.addEventListener('click', (e) => {
                    // Não duplicar quando clicar no elemento do input/label
                    if (e.target.tagName.toLowerCase() === 'input' || 
                        e.target.tagName.toLowerCase() === 'label') {
                    return;
                }
                
                    input.checked = !input.checked;
                    input.dispatchEvent(new Event('change'));
                });
            }
        });
        
        // Botão de pagar
        if (this.payButton) {
            this.payButton.addEventListener('click', () => this.handlePayment());
        }
    }
    
    renderBase() {
        if (!this.summaryList) return;
        
        this.summaryList.innerHTML = `
            <div class="summary-item main-product">
                <span class="item-name">${this.baseName}</span>
                <span class="item-price">${this.formatCurrency(this.baseAmount)}</span>
            </div>
        `;
    }
    
    updateSummary() {
        this.renderBase();
        let total = this.baseAmount;
        
        document.querySelectorAll('.bump-checkbox').forEach(input => {
            const card = input.closest('.bump-product-card');
            
            if (input.checked) {
                card?.classList.add('selected');
                
                const name = input.dataset.name || 'Item';
                const price = Number(input.dataset.price || '0');
                total += price;
                
                const div = document.createElement('div');
                div.className = 'summary-item bump-item';
                div.innerHTML = `
                    <span class="item-name">${name}</span>
                    <span class="item-price">${this.formatCurrency(price)}</span>
                `;
                
                if (this.summaryList) {
                    this.summaryList.appendChild(div);
                }
            } else {
                card?.classList.remove('selected');
            }
        });
        
        if (this.summaryTotal) {
            this.summaryTotal.textContent = this.formatCurrency(total);
        }
    }
    
    formatCurrency(value) {
        try {
            return value.toLocaleString('pt-BR', {
                style: 'currency',
                currency: 'BRL'
            });
        } catch {
            return `R$ ${Number(value).toFixed(2).replace('.', ',')}`;
        }
    }
    
    getSelectedItems() {
        const items = [{
            name: this.baseName,
            price: this.baseAmount,
            type: 'main'
        }];
        
        document.querySelectorAll('.bump-checkbox:checked').forEach(input => {
            items.push({
                name: input.dataset.name || 'Item',
                price: Number(input.dataset.price || '0'),
                type: 'bump'
            });
        });
        
        return items;
    }
    
    getTotalAmount() {
        return this.getSelectedItems().reduce((total, item) => total + item.price, 0);
    }
    
    handlePayment() {
        const total = this.getTotalAmount();
        const items = this.getSelectedItems();
        
        console.log('🔥 Processando pagamento Order Bump:', {
            total: this.formatCurrency(total),
            items: items
        });
        
        // Criar dados da transação para o sistema de pagamento
        const transactionData = {
            amount: total,
            price: total,
            description: `${this.baseName} + ${items.length - 1} extras`,
            items: items,
            skipOrderBump: true // Evitar loop infinito
        };
        
        // Fechar modal atual e abrir PIX
        this.proceedToPixPayment(transactionData);
    }
    
    proceedToPixPayment(transactionData) {
        console.log('💳 Redirecionando para Modal de Pagamento PIX...');
        
        // Fechar modal atual
        const modal = document.querySelector('.payment-modal-overlay');
        if (modal) {
            modal.classList.remove('show');
            modal.style.display = 'none';
        }
        
        // Aguardar fechamento e abrir PIX
        setTimeout(() => {
            // Gerar código PIX
            const pixCode = this.generatePixCode(transactionData.amount);
            
            // Usar Modal de Pagamento PIX se disponível
            if (window.PixPopupAlternative) {
                console.log('📱 Usando Modal de Pagamento PIX...');
                window.PixPopupAlternative.show({
                    pix_code: pixCode,
                    amount: transactionData.amount,
                    description: transactionData.description
                });
                return;
            }
            
            // Fallback: Modal Order Bump (modo PIX)
            if (window.PaymentModal) {
                console.log('📱 Usando Modal Order Bump (modo PIX)...');
                const transaction = {
                    pix_qr_code: pixCode,
                    pix_copy_paste: pixCode,
                    pix_code: pixCode,
                    amount: transactionData.amount,
                    price: transactionData.amount,
                    description: transactionData.description,
                    skipOrderBump: true
                };
                
                window.PaymentModal.show(transaction);
                return;
            }
            
            // Último recurso: alert
            console.log('📱 Fallback: mostrando alert...');
            alert(`✅ PIX Gerado!\n\nTotal: ${this.formatCurrency(transactionData.amount)}\n\nCódigo PIX:\n${pixCode.substring(0, 100)}...`);
            
        }, 300);
    }
    
    generatePixCode(amount) {
        // Gerar código PIX EMV padrão
        const amountStr = amount.toFixed(2);
        const pixCode = `00020126580014br.gov.bcb.pix01361234567890-abcdef-1234-5678-90ab-cdef1234567890520400005303986540${amountStr}5802BR5913Modern OrderBump6009Sao Paulo62070503***6304`;
        
        return pixCode;
    }
    
    // Método para integração externa
    setBaseProduct(name, amount) {
        this.baseName = name;
        this.baseAmount = amount;
        
        if (this.root) {
            this.root.dataset.baseName = name;
            this.root.dataset.baseAmount = amount.toString();
        }
        
        this.updateSummary();
    }
}

// Instância global
window.OrderBump = new OrderBump();

// Função para integração com sistema existente
window.initOrderBump = function(baseName, baseAmount) {
    if (window.OrderBump) {
        window.OrderBump.setBaseProduct(baseName, baseAmount);
    }
};

console.log('🎨 Order Bump carregado e disponível globalmente');
