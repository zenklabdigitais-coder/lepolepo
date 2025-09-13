/**
 * UTMify Tracking - Cliente Frontend
 * Gerencia captura de UTMs, FBP, FBC e eventos de conversão no frontend
 */

class UTMifyTracker {
    constructor() {
        this.utmParams = {};
        this.fbParams = {};
        this.sessionData = {};
        
        console.log('🎯 UTMify Tracker inicializado');
        this.init();
    }

    /**
     * Inicializar tracker
     */
    init() {
        // Capturar parâmetros da URL atual
        this.captureURLParams();
        
        // Carregar parâmetros salvos da sessão
        this.loadSessionData();
        
        // Preservar parâmetros na sessão
        this.saveSessionData();
        
        // Configurar interceptação de redirects
        this.setupRedirectInterception();
        
        console.log('📊 Parâmetros capturados:', {
            utm: this.utmParams,
            fb: this.fbParams
        });
    }

    /**
     * Capturar parâmetros da URL atual
     */
    captureURLParams() {
        const urlParams = new URLSearchParams(window.location.search);
        
        // Capturar parâmetros UTM
        this.utmParams = {
            src: urlParams.get('src'),
            sck: urlParams.get('sck'),
            utm_source: urlParams.get('utm_source'),
            utm_campaign: urlParams.get('utm_campaign'),
            utm_medium: urlParams.get('utm_medium'),
            utm_content: urlParams.get('utm_content'),
            utm_term: urlParams.get('utm_term')
        };

        // Capturar parâmetros do Facebook
        this.fbParams = {
            fbp: urlParams.get('fbp') || this.getFBPFromCookie(),
            fbc: urlParams.get('fbc') || this.getFBCFromCookie(),
            fb_click_id: urlParams.get('fbclid')
        };

        // Remover parâmetros null/undefined
        Object.keys(this.utmParams).forEach(key => {
            if (!this.utmParams[key]) delete this.utmParams[key];
        });
        
        Object.keys(this.fbParams).forEach(key => {
            if (!this.fbParams[key]) delete this.fbParams[key];
        });
    }

    /**
     * Obter FBP do cookie _fbp
     */
    getFBPFromCookie() {
        const fbpCookie = document.cookie
            .split('; ')
            .find(row => row.startsWith('_fbp='));
        
        return fbpCookie ? fbpCookie.split('=')[1] : null;
    }

    /**
     * Obter FBC do cookie _fbc
     */
    getFBCFromCookie() {
        const fbcCookie = document.cookie
            .split('; ')
            .find(row => row.startsWith('_fbc='));
        
        return fbcCookie ? fbcCookie.split('=')[1] : null;
    }

    /**
     * Carregar dados da sessão
     */
    loadSessionData() {
        try {
            const savedUTM = localStorage.getItem('utmify_utm_params');
            const savedFB = localStorage.getItem('utmify_fb_params');
            
            if (savedUTM) {
                const savedUTMData = JSON.parse(savedUTM);
                // Manter parâmetros anteriores se não houver novos
                Object.keys(savedUTMData).forEach(key => {
                    if (!this.utmParams[key] && savedUTMData[key]) {
                        this.utmParams[key] = savedUTMData[key];
                    }
                });
            }
            
            if (savedFB) {
                const savedFBData = JSON.parse(savedFB);
                Object.keys(savedFBData).forEach(key => {
                    if (!this.fbParams[key] && savedFBData[key]) {
                        this.fbParams[key] = savedFBData[key];
                    }
                });
            }
        } catch (error) {
            console.error('❌ Erro ao carregar dados da sessão:', error);
        }
    }

    /**
     * Salvar dados na sessão
     */
    saveSessionData() {
        try {
            localStorage.setItem('utmify_utm_params', JSON.stringify(this.utmParams));
            localStorage.setItem('utmify_fb_params', JSON.stringify(this.fbParams));
            
            // Salvar timestamp da sessão
            localStorage.setItem('utmify_session_start', Date.now().toString());
        } catch (error) {
            console.error('❌ Erro ao salvar dados na sessão:', error);
        }
    }

    /**
     * Configurar interceptação de redirects para preservar parâmetros
     */
    setupRedirectInterception() {
        // Interceptar cliques em links
        document.addEventListener('click', (event) => {
            const link = event.target.closest('a');
            if (link && link.href) {
                this.preserveParamsInURL(link);
            }
        });

        // Interceptar mudanças de localização via JavaScript
        const originalPushState = history.pushState;
        const originalReplaceState = history.replaceState;
        
        history.pushState = (...args) => {
            if (args[2]) {
                args[2] = this.addParamsToURL(args[2]);
            }
            return originalPushState.apply(history, args);
        };
        
        history.replaceState = (...args) => {
            if (args[2]) {
                args[2] = this.addParamsToURL(args[2]);
            }
            return originalReplaceState.apply(history, args);
        };
    }

