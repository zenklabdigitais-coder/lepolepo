(async function(){
  try {
    // Sempre buscar configuração do servidor (removido modo demo)
    const res = await fetch('/api/config');
    const cfg = await res.json();

    window.APP_CONFIG = cfg;
    window.SYNCPAY_CONFIG = window.SYNCPAY_CONFIG || {};
    window.SYNCPAY_CONFIG.client_id = cfg.syncpay?.clientId;
    window.SYNCPAY_CONFIG.client_secret = cfg.syncpay?.clientSecret;
    window.SYNCPAY_CONFIG.plans = cfg.plans || {};
    window.PUSHINPAY_CONFIG = cfg.pushinpay || {};

    if (cfg.model && cfg.model.name) {
      document.title = `Privacy | Checkout ${cfg.model.name}`;
    }
    document.querySelectorAll('[data-config="model.name"]').forEach(el => el.textContent = cfg.model?.name || 'Modelo');
    document.querySelectorAll('[data-config="model.handle"]').forEach(el => el.textContent = cfg.model?.handle || '@modelo');
    document.querySelectorAll('[data-config="model.bio"]').forEach(el => el.textContent = cfg.model?.bio || 'Bio não informada.');

    if (cfg.plans) {
      Object.keys(cfg.plans).forEach(key => {
        const plan = cfg.plans[key];
        const labelEl = document.querySelector(`[data-config="plans.${key}.label"]`);
        const priceEl = document.querySelector(`[data-config="plans.${key}.priceLabel"]`);
        if (labelEl && plan.label) labelEl.textContent = plan.label;
        if (priceEl && plan.priceLabel) priceEl.textContent = plan.priceLabel;
      });
    }
  } catch (err) {
    console.error('Erro ao carregar configurações', err);
  }
})();
