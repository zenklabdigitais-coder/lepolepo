// Teste simples da URL do ngrok
const https = require('https');

const ngrokUrl = 'https://8f298a9ff705.ngrok-free.app';

console.log('🧪 Testando URL do ngrok:', ngrokUrl);

// Teste básico da página principal
https.get(ngrokUrl, (res) => {
    console.log('📊 Status:', res.statusCode);
    console.log('📋 Headers:', res.headers);
    
    if (res.statusCode === 200) {
        console.log('✅ Página principal carregando corretamente');
    } else {
        console.log('❌ Problema ao carregar página principal');
    }
    
    // Testar endpoint de teste
    https.get(ngrokUrl + '/api/test-syncpay', (res2) => {
        console.log('\n🔍 Teste do proxy - Status:', res2.statusCode);
        
        let data = '';
        res2.on('data', chunk => data += chunk);
        res2.on('end', () => {
            try {
                const jsonData = JSON.parse(data);
                console.log('📋 Dados do proxy:', jsonData);
            } catch (e) {
                console.log('📋 Resposta (não JSON):', data);
            }
        });
    }).on('error', (err) => {
        console.log('❌ Erro no teste do proxy:', err.message);
    });
    
}).on('error', (err) => {
    console.log('❌ Erro ao acessar ngrok:', err.message);
});
