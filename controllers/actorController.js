// Importa o modelo Actor que contém as funções para interagir com a tabela de atores
const Actor = require('../models/Actor');

// Controlador que gere todas as operações relacionadas com atores
const actorController = {

    // Obtém todos os atores da base de dados
    async getAllActors(req, res) {
        try {
            // Chama o método getAll do modelo Actor para buscar todos os atores
            const actors = await Actor.getAll();
            // Retorna a lista de atores em formato JSON
            res.json(actors);
        } catch (error) {
            // Se ocorrer algum erro, retorna estado 500 com a mensagem de erro
            res.status(500).json({ error: error.message });
        }
    },

    // Obtém um ator específico pelo ID
    async getActorById(req, res) {
        try {
            // Procura o ator pelo ID passado no URL (req.params.id)
            const actor = await Actor.getById(req.params.id);
            
            // Se o ator não for encontrado, retorna erro 404
            if (!actor) {
                return res.status(404).json({ error: 'Ator não encontrado' });
            }
            
            // Retorna o ator encontrado em formato JSON
            res.json(actor);
        } catch (error) {
            // Se ocorrer algum erro, retorna estado 500 com a mensagem de erro
            res.status(500).json({ error: error.message });
        }
    },

    // Cria um novo ator
    async createActor(req, res) {
        try {
            // Verifica se o utilizador é administrador (segurança)
            if (!req.user.is_admin) {
                return res.status(403).json({ error: 'Acesso negado' });
            }
            
            // Chama o método create do modelo Actor, passando os dados do corpo do pedido
            const actorId = await Actor.create(req.body);
            
            // Retorna estado 201 (Criado) com mensagem de sucesso e o ID do ator criado
            res.status(201).json({ 
                message: 'Ator criado com sucesso',
                actorId 
            });
        } catch (error) {
            // Se ocorrer algum erro, retorna estado 500 com a mensagem de erro
            res.status(500).json({ error: error.message });
        }
    },

    // Atualiza um ator existente
    async updateActor(req, res) {
        try {
            // Verifica se o utilizador é administrador (segurança)
            if (!req.user.is_admin) {
                return res.status(403).json({ error: 'Acesso negado' });
            }
            
            // Chama o método update do modelo Actor, passando o ID e os novos dados
            await Actor.update(req.params.id, req.body);
            
            // Retorna mensagem de sucesso
            res.json({ message: 'Ator atualizado com sucesso' });
        } catch (error) {
            // Se ocorrer algum erro, retorna estado 500 com a mensagem de erro
            res.status(500).json({ error: error.message });
        }
    },

    // Remove um ator da base de dados
    async deleteActor(req, res) {
        try {
            // Verifica se o utilizador é administrador (segurança)
            if (!req.user.is_admin) {
                return res.status(403).json({ error: 'Acesso negado' });
            }
            
            // Chama o método delete do modelo Actor, passando o ID do ator a ser removido
            await Actor.delete(req.params.id);
            
            // Retorna mensagem de sucesso
            res.json({ message: 'Ator removido com sucesso' });
        } catch (error) {
            // Se ocorrer algum erro, retorna estado 500 com a mensagem de erro
            res.status(500).json({ error: error.message });
        }
    }
};

// Exporta o controlador para ser usado noutras partes da aplicação
module.exports = actorController;