import { useState, useEffect, useRef } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { getNotificaciones, marcarTodasLeidas, resetStore } from '../data/store.js';

export default function Layout({ children }) {
  const { usuario, logout } = useAuth();
  const navigate = useNavigate();
  const [notifs, setNotifs] = useState([]);
  const [showNotifs, setShowNotifs] = useState(false);
  const notifRef = useRef(null);

  const refreshNotifs = () => {
    if (usuario) setNotifs(getNotificaciones(usuario));
  };

  useEffect(() => {
    refreshNotifs();
    const interval = setInterval(refreshNotifs, 3000);
    return () => clearInterval(interval);
  }, [usuario]);

  useEffect(() => {
    const handleClick = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setShowNotifs(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const unread = notifs.filter(n => !n.leida).length;

  const handleReset = () => {
    if (confirm('¿Restablecer la demo? Se eliminarán todos los cambios y se volverá a los datos iniciales.')) {
      resetStore();
      logout();
      navigate('/');
    }
  };

  const esRegistrador = usuario?.roles.includes('REGISTRADOR');
  const esGobierno = usuario?.roles.includes('GOBIERNO');
  const esRisk = usuario?.roles.includes('RISK_SPECIALIST');

  return (
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily: 'system-ui, sans-serif', background: '#f1f5f9' }}>
      {/* Sidebar */}
      <aside style={{
        width: 240, background: '#1e293b', color: '#e2e8f0',
        display: 'flex', flexDirection: 'column', flexShrink: 0,
      }}>
        <div style={{ padding: '20px 16px 12px', borderBottom: '1px solid #334155' }}>
          <div style={{ fontSize: 13, color: '#94a3b8', marginBottom: 2 }}>Credit Risk Models</div>
          <div style={{ fontSize: 16, fontWeight: 700, color: '#f8fafc' }}>Administración</div>
        </div>

        {/* Usuario activo */}
        <div style={{ padding: '12px 16px', borderBottom: '1px solid #334155', fontSize: 13 }}>
          <div style={{ color: '#94a3b8', fontSize: 11, marginBottom: 2 }}>Usuario activo</div>
          <div style={{ color: '#f1f5f9', fontWeight: 600 }}>{usuario?.nombre}</div>
          <div style={{ color: '#64748b', fontSize: 11 }}>
            {usuario?.roles.map(r => ROL_LABEL[r]).join(', ')}
          </div>
        </div>

        {/* Navegación */}
        <nav style={{ padding: '8px 0', flex: 1, overflowY: 'auto' }}>
          {(esRegistrador || esGobierno) && (
            <>
              <div style={sectionHeader}>Módulo Pilotos</div>
              {esRegistrador && (
                <>
                  <NavLink to="/pilotos/mis-pilotos" style={navStyle} end>Mis Pilotos</NavLink>
                  <NavLink to="/pilotos/solicitudes" style={navStyle}>Solicitudes</NavLink>
                </>
              )}
              {esGobierno && (
                <>
                  <NavLink to="/pilotos/bandeja-aprobacion" style={navStyle}>Bandeja de Aprobación</NavLink>
                  <NavLink to="/pilotos/bandeja-solicitudes" style={navStyle}>Bandeja Solicitudes</NavLink>
                </>
              )}
              {(esRegistrador || esGobierno) && (
                <NavLink to="/pilotos/monitoreo" style={navStyle}>Monitoreo</NavLink>
              )}
            </>
          )}

          {esRisk && (
            <>
              <div style={sectionHeader}>Módulo Catálogo de Modelos</div>
              <NavLink to="/modelos/registro" style={navStyle}>Registrar Modelo</NavLink>
              <NavLink to="/modelos/mantenimiento" style={navStyle}>Mantenimiento</NavLink>
            </>
          )}
        </nav>

        {/* Botón reset */}
        <div style={{ padding: '12px 16px', borderTop: '1px solid #334155' }}>
          <button onClick={handleReset} style={{
            width: '100%', padding: '7px', background: '#7f1d1d',
            color: '#fca5a5', border: 'none', borderRadius: 6,
            fontSize: 12, cursor: 'pointer', fontWeight: 600,
          }}>
            🔄 Restablecer demo
          </button>
          <button onClick={() => { logout(); navigate('/'); }} style={{
            width: '100%', marginTop: 6, padding: '7px', background: '#1e293b',
            color: '#94a3b8', border: '1px solid #334155', borderRadius: 6,
            fontSize: 12, cursor: 'pointer',
          }}>
            Cambiar usuario
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Header */}
        <header style={{
          background: 'white', borderBottom: '1px solid #e2e8f0',
          padding: '0 24px', height: 52, display: 'flex', alignItems: 'center', justifyContent: 'flex-end',
          gap: 12, boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
        }}>
          {/* Campana de notificaciones */}
          <div ref={notifRef} style={{ position: 'relative' }}>
            <button
              onClick={() => { setShowNotifs(v => !v); }}
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                position: 'relative', padding: '4px 6px', borderRadius: 6,
                fontSize: 20, color: '#374151',
              }}
              title="Notificaciones"
            >
              🔔
              {unread > 0 && (
                <span style={{
                  position: 'absolute', top: 0, right: 0,
                  background: '#dc2626', color: 'white',
                  borderRadius: '50%', fontSize: 10, fontWeight: 700,
                  width: 16, height: 16, display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  {unread > 9 ? '9+' : unread}
                </span>
              )}
            </button>

            {showNotifs && (
              <div style={{
                position: 'absolute', right: 0, top: 44, width: 360,
                background: 'white', borderRadius: 10, boxShadow: '0 8px 30px rgba(0,0,0,0.15)',
                border: '1px solid #e2e8f0', zIndex: 1000, overflow: 'hidden',
              }}>
                <div style={{
                  padding: '10px 14px', borderBottom: '1px solid #f1f5f9',
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                }}>
                  <span style={{ fontWeight: 700, fontSize: 14, color: '#1e293b' }}>
                    Notificaciones {unread > 0 && <span style={{ color: '#dc2626' }}>({unread})</span>}
                  </span>
                  {unread > 0 && (
                    <button
                      onClick={() => { marcarTodasLeidas(usuario); refreshNotifs(); }}
                      style={{ background: 'none', border: 'none', color: '#2563eb', fontSize: 12, cursor: 'pointer' }}
                    >
                      Marcar todas leídas
                    </button>
                  )}
                </div>
                <div style={{ maxHeight: 320, overflowY: 'auto' }}>
                  {notifs.length === 0 ? (
                    <div style={{ padding: 16, color: '#6b7280', fontSize: 13, textAlign: 'center' }}>
                      Sin notificaciones
                    </div>
                  ) : notifs.map(n => (
                    <div key={n.id} style={{
                      padding: '10px 14px', borderBottom: '1px solid #f8fafc',
                      background: n.leida ? 'white' : '#eff6ff',
                    }}>
                      <div style={{ fontSize: 13, color: '#1e293b', lineHeight: 1.4 }}>{n.mensaje}</div>
                      <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 3 }}>
                        {new Date(n.fechaHora).toLocaleString('es-CO')}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </header>

        {/* Page content */}
        <main style={{ flex: 1, overflow: 'auto', padding: 24 }}>
          {children}
        </main>
      </div>
    </div>
  );
}

const ROL_LABEL = {
  REGISTRADOR: 'Analista Riesgos',
  GOBIERNO: 'Gobierno A/B Testing',
  RISK_SPECIALIST: 'Risk Specialist',
};

const sectionHeader = {
  padding: '10px 16px 4px',
  fontSize: 10,
  fontWeight: 700,
  color: '#475569',
  textTransform: 'uppercase',
  letterSpacing: '0.08em',
};

const navStyle = ({ isActive }) => ({
  display: 'block',
  padding: '8px 16px 8px 24px',
  color: isActive ? '#f8fafc' : '#94a3b8',
  background: isActive ? '#334155' : 'transparent',
  textDecoration: 'none',
  fontSize: 14,
  fontWeight: isActive ? 600 : 400,
  borderLeft: isActive ? '3px solid #3b82f6' : '3px solid transparent',
  transition: 'all 0.15s',
});
