const express = require('express');
const router = express.Router();
const profissionalController = require('../controllers/profissionalController');
const autenticarToken = require('../middlewares/autenticarToken');
const autorizarPorPerfil = require('../middlewares/autorizarPorPerfil');

router.get('/', profissionalController.listar);
router.get('/:id', profissionalController.buscarPorId);
router.post('/', autenticarToken, autorizarPorPerfil('admin'), profissionalController.criar);
router.put('/:id', autenticarToken, autorizarPorPerfil('admin'), profissionalController.atualizar);
router.delete('/:id', autenticarToken, autorizarPorPerfil('admin'), profissionalController.remover);

module.exports = router;
