import React, { useState } from 'react';
import axios from 'axios';

function App() {
  const [nombre, setNombre] = useState('');
  const [resultados, setResultados] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState('');

  const buscarTesoreros = async (e) => {
    e.preventDefault();
    setCargando(true);
    setError('');
    setResultados([]);
    try {
      const res = await axios.get('http://localhost:3001/tesoreros', {
        params: { nombre }
      });
      setResultados(res.data);
    } catch (err) {
      setError('Error al buscar tesoreros');
    }
    setCargando(false);
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
    </div>
  );
}

export default App;
