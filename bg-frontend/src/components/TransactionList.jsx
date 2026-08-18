import { useState, useEffect } from 'react';
import api from '../services/api';

function TransactionList({ refreshTrigger }) {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecentTransactions = async () => {
      try {
        setLoading(true);
        // Obtenemos gastos e ingresos en paralelo de forma segura
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

        // Combinamos, ordenamos por fecha reciente y tomamos solo las últimas 5 o 6
        const combined = [...expenses, ...incomes]
          .sort((a, b) => new Date(b.fecha || b.date) - new Date(a.fecha || a.date))
          .slice(0, 5);

        setTransactions(combined);
      } catch (error) {
        console.error("Error al cargar transacciones recientes:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRecentTransactions();
  }, [refreshTrigger]);

  if (loading) return <div style={{ color: '#8b92a5', fontSize: '14px' }}>Cargando transacciones recientes...</div>;

  return (
    <div style={{ backgroundColor: '#1a1d21', padding: '25px', borderRadius: '16px', border: '1px solid #2d3139' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h3 style={{ color: '#fff', margin: 0, fontSize: '18px', fontWeight: '500' }}>Transacciones Recientes</h3>
      </div>

      {transactions.length === 0 ? (
        <p style={{ color: '#8b92a5', fontSize: '14px', margin: 0 }}>No hay transacciones registradas aún.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          {transactions.map((tx, index) => {
            const isIncome = tx.tipo === 'Ingreso';
            const fechaStr = tx.fecha || tx.date ? new Date(tx.fecha || tx.date).toLocaleDateString() : 'N/A';
            
            return (
              <div key={index} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: index < transactions.length - 1 ? '1px solid #2d3139' : 'none', paddingBottom: index < transactions.length - 1 ? '12px' : '0' }}>
                <div>
                  <p style={{ color: '#fff', margin: '0 0 4px 0', fontSize: '14px', fontWeight: '500' }}>{tx.descripcion || tx.description || 'Sin descripción'}</p>
                  <span style={{ color: '#8b92a5', fontSize: '12px' }}>{fechaStr} • {tx.tipo}</span>
                </div>
                <span style={{ fontWeight: 'bold', fontSize: '15px', color: isIncome ? '#5fe3c0' : '#ff6b6b' }}>
                  {isIncome ? `+$${tx.monto?.toFixed(2) || '0.00'}` : `-$${Math.abs(tx.monto || 0).toFixed(2)}`}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default TransactionList;