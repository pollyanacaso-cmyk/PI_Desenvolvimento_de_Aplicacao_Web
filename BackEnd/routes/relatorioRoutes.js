const router = require('express').Router();
const autenticarToken = require('../middlewares/autenticarToken');
const autorizarPorPerfil = require('../middlewares/autorizarPorPerfil');
const controller = require('../controllers/relatorioController');
router.use(autenticarToken, autorizarPorPerfil('admin', 'profissional'));
router.get('/resumo', controller.resumo);
router.get('/excel', controller.excel);
module.exports = router;
