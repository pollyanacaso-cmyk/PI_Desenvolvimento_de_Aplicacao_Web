
const express = require('express');
const router = express.Router();

const {
    Agendamento,
    Cliente,
    Profissional,
    Servico
} = require('../config/db').models;

function tratarTexto(valor) {
    if (typeof valor !== 'string') {
        return valor;
    }

    const texto = valor.trim();
    return texto === '' ? null : texto;
}

function validarData(data) {
    if (typeof data !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(data)) {
        return false;
    }

    const [ano, mes, dia] = data.split('-').map(Number);
    const dataConvertida = new Date(Date.UTC(ano, mes - 1, dia));

    return (
        dataConvertida.getUTCFullYear() === ano &&
        dataConvertida.getUTCMonth() === mes - 1 &&
        dataConvertida.getUTCDate() === dia
    );
}

function validarHorario(horario) {
    return typeof horario === 'string' &&
        /^([01]\d|2[0-3]):[0-5]\d(:[0-5]\d)?$/.test(horario);
}

function validarDados(dados, parcial = false) {
    const erros = [];

    const camposObrigatorios = [
        'cliente_id',
        'profissional_id',
        'servico_id',
        'data',
        'horario_inicio',
        'horario_fim'
    ];

    for (const campo of camposObrigatorios) {
        if (!parcial || dados[campo] !== undefined) {
            const valor = dados[campo];

            if (valor === undefined || valor === null || valor === '') {
                erros.push(`O campo ${campo} é obrigatório.`);
            }
        }
    }

    const camposId = [
        'cliente_id',
        'profissional_id',
        'servico_id'
    ];

    for (const campo of camposId) {
        if (dados[campo] !== undefined) {
            const id = Number(dados[campo]);

            if (!Number.isInteger(id) || id <= 0) {
                erros.push(`O campo ${campo} deve ser um ID inteiro positivo.`);
            } else {
                dados[campo] = id;
            }
        }
    }

    if (dados.data !== undefined) {
        if (!validarData(dados.data)) {
            erros.push('Informe uma data válida no formato AAAA-MM-DD.');
        }
    }

    for (const campo of ['horario_inicio', 'horario_fim']) {
        if (dados[campo] !== undefined && !validarHorario(dados[campo])) {
            erros.push(`O campo ${campo} deve estar no formato HH:MM ou HH:MM:SS.`);
        }
    }

    if (
        validarHorario(dados.horario_inicio) &&
        validarHorario(dados.horario_fim)
    ) {
        const inicio = dados.horario_inicio.length === 5
            ? `${dados.horario_inicio}:00`
            : dados.horario_inicio;

        const fim = dados.horario_fim.length === 5
            ? `${dados.horario_fim}:00`
            : dados.horario_fim;

        if (fim <= inicio) {
            erros.push('O horário final deve ser posterior ao horário inicial.');
        }
    }

    if (dados.status !== undefined) {
        const statusPermitidos = [
            'Agendado',
            'Confirmado',
            'Concluído',
            'Cancelado'
        ];

        if (!statusPermitidos.includes(dados.status)) {
            erros.push(`O status deve ser um destes: ${statusPermitidos.join(', ')}.`);
        }
    }

    if (dados.observacoes !== undefined) {
        dados.observacoes = tratarTexto(dados.observacoes);
    }

    return erros;
}

async function validarRelacionamentos(dados) {
    const erros = [];

    if (dados.cliente_id !== undefined) {
        const cliente = await Cliente.findByPk(dados.cliente_id);

        if (!cliente) {
            erros.push('O cliente informado não existe.');
        } else if (cliente.ativo === false) {
            erros.push('Não é possível agendar com um cliente inativo.');
        }
    }

    if (dados.profissional_id !== undefined) {
        const profissional = await Profissional.findByPk(dados.profissional_id);

        if (!profissional) {
            erros.push('O profissional informado não existe.');
        } else if (profissional.ativo === false) {
            erros.push('Não é possível agendar com um profissional inativo.');
        }
    }

    if (dados.servico_id !== undefined) {
        const servico = await Servico.findByPk(dados.servico_id);

        if (!servico) {
            erros.push('O serviço informado não existe.');
        } else if (servico.ativo === false) {
            erros.push('Não é possível agendar um serviço inativo.');
        }
    }

    return erros;
}

