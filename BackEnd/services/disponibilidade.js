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

// Regras de expediente do Salão Ke Bella (em minutos desde 00:00)
const ABERTURA_MIN = 8 * 60;           // 08:00
const ALMOCO_INICIO_MIN = 12 * 60;     // 12:00
const ALMOCO_FIM_MIN = 13 * 60 + 30;   // 13:30
const FECHAMENTO_MIN = 20 * 60;        // 20:00

function horarioParaMinutos(horario) {
    const [hh, mm] = String(horario).split(':').map(Number);
    return hh * 60 + mm;
}

function minutosParaHorario(minutos) {
    const hh = String(Math.floor(minutos / 60)).padStart(2, '0');
    const mm = String(minutos % 60).padStart(2, '0');
    return `${hh}:${mm}:00`;
}

// Valida se o intervalo respeita abertura, almoço e fechamento.
// Recebe minutos (inteiros) e devolve uma lista de mensagens de erro.
function validarExpediente(inicioMin, fimMin) {
    const erros = [];

    if (inicioMin < ABERTURA_MIN) {
        erros.push('O salão abre às 08:00.');
    }

    if (fimMin > FECHAMENTO_MIN) {
        erros.push('O atendimento ultrapassa o horário de fechamento do salão (20:00).');
    }

    if (inicioMin < ALMOCO_FIM_MIN && fimMin > ALMOCO_INICIO_MIN) {
        erros.push('O atendimento invade o horário de almoço do salão (12:00 às 13:30).');
    }

    return erros;
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
    const [ano, mes, dia] = String(parametros.data).slice(0, 10).split('-').map(Number);
    const domingo = new Date(ano, mes - 1, dia).getDay() === 0;
    if (domingo) {
        const liberacao = await BloqueioHorario.findOne({ where: { profissional_id: parametros.profissional_id, data: parametros.data, status: 'Liberado', horario_inicio: { [Op.lte]: normalizarHorario(parametros.horario_inicio) }, horario_fim: { [Op.gte]: normalizarHorario(parametros.horario_fim) } }, transaction: parametros.transaction });
        if (!liberacao) mensagens.push('Este domingo está bloqueado para atendimentos. O profissional precisa liberar o horário primeiro.');
    }

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
    horarioParaMinutos,
    minutosParaHorario,
    validarExpediente,
    validarData,
    validarHorario,
    normalizarHorario,
    buscarAgendamentosConflitantes,
    buscarBloqueiosConflitantes,
    verificarDisponibilidade
};
