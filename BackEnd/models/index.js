// Reúne os models e define os relacionamentos utilizados pelo sistema.
const Cliente = require('./Cliente');
const Profissional = require('./Profissional');
const Servico = require('./Servico');
const Agendamento = require('./Agendamento');
const Administrador = require('./Administrador');
const BloqueioHorario = require('./BloqueioHorario');

Cliente.hasMany(Agendamento, { foreignKey: 'cliente_id' });
Agendamento.belongsTo(Cliente, { foreignKey: 'cliente_id' });

Profissional.hasMany(Agendamento, { foreignKey: 'profissional_id' });
Agendamento.belongsTo(Profissional, { foreignKey: 'profissional_id' });

Servico.hasMany(Agendamento, { foreignKey: 'servico_id' });
Agendamento.belongsTo(Servico, { foreignKey: 'servico_id' });

Profissional.hasMany(BloqueioHorario, { foreignKey: 'profissional_id' });
BloqueioHorario.belongsTo(Profissional, { foreignKey: 'profissional_id' });

Administrador.hasMany(BloqueioHorario, { foreignKey: 'administrador_id' });
BloqueioHorario.belongsTo(Administrador, { foreignKey: 'administrador_id' });

module.exports = {
  Cliente,
  Profissional,
  Servico,
  Agendamento,
  Administrador,
  BloqueioHorario
};
