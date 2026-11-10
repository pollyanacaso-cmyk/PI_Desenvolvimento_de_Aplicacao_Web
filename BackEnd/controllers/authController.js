const bcrypt = require('bcryptjs');
const { Cliente, Administrador } = require('../models');
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

        // 1. Tenta buscar primeiro na tabela de Clientes
        let usuario = await Cliente.findOne({ where: { email } });
        let tipoUsuario = 'cliente';

        // 2. Se não achar cliente, tenta buscar em Administrador
        if (!usuario) {
            usuario = await Administrador.unscoped().findOne({ where: { email } });
            tipoUsuario = 'admin';
        }

        // Define a hash do banco de acordo com a model (Cliente usa 'senha', Admin usa 'senha_hash')
        const hashDoBanco = usuario ? (usuario.senha || usuario.senha_hash) : HASH_FALSO;

        // 3. Compara a senha
        const senhaConfere = await bcrypt.compare(senha, hashDoBanco);

        if (!usuario || !senhaConfere) {
            return res.status(401).json({
                mensagem: 'E-mail ou senha inválidos.'
            });
        }

        // 4. Verifica se o usuário está ativo
        if (usuario.ativo === false) {
            return res.status(403).json({
                mensagem: 'Este usuário está inativo.'
            });
        }

        // 5. Retorna a resposta com o token e dados
        return res.status(200).json({
            mensagem: 'Login realizado com sucesso.',
            token: gerarToken(usuario),
            user: {
                id: usuario.id,
                nome: usuario.nome,
                email: usuario.email,
                tipo: tipoUsuario
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