import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { getSolicitudesPendientes, confirmarSolicitud, rechazarSolicitud, getPilotoByCode, getUsuarios } from '../../data/store.js';
import StateBadge from '../../components/StateBadge.jsx';

export default function BandejaSolicitudes() {
  const { usuario } = useAuth();
  const [refresh, setRefresh] = useState(0);
  const solicitudes = getSolicitudesPendientes();
  const usuarios = getUsuarios();

  const nombreUsuario = (id) => usuarios.find(u => u.id === id)?.nombre || id;

  const handleConfirmar = (id) => {
    if (confirm('¿Confirmar esta solicitud? Esta acción cambiará el estado del piloto y liberará sus recursos.')) {
      confirmarSolicitud(id, usuario);
      setRefresh(r => r + 1);
    }
  };

  const handleRechazar = (id) => {
    if (confirm('¿Rechazar esta solicitud? El piloto no cambiará de estado y el registrador podrá hacer una nueva solicitud.')) {
      rechazarSolicitud(id, usuario);
      setRefresh(r => r + 1);
    }
  };

  return (
    <div>
      <h2 style={{ fontSize: 20, fontWeight: 700, color: '#1e293b', marginBottom: 6 }}>Bandeja de Solicitudes</h2>
      <p style={{ color: '#64748b', fontSize: 14, marginBottom: 20 }}>
        {solicitudes.length} solicitud{solicitudes.length !== 1 ? 'es' : ''} pendiente{solicitudes.length !== 1 ? 's' : ''}
      </p>

      {solicitudes.length === 0 ? (
        <div style={{ background: 'white', borderRadius: 10, border: '1px solid #e2e8f0', padding: 32, textAlign: 'center', color: '#94a3b8' }}>
          No hay solicitudes pendientes de resolución.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {solicitudes.map(s => {
            const piloto = getPilotoByCode(s.pilotoCodigo);
            return (
              <div key={s.id} style={{
                background: 'white', borderRadius: 10, border: '1px solid #e2e8f0',
                padding: '16px 20px',
                borderLeft: `4px solid ${s.tipo === 'APAGADO' ? '#dc2626' : '#0284c7'}`,
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                  <div>
                    <span style={{
                      padding: '2px 10px', borderRadius: 10, fontSize: 12, fontWeight: 700,
                      background: s.tipo === 'APAGADO' ? '#fee2e2' : '#e0f2fe',
                      color: s.tipo === 'APAGADO' ? '#dc2626' : '#0284c7',
                      marginRight: 8,
                    }}>
                      {s.tipo}
                    </span>
                    <span style={{ fontFamily: 'monospace', fontSize: 13, fontWeight: 700, color: '#1d4ed8' }}>{s.pilotoCodigo}</span>
                  </div>
                  <span style={{ fontSize: 12, color: '#94a3b8', fontFamily: 'monospace' }}>{s.fecha}</span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 12 }}>
                  <div>
                    <span style={labelS}>Piloto:</span>
                    <span style={{ fontSize: 13, fontWeight: 600 }}> {piloto?.nombre}</span>
                  </div>
                  <div>
                    <span style={labelS}>Estado actual:</span>
                    <span> </span><StateBadge estado={piloto?.estado} />
                  </div>
                  <div>
                    <span style={labelS}>Solicitante:</span>
                    <span style={{ fontSize: 13 }}> {nombreUsuario(s.solicitanteId)}</span>
                  </div>
                </div>

                {s.motivo && (
                  <div style={{ background: '#f8fafc', borderRadius: 6, padding: '8px 12px', marginBottom: 12, fontSize: 13, color: '#374151' }}>
                    <strong style={{ fontSize: 11, color: '#64748b', display: 'block', marginBottom: 2 }}>MOTIVO:</strong>
                    {s.motivo}
                  </div>
                )}

                {s.adjuntoNombre && (
                  <div style={{ background: '#f0fdf4', borderRadius: 6, padding: '8px 12px', marginBottom: 12, fontSize: 13, color: '#15803d' }}>
                    📎 Adjunto: {s.adjuntoNombre}
                  </div>
                )}

                <div style={{ display: 'flex', gap: 8 }}>
                  <button onClick={() => handleConfirmar(s.id)} style={btnConfirmar}>
                    ✓ Confirmar {s.tipo === 'APAGADO' ? 'Apagado' : 'Escalado'}
                  </button>
                  <button onClick={() => handleRechazar(s.id)} style={btnRechazar}>
                    ✕ Rechazar solicitud
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

const labelS = { fontSize: 12, color: '#64748b', fontWeight: 600 };
const btnConfirmar = { background: '#059669', color: 'white', border: 'none', borderRadius: 8, padding: '8px 18px', cursor: 'pointer', fontWeight: 700, fontSize: 13 };
const btnRechazar = { background: '#fee2e2', color: '#dc2626', border: '1px solid #fecaca', borderRadius: 8, padding: '8px 18px', cursor: 'pointer', fontWeight: 600, fontSize: 13 };
