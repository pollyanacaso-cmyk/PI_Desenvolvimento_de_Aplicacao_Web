const express = require('express');
const router = express.Router();
const { Produto } = require('../config/db').models;

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
            erros.push('O nome do produto é obrigatório.');
        }
    }

    if (dados.descricao !== undefined) {
        dados.descricao = tratarTexto(dados.descricao);
    }

    if (dados.imagem !== undefined) {
        dados.imagem = tratarTexto(dados.imagem);

        if (dados.imagem) {
            try {
                const url = new URL(dados.imagem);

                if (url.protocol !== 'http:' && url.protocol !== 'https:') {
                    erros.push('A imagem deve utilizar uma URL HTTP ou HTTPS.');
                }
            } catch {
                erros.push('Informe uma URL válida para a imagem.');
            }
        }
    }

    if (dados.categoria_id !== undefined && dados.categoria_id !== null && dados.categoria_id !== '') {
        const categoriaId = Number(dados.categoria_id);

        if (!Number.isInteger(categoriaId) || categoriaId <= 0) {
            erros.push('O ID da categoria deve ser um número inteiro positivo.');
        } else {
            dados.categoria_id = categoriaId;
        }
    } else if (dados.categoria_id === '') {
        dados.categoria_id = null;
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

    const camposEstoque = ['estoque', 'estoque_minimo'];

    for (const campo of camposEstoque) {
        if (!parcial && dados[campo] === undefined) {
            dados[campo] = 0;
        }

        if (dados[campo] !== undefined) {
            const valor = Number(dados[campo]);

            if (
                dados[campo] === null ||
                dados[campo] === '' ||
                !Number.isInteger(valor) ||
                valor < 0
            ) {
                erros.push(`O campo ${campo} deve ser um número inteiro maior ou igual a zero.`);
            } else {
                dados[campo] = valor;
            }
        }
    }

    if (dados.ativo !== undefined && typeof dados.ativo !== 'boolean') {
        erros.push('O campo ativo deve ser verdadeiro ou falso.');
    }

    return erros;
}

router.get('/', async (req, res) => {
    try {
        const produtos = await Produto.findAll({
            order: [['nome', 'ASC']]
        });

        return res.status(200).json(produtos);
    } catch (erro) {
        console.error(erro);
        return res.status(500).json({
            mensagem: 'Não foi possível consultar os produtos.'
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

        const produto = await Produto.findByPk(id);

        if (!produto) {
            return res.status(404).json({
                mensagem: 'Produto não encontrado.'
            });
        }

        return res.status(200).json(produto);
    } catch (erro) {
        console.error(erro);
        return res.status(500).json({
            mensagem: 'Não foi possível consultar o produto.'
        });
    }
});

router.post('/', async (req, res) => {
    try {
        const dados = {
            categoria_id: req.body.categoria_id,
            nome: req.body.nome,
            descricao: req.body.descricao,
            preco: req.body.preco,
            imagem: req.body.imagem,
            estoque: req.body.estoque === undefined ? 0 : req.body.estoque,
            estoque_minimo: req.body.estoque_minimo === undefined ? 0 : req.body.estoque_minimo,
            ativo: req.body.ativo === undefined ? true : req.body.ativo
        };

        const erros = validarDados(dados);

        if (erros.length > 0) {
            return res.status(400).json({
                mensagem: 'Os dados do produto são inválidos.',
                erros
            });
        }

        const produto = await Produto.create(dados);

        return res.status(201).json({
            mensagem: 'Produto cadastrado com sucesso.',
            produto
        });
    } catch (erro) {
        console.error(erro);

        if (
            erro.name === 'SequelizeValidationError' ||
            erro.name === 'SequelizeUniqueConstraintError' ||
            erro.name === 'SequelizeForeignKeyConstraintError'
        ) {
            return res.status(400).json({
                mensagem: 'Não foi possível cadastrar o produto com os dados informados.',
                erros: erro.errors?.map(item => item.message) || []
            });
        }

        return res.status(500).json({
            mensagem: 'Não foi possível cadastrar o produto. Verifique os dados enviados e a categoria informada.'
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

        const produto = await Produto.findByPk(id);

        if (!produto) {
            return res.status(404).json({
                mensagem: 'Produto não encontrado.'
            });
        }

        const camposPermitidos = [
            'categoria_id',
            'nome',
            'descricao',
            'preco',
            'imagem',
            'estoque',
            'estoque_minimo',
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
                mensagem: 'Os dados do produto são inválidos.',
                erros
            });
        }

        await produto.update(dados);

        return res.status(200).json({
            mensagem: 'Produto atualizado com sucesso.',
            produto
        });
    } catch (erro) {
        console.error(erro);

        if (
            erro.name === 'SequelizeValidationError' ||
            erro.name === 'SequelizeUniqueConstraintError' ||
            erro.name === 'SequelizeForeignKeyConstraintError'
        ) {
            return res.status(400).json({
                mensagem: 'Não foi possível atualizar o produto com os dados informados.',
                erros: erro.errors?.map(item => item.message) || []
            });
        }

        return res.status(500).json({
            mensagem: 'Não foi possível atualizar o produto.'
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

        const produto = await Produto.findByPk(id);

        if (!produto) {
            return res.status(404).json({
                mensagem: 'Produto não encontrado.'
            });
        }

        await produto.destroy();

        return res.status(200).json({
            mensagem: 'Produto removido com sucesso.'
        });
    } catch (erro) {
        console.error(erro);
        return res.status(500).json({
            mensagem: 'Não foi possível remover o produto.'
        });
    }
});

module.exports = router;
