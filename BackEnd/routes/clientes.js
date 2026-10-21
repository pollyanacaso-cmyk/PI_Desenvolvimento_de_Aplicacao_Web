const express = require('express');
const router = express.Router();
const { Cliente } = require('../config/db').models;

function tratarTexto(valor) {
  if (typeof valor !== 'string') {
    return valor;
  }

  const texto = valor.trim();
  return texto === '' ? null : texto;
}

function validarEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validarDados(dados) {
  if (dados.nome !== undefined) {
    dados.nome = tratarTexto(dados.nome);

    if (!dados.nome) {
      return 'O nome é obrigatório e não pode conter apenas espaços';
    }
  }

  if (dados.telefone !== undefined) {
    dados.telefone = tratarTexto(dados.telefone);
  }

  if (dados.email !== undefined) {
    dados.email = tratarTexto(dados.email);

    if (dados.email !== null) {
      dados.email = dados.email.toLowerCase();

      if (!validarEmail(dados.email)) {
        return 'O e-mail informado não é válido';
      }
    }
  }

  if (dados.cpf !== undefined) {
    dados.cpf = tratarTexto(dados.cpf);
  }

  if (dados.data_nascimento !== undefined && dados.data_nascimento !== null) {
    if (
      typeof dados.data_nascimento !== 'string' ||
      !/^\d{4}-\d{2}-\d{2}$/.test(dados.data_nascimento) ||
      Number.isNaN(Date.parse(`${dados.data_nascimento}T00:00:00Z`)) ||
      new Date(`${dados.data_nascimento}T00:00:00Z`).toISOString().slice(0, 10) !== dados.data_nascimento
    ) {
      return 'A data de nascimento deve ser uma data válida no formato AAAA-MM-DD';
    }

    if (new Date(`${dados.data_nascimento}T00:00:00Z`) > new Date()) {
      return 'A data de nascimento não pode estar no futuro';
    }
  }

  if (dados.ativo !== undefined && typeof dados.ativo !== 'boolean') {
    return 'O campo ativo deve ser verdadeiro ou falso';
  }

  return null;
}

router.get('/', async (req, res) => {
  try {
    const clientes = await Cliente.findAll();
    res.json(clientes);
  } catch (err) {
    res.status(500).json({ erro: 'Erro ao consultar clientes' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({ erro: 'O ID informado é inválido' });
    }

    const cliente = await Cliente.findByPk(id);

    if (!cliente) {
      return res.status(404).json({ erro: 'Cliente não encontrado' });
    }

    res.json(cliente);
  } catch (err) {
    res.status(500).json({ erro: 'Erro ao consultar cliente' });
  }
});

router.post('/', async (req, res) => {
  try {
    const dados = {
      nome: req.body.nome,
      telefone: req.body.telefone,
      email: req.body.email,
      cpf: req.body.cpf,
      data_nascimento: req.body.data_nascimento,
      ativo: req.body.ativo
    };

    if (dados.nome === undefined) {
      return res.status(400).json({ erro: 'O campo nome é obrigatório' });
    }

    const erroValidacao = validarDados(dados);

    if (erroValidacao) {
      return res.status(400).json({ erro: erroValidacao });
    }

    const cliente = await Cliente.create(dados);
    res.status(201).json(cliente);
  } catch (err) {
    if (err.name === 'SequelizeValidationError' || err.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({
        erro: 'Os dados informados são inválidos ou já estão cadastrados',
        detalhes: err.errors?.map((item) => item.message)
      });
    }

    res.status(500).json({ erro: 'Erro interno ao cadastrar cliente' });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({ erro: 'O ID informado é inválido' });
    }

    const cliente = await Cliente.findByPk(id);

    if (!cliente) {
      return res.status(404).json({ erro: 'Cliente não encontrado' });
    }

    const campos = [
      'nome',
      'telefone',
      'email',
      'cpf',
      'data_nascimento',
      'ativo'
    ];

    const dados = {};

    campos.forEach((campo) => {
      if (req.body[campo] !== undefined) {
        dados[campo] = req.body[campo];
      }
    });

    const erroValidacao = validarDados(dados);

    if (erroValidacao) {
      return res.status(400).json({ erro: erroValidacao });
    }

    await cliente.update(dados);
    res.json(cliente);
  } catch (err) {
    if (err.name === 'SequelizeValidationError' || err.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({
        erro: 'Os dados informados são inválidos ou já estão cadastrados',
        detalhes: err.errors?.map((item) => item.message)
      });
    }

    res.status(500).json({ erro: 'Erro interno ao atualizar cliente' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({ erro: 'O ID informado é inválido' });
    }

    const cliente = await Cliente.findByPk(id);

    if (!cliente) {
      return res.status(404).json({ erro: 'Cliente não encontrado' });
    }

    await cliente.destroy();
    res.json({ mensagem: 'Cliente removido com sucesso' });
  } catch (err) {
    res.status(500).json({
      erro: 'Não foi possível remover o cliente. Verifique se ele está relacionado a um agendamento.'
    });
  }
});

module.exports = router;
