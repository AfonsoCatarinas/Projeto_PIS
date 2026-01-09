const pool = require('../config/database');
const bcrypt = require('bcryptjs');

const User = {
    // Criar utilizador
    async create(user) {
        // Criptografa a password
        const hashedPassword = await bcrypt.hash(user.password, 10);
        
        // Insere na base de dados
        const [result] = await pool.execute(
            'INSERT INTO users (name, email, password, is_admin) VALUES (?, ?, ?, ?)',
            [user.name, user.email, hashedPassword, user.is_admin || false]
        );
        
        // Retorna o ID criado
        return result.insertId;
    },

    // Buscar por email
    async findByEmail(email) {
        // Procura utilizador pelo email
        const [rows] = await pool.execute('SELECT * FROM users WHERE email = ?', [email]);
        // Retorna o utilizador encontrado
        return rows[0];
    },

    // Buscar por ID (sem password)
    async findById(id) {
        // Procura utilizador pelo ID (não mostra a password)
        const [rows] = await pool.execute(
            'SELECT id, name, email, is_admin, created_at FROM users WHERE id = ?', 
            [id]
        );
        return rows[0];
    },

    // Todos os utilizadores (sem passwords)
    async getAll() {
        // Lista todos os utilizadores (sem mostrar passwords)
        const [rows] = await pool.execute(
            'SELECT id, name, email, is_admin, created_at FROM users ORDER BY name'
        );
        return rows;
    },

    // Atualizar utilizador
    async update(id, data) {
        // Atualiza nome, email, is_admin
        let query = 'UPDATE users SET name = ?, email = ?, is_admin = ?';
        let params = [data.name, data.email, data.is_admin || false];
        
        // Se tiver nova password, adiciona
        if (data.password) {
            const hashedPassword = await bcrypt.hash(data.password, 10);
            query += ', password = ?';
            params.push(hashedPassword);
        }
        
        // Adiciona WHERE
        query += ' WHERE id = ?';
        params.push(id);
        
        // Executa
        const [result] = await pool.execute(query, params);
        return result.affectedRows > 0;
    },

    // Apagar utilizador
    async delete(id) {
        // Apaga o utilizador
        const [result] = await pool.execute('DELETE FROM users WHERE id = ?', [id]);
        return result.affectedRows > 0;
    },

    // Verificar password
    async comparePassword(password, hash) {
        // Compara password normal com password criptografada
        return await bcrypt.compare(password, hash);
    },

    // Verificar se email já existe
    async isEmailTaken(email, excludeUserId = null) {
        // Procura email
        let query = 'SELECT id FROM users WHERE email = ?';
        const params = [email];
        
        // Se for atualização, exclui o próprio utilizador
        if (excludeUserId) {
            query += ' AND id != ?';
            params.push(excludeUserId);
        }
        
        const [rows] = await pool.execute(query, params);
        // Retorna true se email já existe
        return rows.length > 0;
    }
};

module.exports = User;