const express = require('express');
const router = express.Router();
const bloqueioController = require('../controllers/bloqueioController');
const autenticarToken = require('../middlewares/autenticarToken');
const autorizarPorPerfil = require('../middlewares/autorizarPorPerfil');

router.use(autenticarToken, autorizarPorPerfil('admin'));

router.get('/', bloqueioController.listar);
router.get('/:id', bloqueioController.buscarPorId);
router.post('/', bloqueioController.criar);
router.patch('/:id/liberar', bloqueioController.liberar);

module.exports = router;
