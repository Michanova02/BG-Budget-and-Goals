import { useState, useEffect, useCallback } from 'react';
import api from '../services/api';

export default function CategoryForm({ onCategoryAdded }) {
  const [nombre, setNombre] = useState('');
  const [tipo, setTipo] = useState('0'); // 0 = Gasto, 1 = Ingreso
  const [categorias, setCategorias] = useState([]);
  const [mensaje, setMensaje] = useState('');
  
  // Estados para edición
  const [editingId, setEditingId] = useState(null);
  const [editNombre, setEditNombre] = useState('');
  const [editTipo, setEditTipo] = useState('0');

  const fetchCategorias = useCallback(async () => {
    try {
      const response = await api.get('/Categories');
      setCategorias(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error("Error al cargar categorías", error);
    }
  }, []);

  useEffect(() => {
    fetchCategorias();
  }, [fetchCategorias]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/Categories', { 
        nombre: nombre, 
        tipo: parseInt(tipo) 
      });
      
      setMensaje('¡Categoría creada con éxito!');
      setNombre('');
      fetchCategorias();
      if (onCategoryAdded) onCategoryAdded();
    } catch (error) {
      setMensaje('Error: ' + (error.response?.data?.Error || 'No se pudo crear'));
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Estás seguro de eliminar esta categoría?')) return;
    try {
      await api.delete(`/Categories/${id}`);
      setMensaje('¡Categoría eliminada!');
      fetchCategorias();
      if (onCategoryAdded) onCategoryAdded();
    } catch (error) {
      setMensaje('Error: No se pudo eliminar (puede tener gastos asociados).');
    }
  };

  const startEditing = (cat) => {
    setEditingId(cat.id || cat.Id);
    setEditNombre(cat.nombre || cat.Name);
    setEditTipo(String(cat.tipo !== undefined ? cat.tipo : cat.Tipo));
  };

  const handleUpdate = async (id) => {
    try {
      await api.put(`/Categories/${id}`, {
        id: id,
        nombre: editNombre,
        tipo: parseInt(editTipo),
        activo: true
      });
      setEditingId(null);
      setMensaje('¡Categoría actualizada!');
      fetchCategorias();
      if (onCategoryAdded) onCategoryAdded();
    } catch (error) {
      setMensaje('Error al actualizar la categoría.');
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
          Añadir Nueva Categoría
        </h3>
        
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div>
            <label style={{ display: 'block', color: '#8b92a5', fontSize: '13px', marginBottom: '6px' }}>Nombre de la Categoría</label>
            <input 
              type="text" 
              placeholder="Ej. Comida, Alquiler..." 
              value={nombre} 
              onChange={(e) => setNombre(e.target.value)} 
              required 
              style={inputStyle}
            />
          </div>
          
          <div>
            <label style={{ display: 'block', color: '#8b92a5', fontSize: '13px', marginBottom: '6px' }}>Tipo</label>
            <select 
              value={tipo} 
              onChange={(e) => setTipo(e.target.value)}
              style={{...inputStyle, cursor: 'pointer'}}
            >
              <option value="0">Gasto</option>
              <option value="1">Ingreso</option>
            </select>
          </div>

          {/* Botón en Verde Aqua */}
          <button type="submit" style={{ padding: '10px 20px', background: '#5fe3c0', color: '#131517', fontWeight: 'bold', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', marginTop: '5px' }}>
            Crear Categoría
          </button>

          {mensaje && <p style={{ fontSize: '13px', textAlign: 'center', margin: 0, color: mensaje.includes('Error') ? '#ff6b6b' : '#5fe3c0' }}>{mensaje}</p>}
        </form>
      </div>

      {/* Listado con opciones de Editar y Eliminar */}
      <div style={{ backgroundColor: '#1a1d21', padding: '20px', borderRadius: '12px', border: '1px solid #2d3139' }}>
        <h4 style={{ margin: '0 0 15px 0', fontSize: '15px', fontWeight: 'bold', color: '#fff' }}>Categorías Existentes ({categorias.length})</h4>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '250px', overflowY: 'auto' }}>
          {categorias.length === 0 ? (
            <p style={{ color: '#8b92a5', fontSize: '13px', margin: 0 }}>No hay categorías registradas.</p>
          ) : (
            categorias.map((cat, idx) => {
              const catId = cat.id || cat.Id;
              const isEditing = editingId === catId;

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
                      <select 
                        value={editTipo} 
                        onChange={(e) => setEditTipo(e.target.value)} 
                        style={{ ...inputStyle, padding: '6px 10px', width: '100px' }}
                      >
                        <option value="0">Gasto</option>
                        <option value="1">Ingreso</option>
                      </select>
                      <button onClick={() => handleUpdate(catId)} style={{ background: '#5fe3c0', border: 'none', padding: '6px 12px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', color: '#131517' }}>Guardar</button>
                      <button onClick={() => setEditingId(null)} style={{ background: 'transparent', border: '1px solid #2d3139', padding: '6px 10px', borderRadius: '6px', cursor: 'pointer', color: '#8b92a5' }}>Cancelar</button>
                    </div>
                  ) : (
                    <>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <span style={{ fontWeight: '500', color: '#fff', fontSize: '14px' }}>{cat.nombre || cat.Name}</span>
                        <span style={{ fontSize: '11px', padding: '2px 6px', borderRadius: '4px', backgroundColor: (cat.tipo === 1 || cat.Tipo === 1) ? '#5fe3c033' : '#ff6b6b33', color: (cat.tipo === 1 || cat.Tipo === 1) ? '#5fe3c0' : '#ff6b6b' }}>
                          {(cat.tipo === 1 || cat.Tipo === 1) ? 'Ingreso' : 'Gasto'}
                        </span>
                      </div>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button onClick={() => startEditing(cat)} style={{ background: 'transparent', border: '1px solid #4dabf7', color: '#4dabf7', padding: '4px 8px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px' }}>Editar</button>
                        <button onClick={() => handleDelete(catId)} style={{ background: 'transparent', border: '1px solid #ff6b6b', color: '#ff6b6b', padding: '4px 8px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px' }}>Eliminar</button>
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