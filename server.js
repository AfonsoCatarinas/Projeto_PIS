// app.js - Ficheiro principal do servidor
// Configura o Express e define todas as rotas

const express = require('express');
const cors = require('cors');
const path = require('path');
const session = require('express-session');
require('dotenv').config(); // Carrega variáveis do .env

// Cria a aplicação Express
const app = express();
const PORT = process.env.PORT || 3000; // Porta do servidor

// ====================
// CONFIGURAÇÕES
// ====================

// Permite pedidos de outros domínios (frontend)
app.use(cors());

// Permite receber dados em JSON
app.use(express.json());

// Permite receber dados de formulários
app.use(express.urlencoded({ extended: true }));

// Serve ficheiros estáticos (HTML, CSS, JS, imagens)
app.use(express.static(path.join(__dirname, 'public')));

// Configura sessões (para manter login)
app.use(session({
    secret: process.env.SESSION_SECRET || 'secret', // Chave secreta
    resave: false,
    saveUninitialized: true,
    cookie: { 
        maxAge: 24 * 60 * 60 * 1000 // Cookie dura 24 horas
    }
}));

// ====================
// ROTAS DA API
// ====================

// Todas as rotas começam com /api
app.use('/api/auth', require('./routes/authRoutes'));    // Autenticação
app.use('/api/movies', require('./routes/movieRoutes')); // Filmes
app.use('/api/actors', require('./routes/actorRoutes')); // Atores
app.use('/api/genres', require('./routes/genreRoutes')); // Géneros
app.use('/api/reviews', require('./routes/reviewRoutes')); // Avaliações
app.use('/api/users', require('./routes/userRoutes'));   // Utilizadores

// ====================
// ROTAS FRONTOFFICE
// (Parte pública do site)
// ====================

// Página inicial redireciona para frontoffice
app.get('/', (req, res) => {
    res.redirect('/frontoffice');
});

// Frontoffice - Páginas principais
app.get('/frontoffice', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/views/frontoffice/index.html'));
});

app.get('/frontoffice/movies', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/views/frontoffice/movies.html'));
});

app.get('/frontoffice/movie/:id', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/views/frontoffice/movie-details.html'));
});

app.get('/frontoffice/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/views/frontoffice/login.html'));
});

app.get('/frontoffice/register', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/views/frontoffice/register.html'));
});

app.get('/frontoffice/profile', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/views/frontoffice/profile.html'));
});
app.get('/frontoffice/search', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/views/frontoffice//search.html'));
});

// ====================
// ROTAS BACKOFFICE
// (Parte administrativa)
// ====================

// Backoffice - Dashboard admin
app.get('/backoffice', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/views/backoffice/dashboard.html'));
});

app.get('/backoffice/movies', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/views/backoffice/movies.html'));
});

app.get('/backoffice/actors', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/views/backoffice/actors.html'));
});

app.get('/backoffice/genres', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/views/backoffice/genres.html'));
});

app.get('/backoffice/users', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/views/backoffice/users.html'));
});
app.get('/backoffice/reviews', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/views/backoffice/reviews.html'));
});

// ====================
// ROTAS DE ERRO
// ====================

// Se tentar /api/algo-inexistente
app.use('/api/*', (req, res) => {
    res.status(404).json({ error: 'Rota API não encontrada' });
});

// Qualquer outra rota vai para a página inicial
app.use('*', (req, res) => {
    res.redirect('/frontoffice');
});

// ====================
// INICIAR SERVIDOR
// ====================

app.listen(PORT, () => {
    console.log(`App: http://localhost:${PORT}/frontoffice`);
});