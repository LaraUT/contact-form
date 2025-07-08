require('dotenv').config();
const mysql = require('mysql2/promise');

// Configuración para conectar con MySQL en Railway
const pool = mysql.createPool({
  host: process.env.DB_HOST,       // metro.proxy.rlwy.net
  port: process.env.DB_PORT,       // 50564
  user: process.env.DB_USER,       // root
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,   // railway
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Verifica si la conexión es exitosa
pool.getConnection()
  .then(() => console.log('✅ Conectado a MySQL en Railway'))
  .catch(err => console.error('❌ Error de conexión a MySQL:', err));

module.exports = pool;
