import { useState, useEffect } from 'react';
import api from '../services/api';

export default function Profile() {
  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [email, setEmail] = useState('');
  
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [messageProfile, setMessageProfile] = useState('');
  const [messagePassword, setMessagePassword] = useState('');

  useEffect(() => {
    // Cargar los datos actuales del perfil del usuario
    const fetchProfile = async () => {
      try {
        const response = await api.get('/Users/profile'); // Ajusta la ruta según tu backend si es distinta
        setNombre(response.data.nombre || response.data.name || 'Michael arturo');
        setDescripcion(response.data.descripcion || response.data.description || 'Desarrollador de Software');
        setEmail(response.data.email || 'michanova@example.com');
      } catch (err) {
        console.error("No se pudo cargar el perfil", err);
        // Valores por defecto para pruebas si la API aún no tiene este endpoint exacto
        setNombre('Michael arturo');
        setDescripcion('Desarrollador de Software');
        setEmail('michanova@example.com');
      }
    };
    fetchProfile();
  }, []);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      await api.put('/Users/profile', { 
        nombre: nombre, 
        descripcion: descripcion 
      });
      setMessageProfile('¡Perfil actualizado con éxito!');
    } catch (err) {
      console.error(err);
      setMessageProfile('Error al actualizar el perfil.');
    }
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setMessagePassword('Error: Las contraseñas no coinciden.');
      return;
    }

    try {
      await api.put('/Users/password', {
        currentPassword: currentPassword,
        newPassword: newPassword
      });
      setMessagePassword('¡Contraseña actualizada con éxito!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      console.error(err);
      setMessagePassword('Error al actualizar la contraseña.');
    }
  };

  const inputStyle = {
    padding: '12px 15px', width: '100%', borderRadius: '8px', 
    backgroundColor: '#131517', border: '1px solid #2d3139', 
    color: '#fff', boxSizing: 'border-box', outline: 'none', fontSize: '14px'
  };

  const labelStyle = { color: '#8b92a5', display: 'block', marginBottom: '8px', fontSize: '13px', textAlign: 'center' };
  const cardStyle = { backgroundColor: '#1a1d21', padding: '30px', borderRadius: '16px', border: '1px solid #2d3139', flex: 1, boxSizing: 'border-box' };

  return (
    <div style={{ width: '100%', boxSizing: 'border-box' }}>
      <h2 style={{ fontSize: '28px', fontWeight: '600', marginBottom: '30px', textAlign: 'center' }}>Mi Perfil</h2>

      {/* Tarjeta de Presentación Superior */}
      <div style={{ backgroundColor: '#1a1d21', padding: '25px 30px', borderRadius: '16px', border: '1px solid #2d3139', marginBottom: '30px', display: 'flex', alignItems: 'center', gap: '20px', width: '100%', boxSizing: 'border-box' }}>
        <div style={{ width: '65px', height: '65px', borderRadius: '50%', backgroundColor: '#00cec9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px', fontWeight: 'bold', color: '#131517' }}>
          {nombre ? nombre.charAt(0).toUpperCase() : 'M'}
        </div>
        <div>
          <h3 style={{ margin: '0 0 5px 0', fontSize: '22px', color: '#fff' }}>{nombre || 'Usuario'}</h3>
          <p style={{ margin: 0, color: '#8b92a5', fontSize: '14px' }}>{descripcion || 'Sin descripción'}</p>
        </div>
      </div>

      {/* Secciones de Edición (Dos Columnas a pantalla completa) */}
      <div style={{ display: 'flex', gap: '30px', width: '100%', flexWrap: 'wrap' }}>
        
        {/* Datos Personales y Descripción */}
        <div style={cardStyle}>
          <h3 style={{ margin: '0 0 25px 0', textAlign: 'center', fontSize: '18px', fontWeight: '500' }}>Datos Personales</h3>
          <form onSubmit={handleUpdateProfile} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div>
              <label style={labelStyle}>Nombre Completo</label>
              <input type="text" value={nombre} onChange={(e) => setNombre(e.target.value)} required style={inputStyle} />
            </div>

            <div>
              <label style={labelStyle}>Descripción / Profesión / Rol</label>
              <input type="text" value={descripcion} onChange={(e) => setDescripcion(e.target.value)} placeholder="Ej. Desarrollador de Software" style={inputStyle} />
            </div>

            <div>
              <label style={labelStyle}>Correo Electrónico</label>
              <input type="email" value={email} disabled style={{ ...inputStyle, opacity: 0.6, cursor: 'not-allowed' }} />
              <small style={{ color: '#8b92a5', display: 'block', marginTop: '5px', textAlign: 'center', fontSize: '11px' }}>El correo electrónico no se puede modificar.</small>
            </div>

            <button type="submit" style={{ backgroundColor: '#5fe3c0', color: '#131517', padding: '12px', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', marginTop: '10px' }}>
              Guardar Cambios
            </button>
            {messageProfile && <p style={{ color: messageProfile.includes('Error') ? '#ff6b6b' : '#5fe3c0', textAlign: 'center', fontSize: '13px', margin: 0 }}>{messageProfile}</p>}
          </form>
        </div>

        {/* Seguridad (Contraseña) */}
        <div style={cardStyle}>
          <h3 style={{ margin: '0 0 25px 0', textAlign: 'center', fontSize: '18px', fontWeight: '500' }}>Seguridad</h3>
          <form onSubmit={handleUpdatePassword} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div>
              <label style={labelStyle}>Contraseña Actual</label>
              <input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} required placeholder="••••••••" style={inputStyle} />
            </div>

            <div>
              <label style={labelStyle}>Nueva Contraseña</label>
              <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required placeholder="••••••••" style={inputStyle} />
            </div>

            <div>
              <label style={labelStyle}>Confirmar Nueva Contraseña</label>
              <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required placeholder="••••••••" style={inputStyle} />
            </div>

            <button type="submit" style={{ backgroundColor: '#0984e3', color: '#fff', padding: '12px', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', marginTop: '10px' }}>
              Actualizar Contraseña
            </button>
            {messagePassword && <p style={{ color: messagePassword.includes('Error') ? '#ff6b6b' : '#5fe3c0', textAlign: 'center', fontSize: '13px', margin: 0 }}>{messagePassword}</p>}
          </form>
        </div>

      </div>
    </div>
  );
}