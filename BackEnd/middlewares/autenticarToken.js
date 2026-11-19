const { Administrador, Cliente, Profissional } = require('../models');
const { verificarToken } = require('../utils/token');

async function autenticarToken(req, res, next) {
  try {
    const [tipo, token] = (req.headers.authorization || '').split(' ');
    if (tipo !== 'Bearer' || !token) return res.status(401).json({ mensagem: 'Autenticação necessária.' });
    let payload;
    try { payload = verificarToken(token); } catch {
      return res.status(401).json({ mensagem: 'Token inválido ou expirado. Faça login novamente.' });
    }

    const modelos = { cliente: Cliente, admin: Administrador, profissional: Profissional };
    const Modelo = modelos[payload.papel];
    if (!Modelo) return res.status(401).json({ mensagem: 'Perfil de acesso inválido.' });
    const usuario = payload.papel === 'admin'
      ? await Administrador.unscoped().findByPk(payload.sub)
      : await Modelo.findByPk(payload.sub, { attributes: { exclude: ['senha', 'senha_hash'] } });

    if (!usuario) return res.status(401).json({ mensagem: 'Sessão inválida. Faça login novamente.' });
    if (usuario.ativo === false) return res.status(403).json({ mensagem: 'Este usuário está inativo.' });

    req.usuario = usuario;
    req.perfil = payload.papel;
    return next();
  } catch (erro) {
    console.error(erro);
    return res.status(500).json({ mensagem: 'Não foi possível validar a autenticação.' });
  }
}
module.exports = autenticarToken;
