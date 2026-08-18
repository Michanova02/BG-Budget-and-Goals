import { useEffect, useState, useCallback } from 'react';
import api from '../services/api';

function Transactions() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tipoFiltro, setTipoFiltro] = useState('todos'); 
  const [busqueda, setBusqueda] = useState('');

  const fetchTransactions = useCallback(async () => {
    try {
      setLoading(true);
      const [expensesRes, incomesRes] = await Promise.all([
        api.get('/Expenses').catch(() => ({ data: [] })),
        api.get('/Incomes').catch(() => ({ data: [] }))
      ]);

      const expenses = (Array.isArray(expensesRes.data) ? expensesRes.data : []).map(item => ({
        ...item,
        tipo: 'Gasto'
      }));

      const incomes = (Array.isArray(incomesRes.data) ? incomesRes.data : []).map(item => ({
        ...item,
        tipo: 'Ingreso'
      }));

      const combined = [...expenses, ...incomes].sort((a, b) => 
        new Date(b.fecha || b.date) - new Date(a.fecha || a.date)
      );

      setTransactions(combined);
    } catch (error) {
      console.error("Error cargando transacciones:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  const filteredTransactions = transactions.filter(tx => {
    const matchesTipo = tipoFiltro === 'todos' || tx.tipo.toLowerCase() === tipoFiltro.toLowerCase();
    const descripcion = tx.descripcion || tx.description || '';
    const matchesBusqueda = descripcion.toLowerCase().includes(busqueda.toLowerCase());
    return matchesTipo && matchesBusqueda;
  });

  const inputStyle = {
    padding: '12px 15px', borderRadius: '8px', 
    backgroundColor: '#131517', border: '1px solid #2d3139', 
    color: '#fff', outline: 'none', fontSize: '14px', boxSizing: 'border-box'
  };

  if (loading) return <div style={{ color: '#8b92a5' }}>Cargando historial de transacciones...</div>;

  return (
    <div style={{ width: '100%', boxSizing: 'border-box' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <h2 style={{ fontSize: '28px', fontWeight: '600', margin: 0, color: '#fff' }}>Historial de Transacciones</h2>
      </header>

      {/* Barra de Filtros a Pantalla Completa */}
      <div style={{ backgroundColor: '#1a1d21', padding: '20px', borderRadius: '16px', border: '1px solid #2d3139', marginBottom: '25px', display: 'flex', gap: '15px', flexWrap: 'wrap', width: '100%', boxSizing: 'border-box' }}>
        <input 
          type="text" 
          placeholder="Buscar por descripción..." 
          value={busqueda} 
          onChange={(e) => setBusqueda(e.target.value)} 
          style={{ ...inputStyle, flex: 2, minWidth: '250px' }} 
        />
        <select 
          value={tipoFiltro} 
          onChange={(e) => setTipoFiltro(e.target.value)} 
          style={{ ...inputStyle, flex: 1, minWidth: '180px', cursor: 'pointer' }}
        >
          <option value="todos">Todos los tipos</option>
          <option value="gasto">Solo Gastos</option>
          <option value="ingreso">Solo Ingresos</option>
        </select>
      </div>

      {/* Tabla de Transacciones a Pantalla Completa */}
      <div style={{ backgroundColor: '#1a1d21', borderRadius: '16px', border: '1px solid #2d3139', overflow: 'hidden', width: '100%', boxSizing: 'border-box' }}>
        {filteredTransactions.length === 0 ? (
          <p style={{ color: '#8b92a5', textAlign: 'center', padding: '40px', margin: 0 }}>No se encontraron transacciones registradas.</p>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #2d3139', color: '#8b92a5', fontSize: '13px' }}>
                <th style={{ padding: '15px 20px' }}>Fecha</th>
                <th style={{ padding: '15px 20px' }}>Tipo</th>
                <th style={{ padding: '15px 20px' }}>Descripción</th>
                <th style={{ padding: '15px 20px', textAlign: 'right' }}>Monto</th>
              </tr>
            </thead>
            <tbody>
              {filteredTransactions.map((tx, index) => {
                const isIncome = tx.tipo === 'Ingreso';
                const fechaStr = tx.fecha || tx.date ? new Date(tx.fecha || tx.date).toLocaleDateString() : 'N/A';
                return (
                  <tr key={index} style={{ borderBottom: '1px solid #2d3139', fontSize: '14px' }}>
                    <td style={{ padding: '15px 20px', color: '#8b92a5' }}>{fechaStr}</td>
                    <td style={{ padding: '15px 20px' }}>
                      <span style={{ 
                        padding: '4px 10px', borderRadius: '6px', fontSize: '12px', fontWeight: '500',
                        backgroundColor: isIncome ? 'rgba(95, 227, 192, 0.1)' : 'rgba(255, 107, 107, 0.1)',
                        color: isIncome ? '#5fe3c0' : '#ff6b6b'
                      }}>
                        {tx.tipo}
                      </span>
                    </td>
                    <td style={{ padding: '15px 20px', fontWeight: '500', color: '#fff' }}>{tx.descripcion || tx.description || 'Sin descripción'}</td>
                    <td style={{ padding: '15px 20px', textAlign: 'right', fontWeight: 'bold', color: isIncome ? '#5fe3c0' : '#ff6b6b' }}>
                      {isIncome ? `+$${tx.monto?.toFixed(2) || '0.00'}` : `-$${Math.abs(tx.monto || 0).toFixed(2)}`}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default Transactions;