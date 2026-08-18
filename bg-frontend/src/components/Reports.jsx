import { useState, useEffect, useCallback } from 'react';
import api from '../services/api';

function Reports() {
  const [mes, setMes] = useState(new Date().getMonth() + 1);
  const [anio, setAnio] = useState(new Date().getFullYear());
  const [gastos, setGastos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  
  const [file, setFile] = useState(null);
  const [reporteImportacion, setReporteImportacion] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);

  const fetchReportData = useCallback(async () => {
    try {
      setLoadingData(true);
      const [expensesRes, catsRes] = await Promise.all([
        api.get('/Expenses').catch(() => ({ data: [] })),
        api.get('/Categories').catch(() => ({ data: [] }))
      ]);

      setGastos(Array.isArray(expensesRes.data) ? expensesRes.data : []);
      setCategorias(Array.isArray(catsRes.data) ? catsRes.data : []);
    } catch (err) {
      console.error("Error al cargar datos para reportes:", err);
    } finally {
      setLoadingData(false);
    }
  }, []);

  useEffect(() => {
    fetchReportData();
  }, [fetchReportData]);

  const handleExport = async (format) => {
    try {
      const response = await api.get(`/Transactions/export/${format}?mes=${mes}&ano=${anio}`, {
        responseType: 'blob',
      });
      
      const blob = new Blob([response.data]);
      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);
      link.download = `Reporte_Mensual_${mes}_${anio}.${format === 'excel' ? 'xlsx' : format}`;
      link.click();
    } catch (err) {
      alert('Error al exportar el reporte.');
    }
  };

  const handleUploadExcel = async (e) => {
    e.preventDefault();
    if (!file) return alert('Por favor, selecciona un archivo Excel primero.');
    const formData = new FormData();
    formData.append('file', file);

    try {
      setLoading(true);
      const res = await api.post('/Transactions/import-excel', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setReporteImportacion(res.data);
      alert('¡Importación procesada con éxito!');
      fetchReportData(); 
    } catch (err) {
      alert('Error al procesar el archivo Excel.');
    } finally {
      setLoading(false);
    }
  };

  // --- CÁLCULOS ANALÍTICOS ---
  const mesActualInt = parseInt(mes);
  const anioActualInt = parseInt(anio);
  const mesAnteriorInt = mesActualInt === 1 ? 12 : mesActualInt - 1;
  const anioAnteriorInt = mesActualInt === 1 ? anioActualInt - 1 : anioActualInt;

  // Filtrar gastos del mes actual y anterior
  const gastosActuales = gastos.filter(tx => {
    const fecha = new Date(tx.fecha || tx.date);
    return (fecha.getMonth() + 1) === mesActualInt && fecha.getFullYear() === anioActualInt;
  });

  const gastosAnteriores = gastos.filter(tx => {
    const fecha = new Date(tx.fecha || tx.date);
    return (fecha.getMonth() + 1) === mesAnteriorInt && fecha.getFullYear() === anioAnteriorInt;
  });

  // KPIs
  const totalGastosActual = gastosActuales.reduce((acc, tx) => acc + parseFloat(tx.monto || tx.Monto || 0), 0);
  const totalGastosAnterior = gastosAnteriores.reduce((acc, tx) => acc + parseFloat(tx.monto || tx.Monto || 0), 0);
  const cantidadGastos = gastosActuales.length;
  const promedioGasto = cantidadGastos > 0 ? (totalGastosActual / cantidadGastos) : 0;
  const variacion = totalGastosActual - totalGastosAnterior;

  // Desglose por Categoría
  const gastosPorCat = {};
  const conteoPorCat = {};
  gastosActuales.forEach(tx => {
    const catId = tx.categoryId || tx.CategoryId;
    gastosPorCat[catId] = (gastosPorCat[catId] || 0) + parseFloat(tx.monto || tx.Monto || 0);
    conteoPorCat[catId] = (conteoPorCat[catId] || 0) + 1;
  });

  const categoriaMap = {};
  categorias.forEach(c => {
    categoriaMap[c.id || c.Id] = c.nombre || c.name || c.Nombre || 'Sin Categoría';
  });

  const desgloseGastos = Object.keys(gastosPorCat).map(catId => ({
    categoria: categoriaMap[catId] || 'Otros',
    monto: gastosPorCat[catId],
    cantidad: conteoPorCat[catId],
    porcentaje: totalGastosActual > 0 ? ((gastosPorCat[catId] / totalGastosActual) * 100) : 0
  })).sort((a, b) => b.monto - a.monto);

  const topCategorias = desgloseGastos.slice(0, 4);

  // --- GRÁFICO DE BARRAS EN PÍXELES (MÁS ROBUSTO) ---
  const maxBarValue = Math.max(totalGastosActual, totalGastosAnterior, 1);
  const maxPixelHeight = 100; // Altura máxima en px para la barra más alta
  const heightActualPx = Math.max((totalGastosActual / maxBarValue) * maxPixelHeight, 8); 
  const heightAnteriorPx = Math.max((totalGastosAnterior / maxBarValue) * maxPixelHeight, 8);
  const mesNombres = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];

  // --- ESTILOS REUTILIZABLES ---
  const cardStyle = { backgroundColor: '#1a1d21', padding: '20px', borderRadius: '12px', border: '1px solid #2d3139' };
  const inputStyle = { padding: '8px 12px', borderRadius: '8px', backgroundColor: '#131517', border: '1px solid #2d3139', color: '#fff', outline: 'none', fontSize: '14px' };
  const titleStyle = { margin: '0 0 15px 0', fontSize: '17px', color: '#fff', fontWeight: 'bold', letterSpacing: '-0.3px' };

  if (loadingData) return <div style={{ color: '#8b92a5', fontSize: '15px' }}>Cargando reporte analítico...</div>;

  return (
    <div style={{ width: '100%', boxSizing: 'border-box', fontFamily: '"Inter", sans-serif' }}>
      
      {/* 1. ENCABEZADO Y CONTROLES */}
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px', flexWrap: 'wrap', gap: '15px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <h2 style={{ fontSize: '26px', fontWeight: 'bold', margin: 0, color: '#fff', letterSpacing: '-0.5px' }}>Reporte mensual</h2>
          <div style={{ display: 'flex', gap: '8px' }}>
            <select value={mes} onChange={(e) => setMes(e.target.value)} style={inputStyle}>
              {mesNombres.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
            </select>
            <input type="number" value={anio} onChange={(e) => setAnio(e.target.value)} style={{ ...inputStyle, width: '75px' }} />
          </div>
        </div>
      </header>

      {/* 2. TARJETAS KPI */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px', marginBottom: '20px' }}>
        <div style={cardStyle}>
          <p style={{ margin: '0 0 5px 0', fontSize: '14px', color: '#8b92a5' }}>Total gastado</p>
          <h3 style={{ margin: '0 0 5px 0', fontSize: '24px', color: '#fff' }}>${totalGastosActual.toFixed(2)}</h3>
          <p style={{ margin: 0, fontSize: '12px', color: '#8b92a5' }}>En el mes seleccionado</p>
        </div>
        <div style={cardStyle}>
          <p style={{ margin: '0 0 5px 0', fontSize: '14px', color: '#8b92a5' }}>Cantidad de gastos</p>
          <h3 style={{ margin: '0 0 5px 0', fontSize: '24px', color: '#fff' }}>{cantidadGastos}</h3>
          <p style={{ margin: 0, fontSize: '12px', color: '#8b92a5' }}>Transacciones registradas</p>
        </div>
        <div style={cardStyle}>
          <p style={{ margin: '0 0 5px 0', fontSize: '14px', color: '#8b92a5' }}>Promedio por gasto</p>
          <h3 style={{ margin: '0 0 5px 0', fontSize: '24px', color: '#fff' }}>${promedioGasto.toFixed(2)}</h3>
          <p style={{ margin: 0, fontSize: '12px', color: '#8b92a5' }}>Por cada transacción</p>
        </div>
        <div style={cardStyle}>
          <p style={{ margin: '0 0 5px 0', fontSize: '14px', color: '#8b92a5' }}>Mes anterior</p>
          <h3 style={{ margin: '0 0 5px 0', fontSize: '24px', color: '#fff' }}>${totalGastosAnterior.toFixed(2)}</h3>
          <p style={{ margin: 0, fontSize: '12px', color: variacion > 0 ? '#ff6b6b' : '#5fe3c0' }}>
            {variacion > 0 ? `↑ Aumento de $${variacion.toFixed(2)}` : `↓ Disminución de $${Math.abs(variacion).toFixed(2)}`}
          </p>
        </div>
      </div>

      {/* 3. GRÁFICOS */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '20px' }}>
        
        {/* Gráfico Comparativo de Barras */}
        <div style={{ ...cardStyle, display: 'flex', flexDirection: 'column' }}>
          <h4 style={titleStyle}>Comparación de meses</h4>
          <div style={{ flex: 1, display: 'flex', alignItems: 'flex-end', justifyContent: 'space-around', padding: '15px 0 10px 0', borderBottom: '1px solid #2d3139', minHeight: '160px' }}>
            
            {/* Barra Mes Anterior */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end', width: '90px' }}>
              <span style={{ fontSize: '12px', color: '#8b92a5', marginBottom: '8px' }}>${totalGastosAnterior.toFixed(0)}</span>
              <div style={{ width: '40px', height: `${heightAnteriorPx}px`, backgroundColor: '#8b92a5', borderRadius: '4px 4px 0 0', transition: 'height 0.5s' }}></div>
              <span style={{ fontSize: '13px', color: '#8b92a5', marginTop: '10px' }}>{mesNombres[mesAnteriorInt - 1]}</span>
            </div>

            {/* Barra Mes Actual (Verde Aqua) */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end', width: '90px' }}>
              <span style={{ fontSize: '12px', color: '#fff', marginBottom: '8px' }}>${totalGastosActual.toFixed(0)}</span>
              <div style={{ width: '40px', height: `${heightActualPx}px`, backgroundColor: '#5fe3c0', borderRadius: '4px 4px 0 0', transition: 'height 0.5s' }}></div>
              <span style={{ fontSize: '13px', color: '#fff', marginTop: '10px' }}>{mesNombres[mesActualInt - 1]}</span>
            </div>

          </div>
        </div>

        {/* Top Categorías */}
        <div style={cardStyle}>
          <h4 style={titleStyle}>Top categorías del mes</h4>
          {topCategorias.length === 0 ? (
            <p style={{ color: '#8b92a5', fontSize: '14px' }}>No hay gastos en este mes.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              {topCategorias.map((item, index) => (
                <div key={index}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '6px' }}>
                    <span style={{ color: '#fff', fontWeight: '500' }}>{index + 1}. {item.categoria}</span>
                    <span style={{ color: '#fff', fontWeight: 'bold' }}>${item.monto.toFixed(2)}</span>
                  </div>
                  <div style={{ width: '100%', height: '6px', backgroundColor: '#131517', borderRadius: '3px', overflow: 'hidden', marginBottom: '4px' }}>
                    <div style={{ width: `${item.porcentaje}%`, height: '100%', backgroundColor: '#5fe3c0' }}></div>
                  </div>
                  <span style={{ fontSize: '11px', color: '#8b92a5' }}>
                    {item.porcentaje.toFixed(1)}% del total - {item.cantidad} gasto(s)
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 4. TABLA DE DESGLOSE */}
      <div style={cardStyle}>
        <h4 style={titleStyle}>Desglose por categoría</h4>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #2d3139', color: '#8b92a5', fontWeight: 'bold' }}>
                <th style={{ padding: '12px 0' }}>Categoría</th>
                <th style={{ padding: '12px 0', textAlign: 'right' }}>Total</th>
                <th style={{ padding: '12px 0', textAlign: 'right' }}>Porcentaje</th>
                <th style={{ padding: '12px 0', textAlign: 'center' }}>Gastos</th>
              </tr>
            </thead>
            <tbody>
              {desgloseGastos.length === 0 ? (
                <tr>
                  <td colSpan="4" style={{ padding: '20px 0', textAlign: 'center', color: '#8b92a5' }}>Sin registros</td>
                </tr>
              ) : (
                desgloseGastos.map((item, idx) => (
                  <tr key={idx} style={{ borderBottom: '1px solid #1f2328' }}>
                    <td style={{ padding: '12px 0', color: '#fff' }}>{item.categoria}</td>
                    <td style={{ padding: '12px 0', color: '#fff', textAlign: 'right' }}>${item.monto.toFixed(2)}</td>
                    <td style={{ padding: '12px 0', color: '#8b92a5', textAlign: 'right' }}>{item.porcentaje.toFixed(1)}%</td>
                    <td style={{ padding: '12px 0', color: '#8b92a5', textAlign: 'center' }}>{item.cantidad}</td>
                  </tr>
                ))
              )}
              {desgloseGastos.length > 0 && (
                <tr style={{ borderTop: '2px solid #2d3139', fontWeight: 'bold' }}>
                  <td style={{ padding: '15px 0', color: '#fff' }}>TOTAL</td>
                  <td style={{ padding: '15px 0', color: '#fff', textAlign: 'right' }}>${totalGastosActual.toFixed(2)}</td>
                  <td style={{ padding: '15px 0', color: '#fff', textAlign: 'right' }}>100.0%</td>
                  <td style={{ padding: '15px 0', color: '#fff', textAlign: 'center' }}>{cantidadGastos}</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 5. EXPORTACIÓN DE REPORTES */}
      <div style={{ marginTop: '20px', ...cardStyle, textAlign: 'center' }}>
        <h4 style={titleStyle}>Exportar Reportes</h4>
        <p style={{ color: '#8b92a5', fontSize: '14px', marginBottom: '15px' }}>
          Descarga el reporte mensual consolidado del periodo seleccionado.
        </p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '15px', flexWrap: 'wrap' }}>
          <button onClick={() => handleExport('excel')} style={{ backgroundColor: '#5fe3c0', color: '#131517', padding: '12px 20px', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', fontSize: '14px' }}>
            📊 Exportar Excel (.xlsx)
          </button>
          <button onClick={() => handleExport('txt')} style={{ backgroundColor: '#3498db', color: '#fff', padding: '12px 20px', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', fontSize: '14px' }}>
            📄 Exportar Texto (.txt)
          </button>
          <button onClick={() => handleExport('json')} style={{ backgroundColor: '#feca57', color: '#131517', padding: '12px 20px', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', fontSize: '14px' }}>
            📦 Exportar JSON (.json)
          </button>
        </div>
      </div>

      {/* 6. IMPORTACIÓN DE EXCEL */}
      <div style={{ marginTop: '20px', ...cardStyle, border: '1px dashed #2d3139', textAlign: 'center' }}>
        <h4 style={titleStyle}>Importar desde Excel</h4>
        <p style={{ color: '#8b92a5', fontSize: '14px', marginBottom: '15px' }}>
          Sube una plantilla de Excel con tus gastos. El sistema validará la estructura fila por fila.
        </p>
        <form onSubmit={handleUploadExcel} style={{ display: 'flex', justifyContent: 'center', gap: '15px', alignItems: 'center', flexWrap: 'wrap' }}>
          <input type="file" accept=".xlsx, .xls" onChange={(e) => setFile(e.target.files[0])} style={{ ...inputStyle, minWidth: '250px' }} />
          <button type="submit" disabled={loading} style={{ backgroundColor: '#ff6b6b', color: '#fff', padding: '10px 20px', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: 'bold' }}>
            {loading ? 'Procesando...' : 'Subir archivo'}
          </button>
        </form>
        {reporteImportacion && (
          <div style={{ marginTop: '15px', padding: '15px', backgroundColor: '#131517', borderRadius: '8px', border: '1px solid #2d3139', textAlign: 'left' }}>
            <p style={{ margin: '0 0 5px 0', fontSize: '13px', color: '#5fe3c0', fontWeight: 'bold' }}>✅ {reporteImportacion.totalExitosas} filas importadas con éxito.</p>
            <p style={{ margin: '0 0 10px 0', fontSize: '13px', color: reporteImportacion.totalErrores > 0 ? '#ff6b6b' : '#5fe3c0', fontWeight: 'bold' }}>❌ {reporteImportacion.totalErrores} filas con error.</p>
            {reporteImportacion.detalleErrores && reporteImportacion.detalleErrores.length > 0 && (
              <ul style={{ margin: 0, paddingLeft: '20px', color: '#ff6b6b', fontSize: '12px' }}>
                {reporteImportacion.detalleErrores.map((err, index) => (
                  <li key={index} style={{ marginBottom: '3px' }}>{err}</li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>

    </div>
  );
}

export default Reports;