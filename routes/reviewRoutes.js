const express = require('express');
const router = express.Router();

// Importa o controlador das reviews (tem as funções)
const reviewController = require('../controllers/reviewController');

// Importa o middleware de autenticação
const auth = require('../middleware/auth');

// GET /api/reviews/movie/5 → Ver avaliações do filme ID 5
router.get('/movie/:movieId', reviewController.getMovieReviews);

// POST /api/reviews → Criar nova avaliação
router.post('/', auth, reviewController.createReview);

// GET /api/reviews/user → Ver minhas avaliações
router.get('/user', auth, reviewController.getUserReviews);

// POST /api/reviews/5/vote → Votar "útil" na avaliação ID 5
router.post('/:id/vote', auth, reviewController.voteUseful);

// GET /api/reviews → Ver TODAS as avaliações
router.get('/', auth, reviewController.getAllReviews);

// GET /api/reviews/5 → Ver detalhes de uma avaliação específica
router.get('/:id', auth, reviewController.getReviewById);

// DELETE /api/reviews/5 → Remover uma avaliação
router.delete('/:id', auth, reviewController.deleteReview);

// Exporta o router
module.exports = router;