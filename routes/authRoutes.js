const express = require('express');
const jwt = require('jsonwebtoken');
const fetch = require('node-fetch');

const router = express.Router();

// Importa o controlador de autenticação
const authController = require('../controllers/authController');

// Importa o middleware de autenticação
const auth = require('../middleware/auth');

// bd
const db = require('../config/database');

// POST /api/auth/register → Criar conta normal
router.post('/register', authController.register);

// POST /api/auth/login → Fazer login
router.post('/login', authController.login);

// LOGIN GOOGLE
// POST /api/auth/google
router.post('/google', authController.googleLogin);

// GET /api/auth/profile → Ver meu perfil
router.get('/profile', auth, authController.getProfile);

// POST /api/auth/register-admin → Admin cria outro admin
router.post('/register-admin', auth, authController.registerAdmin);

// POST /api/auth/users → Admin cria utilizador normal
router.post('/users', auth, authController.createUser);

// GET /api/auth/users → Admin vê todos os utilizadores
router.get('/users', auth, authController.getAllUsers);

// GET /api/auth/users/5 → Admin vê utilizador 5
router.get('/users/:id', auth, authController.getUserById);

// PUT /api/auth/users/5 → Admin atualiza utilizador 5
router.put('/users/:id', auth, authController.updateUser);

// DELETE /api/auth/users/5 → Admin apaga utilizador 5
router.delete('/users/:id', auth, authController.deleteUser);

// Exporta as rotas
module.exports = router;