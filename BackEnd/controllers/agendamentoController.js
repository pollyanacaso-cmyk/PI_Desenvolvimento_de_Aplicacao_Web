const sequelize = require('../config/database');

const {
    Agendamento,
    Cliente,
    Profissional,
    Servico
} = require('../models');
const { tratarTexto } = require('../utils/texto');

const {
    validarData,
    validarHorario,
    normalizarHorario,
    verificarDisponibilidade
} = require('../services/disponibilidade');

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

const listar = async (req, res) => {
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
};

const buscarPorId = async (req, res) => {
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
};

const criar = async (req, res) => {
    try {
        const horaInicio = req.body.horario_inicio || req.body.horario;
        let horaFim = req.body.horario_fim;

        // Se o frontend enviar apenas o horário de início, calcula o horario_fim automaticamente com base na duração do serviço
        if (horaInicio && !horaFim && req.body.servico_id) {
            const servico = await Servico.findByPk(req.body.servico_id);
            const duracaoMinutos = servico ? (servico.duracao_minutos || 30) : 30;

            const [h, m] = horaInicio.split(':').map(Number);
            const dataFim = new Date();
            dataFim.setHours(h, m + duracaoMinutos, 0);

            const horaFimStr = String(dataFim.getHours()).padStart(2, '0');
            const minFimStr = String(dataFim.getMinutes()).padStart(2, '0');
            horaFim = `${horaFimStr}:${minFimStr}:00`;
        }

        const dados = {
            cliente_id: req.body.cliente_id,
            profissional_id: req.body.profissional_id,
            servico_id: req.body.servico_id,
            data: req.body.data,
            horario_inicio: horaInicio,
            horario_fim: horaFim,
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

        dados.horario_inicio = normalizarHorario(dados.horario_inicio);
        dados.horario_fim = normalizarHorario(dados.horario_fim);

        const resultado = await sequelize.transaction(async (transacao) => {
            await Profissional.findByPk(dados.profissional_id, {
                transaction: transacao,
                lock: transacao.LOCK.UPDATE
            });

            if (dados.status !== 'Cancelado') {
                const conflitos = await verificarDisponibilidade({
                    profissional_id: dados.profissional_id,
                    data: dados.data,
                    horario_inicio: dados.horario_inicio,
                    horario_fim: dados.horario_fim,
                    transaction: transacao
                });

                if (conflitos.length > 0) {
                    return { conflitos };
                }
            }

            return { agendamento: await Agendamento.create(dados, { transaction: transacao }) };
        });

        if (resultado.conflitos) {
            return res.status(409).json({
                mensagem: 'O horário solicitado não está disponível para este profissional.',
                erros: resultado.conflitos
            });
        }

        const { agendamento } = resultado;

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
};

const atualizar = async (req, res) => {
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

        for (const campo of ['horario_inicio', 'horario_fim']) {
            if (dados[campo] !== undefined) {
                dados[campo] = normalizarHorario(dados[campo]);
            }
        }

        const final = {
            profissional_id: dados.profissional_id ?? agendamento.profissional_id,
            data: dados.data ?? agendamento.data,
            horario_inicio: dados.horario_inicio ?? normalizarHorario(agendamento.horario_inicio),
            horario_fim: dados.horario_fim ?? normalizarHorario(agendamento.horario_fim),
            status: dados.status ?? agendamento.status
        };

        const mudouHorario =
            final.profissional_id !== agendamento.profissional_id ||
            final.data !== agendamento.data ||
            final.horario_inicio !== normalizarHorario(agendamento.horario_inicio) ||
            final.horario_fim !== normalizarHorario(agendamento.horario_fim);

        if (mudouHorario && final.horario_fim <= final.horario_inicio) {
            return res.status(400).json({
                mensagem: 'Os dados do agendamento são inválidos.',
                erros: ['O horário final deve ser posterior ao horário inicial.']
            });
        }

        const reativando = agendamento.status === 'Cancelado' && final.status !== 'Cancelado';
        const precisaConferir = final.status !== 'Cancelado' && (mudouHorario || reativando);

        if (precisaConferir) {
            const conflitos = await sequelize.transaction(async (transacao) => {
                await Profissional.findByPk(final.profissional_id, {
                    transaction: transacao,
                    lock: transacao.LOCK.UPDATE
                });

                const encontrados = await verificarDisponibilidade({
                    profissional_id: final.profissional_id,
                    data: final.data,
                    horario_inicio: final.horario_inicio,
                    horario_fim: final.horario_fim,
                    ignorarAgendamentoId: agendamento.id,
                    transaction: transacao
                });

                if (encontrados.length === 0) {
                    await agendamento.update(dados, { transaction: transacao });
                }

                return encontrados;
            });

            if (conflitos.length > 0) {
                return res.status(409).json({
                    mensagem: 'O horário solicitado não está disponível para este profissional.',
                    erros: conflitos
                });
            }
        } else {
            await agendamento.update(dados);
        }

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
};

const remover = async (req, res) => {
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
};

module.exports = {
    listar,
    buscarPorId,
    criar,
    atualizar,
    remover
};