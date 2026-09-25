const express = require('express');
const router = express.Router();
const db = require('../config/db');

// GET - listar todos os profissionais
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM profissionais');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});

// GET - buscar profissional por id
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM profissionais WHERE id = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ erro: 'Profissional não encontrado' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});

// POST - criar profissional
router.post('/', async (req, res) => {
  try {
    const { nome, especialidade } = req.body;
    if (!nome) return res.status(400).json({ erro: 'O campo nome é obrigatório' });

    const [result] = await db.query(
      'INSERT INTO profissionais (nome, especialidade) VALUES (?, ?)',
      [nome, especialidade]
    );
    res.status(201).json({ id: result.insertId, nome, especialidade });
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});

// PUT - atualizar profissional
router.put('/:id', async (req, res) => {
  try {
    const { nome, especialidade } = req.body;
    const [result] = await db.query(
      'UPDATE profissionais SET nome = ?, especialidade = ? WHERE id = ?',
      [nome, especialidade, req.params.id]
    );
    if (result.affectedRows === 0) return res.status(404).json({ erro: 'Profissional não encontrado' });
    res.json({ id: req.params.id, nome, especialidade });
  } catch (err) {
    res.status(500).json({ erro: err.message });
  } 
});

// DELETE - remover profissional
router.delete('/:id', async (req, res) => {
  try {
    const [result] = await db.query('DELETE FROM profissionais WHERE id = ?', [req.params.id]);
    if (result.affectedRows === 0) return res.status(404).json({ erro: 'Profissional não encontrado' });
    res.json({ mensagem: 'Profissional removido com sucesso' });
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});

module.exports = router;
