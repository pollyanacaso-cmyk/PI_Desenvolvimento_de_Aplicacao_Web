const bcrypt = require('bcryptjs');
const { Profissional } = require('../models');
const { tratarTexto } = require('../utils/texto');

function validarDados(dados, parcial = false) {
    const erros = [];

    if (!parcial || dados.nome !== undefined) {
        dados.nome = tratarTexto(dados.nome);

        if (!dados.nome) {
            erros.push('O nome do profissional é obrigatório.');
        }
    }

    for (const campo of ['especializacao', 'telefone', 'email', 'descricao']) {
        if (dados[campo] !== undefined) {
            dados[campo] = tratarTexto(dados[campo]);
        }
    }

    if (
        dados.email &&
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(dados.email)
    ) {
        erros.push('Informe um e-mail válido.');
    }

    if (
        dados.ativo !== undefined &&
        typeof dados.ativo !== 'boolean'
    ) {
        erros.push('O campo ativo deve ser verdadeiro ou falso.');
    }

    return erros;
}

const listar = async (req, res) => {
    try {
        const profissionais = await Profissional.findAll({
            attributes: { exclude: ['senha_hash'] },
            order: [['nome', 'ASC']]
        });

        return res.status(200).json(profissionais);
    } catch (erro) {
        console.error(erro);

        return res.status(500).json({
            mensagem: 'Não foi possível consultar os profissionais.'
        });
    }
};

const buscarPorId = async (req, res) => {
    try {
        const id = Number(req.params.id);

        if (!Number.isInteger(id) || id <= 0) {
            return res.status(400).json({
                mensagem: 'Informe um ID válido.'
            });
        }

        const profissional = await Profissional.findByPk(id, { attributes: { exclude: ['senha_hash'] } });

        if (!profissional) {
            return res.status(404).json({
                mensagem: 'Profissional não encontrado.'
            });
        }

        return res.status(200).json(profissional);
    } catch (erro) {
        console.error(erro);

        return res.status(500).json({
            mensagem: 'Não foi possível consultar o profissional.'
        });
    }
};

const criar = async (req, res) => {
    try {
        const dados = {
            nome: req.body.nome,
            especializacao: req.body.especializacao,
            telefone: req.body.telefone,
            email: req.body.email,
            senha_hash: req.body.senha ? await bcrypt.hash(String(req.body.senha), 10) : undefined,
            descricao: req.body.descricao,
            ativo: req.body.ativo === undefined ? true : req.body.ativo
        };

        const erros = validarDados(dados);

        if (erros.length > 0) {
            return res.status(400).json({
                mensagem: 'Os dados do profissional são inválidos.',
                erros
            });
        }

        const profissional = await Profissional.create(dados);

        const { senha_hash, ...profissionalSeguro } = profissional.toJSON();
        return res.status(201).json({
            mensagem: 'Profissional cadastrado com sucesso.',
            profissional: profissionalSeguro
        });
    } catch (erro) {
        console.error(erro);

        return res.status(500).json({
            mensagem: 'Não foi possível cadastrar o profissional.'
        });
    }
};

const atualizar = async (req, res) => {
    try {
        const id = Number(req.params.id);

        if (!Number.isInteger(id) || id <= 0) {
            return res.status(400).json({
                mensagem: 'Informe um ID válido.'
            });
        }

        const profissional = await Profissional.findByPk(id, { attributes: { exclude: ['senha_hash'] } });

        if (!profissional) {
            return res.status(404).json({
                mensagem: 'Profissional não encontrado.'
            });
        }

        const camposPermitidos = [
            'nome',
            'especializacao',
            'telefone',
            'email',
            'senha',
            'descricao',
            'ativo'
        ];

        const dados = {};

        for (const campo of camposPermitidos) {
            if (req.body[campo] !== undefined && !(campo === 'senha' && String(req.body[campo]).trim() === '')) {
                dados[campo === 'senha' ? 'senha_hash' : campo] = campo === 'senha' ? await bcrypt.hash(String(req.body[campo]), 10) : req.body[campo];
            }
        }

        if (Object.keys(dados).length === 0) {
            return res.status(400).json({
                mensagem: 'Informe pelo menos um campo para atualizar.'
            });
        }

        const erros = validarDados(dados, true);

        if (erros.length > 0) {
            return res.status(400).json({
                mensagem: 'Os dados do profissional são inválidos.',
                erros
            });
        }

        await profissional.update(dados);

        const { senha_hash, ...profissionalSeguro } = profissional.toJSON();
        return res.status(200).json({
            mensagem: 'Profissional atualizado com sucesso.',
            profissional: profissionalSeguro
        });
    } catch (erro) {
        console.error(erro);

        return res.status(500).json({
            mensagem: 'Não foi possível atualizar o profissional.'
        });
    }
};

const remover = async (req, res) => {
    try {
        const id = Number(req.params.id);

        if (!Number.isInteger(id) || id <= 0) {
            return res.status(400).json({
                mensagem: 'Informe um ID válido.'
            });
        }

        const profissional = await Profissional.findByPk(id, { attributes: { exclude: ['senha_hash'] } });

        if (!profissional) {
            return res.status(404).json({
                mensagem: 'Profissional não encontrado.'
            });
        }

        await profissional.destroy();

        return res.status(200).json({
            mensagem: 'Profissional removido com sucesso.'
        });
    } catch (erro) {
        console.error(erro);

        return res.status(500).json({
            mensagem: 'Não foi possível remover o profissional.'
        });
    }
};

module.exports = {
    listar,
    buscarPorId,
    criar,
    atualizar,
    remover
};