    /**
     * Preservar parâmetros em links
     */
    preserveParamsInURL(linkElement) {
        try {
            if (linkElement.href.includes('javascript:') || 
                linkElement.href.includes('mailto:') || 
                linkElement.href.includes('tel:')) {
                return;
            }

            const url = new URL(linkElement.href);
            
            // Adicionar parâmetros UTM
            Object.keys(this.utmParams).forEach(key => {
                if (this.utmParams[key] && !url.searchParams.has(key)) {
                    url.searchParams.set(key, this.utmParams[key]);
                }
            });

            // Adicionar parâmetros Facebook
            Object.keys(this.fbParams).forEach(key => {
                if (this.fbParams[key] && !url.searchParams.has(key)) {
                    url.searchParams.set(key, this.fbParams[key]);
                }
            });

            linkElement.href = url.toString();
            
        } catch (error) {
            console.error('❌ Erro ao preservar parâmetros no link:', error);
        }
    }

    /**
     * Adicionar parâmetros a uma URL
     */
    addParamsToURL(url) {
        try {
            const urlObj = new URL(url, window.location.origin);
            
            // Adicionar parâmetros UTM
            Object.keys(this.utmParams).forEach(key => {
                if (this.utmParams[key] && !urlObj.searchParams.has(key)) {
                    urlObj.searchParams.set(key, this.utmParams[key]);
                }
            });

            // Adicionar parâmetros Facebook
            Object.keys(this.fbParams).forEach(key => {
                if (this.fbParams[key] && !urlObj.searchParams.has(key)) {
                    urlObj.searchParams.set(key, this.fbParams[key]);
                }
            });

            return urlObj.toString();
        } catch (error) {
            console.error('❌ Erro ao adicionar parâmetros à URL:', error);
            return url;
        }
    }

    /**
     * Obter todos os parâmetros de rastreamento
     */
    getAllTrackingParams() {
        return {
            ...this.utmParams,
            ...this.fbParams,
            session_start: localStorage.getItem('utmify_session_start'),
            timestamp: Date.now()
        };
    }

    /**
     * Enviar evento de checkout iniciado
     */
    async trackInitiateCheckout(orderData) {
        try {
            console.log('🛒 Enviando evento initiate_checkout...');
            
            const trackingData = {
                ...orderData,
                utmParams: this.utmParams,
                fbParams: this.fbParams,
                event: 'initiate_checkout',
                timestamp: new Date().toISOString()
            };

            // Enviar para o backend que irá encaminhar para UTMify
            const response = await fetch('/api/utmify/initiate-checkout', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(trackingData)
            });

            if (response.ok) {
                console.log('✅ Evento initiate_checkout enviado com sucesso');
            } else {
                console.error('❌ Erro ao enviar evento initiate_checkout:', response.statusText);
            }

        } catch (error) {
            console.error('❌ Erro ao rastrear initiate_checkout:', error);
        }
    }

    /**
     * Enviar evento de compra concluída
     */
    async trackPurchase(orderData) {
        try {
            console.log('💰 Enviando evento purchase...');
            
            const trackingData = {
                ...orderData,
                utmParams: this.utmParams,
                fbParams: this.fbParams,
                event: 'purchase',
                timestamp: new Date().toISOString()
            };

            // Enviar para o backend que irá encaminhar para UTMify
            const response = await fetch('/api/utmify/purchase', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(trackingData)
            });

            if (response.ok) {
                console.log('✅ Evento purchase enviado com sucesso');
            } else {
                console.error('❌ Erro ao enviar evento purchase:', response.statusText);
            }

        } catch (error) {
            console.error('❌ Erro ao rastrear purchase:', error);
        }
    }

    /**
     * Limpar dados de rastreamento
     */
    clearTrackingData() {
        localStorage.removeItem('utmify_utm_params');
        localStorage.removeItem('utmify_fb_params');
        localStorage.removeItem('utmify_session_start');
        
        this.utmParams = {};
        this.fbParams = {};
        
        console.log('🧹 Dados de rastreamento limpos');
    }

    /**
     * Debug - exibir informações de rastreamento
     */
    debug() {
        console.log('🔍 UTMify Tracker Debug:', {
            utmParams: this.utmParams,
            fbParams: this.fbParams,
            sessionStart: localStorage.getItem('utmify_session_start'),
            currentURL: window.location.href
        });
    }
}

// Inicializar tracker globalmente
window.utmifyTracker = new UTMifyTracker();

// Expor funções globais para facilitar uso
window.trackInitiateCheckout = (orderData) => window.utmifyTracker.trackInitiateCheckout(orderData);
window.trackPurchase = (orderData) => window.utmifyTracker.trackPurchase(orderData);
window.getTrackingParams = () => window.utmifyTracker.getAllTrackingParams();
