const { Administrador } = require('../models');
const { verificarToken } = require('../utils/token');


async function autenticarToken(req, res, next) {
    try {
        const cabecalho = req.headers.authorization || '';
        const [tipo, token] = cabecalho.split(' ');

        if (tipo !== 'Bearer' || !token) {
            return res.status(401).json({
                mensagem: 'Autenticação necessária. Envie o token no cabeçalho Authorization: Bearer <token>.'
            });
        }

        let payload;

        try {
            payload = verificarToken(token);
        } catch {
            return res.status(401).json({
                mensagem: 'Token inválido ou expirado. Faça login novamente.'
            });
        }

        const administrador = await Administrador.findByPk(payload.sub);

        if (!administrador) {
            return res.status(401).json({
                mensagem: 'Sessão inválida. Faça login novamente.'
            });
        }

        if (administrador.ativo === false) {
            return res.status(403).json({
                mensagem: 'Este administrador está inativo.'
            });
        }

        req.usuario = administrador;
        req.perfil = payload.papel;
        return next();
    } catch (erro) {
        console.error(erro);
        return res.status(500).json({
            mensagem: 'Não foi possível validar a autenticação.'
        });
    }
}

module.exports = autenticarToken;
