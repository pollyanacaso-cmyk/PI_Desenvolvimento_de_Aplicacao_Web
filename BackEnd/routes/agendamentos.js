const express = require('express');
const router = express.Router();
const db = require('../config/db');

// GET
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT a.id, a.data, a.horario, a.status,
             c.id AS cliente_id, c.nome AS cliente_nome,
             p.id AS profissional_id, p.nome AS profissional_nome,
             s.id AS servico_id, s.nome AS servico_nome, s.preco AS servico_preco
      FROM agendamentos a
      JOIN clientes c ON a.cliente_id = c.id
      JOIN profissionais p ON a.profissional_id = p.id
      JOIN servicos s ON a.servico_id = s.id
      ORDER BY a.data, a.horario
    `);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});

// GET
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM agendamentos WHERE id = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ erro: 'Agendamento não encontrado' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});

// POST
router.post('/', async (req, res) => {
  try {
    const { cliente_id, profissional_id, servico_id, data, horario, status } = req.body;
    if (!cliente_id || !profissional_id || !servico_id || !data || !horario) {
      return res.status(400).json({
        erro: 'Os campos cliente_id, profissional_id, servico_id, data e horario são obrigatórios'
      });
    }

    const [result] = await db.query(
      'INSERT INTO agendamentos (cliente_id, profissional_id, servico_id, data, horario, status) VALUES (?, ?, ?, ?, ?, ?)',
      [cliente_id, profissional_id, servico_id, data, horario, status || 'Agendado']
    );
    res.status(201).json({
      id: result.insertId,
      cliente_id,
      profissional_id,
      servico_id,
      data,
      horario,
      status: status || 'Agendado'
    });
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});

// PUT
router.put('/:id', async (req, res) => {
  try {
    const { cliente_id, profissional_id, servico_id, data, horario, status } = req.body;
    const [result] = await db.query(
      `UPDATE agendamentos
       SET cliente_id = ?, profissional_id = ?, servico_id = ?, data = ?, horario = ?, status = ?
       WHERE id = ?`,
      [cliente_id, profissional_id, servico_id, data, horario, status, req.params.id]
    );
    if (result.affectedRows === 0) return res.status(404).json({ erro: 'Agendamento não encontrado' });
    res.json({ id: req.params.id, cliente_id, profissional_id, servico_id, data, horario, status });
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});

// DELETE
router.delete('/:id', async (req, res) => {
  try {
    const [result] = await db.query('DELETE FROM agendamentos WHERE id = ?', [req.params.id]);
    if (result.affectedRows === 0) return res.status(404).json({ erro: 'Agendamento não encontrado' });
    res.json({ mensagem: 'Agendamento removido com sucesso' });
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});

module.exports = router;
