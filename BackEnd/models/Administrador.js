const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Administrador = sequelize.define('Administrador', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  nome: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  email: {
    type: DataTypes.STRING(150),
    allowNull: false
  },
  senha_hash: {
    type: DataTypes.STRING(100),
    allowNull: false
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
  tableName: 'administradores',
  timestamps: false,
  indexes: [
    { unique: true, fields: ['email'], name: 'uq_administradores_email' }
  ],
  
  defaultScope: {
    attributes: { exclude: ['senha_hash'] }
  }
});

module.exports = Administrador;
