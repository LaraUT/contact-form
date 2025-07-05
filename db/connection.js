require('dotenv').config();
const sql = require('mssql');

const config = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  server: process.env.DB_HOST,
  database: process.env.DB_NAME,
  options: {
    encrypt: false, // true si usas Azure SQL en la nube
    trustServerCertificate: true // necesario para evitar errores de certificado en local
  }
};

const pool = new sql.ConnectionPool(config);
const poolConnect = pool.connect();

poolConnect
  .then(() => console.log('✅ Conectado a SQL Server desde Azure Data Studio / Docker'))
  .catch(err => console.error('❌ Error de conexión:', err));

module.exports = { sql, pool, poolConnect };
