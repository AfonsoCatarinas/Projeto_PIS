const pool = require('../config/database');

// Objeto Genre com funções para a tabela de géneros
const Genre = {
    // Criar novo género
    async create(genre) {
        // Executa INSERT para adicionar novo género
        const [result] = await pool.execute('INSERT INTO genres (name) VALUES (?)', [genre.name]);
        // Retorna o ID do género criado
        return result.insertId;
    },

    // Buscar todos os géneros
    async getAll() {
        // Executa SELECT * ordenado por nome
        const [rows] = await pool.execute('SELECT * FROM genres ORDER BY name');
        // Retorna todos os géneros
        return rows;
    },

    // Buscar género pelo ID
    async getById(id) {
        // Executa SELECT com WHERE id
        const [rows] = await pool.execute('SELECT * FROM genres WHERE id = ?', [id]);
        // Retorna apenas o primeiro resultado
        return rows[0];
    },

    // Atualizar género existente
    async update(id, genre) {
        // Executa UPDATE para alterar nome do género
        await pool.execute('UPDATE genres SET name = ? WHERE id = ?', [genre.name, id]);
    },

    // Apagar género
    async delete(id) {
        // Executa DELETE para remover género
        await pool.execute('DELETE FROM genres WHERE id = ?', [id]);
    }
};

// Exporta o modelo
module.exports = Genre;