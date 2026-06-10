import { useState } from 'react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { getPilotos, getProductos, getGerencias, getEquipos } from '../../data/store.js';
import StateBadge from '../../components/StateBadge.jsx';
import HealthBadge from '../../components/HealthBadge.jsx';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444', '#06b6d4', '#84cc16'];

export default function Monitoreo() {
  const [tab, setTab] = useState('resumen');
  const [filtros, setFiltros] = useState({ estado: '', productoId: '', gerenciaId: '', equipoId: '', salud: '' });

  const pilotos = getPilotos();
  const productos = getProductos();
  const gerencias = getGerencias();
  const equipos = getEquipos();

  const nombre = (lista, id) => lista.find(x => x.id === id)?.nombre || '—';

  const filtrados = pilotos.filter(p =>
    (!filtros.estado || p.estado === filtros.estado) &&
    (!filtros.productoId || p.productoId === filtros.productoId) &&
    (!filtros.gerenciaId || p.gerenciaId === filtros.gerenciaId) &&
    (!filtros.equipoId || p.equipoId === filtros.equipoId) &&
    (!filtros.salud || p.salud === filtros.salud)
  );

  const setFiltro = (k, v) => setFiltros(f => ({ ...f, [k]: v }));

  // Datos para gráficos
  const byEstado = groupBy(pilotos, p => {
    const m = { REGISTRADO: 'Registrado', ENVIADO_A_APROBACION: 'En revisión', APROBADO: 'Aprobado', VIGENTE: 'Vigente', APAGADO: 'Apagado', ESCALADO: 'Escalado' };
    return m[p.estado] || p.estado;
  });
  const bySalud = groupBy(pilotos.filter(p => p.estado === 'VIGENTE'), p => {
    const m = { SALUDABLE: 'Saludable', EN_OBSERVACION: 'En Observación', ALERTA: 'Alerta' };
    return m[p.salud] || p.salud;
  });
  const byGerencia = groupBy(pilotos, p => nombre(gerencias, p.gerenciaId));
  const byProducto = groupBy(pilotos, p => nombre(productos, p.productoId));

  return (
    <div>
      <h2 style={{ fontSize: 20, fontWeight: 700, color: '#1e293b', marginBottom: 16 }}>Monitoreo de Pilotos</h2>

      {/* Tabs */}
      <div style={{ display: 'flex', borderBottom: '2px solid #e2e8f0', marginBottom: 20 }}>
        {[{ key: 'resumen', label: 'Resumen General' }, { key: 'performance', label: 'Performance (Power BI)' }].map(t => (
          <button key={t.key} onClick={() => setTab(t.key)} style={{
            padding: '8px 20px', border: 'none', background: 'none', cursor: 'pointer',
            fontSize: 14, fontWeight: 600,
            color: tab === t.key ? '#2563eb' : '#64748b',
            borderBottom: tab === t.key ? '2px solid #2563eb' : '2px solid transparent',
            marginBottom: -2,
          }}>
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'resumen' && (
        <>
          {/* KPIs */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 20 }}>
            {[
              { label: 'Total pilotos', value: pilotos.length, color: '#3b82f6' },
              { label: 'Vigentes', value: pilotos.filter(p => p.estado === 'VIGENTE').length, color: '#059669' },
              { label: 'Pendientes revisión', value: pilotos.filter(p => p.estado === 'ENVIADO_A_APROBACION').length, color: '#7c3aed' },
              { label: 'En Alerta', value: pilotos.filter(p => p.salud === 'ALERTA').length, color: '#dc2626' },
            ].map(k => (
              <div key={k.label} style={{ background: 'white', borderRadius: 10, border: `1px solid ${k.color}30`, padding: '14px 18px' }}>
                <div style={{ fontSize: 28, fontWeight: 800, color: k.color }}>{k.value}</div>
                <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>{k.label}</div>
              </div>
            ))}
          </div>

          {/* Gráficos */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
            <ChartCard title="Distribución por Estado">
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={byEstado} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70} label={({ name, value }) => `${name}: ${value}`} labelLine={false} fontSize={11}>
                    {byEstado.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </ChartCard>
            <ChartCard title="Salud de Pilotos Vigentes">
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={bySalud} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70} label={({ name, value }) => `${name}: ${value}`} labelLine={false} fontSize={11}>
                    {bySalud.map((_, i) => <Cell key={i} fill={['#16a34a', '#d97706', '#dc2626'][i % 3]} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </ChartCard>
            <ChartCard title="Pilotos por Gerencia">
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={byGerencia} margin={{ left: -10 }}>
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Bar dataKey="value" fill="#3b82f6" name="Pilotos" radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>
            <ChartCard title="Pilotos por Producto">
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={byProducto} margin={{ left: -10 }}>
                  <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Bar dataKey="value" fill="#8b5cf6" name="Pilotos" radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>
          </div>

          {/* Filtros tabla */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
            <select value={filtros.estado} onChange={e => setFiltro('estado', e.target.value)} style={selStyle}>
              <option value="">Todos los estados</option>
              {['REGISTRADO', 'ENVIADO_A_APROBACION', 'APROBADO', 'VIGENTE', 'APAGADO', 'ESCALADO'].map(e => (
                <option key={e} value={e}>{e}</option>
              ))}
            </select>
            <select value={filtros.productoId} onChange={e => setFiltro('productoId', e.target.value)} style={selStyle}>
              <option value="">Todos los productos</option>
              {productos.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
            </select>
            <select value={filtros.gerenciaId} onChange={e => setFiltro('gerenciaId', e.target.value)} style={selStyle}>
              <option value="">Todas las gerencias</option>
              {gerencias.map(g => <option key={g.id} value={g.id}>{g.nombre}</option>)}
            </select>
            <select value={filtros.salud} onChange={e => setFiltro('salud', e.target.value)} style={selStyle}>
              <option value="">Toda la salud</option>
              <option value="SALUDABLE">Saludable</option>
              <option value="EN_OBSERVACION">En Observación</option>
              <option value="ALERTA">Alerta</option>
            </select>
          </div>

          {/* Tabla */}
          <div style={{ background: 'white', borderRadius: 10, border: '1px solid #e2e8f0', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#f8fafc' }}>
                  {['Código', 'Nombre', 'Gerencia', 'Equipo', 'Estado', 'Salud'].map(h => (
                    <th key={h} style={thStyle}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtrados.map((p, i) => (
                  <tr key={p.codigo} style={{ borderTop: '1px solid #f1f5f9', background: i % 2 ? '#fafafa' : 'white' }}>
                    <td style={tdStyle}><span style={{ fontFamily: 'monospace', fontSize: 12, color: '#1d4ed8', fontWeight: 600 }}>{p.codigo}</span></td>
                    <td style={{ ...tdStyle, fontWeight: 500 }}>{p.nombre}</td>
                    <td style={tdStyle}>{nombre(gerencias, p.gerenciaId)}</td>
                    <td style={tdStyle}>{nombre(equipos, p.equipoId)}</td>
                    <td style={tdStyle}><StateBadge estado={p.estado} /></td>
                    <td style={tdStyle}>
                      {['VIGENTE', 'APAGADO', 'ESCALADO'].includes(p.estado)
                        ? <HealthBadge salud={p.salud} />
                        : <span style={{ color: '#94a3b8', fontSize: 12 }}>—</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {tab === 'performance' && (
        <div style={{
          background: 'white', borderRadius: 10, border: '1px solid #e2e8f0',
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          padding: 40, minHeight: 400,
        }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>📊</div>
          <h3 style={{ fontSize: 18, fontWeight: 700, color: '#1e293b', margin: 0 }}>Dashboard Power BI</h3>
          <p style={{ color: '#64748b', fontSize: 14, marginTop: 8, textAlign: 'center', maxWidth: 400 }}>
            El dashboard de performance de pilotos se embebe aquí como iframe.<br />
            Diseñado fuera del site — fuera de alcance de esta versión.
          </p>
          <div style={{
            marginTop: 20, border: '2px dashed #cbd5e1', borderRadius: 8,
            width: '100%', maxWidth: 640, height: 280,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#94a3b8', fontSize: 13, background: '#f8fafc',
          }}>
            [ iframe Power BI aquí ]
          </div>
        </div>
      )}
    </div>
  );
}

function groupBy(arr, keyFn) {
  const map = {};
  arr.forEach(item => {
    const key = keyFn(item);
    map[key] = (map[key] || 0) + 1;
  });
  return Object.entries(map).map(([name, value]) => ({ name, value }));
}

function ChartCard({ title, children }) {
  return (
    <div style={{ background: 'white', borderRadius: 10, border: '1px solid #e2e8f0', padding: '14px 16px' }}>
      <div style={{ fontWeight: 600, fontSize: 13, color: '#374151', marginBottom: 10 }}>{title}</div>
      {children}
    </div>
  );
}

const selStyle = { padding: '7px 10px', border: '1px solid #cbd5e1', borderRadius: 6, fontSize: 13, background: 'white' };
const thStyle = { padding: '10px 12px', textAlign: 'left', fontSize: 12, fontWeight: 700, color: '#475569', borderBottom: '1px solid #e2e8f0' };
const tdStyle = { padding: '10px 12px', fontSize: 13, color: '#374151', verticalAlign: 'middle' };
