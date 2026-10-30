const bcrypt = require('bcryptjs');
const { Administrador } = require('../models');
const { gerarToken } = require('../utils/token');


const HASH_FALSO = bcrypt.hashSync('senha-inexistente', 10);

const login = async (req, res) => {
    try {
        const email = typeof req.body.email === 'string'
            ? req.body.email.trim().toLowerCase()
            : '';
        const senha = typeof req.body.senha === 'string' ? req.body.senha : '';

        if (!email || !senha) {
            return res.status(400).json({
                mensagem: 'Informe e-mail e senha.'
            });
        }

        const administrador = await Administrador.unscoped().findOne({
            where: { email }
        });

        const senhaConfere = await bcrypt.compare(
            senha,
            administrador ? administrador.senha_hash : HASH_FALSO
        );

        if (!administrador || !senhaConfere) {
            return res.status(401).json({
                mensagem: 'E-mail ou senha inválidos.'
            });
        }

        if (administrador.ativo === false) {
            return res.status(403).json({
                mensagem: 'Este administrador está inativo.'
            });
        }

        return res.status(200).json({
            mensagem: 'Login realizado com sucesso.',
            token: gerarToken(administrador),
            administrador: {
                id: administrador.id,
                nome: administrador.nome,
                email: administrador.email
            }
        });
    } catch (erro) {
        console.error(erro);
        return res.status(500).json({
            mensagem: 'Não foi possível realizar o login.'
        });
    }
};

module.exports = {
    login
};
