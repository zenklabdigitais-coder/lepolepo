// Função para obter token de autenticação via proxy local
async function fetchAuthToken() {
  const payload = {
    client_id: window.SYNCPAY_CONFIG?.client_id || '',
    client_secret: window.SYNCPAY_CONFIG?.client_secret || '',
    '01K1259MAXE0TNRXV2C2WQN2MV': 'valor'
  };

  try {
    const response = await fetch('/api/auth-token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      throw new Error(`Erro na requisição: ${response.status}`);
    }

    const data = await response.json();
    console.log('Access token:', data.access_token);
    return data.access_token;
  } catch (error) {
    console.error('Erro ao obter token:', error);
  }
}

// Torna a função disponível globalmente
window.fetchAuthToken = fetchAuthToken;

// Exemplo de uso em um botão com id "authButton"
document.getElementById('authButton')?.addEventListener('click', fetchAuthToken);
