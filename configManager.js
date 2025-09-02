const readline = require('readline');
const { getConfig, saveConfig } = require('./loadConfig');

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

function ask(question, defaultValue) {
  return new Promise(resolve => {
    rl.question(`${question} (${defaultValue}): `, answer => {
      resolve(answer.trim() === '' ? defaultValue : answer.trim());
    });
  });
}

async function main() {
  const cfg = getConfig();

  cfg.gateway = await ask('Gateway (syncpay/pushinpay)', cfg.gateway);
  cfg.environment = await ask('Environment (production/sandbox)', cfg.environment);
  cfg.syncpay.clientId = await ask('SyncPay Client ID', cfg.syncpay.clientId);
  cfg.syncpay.clientSecret = await ask('SyncPay Client Secret', cfg.syncpay.clientSecret);
  cfg.pushinpay.token = await ask('PushinPay Token', cfg.pushinpay.token);

  cfg.webhook = cfg.webhook || { baseUrl: 'https://seu-dominio.com', secret: 'sua-chave-secreta-aqui' };
  cfg.webhook.baseUrl = await ask('Webhook base URL', cfg.webhook.baseUrl);
  cfg.webhook.secret = await ask('Webhook secret', cfg.webhook.secret);

  cfg.redirectUrl = await ask('Redirect URL', cfg.redirectUrl || 'https://www.youtube.com/watch?v=KWiSv44OYI0&list=RDKWiSv44OYI0&start_radio=1');

  cfg.model.name = await ask('Model name', cfg.model.name);
  cfg.model.handle = await ask('Model @', cfg.model.handle);
  cfg.model.bio = await ask('Model bio', cfg.model.bio);

  for (const key of Object.keys(cfg.plans)) {
    const plan = cfg.plans[key];
    plan.label = await ask(`Plan ${key} label`, plan.label);
    plan.priceLabel = await ask(`Plan ${key} price label`, plan.priceLabel);
    plan.price = parseFloat(await ask(`Plan ${key} amount`, plan.price));
  }

  saveConfig(cfg);
  console.log('Configuration saved to app-config.json');
  rl.close();
}

main();
