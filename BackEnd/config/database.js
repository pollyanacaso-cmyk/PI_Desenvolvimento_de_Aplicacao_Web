
require('dotenv').config();

const { Sequelize } = require('sequelize');
const mysql = require('mysql2/promise');

const DB_NAME = process.env.DB_NAME;
const DB_HOST = process.env.DB_HOST;
const DB_PORT = Number(process.env.DB_PORT);
const DB_USER = process.env.DB_USER;
const DB_PASSWORD = process.env.DB_PASSWORD;

async function garantirBancoDeDados() {
  const conexao = await mysql.createConnection({
    host: DB_HOST,
    port: DB_PORT,
    user: DB_USER,
    password: DB_PASSWORD
  });

  try {
    await conexao.query(
      `CREATE DATABASE IF NOT EXISTS \`${DB_NAME}\`
       CHARACTER SET utf8mb4
       COLLATE utf8mb4_unicode_ci`
    );

    console.log(`Banco de dados ${DB_NAME} criado ou já existente.`);
  } finally {
    await conexao.end();
  }
}

const sequelize = new Sequelize(
  DB_NAME,
  DB_USER,
  DB_PASSWORD,
  {
    host: DB_HOST,
    port: DB_PORT,
    dialect: 'mysql',
    logging: false
  }
);

module.exports = sequelize;
module.exports.garantirBancoDeDados = garantirBancoDeDados;
