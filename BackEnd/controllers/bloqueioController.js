const {
    BloqueioHorario,
    Profissional
} = require('../models');

const {
    validarData,
    validarHorario,
    normalizarHorario,
    buscarAgendamentosConflitantes
} = require('../services/disponibilidade');

function lerIdDaRota(req, res) {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
        res.status(400).json({ mensagem: 'Informe um ID válido.' });
        return null;
    }

    return id;
}

const listar = async (req, res) => {
    try {
        const where = {};

        if (req.query.profissional_id !== undefined) {
            const profissionalId = Number(req.query.profissional_id);

            if (!Number.isInteger(profissionalId) || profissionalId <= 0) {
                return res.status(400).json({
                    mensagem: 'O filtro profissional_id deve ser um ID inteiro positivo.'
                });
            }

            where.profissional_id = profissionalId;
        }

        if (req.query.data !== undefined) {
            if (!validarData(req.query.data)) {
                return res.status(400).json({
                    mensagem: 'O filtro data deve estar no formato AAAA-MM-DD.'
                });
            }

            where.data = req.query.data;
        }

        if (req.query.status !== undefined) {
            if (!['Bloqueado', 'Liberado'].includes(req.query.status)) {
                return res.status(400).json({
                    mensagem: 'O filtro status deve ser Bloqueado ou Liberado.'
                });
            }

            where.status = req.query.status;
        }

        const bloqueios = await BloqueioHorario.findAll({
            where,
            include: [{ model: Profissional }],
            order: [
                ['data', 'ASC'],
                ['horario_inicio', 'ASC']
            ]
        });

        return res.status(200).json(bloqueios);
    } catch (erro) {
        console.error(erro);
        return res.status(500).json({
            mensagem: 'Não foi possível consultar os bloqueios.'
        });
    }
};

const buscarPorId = async (req, res) => {
    try {
        const id = lerIdDaRota(req, res);

        if (id === null) {
            return;
        }

        const bloqueio = await BloqueioHorario.findByPk(id, {
            include: [{ model: Profissional }]
        });

        if (!bloqueio) {
            return res.status(404).json({
                mensagem: 'Bloqueio não encontrado.'
            });
        }

        return res.status(200).json(bloqueio);
    } catch (erro) {
        console.error(erro);
        return res.status(500).json({
            mensagem: 'Não foi possível consultar o bloqueio.'
        });
    }
};

const criar = async (req, res) => {
    try {
        const erros = [];

        const profissionalId = Number(req.body.profissional_id);

        if (!Number.isInteger(profissionalId) || profissionalId <= 0) {
            erros.push('O campo profissional_id deve ser um ID inteiro positivo.');
        }

        if (!validarData(req.body.data)) {
            erros.push('Informe uma data válida no formato AAAA-MM-DD.');
        }

        for (const campo of ['horario_inicio', 'horario_fim']) {
            if (!validarHorario(req.body[campo])) {
                erros.push(`O campo ${campo} deve estar no formato HH:MM ou HH:MM:SS.`);
            }
        }

        if (
            validarHorario(req.body.horario_inicio) &&
            validarHorario(req.body.horario_fim) &&
            normalizarHorario(req.body.horario_fim) <= normalizarHorario(req.body.horario_inicio)
        ) {
            erros.push('O horário final deve ser posterior ao horário inicial.');
        }

        let motivo = null;

        if (req.body.motivo !== undefined && req.body.motivo !== null) {
            if (typeof req.body.motivo !== 'string') {
                erros.push('O motivo deve ser um texto.');
            } else {
                motivo = req.body.motivo.trim() || null;

                if (motivo && motivo.length > 255) {
                    erros.push('O motivo deve ter no máximo 255 caracteres.');
                }
            }
        }

        if (erros.length > 0) {
            return res.status(400).json({
                mensagem: 'Os dados do bloqueio são inválidos.',
                erros
            });
        }

        const profissional = await Profissional.findByPk(profissionalId);

        if (!profissional) {
            return res.status(400).json({
                mensagem: 'O profissional informado não existe.'
            });
        }

        const dados = {
            profissional_id: profissionalId,
            data: req.body.data,
            horario_inicio: normalizarHorario(req.body.horario_inicio),
            horario_fim: normalizarHorario(req.body.horario_fim),
            motivo,
            status: 'Bloqueado',
            administrador_id: req.usuario.id
        };

        const bloqueio = await BloqueioHorario.create(dados);

        
        const agendamentosAfetados = await buscarAgendamentosConflitantes(dados);

        return res.status(201).json({
            mensagem: 'Horário bloqueado com sucesso.',
            bloqueio,
            agendamentos_existentes_no_periodo: agendamentosAfetados.map(item => item.id)
        });
    } catch (erro) {
        console.error(erro);

        if (erro.name === 'SequelizeValidationError') {
            return res.status(400).json({
                mensagem: 'Não foi possível bloquear o horário com os dados informados.',
                erros: erro.errors?.map(item => item.message) || []
            });
        }

        return res.status(500).json({
            mensagem: 'Não foi possível bloquear o horário.'
        });
    }
};

const liberar = async (req, res) => {
    try {
        const id = lerIdDaRota(req, res);

        if (id === null) {
            return;
        }

        const bloqueio = await BloqueioHorario.findByPk(id);

        if (!bloqueio) {
            return res.status(404).json({
                mensagem: 'Bloqueio não encontrado.'
            });
        }

        if (bloqueio.status === 'Liberado') {
            return res.status(409).json({
                mensagem: 'Este horário já foi liberado.'
            });
        }

        await bloqueio.update({
            status: 'Liberado',
            liberado_por_id: req.usuario.id,
            data_liberacao: new Date()
        });

        return res.status(200).json({
            mensagem: 'Horário liberado com sucesso.',
            bloqueio
        });
    } catch (erro) {
        console.error(erro);
        return res.status(500).json({
            mensagem: 'Não foi possível liberar o horário.'
        });
    }
};

module.exports = {
    listar,
    buscarPorId,
    criar,
    liberar
};
