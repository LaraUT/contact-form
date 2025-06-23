require('dotenv').config();
const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// Conexión a la base de datos
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});

db.connect((err) => {
  if (err) {
    console.error('❌ Error al conectar a la base de datos:', err);
  } else {
    console.log('✅ Conectado a la base de datos MySQL');
  }
});

// 🔽 POST - Crear mensaje
app.post('/api/contact', (req, res) => {
  const { name, email, phone, message } = req.body;

  const query = 'INSERT INTO messages (name, email, phone, message) VALUES (?, ?, ?, ?)';
  db.query(query, [name, email, phone, message], (err, result) => {
    if (err) {
      console.error('❌ Error al guardar datos:', err);
      res.status(500).json({ error: 'Error al guardar el mensaje' });
    } else {
      res.status(201).json({ message: 'Mensaje enviado correctamente', id: result.insertId });
    }
  });
});

// 📥 GET - Obtener todos los mensajes
app.get('/api/contact', (req, res) => {
  const query = 'SELECT * FROM messages ORDER BY created_at DESC';
  db.query(query, (err, results) => {
    if (err) {
      console.error('❌ Error al obtener mensajes:', err);
      res.status(500).json({ error: 'Error al obtener los mensajes' });
    } else {
      res.status(200).json(results);
    }
  });
});

// 🛠️ PUT - Actualizar mensaje por ID
app.put('/api/contact/:id', (req, res) => {
  const { id } = req.params;
  const { name, email, phone, message } = req.body;

  const query = `
    UPDATE messages 
    SET name = ?, email = ?, phone = ?, message = ? 
    WHERE id = ?
  `;

  db.query(query, [name, email, phone, message, id], (err, result) => {
    if (err) {
      console.error('❌ Error al actualizar:', err);
      res.status(500).json({ error: 'Error al actualizar el mensaje' });
    } else {
      res.status(200).json({ message: 'Mensaje actualizado correctamente' });
    }
  });
});

// 🗑️ DELETE - Eliminar mensaje por ID
app.delete('/api/contact/:id', (req, res) => {
  const { id } = req.params;

  const query = 'DELETE FROM messages WHERE id = ?';
  db.query(query, [id], (err, result) => {
    if (err) {
      console.error('❌ Error al eliminar:', err);
      res.status(500).json({ error: 'Error al eliminar el mensaje' });
    } else {
      res.status(200).json({ message: 'Mensaje eliminado correctamente' });
    }
  });
});

app.get('/api/contact/:id', (req, res) => {
  const { id } = req.params;

  const query = 'SELECT * FROM messages WHERE id = ?';
  db.query(query, [id], (err, results) => {
    if (err) {
      console.error('❌ Error al obtener el mensaje:', err);
      res.status(500).json({ error: 'Error al obtener el mensaje' });
    } else if (results.length === 0) {
      res.status(404).json({ error: 'Mensaje no encontrado' });
    } else {
      res.status(200).json(results[0]);
    }
  });
});


// 🚀 Iniciar el servidor
app.listen(process.env.PORT, () => {
  console.log(`🚀 Servidor escuchando en http://localhost:${process.env.PORT}`);
});
