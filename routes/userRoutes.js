const express = require('express');
const router = express.Router();

// Importa middleware de autenticação
const auth = require('../middleware/auth');

// Importa conexão à base de dados
const pool = require('../config/database');

// GET /api/users/stats → Obter estatísticas gerais do sistema
// Apenas utilizadores autenticados podem ver
router.get('/stats', auth, async (req, res) => {
    try {
        // 1. Contar total de filmes
        const [[{ totalMovies }]] = await pool.execute('SELECT COUNT(*) as totalMovies FROM movies');
        
        // 2. Contar total de utilizadores
        const [[{ totalUsers }]] = await pool.execute('SELECT COUNT(*) as totalUsers FROM users');
        
        // 3. Contar total de atores
        const [[{ totalActors }]] = await pool.execute('SELECT COUNT(*) as totalActors FROM actors');
        
        // 4. Contar total de avaliações
        const [[{ totalReviews }]] = await pool.execute('SELECT COUNT(*) as totalReviews FROM reviews');
        
        // 5. Retornar estatísticas em formato JSON
        res.json({
            totalMovies,
            totalUsers,
            totalActors,
            totalReviews
        });
        
    } catch (error) {
        // Se ocorrer erro, retorna erro 500
        res.status(500).json({ error: error.message });
    }
});

// Exporta o router
module.exports = router;