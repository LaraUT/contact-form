require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const { sql, pool, poolConnect } = require('./db/connection');
const authRoutes = require('./routes/authRoutes');

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Frontend
app.use(express.static(path.join(__dirname, '../contac_form-back-frony/public')));

// Rutas auth
app.use('/api/auth', authRoutes);

// Home
app.get('/', (req, res) => {
  res.send('API CRM operativa 🚀');
});
app.post('/api/contact', async (req, res) => {
  const { name, email, phone, message } = req.body;

  console.log('📨 Nueva solicitud recibida:', { name, email, phone, message });

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

    const newId = result.recordset?.[0]?.id;
    if (!newId) {
      return res.status(500).json({ error: 'No se pudo recuperar el ID del mensaje insertado' });
    }

    console.log(`✅ Mensaje insertado con ID ${newId}`);
    res.status(201).json({ message: 'Mensaje enviado correctamente', id: newId });
  } catch (err) {
    console.error('❌ Error al guardar mensaje:', err);
    res.status(500).json({ error: 'Error al guardar el mensaje' });
  }
});


// GET /api/contact
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

// PUT /api/contact/:id
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

// DELETE /api/contact/:id
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

// Lanzar servidor
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`🚀 Servidor escuchando en http://localhost:${PORT}`);
});
