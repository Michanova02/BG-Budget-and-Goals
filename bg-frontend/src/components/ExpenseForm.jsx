import { useState, useEffect } from 'react';
import api from '../services/api';

function ExpenseForm({ onExpenseAdded }) {
  const [descripcion, setDescripcion] = useState('');
  const [monto, setMonto] = useState('');
  const [fecha, setFecha] = useState(new Date().toISOString().split('T')[0]);
  const [categoriaId, setCategoriaId] = useState('');
  const [metodoPagoId, setMetodoPagoId] = useState('');
  const [accountId, setAccountId] = useState('');
  
  const [categorias, setCategorias] = useState([]);
  const [metodosPago, setMetodosPago] = useState([]);
  const [cuentas, setCuentas] = useState([]);
  
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const fetchSelectOptions = async () => {
    try {
      const [catsResponse, methodsResponse, accountsResponse] = await Promise.all([
        api.get('/Categories'),      
        api.get('/PaymentMethods'),
        api.get('/Accounts')
      ]);
      
      setCategorias(Array.isArray(catsResponse.data) ? catsResponse.data : []);
      setMetodosPago(Array.isArray(methodsResponse.data) ? methodsResponse.data : []);
      setCuentas(Array.isArray(accountsResponse.data) ? accountsResponse.data : []);
    } catch (error) {
      console.error("Error al cargar las opciones:", error);
    }
  };

  useEffect(() => {
    fetchSelectOptions();
  }, []);

  const selectedMethod = metodosPago.find(
    m => String(m.id || m.Id || m.metodoPagoId) === String(metodoPagoId)
  );
  
  const esTransferencia = selectedMethod && 
    (selectedMethod.nombre || selectedMethod.name || selectedMethod.Name || '')
      .toLowerCase()
      .includes('transferencia');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      if (esTransferencia && accountId) {
        const cuentaSeleccionada = cuentas.find(
          acc => String(acc.id || acc.Id) === String(accountId)
        );
        
        const balanceActual = cuentaSeleccionada ? (cuentaSeleccionada.balance ?? cuentaSeleccionada.Balance ?? 0) : 0;
        
        if (parseFloat(monto) > balanceActual) {
          setMessage('Error: Fondos insuficientes en la cuenta seleccionada.');
          setLoading(false);
          return;
        }
      }

      const payload = {
        descripcion: descripcion,
        monto: parseFloat(monto),
        fecha: new Date(fecha).toISOString(),
        categoryId: parseInt(categoriaId),      
        paymentMethodId: parseInt(metodoPagoId),
        accountId: esTransferencia && accountId ? parseInt(accountId) : null
      };

      await api.post('/Expenses', payload);
      setMessage('¡Gasto registrado con éxito!');
      setDescripcion(''); 
      setMonto('');
      setCategoriaId('');
      setMetodoPagoId('');
      setAccountId('');
      
      await fetchSelectOptions();
      if (onExpenseAdded) onExpenseAdded();
    } catch (err) {
      console.error(err);
      const errorMsg = err.response?.data || 'Error al guardar el gasto.';
      setMessage(typeof errorMsg === 'string' ? errorMsg : 'Error al guardar el gasto.');
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    padding: '12px 15px', width: '100%', borderRadius: '8px', 
    backgroundColor: '#131517', border: '1px solid #2d3139', 
    color: '#fff', boxSizing: 'border-box', outline: 'none',
    fontSize: '14px', appearance: 'none' 
  };

  const labelStyle = { color: '#8b92a5', display: 'block', marginBottom: '8px', fontSize: '14px' };

  return (
    <div style={{ backgroundColor: '#1a1d21', padding: '30px', borderRadius: '16px', border: '1px solid #2d3139' }}>
      <h3 style={{ color: '#fff', margin: '0 0 25px 0', fontSize: '20px', fontWeight: '500' }}>Registrar Gasto</h3>
      
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        
        <div style={{ display: 'flex', gap: '20px' }}>
          <div style={{ flex: 2 }}>
            <label style={labelStyle}>Descripción</label>
            <input type="text" required value={descripcion} onChange={(e) => setDescripcion(e.target.value)} placeholder="Ej. Amazon, Supermercado..." style={inputStyle} />
          </div>
          <div style={{ flex: 1 }}>
            <label style={labelStyle}>Monto ($)</label>
            <input type="number" step="0.01" required value={monto} onChange={(e) => setMonto(e.target.value)} placeholder="0.00" style={inputStyle} />
          </div>
        </div>

        <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: '180px' }}>
            <label style={labelStyle}>Fecha</label>
            <input type="date" required value={fecha} onChange={(e) => setFecha(e.target.value)} style={inputStyle} />
          </div>
          
          <div style={{ flex: 1, minWidth: '180px' }}>
            <label style={labelStyle}>Categoría</label>
            <select required value={categoriaId} onChange={(e) => setCategoriaId(e.target.value)} style={{...inputStyle, cursor: 'pointer'}}>
              <option value="" disabled>Selecciona una...</option>
              {categorias.map(cat => (
                <option key={cat.id || cat.Id || cat.categoriaId || Math.random()} value={cat.id || cat.Id || cat.categoriaId}>
                  {cat.nombre || cat.name || cat.Name || cat.descripcion || 'Opción sin nombre'}
                </option>
              ))}
            </select>
          </div>

          <div style={{ flex: 1, minWidth: '180px' }}>
            <label style={labelStyle}>Método de Pago</label>
            <select required value={metodoPagoId} onChange={(e) => setMetodoPagoId(e.target.value)} style={{...inputStyle, cursor: 'pointer'}}>
              <option value="" disabled>Selecciona uno...</option>
              {metodosPago.map(metodo => (
                <option key={metodo.id || metodo.Id || metodo.metodoPagoId || Math.random()} value={metodo.id || metodo.Id || metodo.metodoPagoId}>
                  {metodo.nombre || metodo.name || metodo.Name || metodo.descripcion || 'Opción sin nombre'}
                </option>
              ))}
            </select>
          </div>

          {esTransferencia && (
            <div style={{ flex: 1, minWidth: '180px' }}>
              <label style={labelStyle}>Cuenta de Origen</label>
              <select required value={accountId} onChange={(e) => setAccountId(e.target.value)} style={{...inputStyle, cursor: 'pointer'}}>
                <option value="" disabled>Selecciona una cuenta...</option>
                {cuentas.map(acc => (
                  <option key={acc.id || acc.Id} value={acc.id || acc.Id}>
                    {acc.nombre || acc.Nombre} (${acc.balance || acc.Balance})
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        <button type="submit" disabled={loading} style={{ backgroundColor: '#ff6b6b', color: '#fff', padding: '12px', border: 'none', borderRadius: '8px', fontWeight: 'bold', fontSize: '15px', cursor: 'pointer', marginTop: '10px' }}>
          {loading ? 'Procesando...' : 'Añadir Gasto'}
        </button>

        {message && <p style={{ color: message.includes('Error') ? '#ff6b6b' : '#5fe3c0', margin: 0, fontSize: '14px' }}>{message}</p>}
      </form>
    </div>
  );
}

export default ExpenseForm;