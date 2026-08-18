import { useState } from 'react';
import api from '../services/api';

function TransactionForm({ onTransactionAdded }) {
  const [type, setType] = useState('ingreso'); // 'ingreso' o 'gasto'
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      // Preparamos el objeto que enviaremos a tu API de ASP.NET Core
      const payload = {
        monto: parseFloat(amount),
        descripcion: description,
        fecha: new Date().toISOString(),
        // categoriaId: 1 // Descomenta esto si tu API exige un ID de categoría por defecto
      };

      // Decidimos a qué endpoint pegarle según el tipo seleccionado
      const endpoint = type === 'ingreso' ? '/Income' : '/Expense';
      
      await api.post(endpoint, payload);
      
      setMessage(`¡${type === 'ingreso' ? 'Ingreso' : 'Gasto'} registrado con éxito!`);
      setAmount('');
      setDescription('');
      
      // Llamamos a esta función para que el Dashboard se actualice automáticamente
      if (onTransactionAdded) onTransactionAdded();

    } catch (err) {
      console.error(err);
      setMessage('Error al registrar la transacción. Verifica los datos.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ background: '#f8f9fa', padding: '20px', borderRadius: '8px', marginTop: '30px', border: '1px solid #ddd' }}>
      <h3>Registrar Nueva Transacción</h3>
      
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        
        {/* Selector de Tipo */}
        <div>
          <label style={{ fontWeight: 'bold', marginRight: '10px' }}>Tipo:</label>
          <select 
            value={type} 
            onChange={(e) => setType(e.target.value)}
            style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
          >
            <option value="ingreso">Ingreso (+)</option>
            <option value="gasto">Gasto (-)</option>
          </select>
        </div>

        {/* Monto */}
        <div>
          <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>Monto:</label>
          <input 
            type="number" 
            step="0.01"
            required 
            value={amount} 
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Ej. 1500.50"
            style={{ padding: '8px', width: '100%', borderRadius: '4px', border: '1px solid #ccc', boxSizing: 'border-box' }}
          />
        </div>

        {/* Descripción */}
        <div>
          <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>Descripción:</label>
          <input 
            type="text" 
            required 
            value={description} 
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Ej. Pago de quincena / Compra supermercado"
            style={{ padding: '8px', width: '100%', borderRadius: '4px', border: '1px solid #ccc', boxSizing: 'border-box' }}
          />
        </div>

        {/* Botón de Envío */}
        <button 
          type="submit" 
          disabled={loading}
          style={{ 
            background: type === 'ingreso' ? '#52c41a' : '#ff4d4f', 
            color: 'white', 
            padding: '10px', 
            border: 'none', 
            borderRadius: '4px', 
            fontWeight: 'bold', 
            cursor: 'pointer' 
          }}
        >
          {loading ? 'Guardando...' : `Registrar ${type === 'ingreso' ? 'Ingreso' : 'Gasto'}`}
        </button>

        {/* Mensaje de éxito o error */}
        {message && <p style={{ color: message.includes('Error') ? 'red' : 'green', fontWeight: 'bold' }}>{message}</p>}
      </form>
    </div>
  );
}

export default TransactionForm;