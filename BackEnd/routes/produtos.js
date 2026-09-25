const express = require('express');
const router = express.Router();
const db = require('../config/db');

// GET
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM produtos');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});

// GET
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM produtos WHERE id = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ erro: 'Produto não encontrado' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});

// POST
router.post('/', async (req, res) => {
  try {
    const { nome, categoria, preco, estoque } = req.body;
    if (!nome) return res.status(400).json({ erro: 'O campo nome é obrigatório' });

    const [result] = await db.query(
      'INSERT INTO produtos (nome, categoria, preco, estoque) VALUES (?, ?, ?, ?)',
      [nome, categoria, preco, estoque || 0]
    );
    res.status(201).json({ id: result.insertId, nome, categoria, preco, estoque: estoque || 0 });
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});

// PUT
router.put('/:id', async (req, res) => {
  try {
    const { nome, categoria, preco, estoque } = req.body;
    const [result] = await db.query(
      'UPDATE produtos SET nome = ?, categoria = ?, preco = ?, estoque = ? WHERE id = ?',
      [nome, categoria, preco, estoque, req.params.id]
    );
    if (result.affectedRows === 0) return res.status(404).json({ erro: 'Produto não encontrado' });
    res.json({ id: req.params.id, nome, categoria, preco, estoque });
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});

// DELETE
router.delete('/:id', async (req, res) => {
  try {
    const [result] = await db.query('DELETE FROM produtos WHERE id = ?', [req.params.id]);
    if (result.affectedRows === 0) return res.status(404).json({ erro: 'Produto não encontrado' });
    res.json({ mensagem: 'Produto removido com sucesso' });
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});

module.exports = router;
