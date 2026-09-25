const express = require('express');
const router = express.Router();
const db = require('../config/db');

// GET
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM clientes');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});

// GET
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM clientes WHERE id = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ erro: 'Cliente não encontrado' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});

// POST
router.post('/', async (req, res) => {
  try {
    const { nome, telefone, email } = req.body;
    if (!nome) return res.status(400).json({ erro: 'O campo nome é obrigatório' });

    const [result] = await db.query(
      'INSERT INTO clientes (nome, telefone, email) VALUES (?, ?, ?)',
      [nome, telefone, email]
    );
    res.status(201).json({ id: result.insertId, nome, telefone, email });
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});

// PUT
router.put('/:id', async (req, res) => {
  try {
    const { nome, telefone, email } = req.body;
    const [result] = await db.query(
      'UPDATE clientes SET nome = ?, telefone = ?, email = ? WHERE id = ?',
      [nome, telefone, email, req.params.id]
    );
    if (result.affectedRows === 0) return res.status(404).json({ erro: 'Cliente não encontrado' });
    res.json({ id: req.params.id, nome, telefone, email });
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});

// DELETE
router.delete('/:id', async (req, res) => {
  try {
    const [result] = await db.query('DELETE FROM clientes WHERE id = ?', [req.params.id]);
    if (result.affectedRows === 0) return res.status(404).json({ erro: 'Cliente não encontrado' });
    res.json({ mensagem: 'Cliente removido com sucesso' });
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});

module.exports = router;
