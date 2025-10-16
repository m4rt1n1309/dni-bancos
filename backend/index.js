const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({
  origin: 'https://dnibancos.netlify.app'
}));
app.use(express.json());

// Inicializar base de datos SQLite
const db = new sqlite3.Database('./tesoreros.db', (err) => {
  if (err) {
    console.error('Error al abrir la base de datos', err);
  } else {
    db.run(
      `CREATE TABLE IF NOT EXISTS tesoreros (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nombre TEXT NOT NULL,
        dni TEXT NOT NULL
      )`
    );
  }
});

// Endpoint para agregar un tesorero
app.post('/tesoreros', (req, res) => {
  const { nombre, dni } = req.body;
  db.run(
    'INSERT INTO tesoreros (nombre, dni) VALUES (?, ?)',
    [nombre, dni],
    function (err) {
      if (err) {
        res.status(500).json({ error: err.message });
      } else {
        res.json({ id: this.lastID, nombre, dni });
      }
    }
  );
});

// Endpoint para buscar tesorero por nombre
app.get('/tesoreros', (req, res) => {
  const { nombre } = req.query;
  db.all(
    'SELECT * FROM tesoreros WHERE nombre LIKE ?',
    [`%${nombre}%`],
    (err, rows) => {
      if (err) {
        res.status(500).json({ error: err.message });
      } else {
        res.json(rows);
      }
    }
  );
});

app.listen(PORT, () => {
  console.log(`Servidor escuchando en el puerto ${PORT}`);
});