const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({
  origin: process.env.ALLOWED_ORIGIN || 'https://dnibancos.netlify.app'
}));
app.use(express.json());

// Conexión a Postgres
// Asegúrate de definir DATABASE_URL en el entorno: postgres://user:pass@host:port/dbname
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Aseguramos la tabla
(async () => {
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS tesoreros (
        id SERIAL PRIMARY KEY,
        nombre TEXT NOT NULL,
        dni TEXT NOT NULL
      );
    `);
    console.log('Tabla tesoreros asegurada en Postgres.');
  } catch (err) {
    console.error('Error creando tabla tesoreros:', err);
  } finally {
    client.release();
  }
})();

// POST /tesoreros
app.post('/tesoreros', async (req, res) => {
  const { nombre, dni } = req.body;
  if (!nombre || !dni) return res.status(400).json({ error: 'nombre y dni requeridos' });
  try {
    const result = await pool.query(
      'INSERT INTO tesoreros (nombre, dni) VALUES ($1, $2) RETURNING id, nombre, dni',
      [nombre, dni]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error('POST /tesoreros error:', err);
    res.status(500).json({ error: 'Error al insertar tesorero' });
  }
});

// GET /tesoreros?nombre=...
app.get('/tesoreros', async (req, res) => {
  const { nombre = '' } = req.query;
  try {
    const result = await pool.query(
      'SELECT id, nombre, dni FROM tesoreros WHERE nombre ILIKE $1 ORDER BY nombre',
      [`%${nombre}%`]
    );
    res.json(result.rows);
  } catch (err) {
    console.error('GET /tesoreros error:', err);
    res.status(500).json({ error: 'Error al consultar tesoreros' });
  }
});

app.listen(PORT, () => {
  console.log(`Servidor escuchando en el puerto ${PORT}`);
});