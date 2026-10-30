const { Sequelize } = require('sequelize');

if (process.env.DB_PASSWORD === undefined) {
  console.warn('[AVISO] DB_PASSWORD não definido no .env. A conexão com o MySQL pode ser recusada.');
}

const sequelize = new Sequelize(
  process.env.DB_NAME || 'ke_bella',
  process.env.DB_USER || 'root',
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST || 'localhost',
    dialect: 'mysql',
    logging: false
  }
);

module.exports = sequelize;
