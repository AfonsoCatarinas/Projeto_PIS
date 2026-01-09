const pool = require('../config/database');

const Movie = {
    // Criar filme
    async create(movie) {
        // Insere filme
        const [result] = await pool.execute(
            'INSERT INTO movies (title, synopsis, duration, release_year, director_id, poster_url, trailer_url) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [movie.title, movie.synopsis, movie.duration, movie.release_year, movie.director_id, movie.poster_url, movie.trailer_url]
        );
        
        const movieId = result.insertId;
        
        // Insere géneros do filme
        if (movie.genres && movie.genres.length > 0) {
            for (const genreId of movie.genres) {
                await pool.execute(
                    'INSERT INTO movie_genres (movie_id, genre_id) VALUES (?, ?)',
                    [movieId, genreId]
                );
            }
        }
        
        return movieId;
    },

    // Todos filmes
    async getAll() {
        // Busca filmes
        const [movies] = await pool.execute(`
            SELECT m.*, a.name AS director_name 
            FROM movies m 
            LEFT JOIN actors a ON m.director_id = a.id
        `);
        
        // Para cada filme, busca géneros
        for (let movie of movies) {
            const [genres] = await pool.execute(
                'SELECT g.id, g.name FROM genres g JOIN movie_genres mg ON g.id = mg.genre_id WHERE mg.movie_id = ?',
                [movie.id]
            );
            movie.genres = genres;
        }
        
        return movies;
    },

    // Filme por ID
    async getById(id) {
        // Busca filme
        const [rows] = await pool.execute(`
            SELECT m.*, a.name AS director_name, a.bio AS director_bio
            FROM movies m 
            LEFT JOIN actors a ON m.director_id = a.id 
            WHERE m.id = ?
        `, [id]);
        
        if (rows.length === 0) return null;
        
        const movie = rows[0];
        
        // Busca géneros
        const [genres] = await pool.execute(
            'SELECT g.id, g.name FROM genres g JOIN movie_genres mg ON g.id = mg.genre_id WHERE mg.movie_id = ?',
            [id]
        );
        movie.genres = genres;
        
        return movie;
    },

    // Atualizar filme
    async update(id, movie) {
        // Atualiza dados do filme
        await pool.execute(
            'UPDATE movies SET title = ?, synopsis = ?, duration = ?, release_year = ?, director_id = ?, poster_url = ?, trailer_url = ? WHERE id = ?',
            [movie.title, movie.synopsis, movie.duration, movie.release_year, movie.director_id, movie.poster_url, movie.trailer_url, id]
        );
        
        // Atualiza géneros
        // 1. Remove géneros antigos
        await pool.execute('DELETE FROM movie_genres WHERE movie_id = ?', [id]);
        
        // 2. Adiciona novos géneros
        if (movie.genres && movie.genres.length > 0) {
            for (const genreId of movie.genres) {
                await pool.execute(
                    'INSERT INTO movie_genres (movie_id, genre_id) VALUES (?, ?)',
                    [id, genreId]
                );
            }
        }
    },

    // Apagar filme
    async delete(id) {
        await pool.execute('DELETE FROM movies WHERE id = ?', [id]);
    },

    // Pesquisar filmes
    async search(query) {
        if (!query || query.trim() === '') return [];
        
        const searchTerm = `%${query}%`;
        const [movies] = await pool.execute(
            'SELECT m.*, a.name AS director_name FROM movies m LEFT JOIN actors a ON m.director_id = a.id WHERE m.title LIKE ? OR m.synopsis LIKE ? ORDER BY m.title',
            [searchTerm, searchTerm]
        );
        
        return movies;
    },

    // Filmes recentes
    async getLatest(limit = 6) {
        const [movies] = await pool.execute(
            'SELECT m.*, a.name AS director_name FROM movies m LEFT JOIN actors a ON m.director_id = a.id ORDER BY m.release_year DESC LIMIT ?',
            [limit]
        );
        return movies;
    },

    // Filmes por género
    async getByGenre(genreId) {
        const [movies] = await pool.execute(
            'SELECT m.*, a.name AS director_name FROM movies m LEFT JOIN actors a ON m.director_id = a.id JOIN movie_genres mg ON m.id = mg.movie_id WHERE mg.genre_id = ? ORDER BY m.release_year DESC',
            [genreId]
        );
        return movies;
    },

    // Filmes por ano
    async getByYear(year) {
        const [movies] = await pool.execute(
            'SELECT m.*, a.name AS director_name FROM movies m LEFT JOIN actors a ON m.director_id = a.id WHERE m.release_year = ? ORDER BY m.title',
            [year]
        );
        return movies;
    }
};

module.exports = Movie;