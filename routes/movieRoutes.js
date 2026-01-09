const express = require('express');
const router = express.Router();

// Importa o controlador dos filmes (tem as funções)
const movieController = require('../controllers/movieController');

// Importa o middleware de autenticação
const auth = require('../middleware/auth');

// GET /api/movies → Ver todos os filmes
router.get('/', movieController.getAllMovies);

// GET /api/movies/search?q=batman → Pesquisar filmes
router.get('/search', movieController.searchMovies);

// GET /api/movies/latest → Ver filmes mais recentes
router.get('/latest', movieController.getLatestMovies);

// GET /api/movies/5 → Ver detalhes do filme ID 5
router.get('/:id', movieController.getMovieById);

// POST /api/movies → Criar novo filme
router.post('/', auth, movieController.createMovie);

// PUT /api/movies/5 → Atualizar filme ID 5
router.put('/:id', auth, movieController.updateMovie);

// DELETE /api/movies/5 → Remover filme ID 5
router.delete('/:id', auth, movieController.deleteMovie);

// POST /api/movies/favorites → Adicionar filme aos favoritos
router.post('/favorites', auth, movieController.addToFavorites);

// DELETE /api/movies/favorites/5 → Remover filme 5 dos favoritos
router.delete('/favorites/:movieId', auth, movieController.removeFromFavorites);

// GET /api/movies/user/favorites → Ver meus filmes favoritos
router.get('/user/favorites', auth, movieController.getUserFavorites);

// Exporta o router
module.exports = router;