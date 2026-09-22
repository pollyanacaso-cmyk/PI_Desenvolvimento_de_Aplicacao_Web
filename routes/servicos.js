const express = require('express');
const router = express.Router();
const db = require('../config/db');

// GET - listar todos os serviços
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM servicos');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});

// GET - buscar serviço por id
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM servicos WHERE id = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ erro: 'Serviço não encontrado' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});

// POST - criar serviço
router.post('/', async (req, res) => {
  try {
    const { nome, preco, duracao } = req.body;
    if (!nome || preco === undefined) {
      return res.status(400).json({ erro: 'Os campos nome e preco são obrigatórios' });
    }

    const [result] = await db.query(
      'INSERT INTO servicos (nome, preco, duracao) VALUES (?, ?, ?)',
      [nome, preco, duracao]
    );
    res.status(201).json({ id: result.insertId, nome, preco, duracao });
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});

// PUT - atualizar serviço
router.put('/:id', async (req, res) => {
  try {
    const { nome, preco, duracao } = req.body;
    const [result] = await db.query(
      'UPDATE servicos SET nome = ?, preco = ?, duracao = ? WHERE id = ?',
      [nome, preco, duracao, req.params.id]
    );
    if (result.affectedRows === 0) return res.status(404).json({ erro: 'Serviço não encontrado' });
    res.json({ id: req.params.id, nome, preco, duracao });
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});

// DELETE - remover serviço
router.delete('/:id', async (req, res) => {
  try {
    const [result] = await db.query('DELETE FROM servicos WHERE id = ?', [req.params.id]);
    if (result.affectedRows === 0) return res.status(404).json({ erro: 'Serviço não encontrado' });
    res.json({ mensagem: 'Serviço removido com sucesso' });
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});

module.exports = router;
