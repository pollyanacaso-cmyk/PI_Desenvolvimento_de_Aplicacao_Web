const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Produto = sequelize.define('Produto', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  categoria_id: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  nome: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  descricao: {
    type: DataTypes.TEXT
  },
  preco: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  imagem: {
    type: DataTypes.STRING(500)
  },
  estoque: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  estoque_minimo: {
    type: DataTypes.INTEGER,
    defaultValue: 0
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
  tableName: 'produtos',
  timestamps: false
});

module.exports = Produto;