router.get('/', async (req, res) => {
    try {
        const agendamentos = await Agendamento.findAll({
            include: [
                { model: Cliente },
                { model: Profissional },
                { model: Servico }
            ],
            order: [
                ['data', 'ASC'],
                ['horario_inicio', 'ASC']
            ]
        });

        return res.status(200).json(agendamentos);
    } catch (erro) {
        console.error(erro);
        return res.status(500).json({
            mensagem: 'Não foi possível consultar os agendamentos.'
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

        const agendamento = await Agendamento.findByPk(id, {
            include: [
                { model: Cliente },
                { model: Profissional },
                { model: Servico }
            ]
        });

        if (!agendamento) {
            return res.status(404).json({
                mensagem: 'Agendamento não encontrado.'
            });
        }

        return res.status(200).json(agendamento);
    } catch (erro) {
        console.error(erro);
        return res.status(500).json({
            mensagem: 'Não foi possível consultar o agendamento.'
        });
    }
});

router.post('/', async (req, res) => {
    try {
        const dados = {
            cliente_id: req.body.cliente_id,
            profissional_id: req.body.profissional_id,
            servico_id: req.body.servico_id,
            data: req.body.data,
            horario_inicio: req.body.horario_inicio,
            horario_fim: req.body.horario_fim,
            status: req.body.status === undefined ? 'Agendado' : req.body.status,
            observacoes: tratarTexto(req.body.observacoes)
        };

        const erros = validarDados(dados);

        if (erros.length > 0) {
            return res.status(400).json({
                mensagem: 'Os dados do agendamento são inválidos.',
                erros
            });
        }

        const errosRelacionamentos = await validarRelacionamentos(dados);

        if (errosRelacionamentos.length > 0) {
            return res.status(400).json({
                mensagem: 'Existem referências inválidas no agendamento.',
                erros: errosRelacionamentos
            });
        }

        const agendamento = await Agendamento.create(dados);

        return res.status(201).json({
            mensagem: 'Agendamento cadastrado com sucesso.',
            agendamento
        });
    } catch (erro) {
        console.error(erro);

        if (
            erro.name === 'SequelizeValidationError' ||
            erro.name === 'SequelizeForeignKeyConstraintError'
        ) {
            return res.status(400).json({
                mensagem: 'Não foi possível cadastrar o agendamento com os dados informados.',
                erros: erro.errors?.map(item => item.message) || []
            });
        }

        return res.status(500).json({
            mensagem: 'Não foi possível cadastrar o agendamento.'
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

        const agendamento = await Agendamento.findByPk(id);

        if (!agendamento) {
            return res.status(404).json({
                mensagem: 'Agendamento não encontrado.'
            });
        }

        const camposPermitidos = [
            'cliente_id',
            'profissional_id',
            'servico_id',
            'data',
            'horario_inicio',
            'horario_fim',
            'status',
            'observacoes'
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
                mensagem: 'Os dados do agendamento são inválidos.',
                erros
            });
        }

        const errosRelacionamentos = await validarRelacionamentos(dados);

        if (errosRelacionamentos.length > 0) {
            return res.status(400).json({
                mensagem: 'Existem referências inválidas no agendamento.',
                erros: errosRelacionamentos
            });
        }

        await agendamento.update(dados);

        return res.status(200).json({
            mensagem: 'Agendamento atualizado com sucesso.',
            agendamento
        });
    } catch (erro) {
        console.error(erro);

        if (
            erro.name === 'SequelizeValidationError' ||
            erro.name === 'SequelizeForeignKeyConstraintError'
        ) {
            return res.status(400).json({
                mensagem: 'Não foi possível atualizar o agendamento com os dados informados.',
                erros: erro.errors?.map(item => item.message) || []
            });
        }

        return res.status(500).json({
            mensagem: 'Não foi possível atualizar o agendamento.'
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

        const agendamento = await Agendamento.findByPk(id);

        if (!agendamento) {
            return res.status(404).json({
                mensagem: 'Agendamento não encontrado.'
            });
        }

        await agendamento.destroy();

        return res.status(200).json({
            mensagem: 'Agendamento removido com sucesso.'
        });
    } catch (erro) {
        console.error(erro);
        return res.status(500).json({
            mensagem: 'Não foi possível remover o agendamento.'
        });
    }
});

module.exports = router;
