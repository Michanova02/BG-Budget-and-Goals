import { useEffect, useState } from 'react';

export default function BudgetAlert({ budgets }) {
  const [alertas, setAlertas] = useState([]);

  useEffect(() => {
    const nuevasAlertas = budgets.filter(b => {
      const gasto = parseFloat(b.gastoActual || 0);
      const limite = parseFloat(b.monto || 1);
      return gasto >= limite * 0.8; // Avisar si supera el 80%
    });
    setAlertas(nuevasAlertas);
  }, [budgets]);

  if (alertas.length === 0) return null;

  return (
    <div style={{ marginBottom: '20px' }}>
      {alertas.map((alerta, idx) => {
        const esExcedido = parseFloat(alerta.gastoActual) >= parseFloat(alerta.monto);
        return (
          <div key={idx} style={{ 
            padding: '12px 20px', 
            borderRadius: '8px', 
            marginBottom: '10px',
            backgroundColor: esExcedido ? '#ff6b6b22' : '#ff9f4322',
            border: `1px solid ${esExcedido ? '#ff6b6b' : '#ff9f43'}`,
            color: esExcedido ? '#ff6b6b' : '#ff9f43',
            fontSize: '14px',
            fontWeight: 'bold'
          }}>
            ⚠️ {esExcedido ? '¡Límite excedido!' : '¡Estás cerca del límite!'} 
            La categoría "{alerta.categoriaNombre}" ha consumido {((alerta.gastoActual / alerta.monto) * 100).toFixed(0)}% de su presupuesto.
          </div>
        );
      })}
    </div>
  );
}