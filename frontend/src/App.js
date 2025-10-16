import React, { useState } from 'react';
import axios from 'axios';

function App() {
  const [nombre, setNombre] = useState('');
  const [resultados, setResultados] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState('');

  // Estados para agregar tesorero
  const [nuevoNombre, setNuevoNombre] = useState('');
  const [nuevoDni, setNuevoDni] = useState('');
  const [mensaje, setMensaje] = useState('');

  const buscarTesoreros = async (e) => {
    e.preventDefault();
    setCargando(true);
    setError('');
    setResultados([]);
    try {
      const res = await axios.get('https://dni-bancos.onrender.com/tesoreros', { params: { nombre } })
      setResultados(res.data);
    } catch (err) {
      setError('Error al buscar tesoreros');
    }
    setCargando(false);
  };

  const agregarTesorero = async (e) => {
    e.preventDefault();
    setMensaje('');
    setError('');
    try {
      await axios.post('https://dni-bancos.onrender.com/tesoreros', { nombre: nuevoNombre, dni: nuevoDni })
      setMensaje('Tesorero agregado correctamente');
      setNuevoNombre('');
      setNuevoDni('');
      // Opcional: actualizar resultados si el nombre coincide
      if (nuevoNombre && nuevoNombre.toLowerCase().includes(nombre.toLowerCase())) {
        buscarTesoreros({ preventDefault: () => {} });
      }
    } catch (err) {
      setError('Error al agregar tesorero');
    }
  };

  return (
    <div style={{ maxWidth: 400, margin: '40px auto', fontFamily: 'Arial' }}>
      <h2>Buscar DNI de Tesorero</h2>
      <form onSubmit={buscarTesoreros}>
        <input
          type="text"
          placeholder="Nombre del tesorero"
          value={nombre}
          onChange={e => setNombre(e.target.value)}
          style={{ width: '100%', padding: 8, marginBottom: 10 }}
          required
        />
        <button type="submit" style={{ width: '100%', padding: 8 }}>
          Buscar
        </button>
      </form>
      {cargando && <p>Buscando...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {resultados.length > 0 && (
        <ul>
          {resultados.map(tesorero => (
            <li key={tesorero.id}>
              <strong>{tesorero.nombre}</strong>: {tesorero.dni}
            </li>
          ))}
        </ul>
      )}
      {resultados.length === 0 && !cargando && nombre && <p>No se encontraron resultados.</p>}

      <hr style={{ margin: '30px 0' }} />

      <h2>Agregar Tesorero</h2>
      <form onSubmit={agregarTesorero}>
        <input
          type="text"
          placeholder="Nombre"
          value={nuevoNombre}
          onChange={e => setNuevoNombre(e.target.value)}
          style={{ width: '100%', padding: 8, marginBottom: 10 }}
          required
        />
        <input
          type="text"
          placeholder="DNI"
          value={nuevoDni}
          onChange={e => setNuevoDni(e.target.value)}
          style={{ width: '100%', padding: 8, marginBottom: 10 }}
          required
        />
        <button type="submit" style={{ width: '100%', padding: 8 }}>
          Agregar
        </button>
      </form>
      {mensaje && <p style={{ color: 'green' }}>{mensaje}</p>}
    </div>
  );
}

export default App;
