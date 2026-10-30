const bcrypt = require('bcryptjs');
const { Administrador } = require('../models');
const { validarEmail } = require('../utils/texto');

const listar = async (req, res) => {
    try {
        const administradores = await Administrador.findAll({
            order: [['nome', 'ASC']]
        });

        return res.status(200).json(administradores);
    } catch (erro) {
        console.error(erro);
        return res.status(500).json({
            mensagem: 'Não foi possível consultar os administradores.'
        });
    }
};

const criar = async (req, res) => {
    try {
        const nome = typeof req.body.nome === 'string' ? req.body.nome.trim() : '';
        const email = typeof req.body.email === 'string'
            ? req.body.email.trim().toLowerCase()
            : '';
        const senha = typeof req.body.senha === 'string' ? req.body.senha : '';

        const erros = [];

        if (!nome) {
            erros.push('O nome é obrigatório.');
        }

        if (!validarEmail(email)) {
            erros.push('Informe um e-mail válido.');
        }

        if (senha.length < 8) {
            erros.push('A senha deve ter pelo menos 8 caracteres.');
        }

        if (erros.length > 0) {
            return res.status(400).json({
                mensagem: 'Os dados do administrador são inválidos.',
                erros
            });
        }

        const existente = await Administrador.findOne({ where: { email } });

        if (existente) {
            return res.status(409).json({
                mensagem: 'Já existe um administrador com este e-mail.'
            });
        }

        const administrador = await Administrador.create({
            nome,
            email,
            senha_hash: await bcrypt.hash(senha, 10)
        });

        return res.status(201).json({
            mensagem: 'Administrador cadastrado com sucesso.',
            administrador: {
                id: administrador.id,
                nome: administrador.nome,
                email: administrador.email,
                ativo: administrador.ativo,
                data_cadastro: administrador.data_cadastro
            }
        });
    } catch (erro) {
        console.error(erro);

        if (erro.name === 'SequelizeUniqueConstraintError') {
            return res.status(409).json({
                mensagem: 'Já existe um administrador com este e-mail.'
            });
        }

        return res.status(500).json({
            mensagem: 'Não foi possível cadastrar o administrador.'
        });
    }
};

module.exports = {
    listar,
    criar
};
