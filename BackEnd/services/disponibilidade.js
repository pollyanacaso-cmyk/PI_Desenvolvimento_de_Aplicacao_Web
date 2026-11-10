const { Op } = require('sequelize');
const { Agendamento, BloqueioHorario } = require('../models');

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

function normalizarHorario(horario) {
    if (typeof horario !== 'string') {
        return horario;
    }

    return horario.length === 5 ? `${horario}:00` : horario;
}

async function buscarAgendamentosConflitantes({
    profissional_id,
    data,
    horario_inicio,
    horario_fim,
    ignorarAgendamentoId,
    transaction
}) {
    const where = {
        profissional_id,
        data,
        status: { [Op.ne]: 'Cancelado' },
        horario_inicio: { [Op.lt]: normalizarHorario(horario_fim) },
        horario_fim: { [Op.gt]: normalizarHorario(horario_inicio) }
    };

    if (ignorarAgendamentoId !== undefined) {
        where.id = { [Op.ne]: ignorarAgendamentoId };
    }

    return Agendamento.findAll({ where, transaction });
}

async function buscarBloqueiosConflitantes({
    profissional_id,
    data,
    horario_inicio,
    horario_fim,
    transaction
}) {
    return BloqueioHorario.findAll({
        where: {
            profissional_id,
            data,
            status: 'Bloqueado',
            horario_inicio: { [Op.lt]: normalizarHorario(horario_fim) },
            horario_fim: { [Op.gt]: normalizarHorario(horario_inicio) }
        },
        transaction
    });
}

async function verificarDisponibilidade(parametros) {
    const mensagens = [];

    const bloqueios = await buscarBloqueiosConflitantes(parametros);

    if (bloqueios.length > 0) {
        mensagens.push('O profissional está com o horário bloqueado neste período.');
    }

    const agendamentos = await buscarAgendamentosConflitantes(parametros);

    if (agendamentos.length > 0) {
        mensagens.push('O profissional já possui um agendamento que conflita com este horário.');
    }

    return mensagens;
}

module.exports = {
    validarData,
    validarHorario,
    normalizarHorario,
    buscarAgendamentosConflitantes,
    buscarBloqueiosConflitantes,
    verificarDisponibilidade
};
