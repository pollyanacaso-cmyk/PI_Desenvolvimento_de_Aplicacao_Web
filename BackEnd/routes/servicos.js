const express = require('express');
const router = express.Router();
const { Servico } = require('../config/db').models;

function tratarTexto(valor) {
    if (typeof valor !== 'string') {
        return valor;
    }

    const texto = valor.trim();
    return texto === '' ? null : texto;
}

function validarDados(dados, parcial = false) {
    const erros = [];

    if (!parcial || dados.nome !== undefined) {
        dados.nome = tratarTexto(dados.nome);

        if (!dados.nome) {
            erros.push('O nome do serviço é obrigatório.');
        }
    }

    if (dados.descricao !== undefined) {
        dados.descricao = tratarTexto(dados.descricao);
    }

    if (!parcial || dados.preco !== undefined) {
        const preco = Number(dados.preco);

        if (
            dados.preco === undefined ||
            dados.preco === null ||
            dados.preco === '' ||
            !Number.isFinite(preco) ||
            preco < 0
        ) {
            erros.push('O preço deve ser um número válido maior ou igual a zero.');
        } else {
            dados.preco = preco;
        }
    }

    if (!parcial || dados.duracao_minutos !== undefined) {
        const duracao = Number(dados.duracao_minutos);

        if (
            dados.duracao_minutos === undefined ||
            dados.duracao_minutos === null ||
            dados.duracao_minutos === '' ||
            !Number.isInteger(duracao) ||
            duracao <= 0
        ) {
            erros.push('A duração deve ser um número inteiro maior que zero.');
        } else {
            dados.duracao_minutos = duracao;
        }
    }

    if (dados.ativo !== undefined && typeof dados.ativo !== 'boolean') {
        erros.push('O campo ativo deve ser verdadeiro ou falso.');
    }

    return erros;
}

router.get('/', async (req, res) => {
    try {
        const servicos = await Servico.findAll({
            order: [['nome', 'ASC']]
        });

        return res.status(200).json(servicos);
    } catch (erro) {
        console.error(erro);
        return res.status(500).json({
            mensagem: 'Não foi possível consultar os serviços.'
        });
    }
});

router.get('/:id', async (req, res) => {
    try {
        const id = Number(req.params.id);

        if (!Number.isInteger(id) || id <= 0) {
            return res.status(400).json({
                mensagem: 'Informe um ID válido.'
            });
        }

        const servico = await Servico.findByPk(id);

        if (!servico) {
            return res.status(404).json({
                mensagem: 'Serviço não encontrado.'
            });
        }

        return res.status(200).json(servico);
    } catch (erro) {
        console.error(erro);
        return res.status(500).json({
            mensagem: 'Não foi possível consultar o serviço.'
        });
    }
});

router.post('/', async (req, res) => {
    try {
        const dados = {
            nome: req.body.nome,
            descricao: tratarTexto(req.body.descricao),
            preco: req.body.preco,
            duracao_minutos: req.body.duracao_minutos,
            ativo: req.body.ativo === undefined ? true : req.body.ativo
        };

        const erros = validarDados(dados);

        if (erros.length > 0) {
            return res.status(400).json({
                mensagem: 'Os dados do serviço são inválidos.',
                erros
            });
        }

        const servico = await Servico.create(dados);

        return res.status(201).json({
            mensagem: 'Serviço cadastrado com sucesso.',
            servico
        });
    } catch (erro) {
        console.error(erro);

        if (
            erro.name === 'SequelizeValidationError' ||
            erro.name === 'SequelizeUniqueConstraintError'
        ) {
            return res.status(400).json({
                mensagem: 'Não foi possível cadastrar o serviço com os dados informados.',
                erros: erro.errors?.map(item => item.message) || []
            });
        }

        return res.status(500).json({
            mensagem: 'Não foi possível cadastrar o serviço.'
        });
    }
});

router.put('/:id', async (req, res) => {
    try {
        const id = Number(req.params.id);

        if (!Number.isInteger(id) || id <= 0) {
            return res.status(400).json({
                mensagem: 'Informe um ID válido.'
            });
        }

        const servico = await Servico.findByPk(id);

        if (!servico) {
            return res.status(404).json({
                mensagem: 'Serviço não encontrado.'
            });
        }

        const camposPermitidos = [
            'nome',
            'descricao',
            'preco',
            'duracao_minutos',
            'ativo'
        ];

        const dados = {};

        for (const campo of camposPermitidos) {
            if (req.body[campo] !== undefined) {
                dados[campo] = req.body[campo];
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
                mensagem: 'Os dados do serviço são inválidos.',
                erros
            });
        }

        await servico.update(dados);

        return res.status(200).json({
            mensagem: 'Serviço atualizado com sucesso.',
            servico
        });
    } catch (erro) {
        console.error(erro);

        if (
            erro.name === 'SequelizeValidationError' ||
            erro.name === 'SequelizeUniqueConstraintError'
        ) {
            return res.status(400).json({
                mensagem: 'Não foi possível atualizar o serviço com os dados informados.',
                erros: erro.errors?.map(item => item.message) || []
            });
        }

        return res.status(500).json({
            mensagem: 'Não foi possível atualizar o serviço.'
        });
    }
});

router.delete('/:id', async (req, res) => {
    try {
        const id = Number(req.params.id);

        if (!Number.isInteger(id) || id <= 0) {
            return res.status(400).json({
                mensagem: 'Informe um ID válido.'
            });
        }

        const servico = await Servico.findByPk(id);

        if (!servico) {
            return res.status(404).json({
                mensagem: 'Serviço não encontrado.'
            });
        }

        await servico.destroy();

        return res.status(200).json({
            mensagem: 'Serviço removido com sucesso.'
        });
    } catch (erro) {
        console.error(erro);
        return res.status(500).json({
            mensagem: 'Não foi possível remover o serviço. Verifique se ele está relacionado a um agendamento.'
        });
    }
});

module.exports = router;
