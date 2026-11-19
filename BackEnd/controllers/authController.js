const bcrypt = require('bcryptjs');
const { Cliente, Administrador, Profissional } = require('../models');
const { gerarToken } = require('../utils/token');
const HASH_FALSO = bcrypt.hashSync('senha-inexistente', 10);

const login = async (req, res) => {
  try {
    const email = typeof req.body.email === 'string' ? req.body.email.trim().toLowerCase() : '';
    const senha = typeof req.body.senha === 'string' ? req.body.senha : '';
    if (!email || !senha) return res.status(400).json({ mensagem: 'Informe e-mail e senha.' });

    let usuario = await Cliente.findOne({ where: { email } });
    let papel = 'cliente';
    if (!usuario) {
      usuario = await Profissional.findOne({ where: { email } });
      papel = 'profissional';
    }
    if (!usuario) {
      usuario = await Administrador.unscoped().findOne({ where: { email } });
      papel = 'admin';
    }
    const hash = usuario ? (usuario.senha || usuario.senha_hash) : HASH_FALSO;
    const senhaConfere = await bcrypt.compare(senha, hash || HASH_FALSO);
    if (!usuario || !hash || !senhaConfere) return res.status(401).json({ mensagem: 'E-mail ou senha inválidos.' });
    if (usuario.ativo === false) return res.status(403).json({ mensagem: 'Este usuário está inativo.' });

    return res.status(200).json({
      mensagem: 'Login realizado com sucesso.',
      token: gerarToken(usuario, papel),
      usuario: {
        id: usuario.id, nome: usuario.nome, email: usuario.email, tipo: papel,
        profissional_id: papel === 'profissional' ? usuario.id : undefined
      }
    });
  } catch (erro) {
    console.error(erro);
    return res.status(500).json({ mensagem: 'Não foi possível realizar o login.' });
  }
};
module.exports = { login };
