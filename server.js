const express = require('express');
const cors = require('cors');
const path = require('path');
const { syncpayGet, syncpayPost } = require('./syncpayApi');

const app = express();
const PORT = process.env.PORT || 3000;

// Configurar CORS
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// Middleware para interpretar JSON no corpo das requisições
app.use(express.json());

// Servir arquivos estáticos do diretório public
app.use(express.static(path.join(__dirname, 'public')));

// Rota protegida de exemplo - consulta de saldo
app.get('/balance', async (req, res) => {
    try {
        const response = await syncpayGet('/balance');
        res.json(response.data);
    } catch (err) {
        console.error('[Balance] Erro ao obter saldo:', err.response?.data || err.message);
        res.status(500).json({
            message: 'Não foi possível obter o saldo',
            details: err.response?.data || err.message
        });
    }
});

// Rota para criação de transação (cash-in)
app.post('/cash-in', async (req, res) => {
    try {
        const response = await syncpayPost('/cash-in', req.body);
        res.json(response.data);
    } catch (err) {
        console.error('[Cash-in] Erro ao criar transação:', err.response?.data || err.message);
        res.status(err.response?.status || 500).json({
            message: 'Não foi possível criar a transação',
            details: err.response?.data || err.message
        });
    }
});

// Rota de teste para verificar se o servidor está funcionando
app.get('/api/health', (req, res) => {
    res.json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        message: 'Servidor funcionando corretamente'
    });
});

// Rota principal
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Servidor rodando na porta ${PORT}`);
    console.log(`📱 Acesse: http://localhost:${PORT}`);
    console.log(`🌐 Acesse externamente: http://0.0.0.0:${PORT}`);
});
