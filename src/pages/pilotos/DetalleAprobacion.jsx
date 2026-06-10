import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import {
  getPilotoByCode, aprobarPiloto, devolverPiloto,
  actualizarUniversoVariablesGobierno, ajustarSaludManual,
  getProductos, getSubproductos, getGerencias, getEquipos,
  getGrilla, getVariables, getSlotsOcupados, getVariablesEnUso,
  getBitacoraByEntidad,
} from '../../data/store.js';
import SlotGrid from '../../components/SlotGrid.jsx';
import VariablePicker from '../../components/VariablePicker.jsx';
import StateBadge from '../../components/StateBadge.jsx';
import HealthBadge from '../../components/HealthBadge.jsx';

export default function DetalleAprobacion() {
  const { codigo } = useParams();
  const { usuario } = useAuth();
  const navigate = useNavigate();

  const piloto = getPilotoByCode(codigo);

  const [slots, setSlots] = useState(piloto?.slots || []);
  const [variables, setVariables] = useState(piloto?.variables || []);
  const [comentario, setComentario] = useState('');
  const [errorComentario, setErrorComentario] = useState('');
  const [saludManual, setSaludManual] = useState(piloto?.salud || 'SALUDABLE');
  const [mostrarBitacora, setMostrarBitacora] = useState(false);

  const productos = getProductos();
  const gerencias = getGerencias();
  const equipos = getEquipos();
  const grilla = getGrilla();
  const todasVars = getVariables();

  if (!piloto) return <div style={{ padding: 24, color: '#dc2626' }}>Piloto no encontrado.</div>;

  const slotsOcupados = piloto.universo === 'Producto' && piloto.productoId
    ? getSlotsOcupados(piloto.productoId, codigo)
    : [];
  const varsEnUso = getVariablesEnUso(codigo);

  const nombre = (lista, id) => lista.find(x => x.id === id)?.nombre || '—';
  const sub = getSubproductos(piloto.productoId);

  const esEnviado = piloto.estado === 'ENVIADO_A_APROBACION';

  const handleAprobar = () => {
    actualizarUniversoVariablesGobierno(codigo, slots, variables, usuario);
    aprobarPiloto(codigo, usuario);
    navigate('/pilotos/bandeja-aprobacion');
  };

  const handleDevolver = () => {
    if (!comentario.trim()) { setErrorComentario('El comentario es obligatorio para devolver.'); return; }
    actualizarUniversoVariablesGobierno(codigo, slots, variables, usuario);
    devolverPiloto(codigo, comentario, usuario);
    navigate('/pilotos/bandeja-aprobacion');
  };

  const handleAjustarSalud = () => {
    ajustarSaludManual(codigo, saludManual, usuario);
    alert(`Salud ajustada a ${saludManual}`);
  };

  const bitacora = getBitacoraByEntidad(codigo);

  return (
    <div style={{ maxWidth: 900 }}>
      <button onClick={() => navigate('/pilotos/bandeja-aprobacion')} style={btnBack}>← Bandeja de Aprobación</button>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h2 style={h2}>Revisión de Piloto — {codigo}</h2>
        <div style={{ display: 'flex', gap: 8 }}>
          <StateBadge estado={piloto.estado} />
          <HealthBadge salud={piloto.salud} />
        </div>
      </div>

      {/* Datos generales (solo lectura) */}
      <Section title="Datos Generales (solo lectura)">
        <div style={grid2}>
          <Info label="Nombre" value={piloto.nombre} />
          <Info label="Universo" value={piloto.universo} />
          <Info label="Producto" value={nombre(productos, piloto.productoId)} />
          <Info label="Subproducto" value={nombre(sub, piloto.subproductoId)} />
          <Info label="Gerencia" value={nombre(gerencias, piloto.gerenciaId)} />
          <Info label="Equipo" value={nombre(equipos, piloto.equipoId)} />
          <Info label="Fecha Inicio" value={piloto.fechaInicio || '—'} />
          <Info label="Fecha Fin" value={piloto.fechaFin || '—'} />
          <Info label="Tamaño de muestra" value={piloto.tamanoMuestra?.toLocaleString('es-CO') || '—'} />
          <Info label="Distribución control" value={piloto.distribucionControl ? `${piloto.distribucionControl}% control` : '—'} />
          <Info label="Adjunto" value={piloto.adjuntoNombre ? `📎 ${piloto.adjuntoNombre}` : '—'} />
        </div>
        <Info label="Descripción / Hipótesis" value={piloto.descripcion} style={{ marginTop: 10 }} full />
      </Section>

      {/* Métricas (solo lectura) */}
      <Section title="Métricas de Éxito (solo lectura)">
        {piloto.metricas.length === 0 ? (
          <span style={{ color: '#94a3b8', fontSize: 13 }}>Sin métricas.</span>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ background: '#f8fafc' }}>
                {['Nombre', 'Tipo', 'Límite', 'Esperado'].map(h => (
                  <th key={h} style={{ padding: '6px 10px', textAlign: 'left', fontWeight: 600, color: '#374151', borderBottom: '1px solid #e2e8f0' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {piloto.metricas.map((m, i) => (
                <tr key={i} style={{ borderTop: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '7px 10px' }}>{m.nombre}</td>
                  <td style={{ padding: '7px 10px' }}>{m.tipo}</td>
                  <td style={{ padding: '7px 10px', fontFamily: 'monospace' }}>{m.limite}</td>
                  <td style={{ padding: '7px 10px', fontFamily: 'monospace' }}>{m.esperado}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Section>

      {/* Universo y variables — EDITABLES por Gobierno (RN-06) */}
      <Section title="Universo y Variables (editable por Gobierno — RN-06)">
        {!esEnviado && (
          <div style={{ background: '#fef9c3', border: '1px solid #fde047', borderRadius: 6, padding: '8px 12px', marginBottom: 12, fontSize: 12, color: '#854d0e' }}>
            El piloto ya no está en estado "Enviado a aprobación". Esta vista es de solo lectura.
          </div>
        )}
        <div style={{ marginBottom: 16 }}>
          <label style={labelS}>Grilla de Slots {piloto.universo === 'Producto' ? `(Producto: ${nombre(productos, piloto.productoId)})` : '(Cliente)'}</label>
          <SlotGrid
            filas={grilla.filas} columnas={grilla.columnas}
            ocupados={slotsOcupados} seleccionados={slots}
            onChange={setSlots} readOnly={!esEnviado}
          />
        </div>
        <div>
          <label style={labelS}>Variables</label>
          <VariablePicker
            todas={todasVars} enUso={varsEnUso}
            seleccionadas={variables} onChange={setVariables}
            readOnly={!esEnviado}
          />
        </div>
      </Section>

      {/* Ajuste de salud (gobierno puede hacer siempre) */}
      {['VIGENTE'].includes(piloto.estado) && (
        <Section title="Ajuste Manual de Salud (Gobierno)">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <select value={saludManual} onChange={e => setSaludManual(e.target.value)}
              style={{ padding: '7px 10px', border: '1px solid #cbd5e1', borderRadius: 6, fontSize: 13 }}>
              <option value="SALUDABLE">Saludable</option>
              <option value="EN_OBSERVACION">En Observación</option>
              <option value="ALERTA">Alerta</option>
            </select>
            <button onClick={handleAjustarSalud} style={btnSalud}>Aplicar ajuste manual</button>
            {piloto.saludManual && (
              <span style={{ fontSize: 12, color: '#d97706', fontStyle: 'italic' }}>Override manual activo</span>
            )}
          </div>
        </Section>
      )}

      {/* Acciones de aprobación */}
      {esEnviado && (
        <div style={{ background: 'white', borderRadius: 10, border: '1px solid #e2e8f0', padding: 16, marginBottom: 16 }}>
          <div style={{ marginBottom: 12 }}>
            <label style={{ fontSize: 13, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 6 }}>
              Comentario / Observación (obligatorio para Devolver)
            </label>
            <textarea
              value={comentario}
              onChange={e => { setComentario(e.target.value); setErrorComentario(''); }}
              rows={3}
              placeholder="Escribe el comentario de devolución..."
              style={{ width: '100%', padding: '8px 10px', border: '1px solid #cbd5e1', borderRadius: 6, fontSize: 13, resize: 'vertical', boxSizing: 'border-box' }}
            />
            {errorComentario && <div style={{ color: '#dc2626', fontSize: 12, marginTop: 4 }}>{errorComentario}</div>}
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button onClick={handleAprobar} style={btnAprobar}>✓ Aprobar</button>
            <button onClick={handleDevolver} style={btnDevolver}>↩ Devolver</button>
          </div>
        </div>
      )}

      {/* Bitácora */}
      <div style={{ marginBottom: 24 }}>
        <button onClick={() => setMostrarBitacora(v => !v)} style={btnToggleBit}>
          {mostrarBitacora ? '▲' : '▼'} Bitácora ({bitacora.length})
        </button>
        {mostrarBitacora && (
          <div style={{ background: 'white', borderRadius: 8, border: '1px solid #e2e8f0', marginTop: 8, overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
              <thead>
                <tr style={{ background: '#f8fafc' }}>
                  {['Fecha/Hora', 'Usuario', 'Rol', 'Acción', 'Antes', 'Después'].map(h => (
                    <th key={h} style={{ padding: '8px 10px', textAlign: 'left', fontWeight: 600, color: '#475569', borderBottom: '1px solid #e2e8f0' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {bitacora.map(b => (
                  <tr key={b.id} style={{ borderTop: '1px solid #f8fafc' }}>
                    <td style={{ padding: '7px 10px', fontFamily: 'monospace' }}>{new Date(b.fechaHora).toLocaleString('es-CO')}</td>
                    <td style={{ padding: '7px 10px' }}>{b.usuarioNombre}</td>
                    <td style={{ padding: '7px 10px', color: '#64748b' }}>{b.rol}</td>
                    <td style={{ padding: '7px 10px', fontWeight: 600 }}>{b.accion}</td>
                    <td style={{ padding: '7px 10px', color: '#6b7280' }}>{b.antes || '—'}</td>
                    <td style={{ padding: '7px 10px', color: '#374151' }}>{b.despues || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div style={{ background: 'white', borderRadius: 10, border: '1px solid #e2e8f0', marginBottom: 16, overflow: 'hidden' }}>
      <div style={{ background: '#f8fafc', padding: '10px 16px', borderBottom: '1px solid #e2e8f0' }}>
        <span style={{ fontWeight: 700, fontSize: 14, color: '#1e293b' }}>{title}</span>
      </div>
      <div style={{ padding: 16 }}>{children}</div>
    </div>
  );
}

function Info({ label, value, full, style }) {
  return (
    <div style={{ gridColumn: full ? '1/-1' : undefined, ...style }}>
      <span style={{ fontSize: 11, fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</span>
      <div style={{ fontSize: 13, color: '#1e293b', marginTop: 2, lineHeight: 1.5 }}>{value || '—'}</div>
    </div>
  );
}

const grid2 = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 };
const h2 = { fontSize: 20, fontWeight: 700, color: '#1e293b', margin: '4px 0 0' };
const labelS = { fontSize: 12, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 6 };
const btnBack = { background: 'none', border: 'none', color: '#2563eb', cursor: 'pointer', fontSize: 13, padding: 0, marginBottom: 4 };
const btnAprobar = { background: '#059669', color: 'white', border: 'none', borderRadius: 8, padding: '9px 22px', cursor: 'pointer', fontWeight: 700, fontSize: 14 };
const btnDevolver = { background: '#f59e0b', color: 'white', border: 'none', borderRadius: 8, padding: '9px 22px', cursor: 'pointer', fontWeight: 700, fontSize: 14 };
const btnSalud = { background: '#7c3aed', color: 'white', border: 'none', borderRadius: 6, padding: '7px 14px', cursor: 'pointer', fontSize: 13, fontWeight: 600 };
const btnToggleBit = { background: '#f1f5f9', border: '1px solid #e2e8f0', borderRadius: 6, padding: '5px 12px', cursor: 'pointer', fontSize: 13, color: '#475569' };
