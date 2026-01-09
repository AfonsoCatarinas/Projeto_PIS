// Importa a biblioteca para verificar tokens JWT
const jwt = require('jsonwebtoken');

// Função de middleware para autenticação
const auth = (req, res, next) => {
    try {
        // 1. Pega o token do cabeçalho Authorization
        // Formato: "Bearer token_aqui"
        const token = req.header('Authorization')?.replace('Bearer ', '');
        
        // 2. Verifica se existe token
        if (!token) {
            return res.status(401).json({ error: 'Acesso negado. Token não fornecido.' });
        }
        
        // 3. Verifica se o token é válido
        // Usa a chave secreta do .env para verificar
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // 4. Se for válido, adiciona os dados do utilizador ao pedido
        // decoded contém: { id, email, is_admin } do token
        req.user = decoded;
        
        // 5. Passa para a próxima função (controller)
        next();
        
    } catch (error) {
        // Se houver erro (token inválido/expirado)
        res.status(401).json({ error: 'Token inválido' });
    }
};

module.exports = auth;