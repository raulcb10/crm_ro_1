import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { getPilotoByCode, crearSolicitud, getSolicitudesByPiloto } from '../../data/store.js';
import StateBadge from '../../components/StateBadge.jsx';

export default function SolicitarApagado() {
  const { codigo } = useParams();
  const { usuario } = useAuth();
  const navigate = useNavigate();
  const [motivo, setMotivo] = useState('');
  const [error, setError] = useState('');

  const piloto = getPilotoByCode(codigo);
  const tienePendiente = getSolicitudesByPiloto(codigo).some(s => s.estado === 'PENDIENTE');

  if (!piloto) return <div style={{ padding: 24, color: '#dc2626' }}>Piloto no encontrado.</div>;
  if (!['APROBADO', 'VIGENTE'].includes(piloto.estado)) {
    return <div style={{ padding: 24, color: '#dc2626' }}>El piloto no está en estado válido para solicitar apagado.</div>;
  }

  const handleEnviar = () => {
    if (!motivo.trim()) { setError('El motivo es obligatorio.'); return; }
    crearSolicitud({ pilotoCodigo: codigo, tipo: 'APAGADO', motivo }, usuario);
    navigate('/pilotos/solicitudes');
  };

  return (
    <div style={{ maxWidth: 600 }}>
      <button onClick={() => navigate('/pilotos/mis-pilotos')} style={btnBack}>← Mis Pilotos</button>
      <h2 style={h2}>Solicitar Apagado</h2>

      <div style={{ background: 'white', borderRadius: 10, border: '1px solid #e2e8f0', padding: 20, marginBottom: 16 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 12 }}>
          <div><span style={labelS}>Código:</span> <strong style={{ fontFamily: 'monospace' }}>{codigo}</strong></div>
          <div><span style={labelS}>Estado:</span> <StateBadge estado={piloto.estado} /></div>
          <div style={{ gridColumn: '1/-1' }}><span style={labelS}>Nombre:</span> {piloto.nombre}</div>
        </div>

        {tienePendiente ? (
          <div style={{ background: '#fef3c7', border: '1px solid #fcd34d', borderRadius: 8, padding: 12, color: '#92400e', fontSize: 13 }}>
            Ya existe una solicitud pendiente para este piloto. Espera la resolución de Gobierno.
          </div>
        ) : (
          <>
            <label style={{ fontSize: 13, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 4 }}>
              Motivo del apagado *
            </label>
            <textarea
              value={motivo}
              onChange={e => { setMotivo(e.target.value); setError(''); }}
              rows={4}
              placeholder="Describe el motivo por el que se solicita el apagado del piloto..."
              style={{ width: '100%', padding: '8px 10px', border: '1px solid #cbd5e1', borderRadius: 6, fontSize: 13, resize: 'vertical', boxSizing: 'border-box' }}
            />
            {error && <div style={{ color: '#dc2626', fontSize: 12, marginTop: 4 }}>{error}</div>}

            <div style={{ background: '#fef9c3', border: '1px solid #fde047', borderRadius: 6, padding: '8px 12px', marginTop: 12, fontSize: 12, color: '#854d0e' }}>
              ℹ️ Esta solicitud no cambia el estado del piloto. Gobierno deberá confirmarla para efectuar el apagado.
            </div>

            <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
              <button onClick={handleEnviar} style={btnDanger}>Enviar solicitud de apagado</button>
              <button onClick={() => navigate('/pilotos/mis-pilotos')} style={btnCancel}>Cancelar</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

const h2 = { fontSize: 20, fontWeight: 700, color: '#1e293b', margin: '4px 0 16px' };
const btnBack = { background: 'none', border: 'none', color: '#2563eb', cursor: 'pointer', fontSize: 13, padding: 0, marginBottom: 4 };
const labelS = { fontSize: 12, color: '#64748b', fontWeight: 600 };
const btnDanger = { background: '#dc2626', color: 'white', border: 'none', borderRadius: 8, padding: '9px 20px', cursor: 'pointer', fontWeight: 600, fontSize: 14 };
const btnCancel = { background: '#f1f5f9', color: '#475569', border: '1px solid #e2e8f0', borderRadius: 8, padding: '9px 20px', cursor: 'pointer', fontSize: 14 };
