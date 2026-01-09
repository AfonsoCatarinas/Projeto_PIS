const express = require('express');
const router = express.Router();

// Importa o controlador dos géneros (tem as funções)
const genreController = require('../controllers/genreController');

// Importa o middleware de autenticação (verifica se o utilizador está logado)
const auth = require('../middleware/auth');

// GET /api/genres
// Qualquer pessoa pode ver a lista de géneros
router.get('/', genreController.getAllGenres);
router.get('/:id', genreController.getGenreById); 

// POST /api/genres
// Apenas administradores podem criar novos géneros
router.post('/', auth, genreController.createGenre);

// PUT /api/genres/5
// Apenas administradores podem atualizar um género específico (ID 5)
router.put('/:id', auth, genreController.updateGenre);

// DELETE /api/genres/5
// Apenas administradores podem remover um género específico (ID 5)
router.delete('/:id', auth, genreController.deleteGenre);

// Exporta o router para poder ser usado noutro ficheiro
module.exports = router;