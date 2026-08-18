import { useState, useEffect } from 'react';
import api from '../services/api';

export default function Accounts() {
  const [accounts, setAccounts] = useState([]);
  const [nombre, setNombre] = useState('');
  const [tipo, setTipo] = useState('Efectivo');
  const [balanceInicial, setBalanceInicial] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchAccounts = async () => {
    try {
      const res = await api.get('/Accounts');
      console.log("Cuentas recibidas:", res.data); 
      setAccounts(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error(err);
      setError('No se pudieron cargar las cuentas.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAccounts();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        nombre,
        tipo,
        balanceInicial: parseFloat(balanceInicial || 0)
      };

      if (editingId) {
        await api.put(`/Accounts/${editingId}`, payload);
        alert('¡Cuenta actualizada con éxito!');
      } else {
        await api.post('/Accounts', payload);
        alert('¡Cuenta creada con éxito!');
      }

      setNombre('');
      setTipo('Efectivo');
      setBalanceInicial('');
      setEditingId(null);
      fetchAccounts();
    } catch (err) {
      console.error(err);
      alert('Error al guardar la cuenta.');
    }
  };

  const handleEdit = (acc) => {
    setEditingId(acc.id || acc.Id);
    setNombre(acc.nombre || acc.Nombre || '');
    setTipo(acc.tipo || acc.Tipo || 'Efectivo');
    
    const currentBalance = acc.balanceActual ?? acc.BalanceActual ?? acc.balance ?? acc.Balance ?? acc.balanceInicial ?? acc.BalanceInicial ?? '';
    setBalanceInicial(currentBalance);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setNombre('');
    setTipo('Efectivo');
    setBalanceInicial('');
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Estás seguro de eliminar esta cuenta?')) return;
    try {
      await api.delete(`/Accounts/${id}`);
      fetchAccounts();
    } catch (err) {
      console.error(err);
      alert('No se pudo eliminar la cuenta.');
    }
  };

  const inputStyle = {
    padding: '10px 14px', borderRadius: '8px', 
    backgroundColor: '#131517', border: '1px solid #2d3139', 
    color: '#fff', outline: 'none', fontSize: '14px', width: '100%', boxSizing: 'border-box'
  };

  const cardStyle = { 
    backgroundColor: '#1a1d21', padding: '20px', borderRadius: '12px', 
    border: '1px solid #2d3139', display: 'flex', flexDirection: 'column', 
    justifyContent: 'space-between', position: 'relative' 
  };

  if (loading) return <div style={{ color: '#8b92a5', fontSize: '15px' }}>Cargando cuentas...</div>;
  if (error) return <div style={{ color: '#ff6b6b', fontSize: '15px' }}>{error}</div>;

  return (
    <div style={{ width: '100%', boxSizing: 'border-box', fontFamily: '"Inter", sans-serif' }}>
      
      {/* ENCABEZADO */}
      <h2 style={{ fontSize: '26px', fontWeight: 'bold', margin: '0 0 20px 0', color: '#fff', letterSpacing: '-0.5px' }}>
        Mis Cuentas
      </h2>

      {/* FORMULARIO DE CREACIÓN / EDICIÓN */}
      <div style={{ backgroundColor: '#1a1d21', padding: '20px', borderRadius: '12px', border: '1px solid #2d3139', marginBottom: '25px' }}>
        <h3 style={{ margin: '0 0 15px 0', fontSize: '16px', fontWeight: 'bold', color: '#fff', textAlign: 'center' }}>
          {editingId ? 'Editar Cuenta' : 'Añadir Nueva Cuenta'}
        </h3>
        
        <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr auto', gap: '12px', alignItems: 'flex-end', flexWrap: 'wrap' }}>
          <div>
            <label style={{ display: 'block', color: '#8b92a5', fontSize: '13px', marginBottom: '6px' }}>Nombre de la Cuenta</label>
            <input 
              type="text" 
              required 
              placeholder="Ej. Banreservas, Mi Tarjeta..." 
              value={nombre} 
              onChange={(e) => setNombre(e.target.value)} 
              style={inputStyle} 
            />
          </div>

          <div>
            <label style={{ display: 'block', color: '#8b92a5', fontSize: '13px', marginBottom: '6px' }}>Tipo</label>
            <select value={tipo} onChange={(e) => setTipo(e.target.value)} style={inputStyle}>
              <option value="Efectivo">Efectivo</option>
              <option value="Cuenta de Ahorros">Cuenta de Ahorros</option>
              <option value="Cuenta Corriente">Cuenta Corriente</option>
              <option value="Tarjeta de Crédito">Tarjeta de Crédito</option>
            </select>
          </div>

          <div>
            <label style={{ display: 'block', color: '#8b92a5', fontSize: '13px', marginBottom: '6px' }}>Balance {editingId ? 'Actual' : 'Inicial'} ($)</label>
            <input 
              type="number" 
              step="0.01" 
              required 
              placeholder="0.00" 
              value={balanceInicial} 
              onChange={(e) => setBalanceInicial(e.target.value)} 
              style={inputStyle} 
            />
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button type="submit" style={{ backgroundColor: '#5fe3c0', color: '#131517', padding: '10px 20px', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', fontSize: '14px', height: '41px' }}>
              {editingId ? 'Actualizar' : 'Guardar'}
            </button>
            {editingId && (
              <button type="button" onClick={handleCancelEdit} style={{ backgroundColor: '#2d3139', color: '#fff', padding: '10px 15px', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', height: '41px' }}>
                Cancelar
              </button>
            )}
          </div>
        </form>
      </div>

      {/* LISTADO DE CUENTAS */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '15px' }}>
        {accounts.length === 0 ? (
          <p style={{ color: '#8b92a5', fontSize: '14px' }}>No hay cuentas registradas.</p>
        ) : (
          accounts.map((acc) => {
            const accId = acc.id || acc.Id;
            const accNombre = acc.nombre || acc.Nombre;
            const accTipo = acc.tipo || acc.Tipo;
            
            // Verificamos todas las posibles propiedades de balance que pueda enviar la API
            const accBalance = acc.balanceActual ?? acc.BalanceActual ?? acc.balance ?? acc.Balance ?? acc.balanceInicial ?? acc.BalanceInicial ?? 0;

            return (
              <div key={accId} style={cardStyle}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                    <span style={{ fontSize: '11px', fontWeight: 'bold', color: '#5fe3c0', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      {accTipo}
                    </span>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button onClick={() => handleEdit(acc)} style={{ background: 'transparent', border: '1px solid #2d3139', color: '#4dabf7', padding: '3px 8px', borderRadius: '4px', cursor: 'pointer', fontSize: '11px' }}>
                        ✏️ Editar
                      </button>
                      <button onClick={() => handleDelete(accId)} style={{ background: 'transparent', border: '1px solid #2d3139', color: '#ff6b6b', padding: '3px 8px', borderRadius: '4px', cursor: 'pointer', fontSize: '11px' }}>
                        🗑️
                      </button>
                    </div>
                  </div>
                  <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: '#fff', margin: '0 0 15px 0' }}>
                    {accNombre}
                  </h3>
                </div>

                <div style={{ borderTop: '1px solid #2d3139', paddingTop: '12px' }}>
                  <p style={{ margin: '0 0 4px 0', fontSize: '12px', color: '#8b92a5' }}>Balance Actual</p>
                  <h4 style={{ margin: 0, fontSize: '20px', fontWeight: 'bold', color: '#5fe3c0' }}>
                    ${parseFloat(accBalance).toFixed(2)}
                  </h4>
                </div>
              </div>
            );
          })
        )}
      </div>

    </div>
  );
}