const sequelize = require('../config/database');
const { Venda, Produto, Cliente } = require('../models');

const listar = async (req, res) => {
    try {
        const vendas = await Venda.findAll({
            include: [
                { model: Produto },
                { model: Cliente }
            ],
            order: [['data_venda', 'DESC']]
        });

        return res.status(200).json(vendas);
    } catch (erro) {
        console.error(erro);
        return res.status(500).json({
            mensagem: 'Não foi possível consultar as vendas.'
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

        const venda = await Venda.findByPk(id, {
            include: [
                { model: Produto },
                { model: Cliente }
            ]
        });

        if (!venda) {
            return res.status(404).json({
                mensagem: 'Venda não encontrada.'
            });
        }

        return res.status(200).json(venda);
    } catch (erro) {
        console.error(erro);
        return res.status(500).json({
            mensagem: 'Não foi possível consultar a venda.'
        });
    }
};

const criar = async (req, res) => {
    try {
        const erros = [];

        const produtoId = Number(req.body.produto_id);
        const quantidade = Number(req.body.quantidade);

        if (!Number.isInteger(produtoId) || produtoId <= 0) {
            erros.push('O campo produto_id deve ser um ID inteiro positivo.');
        }

        if (!Number.isInteger(quantidade) || quantidade <= 0) {
            erros.push('A quantidade deve ser um número inteiro maior que zero.');
        }

        let clienteId = null;

        if (
            req.body.cliente_id !== undefined &&
            req.body.cliente_id !== null &&
            req.body.cliente_id !== ''
        ) {
            clienteId = Number(req.body.cliente_id);

            if (!Number.isInteger(clienteId) || clienteId <= 0) {
                erros.push('O campo cliente_id deve ser um ID inteiro positivo.');
            }
        }

        if (erros.length > 0) {
            return res.status(400).json({
                mensagem: 'Os dados da venda são inválidos.',
                erros
            });
        }

        if (clienteId !== null) {
            const cliente = await Cliente.findByPk(clienteId);

            if (!cliente) {
                return res.status(400).json({
                    mensagem: 'O cliente informado não existe.'
                });
            }
        }

        
        const resultado = await sequelize.transaction(async (transacao) => {
            const produto = await Produto.findByPk(produtoId, {
                transaction: transacao,
                lock: transacao.LOCK.UPDATE
            });

            if (!produto) {
                return { status: 404, mensagem: 'Produto não encontrado.' };
            }

            if (produto.ativo === false) {
                return { status: 409, mensagem: 'Não é possível vender um produto inativo.' };
            }

            if (produto.estoque < quantidade) {
                return {
                    status: 409,
                    mensagem: 'Estoque insuficiente para realizar a venda.',
                    estoque_disponivel: produto.estoque
                };
            }

            const precoUnitario = Number(produto.preco);
            const valorTotal = Math.round(precoUnitario * 100) * quantidade / 100;

            const venda = await Venda.create({
                produto_id: produto.id,
                cliente_id: clienteId,
                quantidade,
                preco_unitario: precoUnitario,
                valor_total: valorTotal,
                administrador_id: req.usuario.id
            }, { transaction: transacao });

            await produto.update({
                estoque: produto.estoque - quantidade
            }, { transaction: transacao });

            return { venda, estoque_restante: produto.estoque };
        });

        if (resultado.status) {
            const { status, ...corpo } = resultado;
            return res.status(status).json(corpo);
        }

        return res.status(201).json({
            mensagem: 'Venda registrada com sucesso.',
            venda: resultado.venda,
            estoque_restante: resultado.estoque_restante
        });
    } catch (erro) {
        console.error(erro);

        if (
            erro.name === 'SequelizeValidationError' ||
            erro.name === 'SequelizeForeignKeyConstraintError'
        ) {
            return res.status(400).json({
                mensagem: 'Não foi possível registrar a venda com os dados informados.',
                erros: erro.errors?.map(item => item.message) || []
            });
        }

        return res.status(500).json({
            mensagem: 'Não foi possível registrar a venda.'
        });
    }
};

module.exports = {
    listar,
    buscarPorId,
    criar
};
