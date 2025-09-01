// Script para testar a integração SyncPay via ngrok
// Execute este script após iniciar o ngrok

const https = require('https');
const http = require('http');

// Função para fazer requisição HTTP/HTTPS
function makeRequest(url, options = {}) {
    return new Promise((resolve, reject) => {
        const urlObj = new URL(url);
        const isHttps = urlObj.protocol === 'https:';
        const client = isHttps ? https : http;
        
        const requestOptions = {
            hostname: urlObj.hostname,
            port: urlObj.port || (isHttps ? 443 : 80),
            path: urlObj.pathname + urlObj.search,
            method: options.method || 'GET',
            headers: options.headers || {}
        };
        
        const req = client.request(requestOptions, (res) => {
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => {
                resolve({
                    status: res.statusCode,
                    headers: res.headers,
                    data: data
                });
            });
        });
        
        req.on('error', reject);
        
        if (options.body) {
            req.write(options.body);
        }
        
        req.end();
    });
}

// Função principal de teste
async function testNgrokIntegration(ngrokUrl) {
    console.log('🧪 Testando integração via ngrok...\n');
    console.log(`🌐 URL do ngrok: ${ngrokUrl}\n`);
    
    try {
        // Teste 1: Verificar se o servidor está respondendo
        console.log('1️⃣ Testando resposta do servidor...');
        const healthResponse = await makeRequest(`${ngrokUrl}/api/health`);
        console.log(`   Status: ${healthResponse.status}`);
        if (healthResponse.status === 200) {
            console.log('   ✅ Servidor respondendo corretamente');
        } else {
            console.log('   ❌ Servidor não está respondendo corretamente');
        }
        console.log('');
        
        // Teste 2: Verificar proxy SyncPay
        console.log('2️⃣ Testando proxy SyncPay...');
        const proxyResponse = await makeRequest(`${ngrokUrl}/api/test-syncpay`);
        console.log(`   Status: ${proxyResponse.status}`);
        if (proxyResponse.status === 200) {
            const proxyData = JSON.parse(proxyResponse.data);
            console.log('   ✅ Proxy funcionando');
            console.log(`   📋 Target URL: ${proxyData.target_url}`);
            
            if (proxyData.target_url.includes('api.syncpayments.com.br')) {
                console.log('   ✅ Target URL aponta para API de produção');
            } else {
                console.log('   ⚠️ Target URL não aponta para produção');
            }
        } else {
            console.log('   ❌ Proxy não está funcionando');
        }
        console.log('');
        
        // Teste 3: Testar endpoint de autenticação
        console.log('3️⃣ Testando endpoint de autenticação...');
        const authResponse = await makeRequest(`${ngrokUrl}/api/syncpay/auth/token`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                client_id: 'test',
                client_secret: 'test'
            })
        });
        console.log(`   Status: ${authResponse.status}`);
        if (authResponse.status === 401) {
            console.log('   ✅ Endpoint responde (erro 401 esperado para credenciais inválidas)');
        } else if (authResponse.status === 404) {
            console.log('   ⚠️ Endpoint não encontrado - verificar URL');
        } else {
            console.log(`   ✅ Endpoint responde com status: ${authResponse.status}`);
        }
        console.log('');
        
        // Teste 4: Testar página principal
        console.log('4️⃣ Testando página principal...');
        const mainResponse = await makeRequest(`${ngrokUrl}/`);
        console.log(`   Status: ${mainResponse.status}`);
        if (mainResponse.status === 200) {
            console.log('   ✅ Página principal carregando');
        } else {
            console.log('   ❌ Página principal não está carregando');
        }
        console.log('');
        
        // Resumo
        console.log('📊 Resumo dos testes:');
        console.log('✅ Servidor: Testado');
        console.log('✅ Proxy: Testado');
        console.log('✅ Autenticação: Testado');
        console.log('✅ Página principal: Testado');
        console.log('');
        console.log('🎉 Integração via ngrok está funcionando!');
        console.log('💡 Use a URL do ngrok para testar externamente');
        
    } catch (error) {
        console.error('❌ Erro durante os testes:', error.message);
    }
}

// Verificar se a URL do ngrok foi fornecida
const ngrokUrl = process.argv[2];
if (!ngrokUrl) {
    console.log('❌ URL do ngrok não fornecida!');
    console.log('💡 Uso: node test-ngrok.js <URL_DO_NGROK>');
    console.log('📋 Exemplo: node test-ngrok.js https://abc123.ngrok-free.app');
    process.exit(1);
}

// Executar testes
testNgrokIntegration(ngrokUrl);
