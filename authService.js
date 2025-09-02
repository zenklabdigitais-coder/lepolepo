const axios = require('axios');

let tokenCache = { access_token: null, expires_at: null };

async function getToken() {
  const now = Date.now();
  if (
    tokenCache.access_token &&
    tokenCache.expires_at &&
    now < tokenCache.expires_at
  ) {
    return tokenCache.access_token;
  }

  try {
    const { data } = await axios.post(
      'https://api.syncpayments.com.br/api/partner/v1/auth-token',
      {
        client_id: process.env.SYNCPAY_CLIENT_ID || '708ddc0b-357d-4548-b158-615684caa616',
        client_secret: process.env.SYNCPAY_CLIENT_SECRET || 'c08d40e5-3049-48c9-85c0-fd3cc6ca502c',
        '01K1259MAXE0TNRXV2C2WQN2MV': process.env.SYNCPAY_EXTRA || 'valor'
      }
    );

    tokenCache = {
      access_token: data.access_token,
      expires_at: new Date(data.expires_at).getTime()
    };

    return tokenCache.access_token;
  } catch (error) {
    console.error(
      '[authService] Erro ao autenticar:',
      error.response?.data || error.message
    );
    throw new Error('Falha ao autenticar com a API SyncPayments');
  }
}

module.exports = { getToken };
