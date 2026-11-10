const express = require('express');
const router = express.Router();
const vendaController = require('../controllers/vendaController');
const autenticarToken = require('../middlewares/autenticarToken');
const autorizarPorPerfil = require('../middlewares/autorizarPorPerfil');

router.use(autenticarToken, autorizarPorPerfil('admin'));

router.get('/', vendaController.listar);
router.get('/:id', vendaController.buscarPorId);
router.post('/', vendaController.criar);

module.exports = router;
