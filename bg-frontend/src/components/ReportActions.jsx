import { useState } from 'react';
import api from '../services/api';

function ReportActions() {
  const [file, setFile] = useState(null);
  const [reporteImportacion, setReporteImportacion] = useState(null);
  const [loading, setLoading] = useState(false);

  // Manejar la exportación (CU11)
  const handleExport = async (format) => {
    try {
      const response = await api.get(`/Transactions/export/${format}`, {
        responseType: 'blob', // Vital para que el navegador reciba el archivo binario
      });
      
      const blob = new Blob([response.data]);
      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);
      link.download = `Reporte_Gastos_BG.${format === 'excel' ? 'xlsx' : format}`;
      link.click();
    } catch (err) {
      console.error(err);
      alert('Error al exportar el reporte.');
    }
  };

  // Manejar la importación del Excel (CU07)
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
    } catch (err) {
      console.error(err);
      alert('Error al procesar el archivo Excel.');
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    padding: '10px', borderRadius: '8px', 
    backgroundColor: '#131517', border: '1px solid #2d3139', 
    color: '#fff', outline: 'none', fontSize: '14px', width: '100%', boxSizing: 'border-box'
  };

  return (
    <div style={{ width: '100%', backgroundColor: '#1a1d21', padding: '30px', borderRadius: '16px', border: '1px solid #2d3139', marginTop: '30px' }}>
      <h3 style={{ color: '#fff', fontSize: '20px', marginBottom: '20px', fontWeight: '600' }}>Reportes, Importación y Exportación (CU07 y CU11)</h3>
      
      {/* SECCIÓN EXPORTAR (CU11) */}
      <div style={{ marginBottom: '30px' }}>
        <p style={{ color: '#8b92a5', fontSize: '14px', marginBottom: '12px' }}>CU11 - Exportar Reporte Mensual:</p>
        <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
          <button onClick={() => handleExport('excel')} style={{ backgroundColor: '#5fe3c0', color: '#131517', padding: '10px 20px', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>
            📊 Descargar Excel
          </button>
          <button onClick={() => handleExport('txt')} style={{ backgroundColor: '#3498db', color: '#fff', padding: '10px 20px', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>
            📄 Descargar TXT
          </button>
          <button onClick={() => handleExport('json')} style={{ backgroundColor: '#feca57', color: '#131517', padding: '10px 20px', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>
            📦 Descargar JSON
          </button>
        </div>
      </div>

      {/* SECCIÓN IMPORTAR (CU07) */}
      <div>
        <p style={{ color: '#8b92a5', fontSize: '14px', marginBottom: '12px' }}>CU07 - Importar Transacciones desde Excel:</p>
        <form onSubmit={handleUploadExcel} style={{ display: 'flex', gap: '15px', alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: '250px' }}>
            <input type="file" accept=".xlsx, .xls" onChange={(e) => setFile(e.target.files[0])} style={inputStyle} />
          </div>
          <button type="submit" disabled={loading} style={{ backgroundColor: '#ff6b6b', color: '#fff', padding: '11px 20px', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>
            {loading ? 'Procesando...' : 'Subir y Validar'}
          </button>
        </form>

        {reporteImportacion && (
          <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#131517', borderRadius: '8px', border: '1px solid #2d3139', color: '#5fe3c0' }}>
            <p style={{ margin: '0 0 5px 0' }}>✅ <strong>Filas exitosas:</strong> {reporteImportacion.totalExitosas}</p>
            <p style={{ margin: '0 0 10px 0', color: reporteImportacion.totalErrores > 0 ? '#ff6b6b' : '#5fe3c0' }}>
              ❌ <strong>Filas con error:</strong> {reporteImportacion.totalErrores}
            </p>
            {reporteImportacion.detalleErrores && reporteImportacion.detalleErrores.length > 0 && (
              <ul style={{ margin: 0, paddingLeft: '20px', color: '#ff6b6b', fontSize: '13px' }}>
                {reporteImportacion.detalleErrores.map((err, index) => (
                  <li key={index}>{err}</li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default ReportActions;