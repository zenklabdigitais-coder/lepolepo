// Função para obter token de autenticação via proxy local
async function fetchAuthToken() {
  var config = window.SYNCPAY_CONFIG || {};
  var clientId = config.client_id;
  var clientSecret = config.client_secret;

  if (!clientId || !clientSecret) {
    alert('client_id ou client_secret ausentes.');
    return;
  }

  var payload = {
    client_id: clientId,
    client_secret: clientSecret,
    '01K1259MAXE0TNRXV2C2WQN2MV': 'valor'
  };

  try {
    var response = await fetch('/api/auth-token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      throw new Error('Erro na requisição: ' + response.status);
    }

    var data = await response.json();

    if (data.access_token) {
      sessionStorage.setItem('access_token', data.access_token);
      alert('Token obtido com sucesso.');
      return data.access_token;
    }

    throw new Error('Resposta sem access_token');
  } catch (error) {
    console.error('Erro ao obter token:', error);
    alert('Erro ao obter token: ' + (error && error.message ? error.message : error));
  }
}

// Torna a função disponível globalmente
window.fetchAuthToken = fetchAuthToken;

// Exemplo de uso em um botão com id "authButton"
document.getElementById('authButton')?.addEventListener('click', fetchAuthToken);
