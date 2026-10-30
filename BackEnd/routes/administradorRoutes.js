const express = require('express');
const router = express.Router();
const administradorController = require('../controllers/administradorController');
const autenticarToken = require('../middlewares/autenticarToken');
const autorizarPorPerfil = require('../middlewares/autorizarPorPerfil');

router.use(autenticarToken, autorizarPorPerfil('admin'));

router.get('/', administradorController.listar);
router.post('/', administradorController.criar);

module.exports = router;
