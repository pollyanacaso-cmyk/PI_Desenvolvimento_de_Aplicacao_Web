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
            'Pendente',
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

// Nunca devolver o hash da senha junto com o agendamento
const INCLUIR_CLIENTE = { model: Cliente, attributes: { exclude: ['senha'] } };

const listar = async (req, res) => {
    try {
        const where = {};
        const filtroInformado = req.query.cliente_id;
        let clienteIdFiltro = null;

        if (filtroInformado !== undefined && filtroInformado !== '') {
            clienteIdFiltro = Number(filtroInformado);

            if (!Number.isInteger(clienteIdFiltro) || clienteIdFiltro <= 0) {
                return res.status(400).json({
                    mensagem: 'O cliente_id informado é inválido.'
                });
            }
        }

        if (req.perfil === 'cliente') {
            // Cliente só enxerga os próprios agendamentos, venha o que vier na query.
            if (clienteIdFiltro !== null && clienteIdFiltro !== req.usuario.id) {
                return res.status(403).json({
                    mensagem: 'Você não tem permissão para ver agendamentos de outro cliente.'
                });
            }
            where.cliente_id = req.usuario.id;
        } else if (req.perfil === 'profissional') {
            where.profissional_id = req.usuario.id;
        } else if (clienteIdFiltro !== null) {
            // Admin pode filtrar por qualquer cliente (ou listar todos sem filtro).
            where.cliente_id = clienteIdFiltro;
        }

        const agendamentos = await Agendamento.findAll({
            where,
            include: [
                INCLUIR_CLIENTE,
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
                INCLUIR_CLIENTE,
                { model: Profissional },
                { model: Servico }
            ]
        });

        // Para o cliente, agendamento de outra pessoa é igual a "não existe"
        if (
            !agendamento ||
            (req.perfil === 'cliente' && agendamento.cliente_id !== req.usuario.id) || (req.perfil === 'profissional' && agendamento.profissional_id !== req.usuario.id)
        ) {
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
            cliente_id: req.perfil === 'cliente' ? req.usuario.id : req.body.cliente_id,
            profissional_id: req.body.profissional_id,
            servico_id: req.body.servico_id,
            data: req.body.data,
            horario_inicio: horaInicio,
            horario_fim: horaFim,
            status: 'Agendado',
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

        if (!agendamento || (req.perfil === 'profissional' && agendamento.profissional_id !== req.usuario.id)) {
            return res.status(404).json({ mensagem: 'Agendamento não encontrado.' });
        }

        const camposPermitidos = req.perfil === 'profissional' ? ['status'] : [
            'cliente_id', 'profissional_id', 'servico_id', 'data', 'horario_inicio', 'horario_fim', 'status', 'observacoes'
        ];

        const dados = {};
        if (req.perfil === 'profissional' && req.body.profissional_id !== undefined && Number(req.body.profissional_id) !== req.usuario.id) return res.status(403).json({ mensagem: 'Você só pode gerenciar seus próprios atendimentos.' });

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

const cancelarPeloCliente = async (req, res) => {
    try {
        const id = Number(req.params.id);
        if (!Number.isInteger(id) || id <= 0) return res.status(400).json({ mensagem: 'Informe um ID válido.' });
        const agendamento = await Agendamento.findByPk(id);
        if (!agendamento || Number(agendamento.cliente_id) !== Number(req.usuario.id)) {
            return res.status(404).json({ mensagem: 'Agendamento não encontrado.' });
        }
        if (['Cancelado', 'Concluído'].includes(agendamento.status)) {
            return res.status(409).json({ mensagem: 'Este agendamento não pode mais ser cancelado.' });
        }
        // O cliente pode cancelar até 23h59min59s do dia anterior ao atendimento.
        // A montagem como data local evita deslocamentos causados por conversões UTC.
        const [ano, mes, dia] = String(agendamento.data).slice(0, 10).split('-').map(Number);
        const dataHoraAgendamento = new Date(ano, mes - 1, dia);

        if (Number.isNaN(dataHoraAgendamento.getTime())) {
            return res.status(400).json({ mensagem: 'A data do agendamento é inválida.' });
        }

        const limiteCancelamento = new Date(ano, mes - 1, dia - 1, 23, 59, 59, 999);
        if (Date.now() > limiteCancelamento.getTime()) {
            return res.status(400).json({
                mensagem: 'O cancelamento só pode ser realizado até 23h59 do dia anterior ao agendamento.'
            });
        }
        await agendamento.update({ status: 'Cancelado' });
        return res.status(200).json({ mensagem: 'Agendamento cancelado com sucesso.', agendamento });
    } catch (erro) {
        console.error(erro);
        return res.status(500).json({ mensagem: 'Não foi possível cancelar o agendamento.' });
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

        if (!agendamento || (req.perfil === 'cliente' && agendamento.cliente_id !== req.usuario.id)) {
            return res.status(404).json({ mensagem: 'Agendamento não encontrado.' });
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

const { BloqueioHorario } = require('../models'); // garanta que BloqueioHorario está importado no topo

const consultarAgendaDia = async (req, res) => {
    try {
        const { data } = req.query;
        if (!data || !validarData(data)) {
            return res.status(400).json({ mensagem: 'Informe uma data válida (AAAA-MM-DD).' });
        }

        const [agendamentos, bloqueios, liberacoesDomingo] = await Promise.all([
            Agendamento.findAll({
                where: {
                    data,
                    status: { [require('sequelize').Op.ne]: 'Cancelado' }
                },
                attributes: ['id', 'profissional_id', 'horario_inicio', 'horario_fim']
            }),
            BloqueioHorario.findAll({
                where: { data, status: 'Bloqueado' },
                attributes: ['id', 'profissional_id', 'horario_inicio', 'horario_fim']
            }),
            BloqueioHorario.findAll({ where: { data, status: 'Liberado' }, attributes: ['profissional_id'] })
        ]);
        const [ano, mes, dia] = data.split('-').map(Number);
        const ehDomingo = new Date(ano, mes - 1, dia).getDay() === 0;
        return res.status(200).json({ agendamentos, bloqueios, ehDomingo, profissionaisComDomingoLiberado: liberacoesDomingo.map(x => x.profissional_id) });
    } catch (erro) {
        console.error(erro);
        return res.status(500).json({ mensagem: 'Erro ao consultar disponibilidade do dia.' });
    }
};

module.exports = {
    listar,
    buscarPorId,
    criar,
    atualizar,
    cancelarPeloCliente,
    remover,
    consultarAgendaDia
};
