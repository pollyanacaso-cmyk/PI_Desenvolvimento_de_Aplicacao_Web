const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.json({ mensagem: 'API Ke Bella rodando com sucesso! 💇‍♀️' });
});

const clientesRoutes = require('./routes/clientes');
const profissionaisRoutes = require('./routes/profissionais');
const servicosRoutes = require('./routes/servicos');
const produtosRoutes = require('./routes/produtos');
const agendamentosRoutes = require('./routes/agendamentos');

app.use('/clientes', clientesRoutes);
app.use('/profissionais', profissionaisRoutes);
app.use('/servicos', servicosRoutes);
app.use('/produtos', produtosRoutes);
app.use('/agendamentos', agendamentosRoutes);

app.use((req, res) => {
  res.status(404).json({ erro: 'Rota não encontrada' });
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
});
