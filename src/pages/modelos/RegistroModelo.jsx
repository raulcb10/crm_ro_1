import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import {
  getProductos, getSubproductos, getCategoriasModelo,
  registrarModelo, actualizarModelo, getModeloById,
  isCodigoModeloUnique, isPilotoAsociadoAModelo,
  getPilotoByCode,
} from '../../data/store.js';

const EMPTY = {
  categoria: '', universo: '', productoId: '', subproductoId: '',
  codigo: '', nombre: '', descripcion: '', estado: '', codigoPiloto: '',
};

export default function RegistroModelo() {
  const { usuario } = useAuth();
  const navigate = useNavigate();
  const { id } = useParams();
  const esEdicion = !!id;

  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [msg, setMsg] = useState(null);

  const productos = getProductos();
  const categorias = getCategoriasModelo();

  useEffect(() => {
    if (esEdicion) {
      const m = getModeloById(id);
      if (m) setForm({ ...EMPTY, ...m });
    }
  }, [id]);

  const subproductos = getSubproductos(form.productoId);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const setUniverso = (v) => setForm(f => ({ ...f, universo: v, productoId: '', subproductoId: '' }));
  const setProducto = (v) => setForm(f => ({ ...f, productoId: v, subproductoId: '' }));

  function validar() {
    const err = {};
    if (!form.categoria) err.categoria = 'Obligatorio';
    if (!form.universo) err.universo = 'Obligatorio';
    if (form.universo === 'Producto') {
      if (!form.productoId) err.productoId = 'Obligatorio cuando Universo = Producto';
      if (!form.subproductoId) err.subproductoId = 'Obligatorio cuando Universo = Producto';
    }
    if (!form.codigo.trim()) {
      err.codigo = 'Obligatorio';
    } else if (!isCodigoModeloUnique(form.codigo.trim(), esEdicion ? id : null)) {
      err.codigo = 'Ya existe un modelo con este código';
    }
    if (!form.nombre.trim()) err.nombre = 'Obligatorio';
    if (!form.descripcion?.trim()) err.descripcion = 'Obligatorio';
    if (!form.estado) err.estado = 'Obligatorio';

    if (form.estado === 'CHALLENGER') {
      if (!form.codigoPiloto?.trim()) {
        err.codigoPiloto = 'Obligatorio para modelos Challenger';
      } else {
        const piloto = getPilotoByCode(form.codigoPiloto.trim());
        if (!piloto) {
          err.codigoPiloto = `No existe un piloto con código "${form.codigoPiloto.trim()}"`;
        } else if (!['APROBADO', 'VIGENTE'].includes(piloto.estado)) {
          err.codigoPiloto = `El piloto "${form.codigoPiloto.trim()}" está en estado "${piloto.estado}". Debe estar Aprobado o Vigente.`;
        } else if (isPilotoAsociadoAModelo(form.codigoPiloto.trim(), esEdicion ? id : null)) {
          err.codigoPiloto = `El piloto "${form.codigoPiloto.trim()}" ya está asociado a otro modelo Challenger.`;
        }
      }
    }

    return err;
  }

  const handleSubmit = () => {
    const err = validar();
    setErrors(err);
    if (Object.keys(err).length > 0) return;

    const datos = {
      ...form,
      codigo: form.codigo.trim(),
      nombre: form.nombre.trim(),
      descripcion: form.descripcion?.trim(),
      codigoPiloto: form.estado === 'CHALLENGER' ? form.codigoPiloto.trim() : null,
      productoId: form.universo === 'Producto' ? form.productoId : null,
      subproductoId: form.universo === 'Producto' ? form.subproductoId : null,
    };

    if (esEdicion) {
      actualizarModelo(id, datos, usuario);
      setMsg({ type: 'success', text: 'Modelo actualizado correctamente.' });
    } else {
      const nuevoId = registrarModelo(datos, usuario);
      setMsg({ type: 'success', text: `Modelo registrado correctamente. ID: ${nuevoId}` });
      setTimeout(() => navigate('/modelos/mantenimiento'), 1200);
    }
  };

  return (
    <div style={{ maxWidth: 680 }}>
      <button onClick={() => navigate('/modelos/mantenimiento')} style={btnBack}>← Mantenimiento</button>
      <h2 style={h2}>{esEdicion ? 'Editar Modelo' : 'Registrar Nuevo Modelo'}</h2>

      {msg && (
        <div style={{
          padding: '10px 14px', borderRadius: 8, marginBottom: 16,
          background: msg.type === 'success' ? '#f0fdf4' : '#fef2f2',
          border: `1px solid ${msg.type === 'success' ? '#86efac' : '#fecaca'}`,
          color: msg.type === 'success' ? '#15803d' : '#dc2626', fontSize: 14,
        }}>
          {msg.text}
        </div>
      )}

      <div style={{ background: 'white', borderRadius: 10, border: '1px solid #e2e8f0', padding: 20 }}>
        <div style={grid2}>
          <Field label="Categoría del Modelo *" error={errors.categoria}>
            <select value={form.categoria} onChange={e => set('categoria', e.target.value)} style={inputS}>
              <option value="">Seleccionar...</option>
              {categorias.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </Field>

          <Field label="Universo del Modelo *" error={errors.universo}>
            <select value={form.universo} onChange={e => setUniverso(e.target.value)} style={inputS}>
              <option value="">Seleccionar...</option>
              <option value="Cliente">Cliente</option>
              <option value="Producto">Producto</option>
            </select>
          </Field>

          <Field label={`Producto${form.universo === 'Producto' ? ' *' : ''}`} error={errors.productoId}>
            <select value={form.productoId}
              disabled={form.universo !== 'Producto'}
              onChange={e => setProducto(e.target.value)} style={inputS}>
              <option value="">Seleccionar...</option>
              {productos.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
            </select>
          </Field>

          <Field label={`Subproducto${form.universo === 'Producto' ? ' *' : ''}`} error={errors.subproductoId}>
            <select value={form.subproductoId}
              disabled={form.universo !== 'Producto' || !form.productoId}
              onChange={e => set('subproductoId', e.target.value)} style={inputS}>
              <option value="">Seleccionar...</option>
              {subproductos.map(s => <option key={s.id} value={s.id}>{s.nombre}</option>)}
            </select>
          </Field>

          <Field label="Código del Modelo * (alfanumérico, único)" error={errors.codigo}>
            <input value={form.codigo} onChange={e => set('codigo', e.target.value)} style={inputS}
              placeholder="Ej: MOD-SC-003" />
          </Field>

          <Field label="Nombre del Modelo *" error={errors.nombre}>
            <input value={form.nombre} onChange={e => set('nombre', e.target.value)} style={inputS} />
          </Field>

          <Field label="Estado del Modelo *" error={errors.estado}>
            <select value={form.estado} onChange={e => set('estado', e.target.value)} style={inputS}>
              <option value="">Seleccionar...</option>
              <option value="CHAMPION">Champion</option>
              <option value="CHALLENGER">Challenger</option>
            </select>
          </Field>

          <Field label="Código de Piloto (solo Challenger)" error={errors.codigoPiloto}>
            <input
              value={form.codigoPiloto || ''}
              disabled={form.estado !== 'CHALLENGER'}
              onChange={e => set('codigoPiloto', e.target.value)}
              placeholder="Ej: PIL-000001"
              style={{ ...inputS, background: form.estado !== 'CHALLENGER' ? '#f8fafc' : 'white' }}
            />
            {form.estado === 'CHALLENGER' && (
              <span style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>
                El piloto debe estar en estado Aprobado o Vigente.
              </span>
            )}
          </Field>
        </div>

        <Field label="Descripción del Modelo *" error={errors.descripcion} style={{ marginTop: 12 }}>
          <textarea value={form.descripcion || ''} onChange={e => set('descripcion', e.target.value)}
            rows={3} style={{ ...inputS, resize: 'vertical' }} />
        </Field>

        <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
          <button onClick={handleSubmit} style={btnPrimary}>
            {esEdicion ? 'Guardar cambios' : 'Registrar Modelo'}
          </button>
          <button onClick={() => navigate('/modelos/mantenimiento')} style={btnCancel}>Cancelar</button>
        </div>
      </div>
    </div>
  );
}

function Field({ label, error, children, style }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4, ...style }}>
      <label style={{ fontSize: 12, fontWeight: 600, color: '#374151' }}>
        {label}
        {error && <span style={{ color: '#dc2626', fontWeight: 400, fontSize: 11, marginLeft: 6 }}>{error}</span>}
      </label>
      {children}
    </div>
  );
}

const grid2 = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 };
const h2 = { fontSize: 20, fontWeight: 700, color: '#1e293b', margin: '4px 0 20px' };
const inputS = { padding: '7px 10px', border: '1px solid #cbd5e1', borderRadius: 6, fontSize: 13, width: '100%', boxSizing: 'border-box' };
const btnPrimary = { background: '#2563eb', color: 'white', border: 'none', borderRadius: 8, padding: '9px 20px', cursor: 'pointer', fontWeight: 600, fontSize: 14 };
const btnCancel = { background: '#f1f5f9', color: '#475569', border: '1px solid #e2e8f0', borderRadius: 8, padding: '9px 20px', cursor: 'pointer', fontSize: 14 };
const btnBack = { background: 'none', border: 'none', color: '#2563eb', cursor: 'pointer', fontSize: 13, padding: 0, marginBottom: 4 };
