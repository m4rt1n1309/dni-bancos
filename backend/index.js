const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({
  origin: process.env.ALLOWED_ORIGIN || 'https://dnibancos.netlify.app'
}));
app.use(express.json());

// Conexión a MongoDB (MONGODB_URI en env vars)
const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
  console.error('Falta MONGODB_URI en las variables de entorno.');
  process.exit(1);
}

mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log('Conectado a MongoDB.');
}).catch(err => {
  console.error('Error conectando a MongoDB:', err.message || err);
  process.exit(1);
});

// Modelo
const tesoreroSchema = new mongoose.Schema({
  nombre: { type: String, required: true },
  dni: { type: String, required: true }
}, { timestamps: true });

const Tesorero = mongoose.model('Tesorero', tesoreroSchema);

// POST /tesoreros
app.post('/tesoreros', async (req, res) => {
  console.log('Datos recibidos en backend:', req.body);
  const { nombre, dni } = req.body;
  if (!nombre || !dni) return res.status(400).json({ error: 'nombre y dni requeridos' });
  try {
    const t = new Tesorero({ nombre, dni });
    await t.save();
    res.json({ id: t._id, nombre: t.nombre, dni: t.dni });
  } catch (err) {
    console.error('POST /tesoreros error:', err);
    res.status(500).json({ error: 'Error al insertar tesorero' });
  }
});

// GET /tesoreros?nombre=...
app.get('/tesoreros', async (req, res) => {
  const { nombre = '' } = req.query;
  try {
    const regex = new RegExp(nombre, 'i');
    const rows = await Tesorero.find({ nombre: { $regex: regex } }).sort({ nombre: 1 }).select('nombre dni');
    res.json(rows.map(r => ({ id: r._id, nombre: r.nombre, dni: r.dni })));
  } catch (err) {
    console.error('GET /tesoreros error:', err);
    res.status(500).json({ error: 'Error al consultar tesoreros' });
  }
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('Cerrando conexión a MongoDB...');
  await mongoose.disconnect();
  process.exit(0);
});

app.listen(PORT, () => {
  console.log(`Servidor escuchando en el puerto ${PORT}`);
});