import { useState } from 'react';
import api from '../services/api';

function Auth({ onLogin }) {
  const [isLogin, setIsLogin] = useState(true);
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        // Iniciar Sesión
        const response = await api.post('/Auth/login', { email, password });
        localStorage.setItem('token', response.data.token);
        onLogin();
      } else {
        // Registrarse
        await api.post('/Auth/register', { nombre, email, password });
        setIsLogin(true);
        setError('¡Registro exitoso! Por favor inicia sesión.');
      }
    } catch (err) {
      // Capturamos la respuesta exacta del Backend (C#)
      if (err.response && err.response.data) {
        const backendMessage = err.response.data.message || err.response.data.error || err.response.data;
        
        if (typeof backendMessage === 'string') {
          setError(backendMessage); // Aquí mostrará "El correo no está registrado" o "La contraseña es incorrecta"
        } else {
          setError('Ocurrió un error al procesar la solicitud.');
        }
      } else {
        setError('No se pudo conectar con el servidor.');
      }
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    padding: '12px 15px', width: '100%', borderRadius: '8px', 
    backgroundColor: '#131517', border: '1px solid #2d3139', 
    color: '#fff', boxSizing: 'border-box', outline: 'none',
    fontSize: '14px'
  };

  const labelStyle = {
    color: '#8b92a5', display: 'block', marginBottom: '6px', 
    fontSize: '13px', fontWeight: '500', textAlign: 'left'
  };

  const groupStyle = {
    marginBottom: '20px'
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', backgroundColor: '#131517', color: '#fff', fontFamily: '"Inter", sans-serif' }}>
      <div style={{ backgroundColor: '#1a1d21', padding: '40px', borderRadius: '16px', width: '100%', maxWidth: '420px', border: '1px solid #2d3139', boxSizing: 'border-box' }}>
        
        {/* LOGO Y SIGNIFICADO */}
        <div style={{ textAlign: 'center', marginBottom: '35px' }}>
          <h1 style={{ color: '#5fe3c0', fontSize: '38px', margin: '0 0 2px 0', letterSpacing: '-1px', lineHeight: '1' }}>B&G</h1>
          <span style={{ color: '#8b92a5', fontSize: '11px', fontWeight: '500', letterSpacing: '1px', textTransform: 'uppercase' }}>
            Budgets and Goals
          </span>
        </div>

        <h2 style={{ textAlign: 'center', marginBottom: '30px', fontWeight: '500', fontSize: '22px' }}>
          {isLogin ? 'Iniciar Sesión' : 'Crear Cuenta'}
        </h2>

        <form onSubmit={handleSubmit}>
          {!isLogin && (
            <div style={groupStyle}>
              <label style={labelStyle}>Nombre Completo</label>
              <input type="text" required value={nombre} onChange={(e) => setNombre(e.target.value)} style={inputStyle} placeholder="Ej. Michael Rodriguez" />
            </div>
          )}
          
          <div style={groupStyle}>
            <label style={labelStyle}>Correo Electrónico</label>
            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} style={inputStyle} placeholder="tu@email.com" />
          </div>

          <div style={groupStyle}>
            <label style={labelStyle}>Contraseña</label>
            <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} style={inputStyle} placeholder="••••••••" />
          </div>

          {/* MENSAJE DE ERROR O ÉXITO VISUAL */}
          {error && (
            <div style={{ backgroundColor: error.includes('exitoso') ? 'rgba(95, 227, 192, 0.1)' : 'rgba(255, 107, 107, 0.1)', border: `1px solid ${error.includes('exitoso') ? '#5fe3c0' : '#ff6b6b'}`, borderRadius: '8px', padding: '10px', marginBottom: '15px' }}>
              <p style={{ margin: 0, color: error.includes('exitoso') ? '#5fe3c0' : '#ff6b6b', fontSize: '13px', textAlign: 'center', fontWeight: '500' }}>
                {error}
              </p>
            </div>
          )}

          <button type="submit" disabled={loading} style={{ width: '100%', backgroundColor: '#5fe3c0', color: '#131517', padding: '14px', border: 'none', borderRadius: '8px', fontWeight: '700', fontSize: '16px', cursor: 'pointer', marginTop: '5px', letterSpacing: '0.5px' }}>
            {loading ? 'Cargando...' : (isLogin ? 'Entrar' : 'Registrarse')}
          </button>
        </form>

        <p style={{ textAlign: 'center', color: '#8b92a5', marginTop: '25px', fontSize: '14px' }}>
          {isLogin ? '¿No tienes cuenta?' : '¿Ya tienes cuenta?'} 
          <span onClick={() => { setIsLogin(!isLogin); setError(''); }} style={{ color: '#5fe3c0', cursor: 'pointer', marginLeft: '5px', fontWeight: '600' }}>
            {isLogin ? 'Regístrate aquí' : 'Inicia sesión'}
          </span>
        </p>

      </div>
    </div>
  );
}

export default Auth;