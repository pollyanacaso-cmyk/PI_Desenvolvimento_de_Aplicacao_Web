const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const CategoriaProduto = sequelize.define('CategoriaProduto', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  nome: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  descricao: {
    type: DataTypes.TEXT
  },
  ativo: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  tableName: 'categorias_produto',
  timestamps: false
});

module.exports = CategoriaProduto;
