const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const BloqueioHorario = sequelize.define('BloqueioHorario', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  profissional_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  data: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  horario_inicio: {
    type: DataTypes.TIME,
    allowNull: false
  },
  horario_fim: {
    type: DataTypes.TIME,
    allowNull: false
  },
  motivo: {
    type: DataTypes.STRING(255)
  },
  status: {
    type: DataTypes.STRING(20),
    defaultValue: 'Bloqueado'
  },
  administrador_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  liberado_por_id: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  data_criacao: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  data_liberacao: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  tableName: 'bloqueios_horario',
  timestamps: false
});

module.exports = BloqueioHorario;
