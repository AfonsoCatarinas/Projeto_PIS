const User = require('../models/User');
const jwt = require('jsonwebtoken');
const fetch = require('node-fetch');

const authController = {
    
//registo
    async register(req, res) {
        try {
            console.log('Registo recebido:', req.body);
            
            const { name, email, password, is_admin } = req.body;
            
            // Validações básicas
            if (!name || !email || !password) {
                return res.status(400).json({ error: 'Todos os campos são obrigatórios' });
            }
            
            if (password.length < 6) {
                return res.status(400).json({ error: 'A password deve ter pelo menos 6 caracteres' });
            }
            
            // Verificar se email já existe
            const existingUser = await User.findByEmail(email);
            if (existingUser) {
                return res.status(400).json({ error: 'Email já registado' });
            }
            
            // IMPORTANTE: Por segurança, só permitir criar admins se já for admin
            // Ou se for através da rota especial register-admin
            let isUserAdmin = false;
            
            // Se o request tiver um user (vem do middleware auth), verificar se é admin
            if (req.user && req.user.is_admin) {
                // Se quem está a criar é admin, pode definir is_admin
                isUserAdmin = is_admin || false;
            } else {
                // Se não for admin a criar, sempre não-admin
                isUserAdmin = false;
            }
            
            console.log('A criar utilizador com is_admin:', isUserAdmin);
            
            // Criar utilizador
            const userId = await User.create({
                name,
                email,
                password,
                is_admin: isUserAdmin
            });
            
            // Criar token JWT
            const token = jwt.sign(
                { 
                    id: userId, 
                    email: email, 
                    is_admin: isUserAdmin 
                },
                process.env.JWT_SECRET,
                { expiresIn: '24h' }
            );
            
            res.status(201).json({ 
                message: 'Registo realizado com sucesso!',
                token,
                user: {
                    id: userId,
                    name,
                    email,
                    is_admin: isUserAdmin
                }
            });
            
        } catch (error) {
            console.error('Erro no registo:', error);
            res.status(500).json({ error: 'Erro interno do servidor' });
        }
    },

    // CRIAR UTILIZADOR (APENAS ADMIN)
    async createUser(req, res) {
        try {
            console.log('CREATE /api/auth/users chamado por admin ID:', req.user.id);
            console.log('Dados recebidos:', req.body);
            
            // Apenas admin pode criar utilizadores
            if (!req.user.is_admin) {
                return res.status(403).json({ error: 'Acesso negado. Apenas administradores.' });
            }
            
            const { name, email, password, is_admin } = req.body;
            
            // Validações
            if (!name || !email || !password) {
                return res.status(400).json({ error: 'Nome, email e password são obrigatórios' });
            }
            
            if (password.length < 6) {
                return res.status(400).json({ error: 'A password deve ter pelo menos 6 caracteres' });
            }
            
            // Verificar se email já existe
            const existingUser = await User.findByEmail(email);
            if (existingUser) {
                return res.status(400).json({ error: 'Email já registado' });
            }
            
            // Email validation
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                return res.status(400).json({ error: 'Email inválido' });
            }
            
            console.log('Criando utilizador com is_admin:', is_admin);
            
            // Criar utilizador (admin pode definir is_admin)
            const userId = await User.create({
                name,
                email,
                password,
                is_admin: is_admin || false
            });
            
            res.status(201).json({ 
                message: 'Utilizador criado com sucesso!',
                user: {
                    id: userId,
                    name,
                    email,
                    is_admin: is_admin || false
                }
            });
            
        } catch (error) {
            console.error('Erro no createUser:', error);
            res.status(500).json({ error: 'Erro interno do servidor' });
        }
    },

    // LOGIN
    async login(req, res) {
        try {
            console.log('Login recebido:', req.body);
            
            const { email, password } = req.body;
            
            // Validações
            if (!email || !password) {
                return res.status(400).json({ error: 'Email e password são obrigatórios' });
            }
            
            // Verificar se o utilizador existe
            const user = await User.findByEmail(email);
            if (!user) {
                return res.status(401).json({ error: 'Credenciais inválidas' });
            }
            
            // Verificar password
            const isValidPassword = await User.comparePassword(password, user.password);
            if (!isValidPassword) {
                return res.status(401).json({ error: 'Credenciais inválidas' });
            }
            
            // Criar token JWT
            const token = jwt.sign(
                { 
                    id: user.id, 
                    email: user.email, 
                    is_admin: user.is_admin 
                },
                process.env.JWT_SECRET,
                { expiresIn: '24h' }
            );
            
            // Remover password da resposta
            const { password: _, ...userWithoutPassword } = user;
            
            res.json({
                message: 'Login realizado com sucesso!',
                token,
                user: userWithoutPassword
            });
            
        } catch (error) {
            console.error('Erro no login:', error);
            res.status(500).json({ error: 'Erro interno do servidor' });
        }
    },

    // PERFIL
    async getProfile(req, res) {
        try {
            const user = await User.findById(req.user.id);
            if (!user) {
                return res.status(404).json({ error: 'Utilizador não encontrado' });
            }
            res.json(user);
        } catch (error) {
            console.error('Erro no getProfile:', error);
            res.status(500).json({ error: 'Erro interno do servidor' });
        }
    },

    // GERIR UTILIZADORES (ADMIN ONLY)
    // Obter todos os utilizadores
    async getAllUsers(req, res) {
        try {
            console.log('GET /api/auth/users chamado por user ID:', req.user.id);
            
            // Apenas admin pode ver todos os utilizadores
            if (!req.user.is_admin) {
                return res.status(403).json({ error: 'Acesso negado. Apenas administradores.' });
            }
            
            const users = await User.getAll();
            console.log(`Enviando ${users.length} utilizadores`);
            
            res.json(users);
            
        } catch (error) {
            console.error('Erro no getAllUsers:', error);
            res.status(500).json({ error: 'Erro interno do servidor' });
        }
    },

    // Obter utilizador específico
    async getUserById(req, res) {
        try {
            console.log('GET /api/auth/users/' + req.params.id);
            
            // Apenas admin
            if (!req.user.is_admin) {
                return res.status(403).json({ error: 'Acesso negado' });
            }
            
            const user = await User.findById(req.params.id);
            if (!user) {
                return res.status(404).json({ error: 'Utilizador não encontrado' });
            }
            
            res.json(user);
            
        } catch (error) {
            console.error('Erro no getUserById:', error);
            res.status(500).json({ error: 'Erro interno do servidor' });
        }
    },

    // Atualizar utilizador
    async updateUser(req, res) {
        try {
            console.log('PUT /api/auth/users/' + req.params.id, req.body);
            
            // Apenas admin
            if (!req.user.is_admin) {
                return res.status(403).json({ error: 'Acesso negado' });
            }
            
            const { name, email, password, is_admin } = req.body;
            
            // Validações
            if (!name || !email) {
                return res.status(400).json({ error: 'Nome e email são obrigatórios' });
            }
            
            // Verificar se o email já está a ser usado por outro utilizador
            const emailTaken = await User.isEmailTaken(email, req.params.id);
            if (emailTaken) {
                return res.status(400).json({ error: 'Email já está em uso por outro utilizador' });
            }
            
            // Preparar dados para atualização
            const updateData = { 
                name, 
                email, 
                is_admin: is_admin || false
            };
            
            // Se foi fornecida nova password e não está vazia
            if (password && password.trim() !== '') {
                if (password.length < 6) {
                    return res.status(400).json({ error: 'A password deve ter pelo menos 6 caracteres' });
                }
                updateData.password = password;
            }
            
            console.log('Dados para atualização:', updateData);
            
            // Atualizar utilizador
            const updated = await User.update(req.params.id, updateData);
            
            if (!updated) {
                return res.status(404).json({ error: 'Utilizador não encontrado' });
            }
            
            res.json({ 
                message: 'Utilizador atualizado com sucesso',
                user: {
                    id: req.params.id,
                    name,
                    email,
                    is_admin: is_admin || false
                }
            });
            
        } catch (error) {
            console.error('Erro no updateUser:', error);
            res.status(500).json({ error: 'Erro interno do servidor' });
        }
    },

    // Apagar utilizador
    async deleteUser(req, res) {
        try {
            console.log('DELETE /api/auth/users/' + req.params.id);
            
            // Apenas admin
            if (!req.user.is_admin) {
                return res.status(403).json({ error: 'Acesso negado' });
            }
            
            // Não permitir apagar a própria conta
            if (req.user.id === parseInt(req.params.id)) {
                return res.status(400).json({ error: 'Não pode apagar a sua própria conta' });
            }
            
            // Apagar utilizador
            const deleted = await User.delete(req.params.id);
            
            if (!deleted) {
                return res.status(404).json({ error: 'Utilizador não encontrado' });
            }
            
            res.json({ message: 'Utilizador apagado com sucesso' });
            
        } catch (error) {
            console.error('Erro no deleteUser:', error);
            res.status(500).json({ error: 'Erro interno do servidor' });
        }
    },

    // REGISTO DE ADMIN (para admin criar outros admins)
    async registerAdmin(req, res) {
        try {
            // Apenas admin pode criar outros admins
            if (!req.user || !req.user.is_admin) {
                return res.status(403).json({ error: 'Acesso negado. Apenas administradores.' });
            }
            
            const { name, email, password, is_admin = true } = req.body;
            
            // Validações
            if (!name || !email || !password) {
                return res.status(400).json({ error: 'Todos os campos são obrigatórios' });
            }
            
            if (password.length < 6) {
                return res.status(400).json({ error: 'A password deve ter pelo menos 6 caracteres' });
            }
            
            // Verificar se email já existe
            const existingUser = await User.findByEmail(email);
            if (existingUser) {
                return res.status(400).json({ error: 'Email já registado' });
            }
            
            // Criar administrador
            const userId = await User.create({
                name,
                email,
                password,
                is_admin: is_admin
            });
            
            res.status(201).json({ 
                message: 'Administrador criado com sucesso!',
                user: {
                    id: userId,
                    name,
                    email,
                    is_admin: is_admin
                }
            });
            
        } catch (error) {
            console.error('Erro no registerAdmin:', error);
            res.status(500).json({ error: 'Erro interno do servidor' });
        }
    },

    // LOGIN COM GOOGLE
    async googleLogin(req, res) {
        const { token } = req.body;

        try {
            // Validar token Google
            const googleRes = await fetch(
                `https://oauth2.googleapis.com/tokeninfo?id_token=${token}`
            );
            const googleUser = await googleRes.json();

            if (googleUser.error_description) {
                return res.status(401).json({ error: 'Token Google inválido' });
            }

            const { sub: googleId, email, name } = googleUser;

            // Verificar se existe usuário com esse Google ID ou email
            let user = await User.findByGoogleId(googleId);

            if (!user) {
                user = await User.findByEmail(email);

                if (user) {
                    // Se usuário existe, associar Google ID
                    await User.linkGoogleId(user.id, googleId);
                } else {
                    // Criar novo usuário
                    const id = await User.create({ name, email, google_id: googleId, is_admin: false });
                    user = { id, is_admin: false };
                }
            }

            // Gerar JWT
            const jwtToken = jwt.sign(
                { id: user.id },
                process.env.JWT_SECRET || 'supersecretkey',
                { expiresIn: 86400 }
            );

            res.json({
                token: jwtToken,
                user: {
                    id: user.id,
                    is_admin: user.is_admin
                }
            });

        } catch (err) {
            console.error(err);
            res.status(500).json({ error: 'Erro no login Google' });
        }
    }
};

module.exports = authController;