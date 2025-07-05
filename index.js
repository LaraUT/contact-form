require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const { sql, pool, poolConnect } = require('./db/connection');
const authRoutes = require('./routes/authRoutes');

const app = express(); // ✅ Primero declaramos app

// Middlewares
app.use(cors());
app.use(express.json());

// ✅ Servir frontend desde carpeta public/
app.use(express.static(path.join(__dirname, '../contac_form-back-frony/public')));

// ✅ Rutas de autenticación
app.use('/api/auth', authRoutes);

// ✅ Ruta raíz
app.get('/', (req, res) => {
  res.send('API CRM operativa 🚀');
});

// ✅ Crear mensaje
app.post('/api/contact', async (req, res) => {
  const { name, email, phone, message } = req.body;

  try {
    await poolConnect;
    const result = await pool.request()
      .input('name', sql.NVarChar(100), name)
      .input('email', sql.NVarChar(100), email)
      .input('phone', sql.NVarChar(20), phone)
      .input('message', sql.NVarChar(sql.MAX), message)
      .query(`
        INSERT INTO messages (name, email, phone, message)
        VALUES (@name, @email, @phone, @message);
        SELECT SCOPE_IDENTITY() AS id;
      `);

    res.status(201).json({ message: 'Mensaje enviado correctamente', id: result.recordset[0].id });
  } catch (err) {
    console.error('❌ Error al guardar mensaje:', err);
    res.status(500).json({ error: 'Error al guardar el mensaje' });
  }
});

// ✅ Obtener todos los mensajes
app.get('/api/contact', async (req, res) => {
  try {
    await poolConnect;
    const result = await pool.request().query('SELECT * FROM messages ORDER BY created_at DESC');
    res.status(200).json(result.recordset);
  } catch (err) {
    console.error('❌ Error al obtener mensajes:', err);
    res.status(500).json({ error: 'Error al obtener los mensajes' });
  }
});

app.put('/api/contact/:id', async (req, res) => {
  const { id } = req.params;
  const { name, email, phone, message, status } = req.body;

  try {
    await poolConnect;
    await pool.request()
      .input('id', sql.Int, id)
      .input('name', sql.NVarChar(100), name || '')
      .input('email', sql.NVarChar(100), email || '')
      .input('phone', sql.NVarChar(20), phone || '')
      .input('message', sql.NVarChar(sql.MAX), message || '')
      .input('status', sql.NVarChar(50), status || 'nuevo')
      .query(`
        UPDATE messages
        SET 
          name = CASE WHEN @name != '' THEN @name ELSE name END,
          email = CASE WHEN @email != '' THEN @email ELSE email END,
          phone = CASE WHEN @phone != '' THEN @phone ELSE phone END,
          message = CASE WHEN @message != '' THEN @message ELSE message END,
          status = @status
        WHERE id = @id
      `);

    res.status(200).json({ message: 'Lead actualizado correctamente' });
  } catch (err) {
    console.error('❌ Error al actualizar lead:', err);
    res.status(500).json({ error: 'Error al actualizar el lead' });
  }
});


// ✅ Actualizar mensaje
app.put('/api/contact/:id', async (req, res) => {
  const { id } = req.params;
  const { name, email, phone, message } = req.body;

  try {
    await poolConnect;
    await pool.request()
      .input('id', sql.Int, id)
      .input('name', sql.NVarChar(100), name)
      .input('email', sql.NVarChar(100), email)
      .input('phone', sql.NVarChar(20), phone)
      .input('message', sql.NVarChar(sql.MAX), message)
      .query(`
        UPDATE messages
        SET name = @name, email = @email, phone = @phone, message = @message
        WHERE id = @id
      `);

    res.status(200).json({ message: 'Mensaje actualizado correctamente' });
  } catch (err) {
    console.error('❌ Error al actualizar mensaje:', err);
    res.status(500).json({ error: 'Error al actualizar el mensaje' });
  }
});

// ✅ Eliminar mensaje
app.delete('/api/contact/:id', async (req, res) => {
  const { id } = req.params;

  try {
    await poolConnect;
    await pool.request()
      .input('id', sql.Int, id)
      .query('DELETE FROM messages WHERE id = @id');

    res.status(200).json({ message: 'Mensaje eliminado correctamente' });
  } catch (err) {
    console.error('❌ Error al eliminar mensaje:', err);
    res.status(500).json({ error: 'Error al eliminar el mensaje' });
  }
});

// ✅ Iniciar servidor
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`🚀 Servidor escuchando en http://localhost:${PORT}`);
});
