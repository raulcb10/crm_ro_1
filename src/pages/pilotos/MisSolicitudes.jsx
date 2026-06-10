import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { getPilotosByRegistrador, getSolicitudesByPiloto } from '../../data/store.js';
import StateBadge from '../../components/StateBadge.jsx';

const ESTADO_SOL = {
  PENDIENTE: { label: 'Pendiente', color: '#d97706', bg: '#fef3c7' },
  CONFIRMADA: { label: 'Confirmada', color: '#059669', bg: '#d1fae5' },
  RECHAZADA: { label: 'Rechazada', color: '#dc2626', bg: '#fee2e2' },
};

export default function MisSolicitudes() {
  const { usuario } = useAuth();
  const navigate = useNavigate();

  const pilotos = getPilotosByRegistrador(usuario.id);
  const solicitudes = pilotos
    .flatMap(p => getSolicitudesByPiloto(p.codigo).map(s => ({ ...s, piloto: p })))
    .sort((a, b) => b.fecha.localeCompare(a.fecha));

  return (
    <div>
      <h2 style={{ fontSize: 20, fontWeight: 700, color: '#1e293b', marginBottom: 20 }}>Mis Solicitudes</h2>

      {solicitudes.length === 0 ? (
        <div style={{ background: 'white', borderRadius: 10, border: '1px solid #e2e8f0', padding: 32, textAlign: 'center', color: '#94a3b8' }}>
          No has realizado solicitudes de apagado o escalado.
        </div>
      ) : (
        <div style={{ background: 'white', borderRadius: 10, border: '1px solid #e2e8f0', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f8fafc' }}>
                {['Piloto', 'Nombre', 'Tipo', 'Fecha', 'Estado solicitud', 'Estado piloto', 'Motivo / Adjunto'].map(h => (
                  <th key={h} style={thStyle}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {solicitudes.map((s, i) => {
                const est = ESTADO_SOL[s.estado] || {};
                return (
                  <tr key={s.id} style={{ borderTop: '1px solid #f1f5f9', background: i % 2 ? '#fafafa' : 'white' }}>
                    <td style={tdStyle}>
                      <span style={{ fontFamily: 'monospace', fontSize: 12, color: '#1d4ed8', fontWeight: 600 }}>
                        {s.pilotoCodigo}
                      </span>
                    </td>
                    <td style={{ ...tdStyle, maxWidth: 180 }}>{s.piloto?.nombre}</td>
                    <td style={tdStyle}>
                      <span style={{
                        padding: '2px 8px', borderRadius: 10, fontSize: 12, fontWeight: 600,
                        background: s.tipo === 'APAGADO' ? '#fee2e2' : '#e0f2fe',
                        color: s.tipo === 'APAGADO' ? '#dc2626' : '#0284c7',
                      }}>
                        {s.tipo}
                      </span>
                    </td>
                    <td style={tdStyle}><span style={{ fontFamily: 'monospace', fontSize: 12 }}>{s.fecha}</span></td>
                    <td style={tdStyle}>
                      <span style={{ padding: '2px 8px', borderRadius: 10, fontSize: 12, fontWeight: 600, background: est.bg, color: est.color }}>
                        {est.label}
                      </span>
                    </td>
                    <td style={tdStyle}><StateBadge estado={s.piloto?.estado} /></td>
                    <td style={{ ...tdStyle, fontSize: 12, color: '#475569', maxWidth: 200 }}>
                      {s.motivo || (s.adjuntoNombre && <span>📎 {s.adjuntoNombre}</span>) || '—'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Acceso rápido a pilotos que admiten solicitud */}
      <div style={{ marginTop: 20 }}>
        <h3 style={{ fontSize: 14, fontWeight: 700, color: '#374151', marginBottom: 10 }}>
          Pilotos con posibilidad de solicitud
        </h3>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {pilotos.filter(p => ['APROBADO', 'VIGENTE'].includes(p.estado)).map(p => {
            const pendiente = solicitudes.some(s => s.pilotoCodigo === p.codigo && s.estado === 'PENDIENTE');
            return (
              <div key={p.codigo} style={{
                background: 'white', border: '1px solid #e2e8f0', borderRadius: 8,
                padding: '10px 14px', display: 'flex', flexDirection: 'column', gap: 6, minWidth: 220,
              }}>
                <div style={{ fontSize: 12, fontFamily: 'monospace', color: '#1d4ed8', fontWeight: 700 }}>{p.codigo}</div>
                <div style={{ fontSize: 13, fontWeight: 600 }}>{p.nombre}</div>
                <StateBadge estado={p.estado} />
                {pendiente ? (
                  <span style={{ fontSize: 11, color: '#d97706', fontStyle: 'italic' }}>Solicitud pendiente</span>
                ) : (
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button onClick={() => navigate(`/pilotos/apagado/${p.codigo}`)}
                      style={{ fontSize: 12, padding: '4px 10px', background: '#fee2e2', color: '#dc2626', border: 'none', borderRadius: 5, cursor: 'pointer' }}>
                      Apagar
                    </button>
                    <button onClick={() => navigate(`/pilotos/escalado/${p.codigo}`)}
                      style={{ fontSize: 12, padding: '4px 10px', background: '#e0f2fe', color: '#0284c7', border: 'none', borderRadius: 5, cursor: 'pointer' }}>
                      Escalar
                    </button>
                  </div>
                )}
              </div>
            );
          })}
          {pilotos.filter(p => ['APROBADO', 'VIGENTE'].includes(p.estado)).length === 0 && (
            <p style={{ color: '#94a3b8', fontSize: 13 }}>No tienes pilotos en estado Aprobado o Vigente.</p>
          )}
        </div>
      </div>
    </div>
  );
}

const thStyle = { padding: '10px 12px', textAlign: 'left', fontSize: 12, fontWeight: 700, color: '#475569', borderBottom: '1px solid #e2e8f0' };
const tdStyle = { padding: '10px 12px', fontSize: 13, color: '#374151', verticalAlign: 'middle' };
