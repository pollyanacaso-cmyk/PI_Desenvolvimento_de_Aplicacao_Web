const mysql = require('mysql2');
require('dotenv').config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'ke_bella',
  port: process.env.DB_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

const db = pool.promise();

pool.getConnection((err, connection) => {
  if (err) {
    console.error(' Erro ao conectar ao banco de dados:', err.message);
    return;
  }
  console.log(' Conexão com o banco de dados MySQL estabelecida com sucesso!');
  connection.release();
});

module.exports = db;
