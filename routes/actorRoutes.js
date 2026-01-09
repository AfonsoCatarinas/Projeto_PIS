const express = require('express');
const router = express.Router();

// Importa o controlador dos atores
const actorController = require('../controllers/actorController');

// Importa o middleware de autenticação
const auth = require('../middleware/auth');

// ROTAS PÚBLICAS (todos podem aceder)

// GET /api/actors → Lista todos os atores
router.get('/', actorController.getAllActors);

// GET /api/actors/5 → Mostra ator com ID 5
router.get('/:id', actorController.getActorById);

// ROTAS PROTEGIDAS (só com autenticação, apenas administradores)

// POST /api/actors → Cria novo ator (só admin)
router.post('/', auth, actorController.createActor);

// PUT /api/actors/5 → Atualiza ator com ID 5 (só admin)
router.put('/:id', auth, actorController.updateActor);

// DELETE /api/actors/5 → Apaga ator com ID 5 (só admin)
router.delete('/:id', auth, actorController.deleteActor);

// Exporta o router para usar no app.js
module.exports = router;