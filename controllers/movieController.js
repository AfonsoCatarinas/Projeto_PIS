const pool = require('../config/database');

const movieController = {
    async getAllMovies(req, res) {
        try {
            const [movies] = await pool.execute(`
                SELECT m.*, a.name AS director_name 
                FROM movies m 
                LEFT JOIN actors a ON m.director_id = a.id 
                ORDER BY m.release_year DESC
            `);
            
            // Adicionar géneros a cada filme
            for (let movie of movies) {
                const [genres] = await pool.execute(`
                    SELECT g.id, g.name 
                    FROM genres g 
                    JOIN movie_genres mg ON g.id = mg.genre_id 
                    WHERE mg.movie_id = ?
                `, [movie.id]);
                movie.genres = genres;
            }
            
            res.json(movies);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    async getMovieById(req, res) {
        try {
            const [rows] = await pool.execute(`
                SELECT m.*, a.name AS director_name, a.bio AS director_bio
                FROM movies m 
                LEFT JOIN actors a ON m.director_id = a.id 
                WHERE m.id = ?
            `, [req.params.id]);
            
            if (rows.length === 0) {
                return res.status(404).json({ error: 'Filme não encontrado' });
            }
            
            const movie = rows[0];
            
            // Obter géneros
            const [genres] = await pool.execute(`
                SELECT g.id, g.name 
                FROM genres g 
                JOIN movie_genres mg ON g.id = mg.genre_id 
                WHERE mg.movie_id = ?
            `, [movie.id]);
            movie.genres = genres;
            
            // Obter elenco (se existir tabela movie_cast)
            try {
                const [cast] = await pool.execute(`
                    SELECT a.id, a.name, a.photo_url, mc.character_name
                    FROM actors a 
                    JOIN movie_cast mc ON a.id = mc.actor_id 
                    WHERE mc.movie_id = ?
                `, [movie.id]);
                movie.cast = cast || [];
            } catch (castError) {
                movie.cast = []; // Tabela pode não existir ainda
            }
            
            res.json(movie);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    async createMovie(req, res) {
        try {
            if (!req.user.is_admin) {
                return res.status(403).json({ error: 'Acesso negado. Apenas administradores.' });
            }
            
            const { title, synopsis, duration, release_year, director_id, poster_url, trailer_url, genres } = req.body;
            
            // Inserir filme
            const [result] = await pool.execute(
                `INSERT INTO movies (title, synopsis, duration, release_year, director_id, poster_url, trailer_url) 
                 VALUES (?, ?, ?, ?, ?, ?, ?)`,
                [title, synopsis, duration, release_year, director_id, poster_url, trailer_url]
            );
            
            const movieId = result.insertId;
            
            // Inserir géneros
            if (genres && Array.isArray(genres) && genres.length > 0) {
                for (const genreId of genres) {
                    await pool.execute(
                        'INSERT INTO movie_genres (movie_id, genre_id) VALUES (?, ?)',
                        [movieId, genreId]
                    );
                }
            }
            
            res.status(201).json({ 
                message: 'Filme criado com sucesso',
                movieId 
            });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    async updateMovie(req, res) {
        try {
            if (!req.user.is_admin) {
                return res.status(403).json({ error: 'Acesso negado. Apenas administradores.' });
            }
            
            const { title, synopsis, duration, release_year, director_id, poster_url, trailer_url, genres } = req.body;
            const movieId = req.params.id;
            
            // Atualizar filme
            await pool.execute(
                `UPDATE movies 
                 SET title = ?, synopsis = ?, duration = ?, release_year = ?, 
                     director_id = ?, poster_url = ?, trailer_url = ?
                     
                 WHERE id = ?`,
                [title, synopsis, duration, release_year, director_id, poster_url, trailer_url, movieId]
            );
            
            // Atualizar géneros
            await pool.execute('DELETE FROM movie_genres WHERE movie_id = ?', [movieId]);
            
            if (genres && Array.isArray(genres) && genres.length > 0) {
                for (const genreId of genres) {
                    await pool.execute(
                        'INSERT INTO movie_genres (movie_id, genre_id) VALUES (?, ?)',
                        [movieId, genreId]
                    );
                }
            }
            
            res.json({ message: 'Filme atualizado com sucesso' });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    async deleteMovie(req, res) {
        try {
            if (!req.user.is_admin) {
                return res.status(403).json({ error: 'Acesso negado. Apenas administradores.' });
            }
            
            await pool.execute('DELETE FROM movies WHERE id = ?', [req.params.id]);
            res.json({ message: 'Filme removido com sucesso' });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    async searchMovies(req, res) {
        try {
            const { q } = req.query;
            
            if (!q || q.trim() === '') {
                return res.json([]);
            }
            
            const searchTerm = `%${q}%`;
            const [movies] = await pool.execute(
                `SELECT m.*, a.name AS director_name 
                 FROM movies m 
                 LEFT JOIN actors a ON m.director_id = a.id 
                 WHERE m.title LIKE ? OR m.synopsis LIKE ? 
                 ORDER BY m.title`,
                [searchTerm, searchTerm]
            );
            
            res.json(movies);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    async getLatestMovies(req, res) {
        try {
            const [movies] = await pool.execute(`
                SELECT m.*, a.name AS director_name 
                FROM movies m 
                LEFT JOIN actors a ON m.director_id = a.id 
                ORDER BY m.release_year DESC 
                LIMIT 10
            `);
            
            res.json(movies);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    // Adicionar aos favoritos
async addToFavorites(req, res) {
    try {
        const { movieId } = req.body;
        const userId = req.user.id;
        
        console.log(`[Favoritos] User ${userId} está a tentar adicionar filme ${movieId}`);
        
        // Verificar se o movieId foi fornecido
        if (!movieId) {
            return res.status(400).json({ error: 'ID do filme é obrigatório' });
        }
        
        // Verificar se o filme existe
        const [movieExists] = await pool.execute(
            'SELECT id FROM movies WHERE id = ?',
            [movieId]
        );
        
        if (movieExists.length === 0) {
            return res.status(404).json({ error: 'Filme não encontrado' });
        }
        
        // Verificar se já está nos favoritos (nome da tabela corrigido)
        const [existing] = await pool.execute(
            'SELECT * FROM favorites WHERE user_id = ? AND movie_id = ?',
            [userId, movieId]
        );
        
        if (existing.length > 0) {
            return res.status(400).json({ 
                error: 'Este filme já está nos seus favoritos',
                isFavorite: true 
            });
        }
        
        // Adicionar aos favoritos
        await pool.execute(
            'INSERT INTO favorites (user_id, movie_id) VALUES (?, ?)',
            [userId, movieId]
        );
        
        console.log(`[Favoritos] Filme ${movieId} adicionado aos favoritos do user ${userId}`);
        
        res.json({ 
            message: 'Adicionado aos favoritos com sucesso',
            isFavorite: true 
        });
    } catch (error) {
        console.error('[Favoritos] Erro:', error);
        res.status(500).json({ error: error.message });
    }
},

    async removeFromFavorites(req, res) {
        try {
            const { movieId } = req.params;
            const userId = req.user.id;
            
            const [result] = await pool.execute(
                'DELETE FROM favorites WHERE user_id = ? AND movie_id = ?',
                [userId, movieId]
            );
            
            if (result.affectedRows === 0) {
                return res.status(404).json({ error: 'Favorito não encontrado' });
            }
            
            res.json({ message: 'Removido dos favoritos com sucesso' });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    async getUserFavorites(req, res) {
        try {
            const userId = req.user.id;
            
            const [favorites] = await pool.execute(`
                SELECT m.*, a.name AS director_name 
                FROM movies m 
                JOIN favorites f ON m.id = f.movie_id 
                LEFT JOIN actors a ON m.director_id = a.id 
                WHERE f.user_id = ?
    
            `, [userId]);
            
            res.json(favorites);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
};

module.exports = movieController;