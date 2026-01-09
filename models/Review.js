const pool = require('../config/database');

const Review = {
    // CRIAR - Adiciona nova avaliação
    async create(data) {
        const [result] = await pool.query('INSERT INTO reviews SET ?', data);
        return result.insertId;
    },

    // LER TODAS - Lista todas as avaliações com informações do utilizador e filme
    async getAll() {
        const [rows] = await pool.query(`
            SELECT 
                r.*,
                u.name as user_name,
                u.email as user_email,
                m.title as movie_title,
                m.poster_url as movie_poster
            FROM reviews r
            JOIN users u ON r.user_id = u.id
            JOIN movies m ON r.movie_id = m.id
            ORDER BY r.created_at DESC
        `);
        return rows;
    },

    // LER POR ID - Busca uma avaliação específica com todas as informações
    async getById(id) {
        const [rows] = await pool.query(`
            SELECT 
                r.*,
                u.name as user_name,
                u.email as user_email,
                m.title as movie_title,
                m.poster_url as movie_poster,
                m.release_year as movie_year
            FROM reviews r
            JOIN users u ON r.user_id = u.id
            JOIN movies m ON r.movie_id = m.id
            WHERE r.id = ?
        `, [id]);
        return rows[0];
    },

    // LER POR FILME - Busca avaliações de um filme com nome dos utilizadores
    async getByMovie(movieId) {
        const [rows] = await pool.query(`
            SELECT 
                r.*,
                u.name as user_name,
                u.email as user_email
            FROM reviews r
            JOIN users u ON r.user_id = u.id
            WHERE r.movie_id = ?
            ORDER BY r.created_at DESC
        `, [movieId]);
        return rows;
    },

    // LER POR UTILIZADOR - Busca avaliações de um utilizador com título do filme
    async getByUser(userId) {
        const [rows] = await pool.query(`
            SELECT 
                r.*,
                m.title as movie_title,
                m.poster_url as movie_poster
            FROM reviews r
            JOIN movies m ON r.movie_id = m.id
            WHERE r.user_id = ?
            ORDER BY r.created_at DESC
        `, [userId]);
        return rows;
    },

    // ATUALIZAR - Modifica uma avaliação existente
    async update(id, data) {
        await pool.query('UPDATE reviews SET ? WHERE id = ?', [data, id]);
    },

    // APAGAR - Remove uma avaliação
    async delete(id) {
        await pool.query('DELETE FROM reviews WHERE id = ?', [id]);
    },

    // +1 voto útil
    async incrementUsefulVotes(id) {
        await pool.query('UPDATE reviews SET useful_votes = useful_votes + 1 WHERE id = ?', [id]);
    },

    // Obter estatísticas das reviews
    async getStats() {
        const [[{ totalReviews }]] = await pool.query('SELECT COUNT(*) as totalReviews FROM reviews');
        const [[{ avgRating }]] = await pool.query('SELECT AVG(rating) as avgRating FROM reviews');
        const [[{ totalVotes }]] = await pool.query('SELECT SUM(useful_votes) as totalVotes FROM reviews');
        
        return {
            totalReviews,
            avgRating: avgRating ? parseFloat(avgRating).toFixed(1) : 0,
            totalVotes
        };
    }
};

module.exports = Review;