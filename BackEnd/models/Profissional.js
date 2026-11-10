const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Profissional = sequelize.define('Profissional', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  nome: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  especializacao: {
    type: DataTypes.STRING(100)
  },
  telefone: {
    type: DataTypes.STRING(20)
  },
  email: {
    type: DataTypes.STRING(150)
  },
  descricao: {
    type: DataTypes.TEXT
  },
  ativo: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  data_cadastro: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'profissionais',
  timestamps: false
});

module.exports = Profissional;
