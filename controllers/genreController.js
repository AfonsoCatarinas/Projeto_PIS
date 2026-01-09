const Genre = require('../models/Genre');

// Controlador que gere todas as operações relacionadas com géneros
const genreController = {

    // Obtém todos os géneros da base de dados
    async getAllGenres(req, res) {
        try {
            // Chama o método getAll do modelo Genre para buscar todos os géneros
            const genres = await Genre.getAll();
            
            // Retorna a lista de géneros em formato JSON
            res.json(genres);
            
        } catch (error) {
            // Se ocorrer algum erro, retorna estado 500 com a mensagem de erro
            res.status(500).json({ error: error.message });
        }
    },

// Obter um género por ID (NOVA FUNÇÃO)
    async getGenreById(req, res) {
        try {
            const genre = await Genre.getById(req.params.id);
            if (!genre) {
                return res.status(404).json({ error: 'Género não encontrado' });
            }
            res.json(genre);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    // Cria um novo género
    async createGenre(req, res) {
        try {
            // Verifica se o utilizador é administrador
            // Apenas administradores podem criar géneros
            if (!req.user.is_admin) {
                return res.status(403).json({ error: 'Acesso negado' });
            }
            
            // Chama o método create do modelo Genre
            // Passa os dados recebidos no corpo do pedido
            const genreId = await Genre.create(req.body);
            
            // Retorna estado 201 (Criado) com mensagem de sucesso e ID do género criado
            res.status(201).json({ 
                message: 'Género criado com sucesso',
                genreId 
            });
            
        } catch (error) {
            // Se ocorrer algum erro, retorna estado 500 com a mensagem de erro
            res.status(500).json({ error: error.message });
        }
    },

    // Atualiza um género existente
    async updateGenre(req, res) {
        try {
            // Verifica se o utilizador é administrador
            // Apenas administradores podem atualizar géneros
            if (!req.user.is_admin) {
                return res.status(403).json({ error: 'Acesso negado' });
            }
            
            // Chama o método update do modelo Genre
            // Passa o ID do género (da URL) e os novos dados (do corpo do pedido)
            await Genre.update(req.params.id, req.body);
            
            // Retorna mensagem de sucesso
            res.json({ message: 'Género atualizado com sucesso' });
            
        } catch (error) {
            // Se ocorrer algum erro, retorna estado 500 com a mensagem de erro
            res.status(500).json({ error: error.message });
        }
    },

    // Remove um género da base de dados
    async deleteGenre(req, res) {
        try {
            // Verifica se o utilizador é administrador
            // Apenas administradores podem remover géneros
            if (!req.user.is_admin) {
                return res.status(403).json({ error: 'Acesso negado' });
            }
            
            // Chama o método delete do modelo Genre
            // Passa o ID do género a ser removido
            await Genre.delete(req.params.id);
            
            // Retorna mensagem de sucesso
            res.json({ message: 'Género removido com sucesso' });
            
        } catch (error) {
            // Se ocorrer algum erro, retorna estado 500 com a mensagem de erro
            res.status(500).json({ error: error.message });
        }
    }
};
module.exports = genreController;