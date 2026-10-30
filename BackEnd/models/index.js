// Reune os models e define os relacionamentos entre eles.
const Cliente = require('./Cliente');
const Profissional = require('./Profissional');
const Servico = require('./Servico');
const Agendamento = require('./Agendamento');
const Avaliacao = require('./Avaliacao');
const CategoriaProduto = require('./CategoriaProduto');
const Produto = require('./Produto');
const Administrador = require('./Administrador');
const BloqueioHorario = require('./BloqueioHorario');
const Venda = require('./Venda');

Cliente.hasMany(Agendamento, {
  foreignKey: 'cliente_id'
});
Agendamento.belongsTo(Cliente, {
  foreignKey: 'cliente_id'
});

Profissional.hasMany(Agendamento, {
  foreignKey: 'profissional_id'
});
Agendamento.belongsTo(Profissional, {
  foreignKey: 'profissional_id'
});

Servico.hasMany(Agendamento, {
  foreignKey: 'servico_id'
});
Agendamento.belongsTo(Servico, {
  foreignKey: 'servico_id'
});

Cliente.hasMany(Avaliacao, {
  foreignKey: 'cliente_id'
});
Avaliacao.belongsTo(Cliente, {
  foreignKey: 'cliente_id'
});

Profissional.hasMany(Avaliacao, {
  foreignKey: 'profissional_id'
});
Avaliacao.belongsTo(Profissional, {
  foreignKey: 'profissional_id'
});

Agendamento.hasMany(Avaliacao, {
  foreignKey: 'agendamento_id'
});
Avaliacao.belongsTo(Agendamento, {
  foreignKey: 'agendamento_id'
});

CategoriaProduto.hasMany(Produto, {
  foreignKey: 'categoria_id'
});
Produto.belongsTo(CategoriaProduto, {
  foreignKey: 'categoria_id'
});

Profissional.hasMany(BloqueioHorario, {
  foreignKey: 'profissional_id'
});
BloqueioHorario.belongsTo(Profissional, {
  foreignKey: 'profissional_id'
});

Administrador.hasMany(BloqueioHorario, {
  foreignKey: 'administrador_id'
});
BloqueioHorario.belongsTo(Administrador, {
  foreignKey: 'administrador_id'
});

Produto.hasMany(Venda, {
  foreignKey: 'produto_id'
});
Venda.belongsTo(Produto, {
  foreignKey: 'produto_id'
});

Cliente.hasMany(Venda, {
  foreignKey: 'cliente_id'
});
Venda.belongsTo(Cliente, {
  foreignKey: 'cliente_id'
});

Administrador.hasMany(Venda, {
  foreignKey: 'administrador_id'
});
Venda.belongsTo(Administrador, {
  foreignKey: 'administrador_id'
});

module.exports = {
  Cliente,
  Profissional,
  Servico,
  Agendamento,
  Avaliacao,
  CategoriaProduto,
  Produto,
  Administrador,
  BloqueioHorario,
  Venda
};
