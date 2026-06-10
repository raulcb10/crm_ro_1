import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import {
  getPilotosByRegistrador, getProductos, getGerencias, getEquipos,
  getSolicitudesByPiloto,
} from '../../data/store.js';
import StateBadge from '../../components/StateBadge.jsx';
import HealthBadge from '../../components/HealthBadge.jsx';

export default function MisPilotos() {
  const { usuario } = useAuth();
  const navigate = useNavigate();
  const [filtros, setFiltros] = useState({ estado: '', productoId: '', gerenciaId: '', equipoId: '', salud: '' });

  const pilotos = getPilotosByRegistrador(usuario.id);
  const productos = getProductos();
  const gerencias = getGerencias();
  const equipos = getEquipos();

  const productoNombre = (id) => productos.find(p => p.id === id)?.nombre || '—';
  const gerenciaNombre = (id) => gerencias.find(g => g.id === id)?.nombre || '—';
  const equipoNombre = (id) => equipos.find(e => e.id === id)?.nombre || '—';

  const tieneSolicitudPendiente = (codigo) =>
    getSolicitudesByPiloto(codigo).some(s => s.estado === 'PENDIENTE');

  const filtrados = pilotos.filter(p =>
    (!filtros.estado || p.estado === filtros.estado) &&
    (!filtros.productoId || p.productoId === filtros.productoId) &&
    (!filtros.gerenciaId || p.gerenciaId === filtros.gerenciaId) &&
    (!filtros.equipoId || p.equipoId === filtros.equipoId) &&
    (!filtros.salud || p.salud === filtros.salud)
  );

  const setFiltro = (k, v) => setFiltros(f => ({ ...f, [k]: v }));

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <h2 style={h2}>Mis Pilotos</h2>
          <p style={{ color: '#64748b', margin: 0, fontSize: 14 }}>
            {pilotos.length} piloto{pilotos.length !== 1 ? 's' : ''} registrado{pilotos.length !== 1 ? 's' : ''}
          </p>
        </div>
        <button onClick={() => navigate('/pilotos/nuevo')} style={btnPrimary}>
          + Nuevo Piloto
        </button>
      </div>

      {/* Filtros */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
        <select value={filtros.estado} onChange={e => setFiltro('estado', e.target.value)} style={selectStyle}>
          <option value="">Todos los estados</option>
          {ESTADOS.map(e => <option key={e.value} value={e.value}>{e.label}</option>)}
        </select>
        <select value={filtros.productoId} onChange={e => setFiltro('productoId', e.target.value)} style={selectStyle}>
          <option value="">Todos los productos</option>
          {productos.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
        </select>
        <select value={filtros.gerenciaId} onChange={e => setFiltro('gerenciaId', e.target.value)} style={selectStyle}>
          <option value="">Todas las gerencias</option>
          {gerencias.map(g => <option key={g.id} value={g.id}>{g.nombre}</option>)}
        </select>
        <select value={filtros.equipoId} onChange={e => setFiltro('equipoId', e.target.value)} style={selectStyle}>
          <option value="">Todos los equipos</option>
          {equipos.map(e => <option key={e.id} value={e.id}>{e.nombre}</option>)}
        </select>
        <select value={filtros.salud} onChange={e => setFiltro('salud', e.target.value)} style={selectStyle}>
          <option value="">Toda la salud</option>
          <option value="SALUDABLE">Saludable</option>
          <option value="EN_OBSERVACION">En Observación</option>
          <option value="ALERTA">Alerta</option>
        </select>
        {Object.values(filtros).some(Boolean) && (
          <button onClick={() => setFiltros({ estado: '', productoId: '', gerenciaId: '', equipoId: '', salud: '' })}
            style={{ ...selectStyle, color: '#dc2626', cursor: 'pointer' }}>
            Limpiar filtros ✕
          </button>
        )}
      </div>

      {/* Tabla */}
      <div style={{ background: 'white', borderRadius: 10, border: '1px solid #e2e8f0', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#f8fafc' }}>
              {['Código', 'Nombre', 'Producto', 'Gerencia', 'Equipo', 'Estado', 'Salud', 'F. Inicio', 'F. Fin', 'Acciones'].map(h => (
                <th key={h} style={thStyle}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtrados.length === 0 ? (
              <tr><td colSpan={10} style={{ textAlign: 'center', padding: 24, color: '#94a3b8', fontSize: 14 }}>
                No hay pilotos que coincidan con los filtros.
              </td></tr>
            ) : filtrados.map((p, i) => (
              <tr key={p.codigo} style={{ background: i % 2 === 0 ? 'white' : '#fafafa', borderTop: '1px solid #f1f5f9' }}>
                <td style={tdStyle}>
                  <span style={{ fontFamily: 'monospace', fontSize: 12, color: '#1d4ed8', fontWeight: 600 }}>
                    {p.codigo}
                  </span>
                </td>
                <td style={{ ...tdStyle, maxWidth: 200 }}>
                  <div style={{ fontWeight: 500, fontSize: 13 }}>{p.nombre}</div>
                  {p.comentarioDevolucion && (
                    <div style={{ fontSize: 11, color: '#dc2626', marginTop: 2 }}>
                      ↩ Devuelto con comentario
                    </div>
                  )}
                </td>
                <td style={tdStyle}>{productoNombre(p.productoId)}</td>
                <td style={tdStyle}>{gerenciaNombre(p.gerenciaId)}</td>
                <td style={tdStyle}>{equipoNombre(p.equipoId)}</td>
                <td style={tdStyle}><StateBadge estado={p.estado} /></td>
                <td style={tdStyle}>
                  {['VIGENTE', 'APAGADO', 'ESCALADO'].includes(p.estado)
                    ? <HealthBadge salud={p.salud} />
                    : <span style={{ color: '#94a3b8', fontSize: 12 }}>—</span>}
                </td>
                <td style={tdStyle}><span style={dateStyle}>{fmt(p.fechaInicio)}</span></td>
                <td style={tdStyle}><span style={dateStyle}>{fmt(p.fechaFin)}</span></td>
                <td style={{ ...tdStyle, whiteSpace: 'nowrap' }}>
                  {p.estado === 'REGISTRADO' && (
                    <button onClick={() => navigate(`/pilotos/editar/${p.codigo}`)} style={btnSm}>
                      Editar
                    </button>
                  )}
                  {['APROBADO', 'VIGENTE'].includes(p.estado) && !tieneSolicitudPendiente(p.codigo) && (
                    <>
                      <button onClick={() => navigate(`/pilotos/apagado/${p.codigo}`)} style={{ ...btnSm, background: '#fee2e2', color: '#dc2626' }}>
                        Apagar
                      </button>
                      <button onClick={() => navigate(`/pilotos/escalado/${p.codigo}`)} style={{ ...btnSm, background: '#e0f2fe', color: '#0284c7', marginLeft: 4 }}>
                        Escalar
                      </button>
                    </>
                  )}
                  {tieneSolicitudPendiente(p.codigo) && (
                    <span style={{ fontSize: 11, color: '#d97706', fontStyle: 'italic' }}>
                      Solicitud pendiente
                    </span>
                  )}
                  <button onClick={() => navigate(`/pilotos/ver/${p.codigo}`)} style={{ ...btnSm, marginLeft: 4, background: '#f1f5f9', color: '#475569' }}>
                    Ver
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const ESTADOS = [
  { value: 'REGISTRADO', label: 'Registrado' },
  { value: 'ENVIADO_A_APROBACION', label: 'En revisión' },
  { value: 'APROBADO', label: 'Aprobado' },
  { value: 'VIGENTE', label: 'Vigente' },
  { value: 'APAGADO', label: 'Apagado' },
  { value: 'ESCALADO', label: 'Escalado' },
];

const fmt = (d) => d ? new Date(d + 'T00:00:00').toLocaleDateString('es-CO') : '—';
const h2 = { fontSize: 20, fontWeight: 700, color: '#1e293b', margin: 0 };
const btnPrimary = {
  background: '#2563eb', color: 'white', border: 'none', borderRadius: 8,
  padding: '9px 18px', cursor: 'pointer', fontWeight: 600, fontSize: 14,
};
const selectStyle = {
  padding: '7px 10px', border: '1px solid #cbd5e1', borderRadius: 6,
  fontSize: 13, background: 'white', color: '#374151',
};
const thStyle = {
  padding: '10px 12px', textAlign: 'left', fontSize: 12, fontWeight: 700,
  color: '#475569', borderBottom: '1px solid #e2e8f0',
};
const tdStyle = { padding: '10px 12px', fontSize: 13, color: '#374151', verticalAlign: 'middle' };
const dateStyle = { fontFamily: 'monospace', fontSize: 12, color: '#374151' };
const btnSm = {
  padding: '4px 10px', fontSize: 12, borderRadius: 5, border: 'none',
  background: '#dbeafe', color: '#1d4ed8', cursor: 'pointer', fontWeight: 500,
};
