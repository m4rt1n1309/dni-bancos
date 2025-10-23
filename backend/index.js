const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3001;

const allowedOrigins = [
  'https://dnibancos.netlify.app',  // producción
  'http://localhost:3000'           // desarrollo local
];

app.use(cors({
  origin: function(origin, callback){
    // permitir requests sin origen (como Postman o scripts server-side)
    if(!origin) return callback(null, true);
    if(allowedOrigins.indexOf(origin) === -1){
      const msg = `El CORS para ${origin} no está permitido`;
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  credentials: true
}));

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

// LOGIN hardcodeado
app.post('/login', (req, res) => {
  const { username, password } = req.body;

  // Usuario y contraseña fijos (solo para vos)
  const USER = 'abcdwxyz';
  const PASS = 'admin1234ADMIN';

  // Verificamos los datos
  if (username === USER && password === PASS) {
    console.log(`✅ Login exitoso para: ${username}`);
    res.json({ success: true, message: 'Login correcto' });
  } else {
    console.log(`❌ Intento de login fallido: ${username}`);
    res.status(401).json({ success: false, message: 'Usuario o contraseña incorrectos' });
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