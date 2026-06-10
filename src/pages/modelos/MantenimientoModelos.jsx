import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { getModelos, eliminarModelo, getProductos, getCategoriasModelo } from '../../data/store.js';

export default function MantenimientoModelos() {
  const { usuario } = useAuth();
  const navigate = useNavigate();
  const [filtros, setFiltros] = useState({ codigo: '', nombre: '', categoria: '', estado: '', productoId: '' });
  const [refresh, setRefresh] = useState(0);

  const modelos = getModelos();
  const productos = getProductos();
  const categorias = getCategoriasModelo();

  const productoNombre = (id) => productos.find(p => p.id === id)?.nombre || '—';
  const setFiltro = (k, v) => setFiltros(f => ({ ...f, [k]: v }));

  const filtrados = modelos.filter(m =>
    (!filtros.codigo || m.codigo.toLowerCase().includes(filtros.codigo.toLowerCase())) &&
    (!filtros.nombre || m.nombre.toLowerCase().includes(filtros.nombre.toLowerCase())) &&
    (!filtros.categoria || m.categoria === filtros.categoria) &&
    (!filtros.estado || m.estado === filtros.estado) &&
    (!filtros.productoId || m.productoId === filtros.productoId)
  );

  const handleEliminar = (m) => {
    if (confirm(`¿Eliminar el modelo "${m.nombre}" (${m.codigo})? Se marcará como baja lógica.`)) {
      eliminarModelo(m.id, usuario);
      setRefresh(r => r + 1);
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <h2 style={h2}>Mantenimiento de Modelos</h2>
          <p style={{ color: '#64748b', margin: 0, fontSize: 14 }}>{modelos.length} modelos registrados</p>
        </div>
        <button onClick={() => navigate('/modelos/registro')} style={btnPrimary}>+ Registrar Modelo</button>
      </div>

      {/* Filtros */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 14, flexWrap: 'wrap' }}>
        <input placeholder="Código..." value={filtros.codigo} onChange={e => setFiltro('codigo', e.target.value)} style={inputF} />
        <input placeholder="Nombre..." value={filtros.nombre} onChange={e => setFiltro('nombre', e.target.value)} style={inputF} />
        <select value={filtros.categoria} onChange={e => setFiltro('categoria', e.target.value)} style={selF}>
          <option value="">Categoría</option>
          {categorias.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <select value={filtros.estado} onChange={e => setFiltro('estado', e.target.value)} style={selF}>
          <option value="">Estado</option>
          <option value="CHAMPION">Champion</option>
          <option value="CHALLENGER">Challenger</option>
        </select>
        <select value={filtros.productoId} onChange={e => setFiltro('productoId', e.target.value)} style={selF}>
          <option value="">Producto</option>
          {productos.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
        </select>
      </div>

      {/* Tabla */}
      <div style={{ background: 'white', borderRadius: 10, border: '1px solid #e2e8f0', overflow: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#f8fafc' }}>
              {['Código', 'Nombre', 'Categoría', 'Universo', 'Producto', 'Estado', 'Piloto', 'Acciones'].map(h => (
                <th key={h} style={thStyle}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtrados.length === 0 ? (
              <tr>
                <td colSpan={8} style={{ textAlign: 'center', padding: 24, color: '#94a3b8', fontSize: 14 }}>
                  No hay modelos que coincidan con los filtros.
                </td>
              </tr>
            ) : filtrados.map((m, i) => (
              <tr key={m.id} style={{ borderTop: '1px solid #f1f5f9', background: i % 2 ? '#fafafa' : 'white' }}>
                <td style={tdStyle}>
                  <span style={{ fontFamily: 'monospace', fontSize: 12, fontWeight: 700, color: '#1d4ed8' }}>{m.codigo}</span>
                </td>
                <td style={{ ...tdStyle, fontWeight: 500, maxWidth: 200 }}>{m.nombre}</td>
                <td style={tdStyle}>
                  <span style={{ padding: '2px 8px', borderRadius: 8, background: '#f1f5f9', fontSize: 12, color: '#374151' }}>{m.categoria}</span>
                </td>
                <td style={tdStyle}>{m.universo}</td>
                <td style={tdStyle}>{productoNombre(m.productoId)}</td>
                <td style={tdStyle}>
                  <span style={{
                    padding: '2px 10px', borderRadius: 10, fontSize: 12, fontWeight: 700,
                    background: m.estado === 'CHAMPION' ? '#d1fae5' : '#ede9fe',
                    color: m.estado === 'CHAMPION' ? '#059669' : '#7c3aed',
                  }}>
                    {m.estado === 'CHAMPION' ? '♔ Champion' : '⚔ Challenger'}
                  </span>
                </td>
                <td style={tdStyle}>
                  {m.codigoPiloto
                    ? <span style={{ fontFamily: 'monospace', fontSize: 12, color: '#1d4ed8' }}>{m.codigoPiloto}</span>
                    : <span style={{ color: '#94a3b8', fontSize: 12 }}>—</span>}
                </td>
                <td style={{ ...tdStyle, whiteSpace: 'nowrap' }}>
                  <button onClick={() => navigate(`/modelos/editar/${m.id}`)} style={btnSm}>Editar</button>
                  <button onClick={() => handleEliminar(m)} style={{ ...btnSm, marginLeft: 6, background: '#fee2e2', color: '#dc2626' }}>
                    Eliminar
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

const h2 = { fontSize: 20, fontWeight: 700, color: '#1e293b', margin: 0 };
const btnPrimary = { background: '#2563eb', color: 'white', border: 'none', borderRadius: 8, padding: '9px 18px', cursor: 'pointer', fontWeight: 600, fontSize: 14 };
const inputF = { padding: '7px 10px', border: '1px solid #cbd5e1', borderRadius: 6, fontSize: 13 };
const selF = { padding: '7px 10px', border: '1px solid #cbd5e1', borderRadius: 6, fontSize: 13, background: 'white' };
const thStyle = { padding: '10px 12px', textAlign: 'left', fontSize: 12, fontWeight: 700, color: '#475569', borderBottom: '1px solid #e2e8f0' };
const tdStyle = { padding: '10px 12px', fontSize: 13, color: '#374151', verticalAlign: 'middle' };
const btnSm = { padding: '4px 10px', fontSize: 12, borderRadius: 5, border: 'none', background: '#dbeafe', color: '#1d4ed8', cursor: 'pointer', fontWeight: 500 };
