const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Avaliacao = sequelize.define('Avaliacao', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  cliente_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  profissional_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  agendamento_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  nota: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 1,
      max: 5
    }
  }
}, {
  tableName: 'avaliacoes',
  timestamps: false
});

module.exports = Avaliacao;
