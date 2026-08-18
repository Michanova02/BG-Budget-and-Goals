import { useEffect, useState, useCallback } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import api from './services/api';
import ExpenseForm from './components/ExpenseForm';
import IncomeForm from './components/IncomeForm';
import TransactionList from './components/TransactionList';
import Auth from './components/Auth';
import Profile from './components/Profile';
import Budgets from './components/Budgets';
import CategoryForm from './components/CategoryForm';
import Transactions from './components/Transactions'; 
import Goals from './components/Goals';
import Accounts from './components/Accounts'; 
import Reports from './components/Reports';
import PaymentMethodForm from './components/PaymentMethodForm';
import './App.css';

// --- 1. COMPONENTE DEL PANEL PRINCIPAL (DASHBOARD) ---
function Dashboard({ onLogout, nombreUsuario }) {
  const [summary, setSummary] = useState(null);
  const [budgets, setBudgets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('gasto');
  
  // Estado para el hover interactivo del gráfico circular
  const [hoverInfo, setHoverInfo] = useState(null); // 'ingresos' | 'gastos' | null

  // Estados para el filtro de mes y año
  const [mes, setMes] = useState(new Date().getMonth() + 1);
  const [anio, setAnio] = useState(new Date().getFullYear());

  const fetchDashboard = useCallback(async () => {
    try {
      const [summaryRes, budgetsRes] = await Promise.all([
        api.get(`/Dashboard/summary?mes=${mes}&año=${anio}`).catch(() => ({ data: { balance: 0, totalIngresos: 0, totalGastos: 0 } })),
        api.get(`/Budgets?mes=${mes}&anio=${anio}`).catch(() => ({ data: [] }))
      ]);

      setSummary(summaryRes.data);
      setBudgets(Array.isArray(budgetsRes.data) ? budgetsRes.data : []);
    } catch (err) {
      console.error(err);
      setError('No se pudo cargar el resumen. Revisa tu conexión.');
    } finally {
      setLoading(false);
    }
  }, [mes, anio]);

  useEffect(() => { fetchDashboard(); }, [fetchDashboard]);

  if (loading) return <div style={{ color: '#8b92a5', fontSize: '16px' }}>Cargando finanzas...</div>;
  if (error) return <div style={{ color: '#ff6b6b', fontSize: '16px' }}>{error}</div>;

  const totalBalance = summary?.balance ?? 0;
  const savingsGoalPercent = Math.min(Math.max((totalBalance / 200000) * 100, 0), 100).toFixed(0);
  const totalIngresosReal = summary?.totalIngresos || 0;
  const totalGastosReal = summary?.totalGastos || 0;

  const sumaTotal = totalIngresosReal + totalGastosReal;
  let gradientStops = '#2d3139 0% 100%';
  let porcentajeIngresos = 0;

  if (sumaTotal > 0) {
    porcentajeIngresos = (totalIngresosReal / sumaTotal) * 100;
    gradientStops = `#5fe3c0 0% ${porcentajeIngresos}%, #ff6b6b ${porcentajeIngresos}% 100%`;
  }

  const donutStyle = {
    width: '120px',
    height: '120px',
    borderRadius: '50%',
    background: `conic-gradient(${gradientStops})`,
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer'
  };

  const inputStyle = {
    padding: '6px 12px', borderRadius: '6px', 
    backgroundColor: '#131517', border: '1px solid #2d3139', 
    color: '#fff', outline: 'none', fontSize: '14px'
  };

  return (
    <div style={{ width: '100%', boxSizing: 'border-box' }}>
      
      {/* ENCABEZADO Y FILTROS */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px', flexWrap: 'wrap', gap: '10px' }}>
        <div>
          <h2 style={{ fontSize: '26px', margin: '0 0 3px 0', fontWeight: '600', color: '#fff', letterSpacing: '-0.5px' }}>
            ¡Bienvenido de nuevo, {nombreUsuario}!
          </h2>
          <p style={{ margin: 0, fontSize: '14px', color: '#8b92a5' }}>Visualizando finanzas del periodo seleccionado</p>
        </div>

        <div style={{ display: 'flex', gap: '8px', backgroundColor: '#1a1d21', padding: '6px 12px', borderRadius: '8px', border: '1px solid #2d3139', alignItems: 'center' }}>
          <span style={{ fontSize: '14px', color: '#8b92a5' }}>Periodo:</span>
          <select value={mes} onChange={(e) => setMes(e.target.value)} style={inputStyle}>
            {Array.from({ length: 12 }, (_, i) => (
              <option key={i + 1} value={i + 1}>Mes {i + 1}</option>
            ))}
          </select>
          <input type="number" value={anio} onChange={(e) => setAnio(e.target.value)} style={{ ...inputStyle, width: '75px' }} />
        </div>
      </div>

      {/* TARJETAS SUPERIORES */}
      {summary && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', backgroundColor: '#1a1d21', padding: '18px', borderRadius: '12px', border: '1px solid #2d3139', marginBottom: '15px', alignItems: 'center' }}>
          <div>
            <p style={{ color: '#8b92a5', margin: '0 0 5px 0', fontSize: '14px' }}>Balance Total</p>
            <h3 style={{ fontSize: '26px', margin: 0, color: '#ffffff' }}>${summary.balance ?? 0}</h3>
          </div>
          <div style={{ borderLeft: '1px solid #2d3139', paddingLeft: '18px' }}>
            <p style={{ color: '#8b92a5', margin: '0 0 5px 0', fontSize: '14px' }}>Ingresos</p>
            <h3 style={{ fontSize: '22px', margin: 0, color: '#5fe3c0' }}>+${summary.totalIngresos ?? 0}</h3>
          </div>
          <div style={{ borderLeft: '1px solid #2d3139', paddingLeft: '18px' }}>
            <p style={{ color: '#8b92a5', margin: '0 0 5px 0', fontSize: '14px' }}>Gastos</p>
            <h3 style={{ fontSize: '22px', margin: 0, color: '#ff6b6b' }}>-${summary.totalGastos ?? 0}</h3>
          </div>
          <div style={{ borderLeft: '1px solid #2d3139', paddingLeft: '18px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
              <span style={{ color: '#8b92a5', fontSize: '14px' }}>Meta de Ahorro</span>
              <span style={{ color: '#fff', fontSize: '14px', fontWeight: 'bold' }}>{savingsGoalPercent}%</span>
            </div>
            <div style={{ width: '100%', height: '7px', backgroundColor: '#131517', borderRadius: '4px', overflow: 'hidden' }}>
              <div style={{ width: `${savingsGoalPercent}%`, height: '100%', backgroundColor: '#5fe3c0', transition: 'width 0.5s' }}></div>
            </div>
          </div>
        </div>
      )}

      {/* SECCIÓN DE GRÁFICOS */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '12px', marginBottom: '15px' }}>
        
        {/* Gráfico 1: Resumen de Ingresos vs Gastos */}
        <div style={{ backgroundColor: '#1a1d21', padding: '18px', borderRadius: '12px', border: '1px solid #2d3139', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px', flexWrap: 'wrap', gap: '8px' }}>
            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '600', color: '#fff' }}>Resumen Financiero (Mes {mes})</h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#8b92a5' }}>
                <span style={{ width: '9px', height: '9px', borderRadius: '50%', backgroundColor: '#5fe3c0' }}></span> Ingresos
                <span style={{ width: '9px', height: '9px', borderRadius: '50%', backgroundColor: '#ff6b6b', marginLeft: '6px' }}></span> Gastos
              </div>
              <span style={{ fontSize: '13px', color: '#8b92a5', backgroundColor: '#131517', padding: '3px 9px', borderRadius: '5px', border: '1px solid #2d3139' }}>Año {anio}</span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '20px', flexWrap: 'wrap' }}>
            
            <div style={{ flex: 1, minWidth: '220px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', height: '110px', borderBottom: '1px solid #2d3139', paddingBottom: '6px', paddingLeft: '5px', paddingRight: '5px' }}>
                
                {/* SEMANA 1 */}
                <div style={{ display: 'flex', gap: '5px', alignItems: 'flex-end', height: '100%' }}>
                  <div style={{ width: '18px', height: '50%', backgroundColor: '#5fe3c0', borderRadius: '4px 4px 0 0' }} title="Ingresos Sem 1"></div>
                  <div style={{ width: '18px', height: '35%', backgroundColor: '#ff6b6b', borderRadius: '4px 4px 0 0' }} title="Gastos Sem 1"></div>
                </div>

                {/* SEMANA 2 */}
                <div style={{ display: 'flex', gap: '5px', alignItems: 'flex-end', height: '100%' }}>
                  <div style={{ width: '18px', height: '70%', backgroundColor: '#5fe3c0', borderRadius: '4px 4px 0 0' }} title="Ingresos Sem 2"></div>
                  <div style={{ width: '18px', height: '60%', backgroundColor: '#ff6b6b', borderRadius: '4px 4px 0 0' }} title="Gastos Sem 2"></div>
                </div>

                {/* SEMANA 3 */}
                <div style={{ display: 'flex', gap: '5px', alignItems: 'flex-end', height: '100%' }}>
                  <div style={{ width: '18px', height: '60%', backgroundColor: '#5fe3c0', borderRadius: '4px 4px 0 0' }} title="Ingresos Sem 3"></div>
                  <div style={{ width: '18px', height: '45%', backgroundColor: '#ff6b6b', borderRadius: '4px 4px 0 0' }} title="Gastos Sem 3"></div>
                </div>

                {/* SEMANA 4 */}
                <div style={{ display: 'flex', gap: '5px', alignItems: 'flex-end', height: '100%' }}>
                  <div style={{ width: '18px', height: '95%', backgroundColor: '#5fe3c0', borderRadius: '4px 4px 0 0' }} title="Ingresos Sem 4"></div>
                  <div style={{ width: '18px', height: '80%', backgroundColor: '#ff6b6b', borderRadius: '4px 4px 0 0' }} title="Gastos Sem 4"></div>
                </div>

              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#8b92a5', marginTop: '6px', paddingLeft: '5px', paddingRight: '5px' }}>
                <span style={{ width: '40px', textAlign: 'center' }}>S1</span>
                <span style={{ width: '40px', textAlign: 'center' }}>S2</span>
                <span style={{ width: '40px', textAlign: 'center' }}>S3</span>
                <span style={{ width: '40px', textAlign: 'center' }}>S4</span>
              </div>
            </div>

            {/* GRÁFICO CIRCULAR INTERACTIVO CON LÓGICA INVERTIDA CORRECTA */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div 
                style={donutStyle}
                onMouseMove={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  const x = e.clientX - rect.left;
                  const y = e.clientY - rect.top;
                  
                  // Lógica corregida según posición en pantalla del círculo con conic-gradient
                  const centroX = rect.width / 2;
                  const centroY = rect.height / 2;
                  
                  if (x > centroX && y < centroY) {
                    setHoverInfo('ingresos'); // Superior derecha (Verde)
                  } else if (y > centroY) {
                    setHoverInfo('ingresos'); // Inferior completa (Verde)
                  } else {
                    setHoverInfo('gastos');   // Superior izquierda (Rojo)
                  }
                }}
                onMouseLeave={() => setHoverInfo(null)}
              >
                <div style={{ width: '72px', height: '72px', backgroundColor: '#1a1d21', borderRadius: '50%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '2px' }}>
                  {hoverInfo === 'ingresos' ? (
                    <>
                      <span style={{ fontSize: '11px', color: '#5fe3c0', fontWeight: 'bold' }}>Ingresos</span>
                      <span style={{ fontSize: '11px', fontWeight: 'bold', color: '#5fe3c0' }}>${totalIngresosReal.toFixed(0)}</span>
                    </>
                  ) : hoverInfo === 'gastos' ? (
                    <>
                      <span style={{ fontSize: '11px', color: '#ff6b6b', fontWeight: 'bold' }}>Gastos</span>
                      <span style={{ fontSize: '11px', fontWeight: 'bold', color: '#ff6b6b' }}>${totalGastosReal.toFixed(0)}</span>
                    </>
                  ) : (
                    <>
                      <span style={{ fontSize: '11px', color: '#8b92a5' }}>Gastos</span>
                      <span style={{ fontSize: '12px', fontWeight: 'bold', color: '#ff6b6b' }}>${totalGastosReal.toFixed(0)}</span>
                    </>
                  )}
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Gráfico 2: Progreso de Presupuesto */}
        <div style={{ backgroundColor: '#1a1d21', padding: '18px', borderRadius: '12px', border: '1px solid #2d3139' }}>
          <h3 style={{ margin: '0 0 12px 0', fontSize: '16px', fontWeight: '600', color: '#fff' }}>Progreso de Presupuesto</h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '140px', overflowY: 'auto', paddingRight: '5px' }}>
            {budgets.length === 0 ? (
              <p style={{ color: '#8b92a5', fontSize: '14px', textAlign: 'center' }}>No hay presupuestos definidos.</p>
            ) : (
              budgets.map((b, idx) => {
                const gastado = parseFloat(b.gastoActual ?? b.GastoActual ?? 0);
                const limite = parseFloat(b.monto ?? b.Monto ?? 1);
                const pct = Math.min((gastado / limite) * 100, 100).toFixed(0);
                const colorProgreso = pct >= 100 ? '#ff6b6b' : pct >= 80 ? '#ff9f43' : '#5fe3c0';

                return (
                  <div key={idx}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', marginBottom: '5px', color: '#fff' }}>
                      <span>{b.categoriaNombre || b.CategoriaNombre || 'Categoría'}</span>
                      <span style={{ color: '#8b92a5' }}>{pct}%  <strong style={{ color: '#fff' }}>${gastado.toFixed(0)}/${limite.toFixed(0)}</strong></span>
                    </div>
                    <div style={{ width: '100%', height: '7px', backgroundColor: '#131517', borderRadius: '3px', overflow: 'hidden' }}>
                      <div style={{ width: `${pct}%`, height: '100%', backgroundColor: colorProgreso, transition: 'width 0.5s' }}></div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

      </div>

      {/* PESTAÑAS Y ACCIONES */}
      <div style={{ width: '100%', marginBottom: '15px' }}>
        <div className="dashboard-tabs" style={{ display: 'flex', gap: '8px', marginBottom: '10px', flexWrap: 'wrap' }}>
          <button onClick={() => setActiveTab('gasto')} style={{ flex: 1, minWidth: '130px', padding: '10px', fontSize: '14px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', transition: '0.2s', backgroundColor: activeTab === 'gasto' ? '#ff6b6b' : 'transparent', color: activeTab === 'gasto' ? '#131517' : '#8b92a5', border: activeTab === 'gasto' ? 'none' : '1px solid #2d3139' }}>Registrar Gasto</button>
          
          <button onClick={() => setActiveTab('ingreso')} style={{ flex: 1, minWidth: '130px', padding: '10px', fontSize: '14px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', transition: '0.2s', backgroundColor: activeTab === 'ingreso' ? '#5fe3c0' : 'transparent', color: activeTab === 'ingreso' ? '#131517' : '#8b92a5', border: activeTab === 'ingreso' ? 'none' : '1px solid #2d3139' }}>Registrar Ingreso</button>

          <button onClick={() => setActiveTab('categoria')} style={{ flex: 1, minWidth: '130px', padding: '10px', fontSize: '14px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', transition: '0.2s', backgroundColor: activeTab === 'categoria' ? '#5fe3c0' : 'transparent', color: activeTab === 'categoria' ? '#131517' : '#8b92a5', border: activeTab === 'categoria' ? 'none' : '1px solid #2d3139' }}>Categoría</button>

          <button onClick={() => setActiveTab('metodo')} style={{ flex: 1, minWidth: '130px', padding: '10px', fontSize: '14px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', transition: '0.2s', backgroundColor: activeTab === 'metodo' ? '#5fe3c0' : 'transparent', color: activeTab === 'metodo' ? '#131517' : '#8b92a5', border: activeTab === 'metodo' ? 'none' : '1px solid #2d3139' }}>Método de Pago</button>
        </div>
        
        {activeTab === 'gasto' && <ExpenseForm onExpenseAdded={fetchDashboard} />}
        {activeTab === 'ingreso' && <IncomeForm onIncomeAdded={fetchDashboard} />}
        {activeTab === 'categoria' && <CategoryForm onCategoryAdded={fetchDashboard} />}
        {activeTab === 'metodo' && <PaymentMethodForm onMethodAdded={fetchDashboard} />}
      </div>

      <div style={{ width: '100%' }}>
        <TransactionList refreshTrigger={summary} />
      </div>
    </div>
  );
}

function Layout({ onLogout }) {
  const location = useLocation(); 
  const navigate = useNavigate();
  const [nombreUsuario, setNombreUsuario] = useState('Usuario');
  const [showUserMenu, setShowUserMenu] = useState(false);
  
  const [showNotifications, setShowNotifications] = useState(false);
  const [alertasPresupuesto, setAlertasPresupuesto] = useState([]);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join(''));
        const decoded = JSON.parse(jsonPayload);
        const fullName = decoded.name || decoded["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name"] || decoded.unique_name;
        if (fullName) {
          setNombreUsuario(fullName.split(' ')[0]);
        }
      } catch (e) {
        console.error("No se pudo leer el token", e);
      }
    }

    const fetchBudgetAlerts = async () => {
      try {
        const mesActual = new Date().getMonth() + 1;
        const anioActual = new Date().getFullYear();
        const res = await api.get(`/Budgets?mes=${mesActual}&anio=${anioActual}`);
        if (Array.isArray(res.data)) {
          const criticos = res.data.filter(b => {
            const gasto = parseFloat(b.gastoActual ?? 0);
            const limite = parseFloat(b.monto ?? 1);
            return gasto >= limite * 0.8;
          });
          setAlertasPresupuesto(criticos);
        }
      } catch (err) {
        console.error("Error cargando alertas de presupuesto", err);
      }
    };

    fetchBudgetAlerts();
    const interval = setInterval(fetchBudgetAlerts, 30000);
    return () => clearInterval(interval);
  }, []);

  const limpiarNotificaciones = () => {
    setAlertasPresupuesto([]);
    setShowNotifications(false);
  };

  const handleScroll = (e) => {
    setIsScrolled(e.target.scrollTop > 20);
  };
  
  const getLinkStyle = (path) => ({
    padding: '10px 14px', borderRadius: '6px', fontSize: '15px', fontWeight: location.pathname === path ? 'bold' : 'normal',
    backgroundColor: location.pathname === path ? '#2d3139' : 'transparent',
    color: location.pathname === path ? '#fff' : '#8b92a5', cursor: 'pointer', textDecoration: 'none', display: 'block', transition: '0.3s'
  });

  return (
    <div className="app-layout" style={{ display: 'flex', height: '100vh', overflow: 'hidden', backgroundColor: '#131517', color: '#ffffff', fontFamily: '"Inter", "Segoe UI", sans-serif', width: '100%' }}>
      
      {/* Menú Lateral */}
      <aside className="sidebar" style={{ width: '230px', backgroundColor: '#1a1d21', padding: '22px 16px', borderRight: '1px solid #2d3139', display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
        
        <Link to="/" style={{ textDecoration: 'none', display: 'block', marginBottom: '30px' }}>
          <h1 style={{ color: '#5fe3c0', fontSize: '34px', margin: '0 0 2px 0', letterSpacing: '-1px', lineHeight: '1' }}>B&G</h1>
          <span style={{ color: '#8b92a5', fontSize: '12px', fontWeight: '500', letterSpacing: '0.5px', textTransform: 'uppercase' }}>Budgets and Goals</span>
        </Link>

        <nav className="nav-menu" style={{ display: 'flex', flexDirection: 'column', gap: '6px', flex: 1 }}>
          <Link to="/" style={getLinkStyle('/')}>⊞ Panel Principal</Link>
          <Link to="/budgets" style={getLinkStyle('/budgets')}>◷ Presupuestos</Link>
          <Link to="/accounts" style={getLinkStyle('/accounts')}>◫ Cuentas</Link>
          <Link to="/transactions" style={getLinkStyle('/transactions')}>⇄ Transacciones</Link>
          <Link to="/goals" style={getLinkStyle('/goals')}>◎ Metas</Link>
          <Link to="/reports" style={getLinkStyle('/reports')}>▤ Reportes</Link>
        </nav>
      </aside>

      {/* Contenedor Principal */}
      <div 
        onScroll={handleScroll}
        style={{ flex: 1, display: 'flex', flexDirection: 'column', overflowY: 'auto', position: 'relative' }}
      >
        
        {/* BARRA SUPERIOR */}
        <header style={{ 
          position: 'sticky', top: 0, zIndex: 1000, 
          display: 'flex', justifyContent: 'flex-end', alignItems: 'center', 
          padding: '10px 20px', 
          backgroundColor: isScrolled ? 'rgba(19, 21, 23, 0.95)' : 'rgba(19, 21, 23, 0.4)', 
          backdropFilter: 'blur(12px)',
          borderBottom: isScrolled ? '1px solid #2d3139' : '1px solid transparent', 
          gap: '15px',
          transition: 'all 0.3s ease-in-out' 
        }}>
          
          {/* BOTÓN DE NOTIFICACIONES */}
          <div style={{ position: 'relative' }}>
            <div 
              onClick={() => { setShowNotifications(!showNotifications); setShowUserMenu(false); }}
              style={{ backgroundColor: '#1a1d21', border: '1px solid #2d3139', borderRadius: '50%', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', position: 'relative' }}
            >
              🔔
              {alertasPresupuesto.length > 0 && (
                <span style={{ position: 'absolute', top: '6px', right: '8px', width: '7px', height: '7px', backgroundColor: '#5fe3c0', borderRadius: '50%' }}></span>
              )}
            </div>

            {showNotifications && (
              <div style={{ position: 'absolute', right: 0, top: '42px', backgroundColor: '#1a1d21', border: '1px solid #2d3139', borderRadius: '10px', width: '270px', boxShadow: '0 8px 24px rgba(0,0,0,0.4)', zIndex: 100, overflow: 'hidden', padding: '14px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', borderBottom: '1px solid #2d3139', paddingBottom: '6px' }}>
                  <span style={{ fontSize: '14px', fontWeight: 'bold', color: '#fff' }}>Notificaciones</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ fontSize: '12px', color: '#8b92a5', backgroundColor: '#131517', padding: '2px 5px', borderRadius: '4px' }}>{alertasPresupuesto.length} nuevas</span>
                    {alertasPresupuesto.length > 0 && (
                      <button 
                        onClick={limpiarNotificaciones}
                        style={{ background: 'transparent', border: 'none', color: '#4dabf7', fontSize: '12px', cursor: 'pointer', textDecoration: 'underline', padding: 0 }}
                      >
                        Limpiar todo
                      </button>
                    )}
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '200px', overflowY: 'auto' }}>
                  {alertasPresupuesto.length === 0 ? (
                    <p style={{ color: '#8b92a5', fontSize: '13px', textAlign: 'center', margin: '10px 0' }}>No hay alertas.</p>
                  ) : (
                    alertasPresupuesto.map((a, idx) => {
                      const gastado = parseFloat(a.gastoActual ?? 0);
                      const limite = parseFloat(a.monto ?? 1);
                      const excedido = gastado >= limite;
                      const pct = ((gastado / limite) * 100).toFixed(0);

                      return (
                        <div key={idx} style={{ padding: '8px', borderRadius: '6px', backgroundColor: '#131517', border: `1px solid ${excedido ? '#ff6b6b' : '#ff9f43'}`, fontSize: '13px' }}>
                          <p style={{ margin: '0 0 2px 0', fontWeight: 'bold', color: excedido ? '#ff6b6b' : '#ff9f43' }}>
                            {excedido ? '🚨 ¡Límite Excedido!' : '⚠️ Cerca del Límite'}
                          </p>
                          <p style={{ margin: 0, color: '#c5c8c6' }}>
                            <strong>{a.categoriaNombre}</strong> al {pct}%
                          </p>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Menú del Usuario */}
          <div style={{ position: 'relative' }}>
            <div 
              onClick={() => { setShowUserMenu(!showUserMenu); setShowNotifications(false); }}
              style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: '#1a1d21', border: '1px solid #2d3139', padding: '5px 12px', borderRadius: '18px', cursor: 'pointer' }}
            >
              <div style={{ width: '26px', height: '26px', borderRadius: '50%', backgroundColor: '#5fe3c0', color: '#131517', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '13px' }}>
                {nombreUsuario.charAt(0).toUpperCase()}
              </div>
              <span style={{ fontSize: '14px', fontWeight: '500', color: '#fff' }}>{nombreUsuario} ▼</span>
            </div>

            {showUserMenu && (
              <div style={{ position: 'absolute', right: 0, top: '42px', backgroundColor: '#1a1d21', border: '1px solid #2d3139', borderRadius: '8px', width: '150px', boxShadow: '0 4px 12px rgba(0,0,0,0.3)', zIndex: 100, overflow: 'hidden' }}>
                <button 
                  onClick={() => { setShowUserMenu(false); navigate('/profile'); }}
                  style={{ width: '100%', padding: '10px 14px', backgroundColor: 'transparent', border: 'none', borderBottom: '1px solid #2d3139', color: '#fff', textAlign: 'left', cursor: 'pointer', fontSize: '14px' }}
                >
                  👤 Mi Perfil
                </button>
                <button 
                  onClick={onLogout}
                  style={{ width: '100%', padding: '10px 14px', backgroundColor: 'transparent', border: 'none', color: '#ff6b6b', textAlign: 'left', cursor: 'pointer', fontSize: '14px', fontWeight: 'bold' }}
                >
                  Cerrar Sesión
                </button>
              </div>
            )}
          </div>
        </header>

        {/* VISTAS CENTRALES */}
        <main className="main-content" style={{ flex: 1, padding: '18px' }}>
          <Routes>
            <Route path="/" element={<Dashboard onLogout={onLogout} nombreUsuario={nombreUsuario} />} />
            <Route path="/budgets" element={<Budgets />} />
            <Route path="/accounts" element={<Accounts />} />
            <Route path="/transactions" element={<Transactions />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/goals" element={<Goals />} />
            <Route path="/reports" element={<Reports />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

// --- 4. PUNTO DE ENTRADA CON SEGURIDAD ---
export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('token'));

  const handleLogin = () => setIsAuthenticated(true);
  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsAuthenticated(false);
  };

  return (
    <Router>
      {isAuthenticated ? (
        <Layout onLogout={handleLogout} />
      ) : (
        <Auth onLogin={handleLogin} />
      )}
    </Router>
  );
}