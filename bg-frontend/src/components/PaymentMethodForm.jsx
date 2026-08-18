import { useState, useEffect, useCallback } from 'react';
import api from '../services/api';

export default function PaymentMethodForm({ onMethodAdded }) {
  const [nombre, setNombre] = useState('');
  const [metodos, setMetodos] = useState([]);
  const [mensaje, setMensaje] = useState('');

  // Estados para edición
  const [editingId, setEditingId] = useState(null);
  const [editNombre, setEditNombre] = useState('');

  const fetchMetodos = useCallback(async () => {
    try {
      const response = await api.get('/PaymentMethods');
      setMetodos(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error("Error al cargar métodos de pago", error);
    }
  }, []);

  useEffect(() => {
    fetchMetodos();
  }, [fetchMetodos]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/PaymentMethods', { nombre: nombre, icono: 'cash' });
      setMensaje('¡Método de pago creado con éxito!');
      setNombre('');
      fetchMetodos();
      if (onMethodAdded) onMethodAdded();
    } catch (error) {
      setMensaje('Error al crear el método de pago.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Estás seguro de eliminar este método de pago?')) return;
    try {
      await api.delete(`/PaymentMethods/${id}`);
      setMensaje('¡Método eliminado!');
      fetchMetodos();
      if (onMethodAdded) onMethodAdded();
    } catch (error) {
      setMensaje('Error: No se pudo eliminar.');
    }
  };

  const startEditing = (metodo) => {
    setEditingId(metodo.id || metodo.Id);
    setEditNombre(metodo.nombre || metodo.Name);
  };

  const handleUpdate = async (id) => {
    try {
      await api.put(`/PaymentMethods/${id}`, {
        id: id,
        nombre: editNombre,
        icono: 'cash',
        activo: true
      });
      setEditingId(null);
      setMensaje('¡Método actualizado!');
      fetchMetodos();
      if (onMethodAdded) onMethodAdded();
    } catch (error) {
      setMensaje('Error al actualizar.');
    }
  };

  const inputStyle = {
    padding: '10px 14px', width: '100%', borderRadius: '8px', 
    backgroundColor: '#131517', border: '1px solid #2d3139', 
    color: '#fff', boxSizing: 'border-box', outline: 'none', fontSize: '14px'
  };

  return (
    <div style={{ width: '100%', boxSizing: 'border-box', fontFamily: '"Inter", sans-serif' }}>
      
      {/* Formulario de Creación */}
      <div style={{ backgroundColor: '#1a1d21', padding: '20px', borderRadius: '12px', border: '1px solid #2d3139', marginBottom: '20px', boxSizing: 'border-box' }}>
        <h3 style={{ margin: '0 0 15px 0', fontSize: '16px', fontWeight: 'bold', color: '#fff', textAlign: 'center' }}>
          Añadir Método de Pago
        </h3>
        
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div>
            <label style={{ display: 'block', color: '#8b92a5', fontSize: '13px', marginBottom: '6px' }}>Nombre del Método de Pago</label>
            <input 
              type="text" 
              placeholder="Ej. Efectivo, Tarjeta de Crédito..." 
              value={nombre} 
              onChange={(e) => setNombre(e.target.value)} 
              required 
              style={inputStyle}
            />
          </div>

          {/* Botón principal en Verde Aqua */}
          <button type="submit" style={{ padding: '10px 20px', background: '#5fe3c0', color: '#131517', fontWeight: 'bold', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', marginTop: '5px' }}>
            Crear Método de Pago
          </button>

          {mensaje && <p style={{ fontSize: '13px', textAlign: 'center', margin: 0, color: mensaje.includes('Error') ? '#ff6b6b' : '#5fe3c0' }}>{mensaje}</p>}
        </form>
      </div>

      {/* Listado con opciones de Editar y Eliminar */}
      <div style={{ backgroundColor: '#1a1d21', padding: '20px', borderRadius: '12px', border: '1px solid #2d3139' }}>
        <h4 style={{ margin: '0 0 15px 0', fontSize: '15px', fontWeight: 'bold', color: '#fff' }}>Métodos de Pago Existentes ({metodos.length})</h4>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '250px', overflowY: 'auto' }}>
          {metodos.length === 0 ? (
            <p style={{ color: '#8b92a5', fontSize: '13px', margin: 0 }}>No hay métodos de pago registrados.</p>
          ) : (
            metodos.map((m, idx) => {
              const mId = m.id || m.Id;
              const isEditing = editingId === mId;

              return (
                <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 14px', backgroundColor: '#131517', borderRadius: '8px', border: '1px solid #2d3139', alignItems: 'center', gap: '10px' }}>
                  {isEditing ? (
                    <div style={{ display: 'flex', gap: '8px', flex: 1, alignItems: 'center', flexWrap: 'wrap' }}>
                      <input 
                        type="text" 
                        value={editNombre} 
                        onChange={(e) => setEditNombre(e.target.value)} 
                        style={{ ...inputStyle, padding: '6px 10px', flex: 1 }} 
                      />
                      <button onClick={() => handleUpdate(mId)} style={{ background: '#5fe3c0', border: 'none', padding: '6px 12px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', color: '#131517' }}>Guardar</button>
                      <button onClick={() => setEditingId(null)} style={{ background: 'transparent', border: '1px solid #2d3139', padding: '6px 10px', borderRadius: '6px', cursor: 'pointer', color: '#8b92a5' }}>Cancelar</button>
                    </div>
                  ) : (
                    <>
                      <span style={{ fontWeight: '500', color: '#fff', fontSize: '14px' }}>💳 {m.nombre || m.Name}</span>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button onClick={() => startEditing(m)} style={{ background: 'transparent', border: '1px solid #4dabf7', color: '#4dabf7', padding: '4px 8px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px' }}>Editar</button>
                        <button onClick={() => handleDelete(mId)} style={{ background: 'transparent', border: '1px solid #ff6b6b', color: '#ff6b6b', padding: '4px 8px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px' }}>Eliminar</button>
                      </div>
                    </>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}