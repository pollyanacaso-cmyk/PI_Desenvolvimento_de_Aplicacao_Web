const express = require('express');
const router = express.Router();
const produtoController = require('../controllers/produtoController');
const autenticarToken = require('../middlewares/autenticarToken');
const autorizarPorPerfil = require('../middlewares/autorizarPorPerfil');

router.get('/', produtoController.listar);
router.get('/:id', produtoController.buscarPorId);
router.post('/', autenticarToken, autorizarPorPerfil('admin'), produtoController.criar);
router.put('/:id', autenticarToken, autorizarPorPerfil('admin'), produtoController.atualizar);
router.delete('/:id', autenticarToken, autorizarPorPerfil('admin'), produtoController.remover);

module.exports = router;
