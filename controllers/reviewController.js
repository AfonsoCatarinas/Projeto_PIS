// Importa o modelo Review
const Review = require('../models/Review');

const reviewController = {
    // Criar uma nova review
    async createReview(req, res) {
        try {
            // Pega os dados do pedido e adiciona o ID do utilizador
            const reviewData = {
                ...req.body,
                user_id: req.user.id
            };
            
            // Cria a review
            const reviewId = await Review.create(reviewData);
            
            // Responde com sucesso
            res.status(201).json({ 
                message: 'Review criada com sucesso',
                reviewId 
            });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    // Ver reviews de um filme
    async getMovieReviews(req, res) {
        try {
            // Pega o ID do filme da URL
            const movieId = req.params.movieId;
            
            // Busca reviews do filme
            const reviews = await Review.getByMovie(movieId);
            
            // Retorna as reviews
            res.json(reviews);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    // Ver reviews do utilizador atual
    async getUserReviews(req, res) {
        try {
            // Pega reviews do utilizador logado
            const reviews = await Review.getByUser(req.user.id);
            
            // Retorna as reviews
            res.json(reviews);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    // Ver TODAS as reviews (só admin)
    async getAllReviews(req, res) {
        try {
            // Verifica se é admin
            if (!req.user.is_admin) {
                return res.status(403).json({ error: 'Acesso negado' });
            }
            
            // Busca todas as reviews
            const reviews = await Review.getAll();
            
            // Retorna as reviews
            res.json(reviews);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    // Ver uma review específica (só admin)
    async getReviewById(req, res) {
        try {
            // Verifica se é admin
            if (!req.user.is_admin) {
                return res.status(403).json({ error: 'Acesso negado' });
            }
            
            // Busca a review pelo ID
            const review = await Review.getById(req.params.id);
            
            // Se não existir, retorna erro
            if (!review) {
                return res.status(404).json({ error: 'Review não encontrada' });
            }
            
            // Retorna a review
            res.json(review);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    // Marcar review como útil
    async voteUseful(req, res) {
        try {
            // Adiciona +1 nos votos "útil"
            await Review.incrementUsefulVotes(req.params.id);
            
            // Retorna sucesso
            res.json({ message: 'Voto registado' });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    // Apagar review (só admin)
    async deleteReview(req, res) {
        try {
            // Verifica se é admin
            if (!req.user.is_admin) {
                return res.status(403).json({ error: 'Acesso negado' });
            }
            
            // Apaga a review
            await Review.delete(req.params.id);
            
            // Retorna sucesso
            res.json({ message: 'Review removida' });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
};

// Exporta o controlador
module.exports = reviewController;