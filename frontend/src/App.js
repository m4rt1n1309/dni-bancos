import React, { useState } from 'react';
import axios from 'axios';

function App() {
  const [loggedIn, setLoggedIn] = useState(localStorage.getItem('isLoggedIn') === 'true');

  // Estados del login
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  // Estados de búsqueda y agregar tesorero
  const [nombre, setNombre] = useState('');
  const [resultados, setResultados] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState('');
  const [nuevoNombre, setNuevoNombre] = useState('');
  const [nuevoDni, setNuevoDni] = useState('');
  const [mensaje, setMensaje] = useState('');

  const backendURL = 'https://dni-bancos.onrender.com'; // cambia si usás otro dominio o puerto

  // --- LOGIN ---
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError('');
    try {
      const res = await axios.post(`${backendURL}/login`, {
        username,
        password
      });
      if (res.data.success) {
        localStorage.setItem('isLoggedIn', 'true');
        setLoggedIn(true);
      } else {
        setLoginError('Usuario o contraseña incorrectos');
      }
    } catch (err) {
      console.error(err);
      setLoginError('Error al conectar con el servidor');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('isLoggedIn');
    setLoggedIn(false);
  };

  // --- TESOREROS ---
  const buscarTesoreros = async (e) => {
    e.preventDefault();
    setCargando(true);
    setError('');
    setResultados([]);
    try {
      const res = await axios.get(`${backendURL}/tesoreros`, { params: { nombre } });
      setResultados(res.data);
    } catch (err) {
      setError('Error al buscar tesoreros');
    }
    setCargando(false);
  };

  const listarTesoreros = async () => {
  setCargando(true);
  setError('');
  setResultados([]);
  try {
    const res = await axios.get(`${backendURL}/tesoreros`);
    setResultados(res.data);
  } catch (err) {
    console.error(err);
    setError('Error al listar tesoreros');
  }
  setCargando(false);
};

  const agregarTesorero = async (e) => {
    e.preventDefault();
    setMensaje('');
    setError('');
    try {
      await axios.post(`${backendURL}/tesoreros`, { nombre: nuevoNombre, dni: nuevoDni });
      setMensaje('Tesorero agregado correctamente');
      setNuevoNombre('');
      setNuevoDni('');
      if (nuevoNombre && nuevoNombre.toLowerCase().includes(nombre.toLowerCase())) {
        buscarTesoreros({ preventDefault: () => {} });
      }
    } catch (err) {
      setError('Error al agregar tesorero');
    }
  };

  // --- UI ---
  if (!loggedIn) {
    return (
      <div style={{ maxWidth: 400, margin: '100px auto', fontFamily: 'Arial' }}>
        <h2>Login</h2>
        <form onSubmit={handleLogin}>
          <input
            type="text"
            placeholder="Usuario"
            value={username}
            onChange={e => setUsername(e.target.value)}
            style={{ width: '100%', padding: 8, marginBottom: 10 }}
            required
          />
          <input
            type="password"
            placeholder="Contraseña"
            value={password}
            onChange={e => setPassword(e.target.value)}
            style={{ width: '100%', padding: 8, marginBottom: 10 }}
            required
          />
          <button type="submit" style={{ width: '100%', padding: 8 }}>
            Ingresar
          </button>
        </form>
        {loginError && <p style={{ color: 'red' }}>{loginError}</p>}
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 400, margin: '40px auto', fontFamily: 'Arial' }}>
      <button
        onClick={handleLogout}
        style={{ float: 'right', marginBottom: 10, backgroundColor: '#ccc', border: 'none', padding: '6px 10px', cursor: 'pointer' }}
      >
        Cerrar sesión
      </button>
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
        <button
  type="button"
  onClick={listarTesoreros}
  style={{ width: '100%', padding: 8, marginTop: 5, backgroundColor: '#e0e0e0' }}
>
  Listar todos
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
