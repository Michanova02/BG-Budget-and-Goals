import { useState, useEffect } from 'react';
import api from '../services/api';

function Goals() {
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [nombre, setNombre] = useState('');
  const [montoMeta, setMontoMeta] = useState('');
  const [fechaLimite, setFechaLimite] = useState('');
  
  // Estado para saber si estamos editando
  const [editingId, setEditingId] = useState(null);
  
  // Estado para el modal o abono rápido
  const [aporteMonto, setAporteMonto] = useState({});

  const fetchGoals = async () => {
    try {
      setLoading(true);
      const res = await api.get('/Goals');
      setGoals(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Error al cargar metas:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGoals();
  }, []);

  // Función unificada para CREAR o EDITAR
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        // Encontramos la meta original para enviar todos sus campos intactos a la API en C#
        const metaOriginal = goals.find(g => g.id === editingId) || {};
        
        // Armamos el payload combinando la data original y los nuevos cambios
        const payload = {
          ...metaOriginal, 
          id: editingId, 
          nombre: nombre,
          montoMeta: parseFloat(montoMeta),
          fechaLimite: fechaLimite
        };

        await api.put(`/Goals/${editingId}`, payload);
        alert('¡Meta actualizada con éxito!');
      } else {
        await api.post('/Goals', {
          nombre,
          montoMeta: parseFloat(montoMeta),
          fechaLimite
        });
        alert('¡Meta creada con éxito!');
      }
      
      handleCancelEdit(); // Limpiamos el formulario
      fetchGoals();
    } catch (err) {
      console.error("Error al guardar meta:", err.response?.data || err);
      // Mostramos el error exacto que envía C# para identificar problemas
      const errorMsg = err.response?.data?.title || err.response?.data?.message || JSON.stringify(err.response?.data) || 'Revisa la consola';
      alert(`Hubo un error al guardar: ${errorMsg}`);
    }
  };

  // Preparar el formulario para editar
  const handleEdit = (goal) => {
    setEditingId(goal.id);
    setNombre(goal.nombre || '');
    setMontoMeta(goal.montoMeta || '');
    // Formatear la fecha para que el input type="date" la acepte (YYYY-MM-DD)
    if (goal.fechaLimite) {
      setFechaLimite(goal.fechaLimite.substring(0, 10));
    } else {
      setFechaLimite('');
    }
  };

  // Cancelar la edición y limpiar form
  const handleCancelEdit = () => {
    setEditingId(null);
    setNombre('');
    setMontoMeta('');
    setFechaLimite('');
  };

  // Eliminar la meta
  const handleDelete = async (id) => {
    if (!window.confirm('¿Estás seguro de eliminar esta meta?')) return;
    try {
      await api.delete(`/Goals/${id}`);
      fetchGoals();
    } catch (err) {
      console.error("Error al eliminar meta:", err.response?.data || err);
      const errorMsg = err.response?.data?.title || err.response?.data?.message || 'Conflicto en el servidor';
      alert(`No se pudo eliminar la meta. Detalle: ${errorMsg}`);
    }
  };

  // Abono respetando tu endpoint original (/contribute)
  const handleAbonar = async (goalId) => {
    const monto = aporteMonto[goalId];
    if (!monto || monto <= 0) return;
    try {
      await api.post(`/Goals/${goalId}/contribute`, { monto: parseFloat(monto) });
      setAporteMonto({ ...aporteMonto, [goalId]: '' }); // Limpia el input específico
      fetchGoals();
    } catch (err) {
      console.error("Error al abonar a la meta:", err);
      alert('Error al procesar el abono.');
    }
  };

  const inputStyle = {
    padding: '12px 15px', borderRadius: '8px', 
    backgroundColor: '#131517', border: '1px solid #2d3139', 
    color: '#fff', outline: 'none', fontSize: '14px', width: '100%', boxSizing: 'border-box'
  };

  if (loading) return <div style={{ color: '#8b92a5' }}>Cargando metas...</div>;

  return (
    <div style={{ width: '100%' }}>
      <h2 style={{ fontSize: '28px', fontWeight: '600', marginBottom: '30px' }}>Metas de Ahorro</h2>

      {/* Formulario de Creación / Edición */}
      <div style={{ backgroundColor: '#1a1d21', padding: '25px', borderRadius: '16px', border: '1px solid #2d3139', marginBottom: '30px' }}>
        <h3 style={{ color: '#fff', fontSize: '18px', marginBottom: '20px', fontWeight: '500', textAlign: 'center' }}>
          {editingId ? 'Editar Meta' : 'Crear Nueva Meta'}
        </h3>
        <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '15px', alignItems: 'flex-end', flexWrap: 'wrap' }}>
          <div style={{ flex: 2, minWidth: '220px' }}>
            <label style={{ color: '#8b92a5', fontSize: '13px', display: 'block', marginBottom: '6px' }}>Nombre de la Meta</label>
            <input type="text" required placeholder="Ej. Viaje, Computadora..." value={nombre} onChange={(e) => setNombre(e.target.value)} style={inputStyle} />
          </div>

          <div style={{ flex: 1, minWidth: '150px' }}>
            <label style={{ color: '#8b92a5', fontSize: '13px', display: 'block', marginBottom: '6px' }}>Monto Objetivo ($)</label>
            <input type="number" step="0.01" min="0.01" onKeyDown={(e) => ["e", "E", "+", "-"].includes(e.key) && e.preventDefault()} required placeholder="0.00" value={montoMeta} onChange={(e) => setMontoMeta(e.target.value)} style={inputStyle} />
          </div>

          <div style={{ flex: 1, minWidth: '160px' }}>
            <label style={{ color: '#8b92a5', fontSize: '13px', display: 'block', marginBottom: '6px' }}>Fecha Límite</label>
            <input type="date" required value={fechaLimite} onChange={(e) => setFechaLimite(e.target.value)} onKeyDown={(e) => e.preventDefault()} style={{ ...inputStyle, cursor: 'pointer' }} />
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button type="submit" style={{ backgroundColor: '#5fe3c0', color: '#131517', padding: '12px 24px', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', height: '45px' }}>
              {editingId ? 'Actualizar Meta' : 'Crear Meta'}
            </button>
            {editingId && (
              <button type="button" onClick={handleCancelEdit} style={{ backgroundColor: '#2d3139', color: '#fff', padding: '12px 15px', border: 'none', borderRadius: '8px', cursor: 'pointer', height: '45px' }}>
                Cancelar
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Listado de Metas en Grid adaptativo */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px', width: '100%' }}>
        {goals.length === 0 ? (
          <p style={{ color: '#8b92a5', gridColumn: '1 / -1' }}>No tienes metas registradas.</p>
        ) : (
          goals.map(goal => {
            const porcentaje = goal.montoMeta > 0 ? Math.min(100, Math.round((goal.montoActual / goal.montoMeta) * 100)) : 0;
            const isCompleted = goal.montoActual >= goal.montoMeta;

            return (
              <div key={goal.id} style={{ backgroundColor: '#1a1d21', padding: '25px', borderRadius: '16px', border: '1px solid #2d3139', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                    <h3 style={{ margin: 0, fontSize: '20px', fontWeight: '600', color: '#fff' }}>{goal.nombre}</h3>
                    
                    {/* Botones de Editar y Eliminar incorporados */}
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button onClick={() => handleEdit(goal)} style={{ background: 'transparent', border: 'none', color: '#4dabf7', cursor: 'pointer', fontSize: '14px', padding: '0 4px' }} title="Editar">
                        ✏️
                      </button>
                      <button onClick={() => handleDelete(goal.id)} style={{ background: 'transparent', border: 'none', color: '#ff6b6b', cursor: 'pointer', fontSize: '14px', padding: '0 4px' }} title="Eliminar">
                        🗑️
                      </button>
                    </div>
                  </div>

                  <p style={{ color: '#8b92a5', fontSize: '13px', margin: '0 0 20px 0' }}>Fecha límite: {new Date(goal.fechaLimite).toLocaleDateString()}</p>
                  
                  {/* Etiqueta de Porcentaje separada */}
                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '5px' }}>
                    <span style={{ fontSize: '14px', fontWeight: 'bold', color: isCompleted ? '#4dabf7' : '#5fe3c0' }}>{porcentaje}%</span>
                  </div>

                  {/* Barra de Progreso */}
                  <div style={{ width: '100%', height: '8px', backgroundColor: '#131517', borderRadius: '4px', overflow: 'hidden', marginBottom: '15px' }}>
                    <div style={{ width: `${porcentaje}%`, height: '100%', backgroundColor: isCompleted ? '#4dabf7' : '#5fe3c0', transition: 'width 0.4s ease' }}></div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', marginBottom: '20px' }}>
                    <span style={{ color: '#8b92a5' }}>Progreso: <strong style={{ color: '#fff' }}>${goal.montoActual.toLocaleString()}</strong></span>
                    <span style={{ color: '#8b92a5' }}>Meta: <strong style={{ color: '#fff' }}>${goal.montoMeta.toLocaleString()}</strong></span>
                  </div>
                </div>

                {/* Formulario de Abono Rápido (Se oculta si ya se completó) */}
                {!isCompleted ? (
                  <div style={{ display: 'flex', gap: '10px', paddingTop: '15px', borderTop: '1px solid #2d3139' }}>
                    <input 
                      type="number" 
                      step="0.01" 
                      min="0.01"
                      placeholder="Monto a abonar" 
                      value={aporteMonto[goal.id] || ''} 
                      onChange={(e) => setAporteMonto({ ...aporteMonto, [goal.id]: e.target.value })}
                      onKeyDown={(e) => ["e", "E", "+", "-"].includes(e.key) && e.preventDefault()}
                      style={{ ...inputStyle, padding: '8px 12px', fontSize: '13px', flex: 1 }} 
                    />
                    <button onClick={() => handleAbonar(goal.id)} style={{ backgroundColor: '#3498db', color: '#fff', border: 'none', borderRadius: '8px', padding: '8px 15px', fontWeight: 'bold', cursor: 'pointer', fontSize: '13px', whiteSpace: 'nowrap' }}>
                      Abonar
                    </button>
                  </div>
                ) : (
                  <div style={{ textAlign: 'center', padding: '10px', backgroundColor: '#4dabf722', borderRadius: '8px', color: '#4dabf7', fontSize: '14px', fontWeight: 'bold', borderTop: '1px solid #2d3139', marginTop: '10px' }}>
                    🎉 ¡Meta Alcanzada!
                  </div>
                )}

              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

export default Goals;