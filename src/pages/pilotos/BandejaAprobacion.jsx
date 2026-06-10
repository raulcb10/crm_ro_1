import { useNavigate } from 'react-router-dom';
import { getPilotosEnviados, getProductos, getGerencias, getEquipos } from '../../data/store.js';

export default function BandejaAprobacion() {
  const navigate = useNavigate();
  const pilotos = getPilotosEnviados();
  const productos = getProductos();
  const gerencias = getGerencias();
  const equipos = getEquipos();

  const nombre = (lista, id) => lista.find(x => x.id === id)?.nombre || '—';

  return (
    <div>
      <h2 style={{ fontSize: 20, fontWeight: 700, color: '#1e293b', marginBottom: 6 }}>Bandeja de Aprobación</h2>
      <p style={{ color: '#64748b', fontSize: 14, marginBottom: 20 }}>
        {pilotos.length} piloto{pilotos.length !== 1 ? 's' : ''} pendiente{pilotos.length !== 1 ? 's' : ''} de revisión
      </p>

      {pilotos.length === 0 ? (
        <div style={{ background: 'white', borderRadius: 10, border: '1px solid #e2e8f0', padding: 32, textAlign: 'center', color: '#94a3b8' }}>
          No hay pilotos pendientes de aprobación.
        </div>
      ) : (
        <div style={{ background: 'white', borderRadius: 10, border: '1px solid #e2e8f0', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f8fafc' }}>
                {['Código', 'Nombre del Experimento', 'Producto', 'Gerencia', 'Equipo', 'Fecha envío', 'Acción'].map(h => (
                  <th key={h} style={thStyle}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {pilotos.map((p, i) => (
                <tr key={p.codigo} style={{ borderTop: '1px solid #f1f5f9', background: i % 2 ? '#fafafa' : 'white' }}>
                  <td style={tdStyle}>
                    <span style={{ fontFamily: 'monospace', fontSize: 12, color: '#1d4ed8', fontWeight: 700 }}>{p.codigo}</span>
                  </td>
                  <td style={{ ...tdStyle, fontWeight: 500, maxWidth: 220 }}>{p.nombre}</td>
                  <td style={tdStyle}>{nombre(productos, p.productoId)}</td>
                  <td style={tdStyle}>{nombre(gerencias, p.gerenciaId)}</td>
                  <td style={tdStyle}>{nombre(equipos, p.equipoId)}</td>
                  <td style={tdStyle}><span style={{ fontFamily: 'monospace', fontSize: 12 }}>{p.fechaEnvio}</span></td>
                  <td style={tdStyle}>
                    <button onClick={() => navigate(`/pilotos/detalle/${p.codigo}`)} style={btnAbrir}>
                      Abrir →
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

const thStyle = { padding: '10px 12px', textAlign: 'left', fontSize: 12, fontWeight: 700, color: '#475569', borderBottom: '1px solid #e2e8f0' };
const tdStyle = { padding: '10px 12px', fontSize: 13, color: '#374151', verticalAlign: 'middle' };
const btnAbrir = { background: '#dbeafe', color: '#1d4ed8', border: 'none', borderRadius: 6, padding: '6px 14px', cursor: 'pointer', fontWeight: 600, fontSize: 13 };
