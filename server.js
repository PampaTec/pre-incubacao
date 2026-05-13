require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cookieSession = require('cookie-session');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;

// Middlewares
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5174',
    credentials: true
}));
app.use(express.json());
app.use(cookieSession({
    name: 'pampatec-session',
    keys: [process.env.COOKIE_KEY || 'pampatec-secret-key'],
    maxAge: 24 * 60 * 60 * 1000 // 24 horas
}));

// Rotas Básicas
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'Servidor PampaTec operante' });
});

// Rotas do sistema
const authRouter = require('./routes/authRouter');
const adminRouter = require('./routes/adminRouter');
const teamRouter = require('./routes/teamRouter');
const chatRouter = require('./routes/chatRouter');
const skillRouter = require('./routes/skillRouter');
const templateRouter = require('./routes/templateRouter');

// Aplicando as rotas
app.use('/auth', authRouter);
app.use('/api/admin', adminRouter);
app.use('/api/teams', teamRouter);
app.use('/api/chat', chatRouter);
app.use('/api/skill', skillRouter);
app.use('/api/templates', templateRouter);


// Servir frontend em produção
if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, 'src/dist')));
    app.get('*', (req, res) => {
        res.sendFile(path.join(__dirname, 'src/dist/index.html'));
    });
}

app.listen(PORT, () => {
    console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
});
