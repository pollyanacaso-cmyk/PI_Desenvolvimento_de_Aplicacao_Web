require('dotenv').config();

const express = require('express');
const cors = require('cors');

const sequelize = require('./config/database');
require('./models');
const { garantirAdminInicial } = require('./utils/adminInicial');

const clienteRoutes = require('./routes/clienteRoutes');
const profissionalRoutes = require('./routes/profissionalRoutes');
const servicoRoutes = require('./routes/servicoRoutes');
const produtoRoutes = require('./routes/produtoRoutes');
const agendamentoRoutes = require('./routes/agendamentoRoutes');
const authRoutes = require('./routes/authRoutes');
const administradorRoutes = require('./routes/administradorRoutes');
const bloqueioRoutes = require('./routes/bloqueioRoutes');
const vendaRoutes = require('./routes/vendaRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.json({ mensagem: 'API Ke Bella rodando com sucesso!' });
});

app.use('/clientes', clienteRoutes);
app.use('/profissionais', profissionalRoutes);
app.use('/servicos', servicoRoutes);
app.use('/produtos', produtoRoutes);
app.use('/agendamentos', agendamentoRoutes);
app.use('/auth', authRoutes);
app.use('/administradores', administradorRoutes);
app.use('/bloqueios', bloqueioRoutes);
app.use('/vendas', vendaRoutes);

app.use((req, res) => {
  res.status(404).json({ erro: 'Rota não encontrada' });
});

app.use((erro, req, res, next) => {
  if (erro.type === 'entity.parse.failed') {
    return res.status(400).json({
      mensagem: 'O corpo da requisição não é um JSON válido.'
    });
  }

  console.error(erro);
  return res.status(500).json({
    mensagem: 'Erro interno do servidor.'
  });
});

async function iniciarServidor() {
  try {
    await sequelize.authenticate();
    console.log('Conexão com o MySQL estabelecida com sucesso!');

    await sequelize.sync({ alter: true });
    console.log('Tabelas do Ke Bella sincronizadas com sucesso!');

    await garantirAdminInicial();

    app.listen(PORT, () => {
      console.log(`Servidor rodando em http://localhost:${PORT}`);
    });
  } catch (erro) {
    console.error('Erro ao conectar ou sincronizar o banco:', erro.message);
    process.exitCode = 1;
  }
}

iniciarServidor();
