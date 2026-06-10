import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { getUsuarios } from '../data/store.js';

const ROL_LABEL = {
  REGISTRADOR: 'Analista de Riesgos',
  GOBIERNO: 'Gobierno A/B Testing',
  RISK_SPECIALIST: 'Risk Specialist',
};

const ROL_COLOR = {
  REGISTRADOR: '#2563eb',
  GOBIERNO: '#7c3aed',
  RISK_SPECIALIST: '#059669',
};

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const usuarios = getUsuarios();

  const handleSelect = (u) => {
    login(u);
    if (u.roles.includes('REGISTRADOR')) {
      navigate('/pilotos/mis-pilotos');
    } else if (u.roles.includes('GOBIERNO')) {
      navigate('/pilotos/bandeja-aprobacion');
    } else if (u.roles.includes('RISK_SPECIALIST')) {
      navigate('/modelos/mantenimiento');
    }
  };

  return (
    <div style={{
      minHeight: '100vh', background: '#0f172a',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <div style={{ width: 480 }}>
        {/* Logo/título */}
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            width: 56, height: 56, background: '#1d4ed8', borderRadius: 14,
            fontSize: 28, marginBottom: 16,
          }}>📊</div>
          <h1 style={{ color: '#f8fafc', fontSize: 22, fontWeight: 700, margin: 0 }}>
            Credit Risk Models
          </h1>
          <p style={{ color: '#64748b', fontSize: 14, margin: '6px 0 0' }}>
            Acceso SSO corporativo (simulado)
          </p>
        </div>

        {/* Tarjetas de usuario */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {usuarios.map(u => (
            <button
              key={u.id}
              onClick={() => handleSelect(u)}
              style={{
                display: 'flex', alignItems: 'center', gap: 14,
                padding: '14px 18px', background: '#1e293b', border: '1px solid #334155',
                borderRadius: 10, cursor: 'pointer', textAlign: 'left',
                transition: 'border-color 0.15s, background 0.15s',
                width: '100%',
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = '#3b82f6'; e.currentTarget.style.background = '#1e3a5f'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = '#334155'; e.currentTarget.style.background = '#1e293b'; }}
            >
              <div style={{
                width: 40, height: 40, borderRadius: '50%',
                background: '#334155', color: '#f8fafc', fontWeight: 700,
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0,
              }}>
                {u.nombre[0]}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ color: '#f8fafc', fontWeight: 600, fontSize: 15 }}>{u.nombre}</div>
                <div style={{ color: '#64748b', fontSize: 12, marginTop: 2 }}>{u.email}</div>
                <div style={{ display: 'flex', gap: 6, marginTop: 4 }}>
                  {u.roles.map(r => (
                    <span key={r} style={{
                      display: 'inline-block', padding: '2px 8px', borderRadius: 10,
                      background: ROL_COLOR[r] + '20',
                      color: ROL_COLOR[r],
                      border: `1px solid ${ROL_COLOR[r]}50`,
                      fontSize: 11, fontWeight: 600,
                    }}>
                      {ROL_LABEL[r]}
                    </span>
                  ))}
                </div>
              </div>
              <div style={{ color: '#475569', fontSize: 18 }}>→</div>
            </button>
          ))}
        </div>

        <p style={{ textAlign: 'center', color: '#475569', fontSize: 12, marginTop: 24 }}>
          Selecciona un usuario para ingresar con su perfil de acceso
        </p>
      </div>
    </div>
  );
}
