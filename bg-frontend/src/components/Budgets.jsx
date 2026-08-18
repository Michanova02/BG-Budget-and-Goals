import { useEffect, useState, useCallback } from 'react';
import api from '../services/api';

function Budgets() {
  const [presupuestos, setPresupuestos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [categoriaId, setCategoriaId] = useState('');
  const [monto, setMonto] = useState('');
  const [mes, setMes] = useState(new Date().getMonth() + 1);
  const [anio, setAnio] = useState(new Date().getFullYear());
  
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [editingId, setEditingId] = useState(null); // Almacena el ID si estamos editando

  const fetchData = useCallback(async () => {
    try {
      const [budgetsRes, catsRes] = await Promise.all([
        api.get(`/Budgets?mes=${mes}&anio=${anio}`),
        api.get('/Categories')
      ]);
      setPresupuestos(Array.isArray(budgetsRes.data) ? budgetsRes.data : []);
      setCategorias(Array.isArray(catsRes.data) ? catsRes.data : []);
    } catch (error) {
      console.error("Error cargando datos:", error);
    }
  }, [mes, anio]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const payload = {
        categoriaId: parseInt(categoriaId),
        monto: parseFloat(monto),
        mes: parseInt(mes),
        anio: parseInt(anio)
      };

      if (editingId) {
        // Editar presupuesto existente (PUT)
        await api.put(`/Budgets/${editingId}`, payload);
        setMessage('¡Presupuesto actualizado con éxito!');
      } else {
        // Crear nuevo presupuesto (POST)
        await api.post('/Budgets', payload);
        setMessage('¡Presupuesto definido con éxito!');
      }

      // Limpiar formulario y recargar datos
      setMonto('');
      setCategoriaId('');
      setEditingId(null);
      fetchData(); 
    } catch (err) {
      const errorMsg = err.response?.data || 'Error al procesar la solicitud.';
      setMessage(typeof errorMsg === 'string' ? errorMsg : 'Error al procesar la solicitud.');
    } finally {
      setLoading(false);
    }
  };

  // Cargar datos en el formulario para editar
  const handleEdit = (budget) => {
    setEditingId(budget.id || budget.Id);
    setMonto(budget.monto || budget.Monto);
    setCategoriaId(budget.categoriaId || budget.CategoriaId);
  };

  // Cancelar edición
  const handleCancel = () => {
    setEditingId(null);
    setMonto('');
    setCategoriaId('');
    setMessage('');
  };

  // Eliminar presupuesto (DELETE)
  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de eliminar este presupuesto?')) {
      try {
        await api.delete(`/Budgets/${id}`);
        setMessage('Presupuesto eliminado con éxito.');
        fetchData();
      } catch (err) {
        console.error("Error al eliminar presupuesto:", err);
        setMessage('Error al eliminar el presupuesto.');
      }
    }
  };

  const inputStyle = {
    padding: '12px 15px', width: '100%', borderRadius: '8px', 
    backgroundColor: '#131517', border: '1px solid #2d3139', 
    color: '#fff', boxSizing: 'border-box', outline: 'none', fontSize: '14px'
  };

  return (
    <div style={{ width: '100%', boxSizing: 'border-box' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <h2 style={{ fontSize: '28px', fontWeight: '600', margin: 0 }}>Planificación Mensual</h2>
        <div style={{ display: 'flex', gap: '10px' }}>
          <select value={mes} onChange={(e) => setMes(e.target.value)} style={inputStyle}>
            {Array.from({ length: 12 }, (_, i) => (
              <option key={i + 1} value={i + 1}>Mes {i + 1}</option>
            ))}
          </select>
          <input type="number" value={anio} onChange={(e) => setAnio(e.target.value)} style={{ ...inputStyle, width: '100px' }} />
        </div>
      </header>

      {/* FORMULARIO */}
      <div style={{ backgroundColor: '#1a1d21', padding: '30px', borderRadius: '16px', border: '1px solid #2d3139', marginBottom: '30px', width: '100%', boxSizing: 'border-box' }}>
        <h3 style={{ margin: '0 0 20px 0', fontWeight: '500', color: '#fff' }}>
          {editingId ? 'Editar Presupuesto' : 'Nuevo Presupuesto'}
        </h3>
        
        <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '15px', alignItems: 'flex-end', flexWrap: 'wrap' }}>
          <div style={{ flex: 2, minWidth: '200px' }}>
            <label style={{ color: '#8b92a5', fontSize: '14px', display: 'block', marginBottom: '8px' }}>Categoría</label>
            <select required value={categoriaId} onChange={(e) => setCategoriaId(e.target.value)} style={{...inputStyle, cursor: 'pointer'}}>
              <option value="" disabled>Selecciona...</option>
              {categorias.map(cat => (
                <option key={cat.id || cat.Id} value={cat.id || cat.Id}>{cat.nombre || cat.name}</option>
              ))}
            </select>
          </div>
          
          <div style={{ flex: 1, minWidth: '150px' }}>
            <label style={{ color: '#8b92a5', fontSize: '14px', display: 'block', marginBottom: '8px' }}>Límite ($)</label>
            <input type="number" step="0.01" required value={monto} onChange={(e) => setMonto(e.target.value)} placeholder="0.00" style={inputStyle} />
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button type="submit" disabled={loading} style={{ backgroundColor: '#5fe3c0', color: '#131517', padding: '12px 20px', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', height: '45px' }}>
              {editingId ? 'Actualizar' : 'Guardar'}
            </button>
            {editingId && (
              <button type="button" onClick={handleCancel} style={{ backgroundColor: '#2d3139', color: '#fff', padding: '12px 16px', border: 'none', borderRadius: '8px', cursor: 'pointer', height: '45px' }}>
                Cancelar
              </button>
            )}
          </div>
        </form>
        {message && <p style={{ color: message.includes('Error') || message.includes('Ya existe') ? '#ff6b6b' : '#5fe3c0', fontSize: '14px', marginTop: '15px' }}>{message}</p>}
      </div>

      {/* LISTADO DE ALERTAS Y ACCIONES */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', width: '100%' }}>
        {presupuestos.length === 0 ? (
          <p style={{ color: '#8b92a5', textAlign: 'center', marginTop: '20px' }}>No hay presupuestos definidos para esta fecha.</p>
        ) : (
          presupuestos.map((p, index) => {
            const gastoActual = parseFloat(p.gastoActual || 0);
            const limite = parseFloat(p.monto || 1);
            
            const porcentajeBruto = (gastoActual / limite) * 100;
            const porcentajeVisual = Math.min(porcentajeBruto, 100).toFixed(0); 
            
            let colorBarra = '#5fe3c0'; 
            let mensajeAlerta = "Presupuesto saludable";

            if (porcentajeBruto >= 100) {
              colorBarra = '#ff6b6b'; 
              mensajeAlerta = "¡Límite excedido!";
            } else if (porcentajeBruto >= 80) {
              colorBarra = '#ff9f43'; 
              mensajeAlerta = "Cerca del límite (80%+)";
            } else if (porcentajeBruto >= 50) {
              colorBarra = '#feca57'; 
              mensajeAlerta = "Más de la mitad consumido (50%+)";
            }

            const budgetId = p.id || p.Id;

            return (
              <div key={index} style={{ backgroundColor: '#1a1d21', padding: '20px', borderRadius: '12px', border: '1px solid #2d3139', width: '100%', boxSizing: 'border-box' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', alignItems: 'center' }}>
                  <span style={{ fontWeight: 'bold', fontSize: '16px', color: '#fff' }}>{p.categoriaNombre || 'Categoría'}</span>
                  <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                    <span style={{ color: '#8b92a5', fontSize: '14px' }}>
                      Gastado: <strong style={{ color: '#fff' }}>${gastoActual.toFixed(2)}</strong> de ${limite.toFixed(2)}
                    </span>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button onClick={() => handleEdit(p)} style={{ backgroundColor: '#f39c12', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: '500' }}>
                        Editar
                      </button>
                      <button onClick={() => handleDelete(budgetId)} style={{ backgroundColor: '#e74c3c', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: '500' }}>
                        Eliminar
                      </button>
                    </div>
                  </div>
                </div>
                
                <div style={{ width: '100%', height: '12px', backgroundColor: '#131517', borderRadius: '6px', overflow: 'hidden', border: '1px solid #2d3139' }}>
                  <div style={{ width: `${porcentajeVisual}%`, height: '100%', backgroundColor: colorBarra, transition: 'width 0.5s ease-in-out' }}></div>
                </div>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px', fontSize: '12px', color: colorBarra, fontWeight: '500' }}>
                  <span>{mensajeAlerta}</span>
                  <span>{porcentajeBruto.toFixed(1)}%</span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

export default Budgets;