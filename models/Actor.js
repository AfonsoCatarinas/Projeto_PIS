const pool = require('../config/database');

// Objeto Actor com funções para a tabela de atores
const Actor = {
    // Criar novo ator
    async create(actor) {
        // Executa INSERT na tabela actors
        const [result] = await pool.execute(
            'INSERT INTO actors (name, bio, birth_date, photo_url) VALUES (?, ?, ?, ?)',
            [actor.name, actor.bio, actor.birth_date, actor.photo_url]
        );
        // Retorna o ID do ator criado
        return result.insertId;
    },

    // Buscar todos os atores
    async getAll() {
        // Executa SELECT * ordenado por nome
        const [rows] = await pool.execute('SELECT * FROM actors ORDER BY name');
        // Retorna todos os atores
        return rows;
    },

    // Buscar ator pelo ID
    async getById(id) {
        // Executa SELECT com WHERE id
        const [rows] = await pool.execute('SELECT * FROM actors WHERE id = ?', [id]);
        // Retorna apenas o primeiro resultado (ou undefined)
        return rows[0];
    },

    // Atualizar ator existente
    async update(id, actor) {
        // Executa UPDATE na tabela actors
        await pool.execute(
            'UPDATE actors SET name = ?, bio = ?, birth_date = ?, photo_url = ? WHERE id = ?',
            [actor.name, actor.bio, actor.birth_date, actor.photo_url, id]
        );
    },

    // Apagar ator
    async delete(id) {
        // Executa DELETE na tabela actors
        await pool.execute('DELETE FROM actors WHERE id = ?', [id]);
    }
};

module.exports = Actor;