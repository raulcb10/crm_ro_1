import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import {
  getPilotoByCode, guardarPiloto, enviarPilotoAprobacion,
  getProductos, getSubproductos, getGerencias, getEquipos, getConfig,
  getGrilla, getVariables, getSlotsOcupados, getVariablesEnUso,
} from '../../data/store.js';
import SlotGrid from '../../components/SlotGrid.jsx';
import VariablePicker from '../../components/VariablePicker.jsx';
import MetricsEditor from '../../components/MetricsEditor.jsx';
import FileInput from '../../components/FileInput.jsx';

const EMPTY = {
  nombre: '', universo: '', productoId: '', subproductoId: '', gerenciaId: '', equipoId: '',
  descripcion: '', fechaInicio: '', fechaFin: '', tamanoMuestra: '', distribucionControl: 20,
  adjuntoNombre: null, slots: [], variables: [], metricas: [],
};

export default function RegistroPiloto() {
  const { usuario } = useAuth();
  const navigate = useNavigate();
  const { codigo } = useParams();
  const esEdicion = !!codigo;

  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [msg, setMsg] = useState(null);
  const [saved, setSaved] = useState(false);

  const productos = getProductos();
  const gerencias = getGerencias();
  const equipos = getEquipos();
  const grilla = getGrilla();
  const todasVariables = getVariables();
  const config = getConfig();

  useEffect(() => {
    if (esEdicion) {
      const p = getPilotoByCode(codigo);
      if (p) setForm({ ...EMPTY, ...p });
    }
  }, [codigo]);

  const subproductos = getSubproductos(form.productoId);
  const slotsOcupados = form.universo === 'Producto' && form.productoId
    ? getSlotsOcupados(form.productoId, esEdicion ? codigo : null)
    : [];
  const variablesEnUso = getVariablesEnUso(esEdicion ? codigo : null);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const setUniverso = (v) => setForm(f => ({ ...f, universo: v, productoId: '', subproductoId: '', slots: [] }));
  const setProducto = (v) => setForm(f => ({ ...f, productoId: v, subproductoId: '', slots: [] }));

  // ─── validaciones ────────────────────────────────────────────────────────

  function validarGuardar() {
    const err = {};
    if (!form.nombre.trim()) err.nombre = 'Obligatorio';
    if (!form.gerenciaId) err.gerenciaId = 'Obligatorio';
    if (!form.equipoId) err.equipoId = 'Obligatorio';
    if (form.universo === 'Producto') {
      if (!form.productoId) err.productoId = 'Obligatorio cuando Universo = Producto';
      if (!form.subproductoId) err.subproductoId = 'Obligatorio cuando Universo = Producto';
    }
    return err;
  }

  function validarEnviar() {
    const err = { ...validarGuardar() };
    if (!form.universo) err.universo = 'Obligatorio';
    if (!form.descripcion?.trim()) err.descripcion = 'Obligatorio';
    if (!form.fechaInicio) err.fechaInicio = 'Obligatorio';
    if (!form.fechaFin) err.fechaFin = 'Obligatorio';
    if (form.fechaInicio && form.fechaFin && form.fechaInicio > form.fechaFin)
      err.fechaFin = 'Debe ser mayor o igual a la fecha de inicio';
    if (!form.tamanoMuestra) {
      err.tamanoMuestra = 'Obligatorio';
    } else {
      const n = parseInt(form.tamanoMuestra, 10);
      if (n < 1 || n > config.tamanoMaxMuestra)
        err.tamanoMuestra = `Debe estar entre 1 y ${config.tamanoMaxMuestra.toLocaleString('es-CO')}`;
    }
    if (!form.adjuntoNombre) err.adjuntoNombre = 'Obligatorio';
    if (form.slots.length === 0) err.slots = 'Debe seleccionar al menos un slot';
    if (form.variables.length === 0) err.variables = 'Debe seleccionar al menos una variable';
    if (form.metricas.length === 0) {
      err.metricas = 'Debe agregar al menos una métrica';
    } else {
      const incompleta = form.metricas.some(m => !m.nombre.trim() || !m.tipo || m.limite === '' || m.esperado === '');
      if (incompleta) err.metricas = 'Todas las métricas deben estar completas';
    }
    return err;
  }

  // ─── acciones ────────────────────────────────────────────────────────────

  const handleGuardar = () => {
    const err = validarGuardar();
    setErrors(err);
    if (Object.keys(err).length > 0) return;
    const cod = guardarPiloto(form, usuario);
    setForm(f => ({ ...f, codigo: cod }));
    setSaved(true);
    setMsg({ type: 'success', text: `Piloto guardado. Código: ${cod}` });
  };

  const handleEnviar = () => {
    if (!saved && !esEdicion) {
      setMsg({ type: 'error', text: 'Guarde el piloto primero antes de enviar.' });
      return;
    }
    const err = validarEnviar();
    setErrors(err);
    if (Object.keys(err).length > 0) {
      setMsg({ type: 'error', text: `Corrija los campos obligatorios antes de enviar: ${Object.values(err).join('; ')}` });
      return;
    }
    const codActual = form.codigo || codigo;
    guardarPiloto(form, usuario);
    enviarPilotoAprobacion(codActual, usuario);
    navigate('/pilotos/mis-pilotos');
  };

  const piloto = esEdicion ? getPilotoByCode(codigo) : null;
  const readOnly = piloto && piloto.estado !== 'REGISTRADO';

  return (
    <div style={{ maxWidth: 860 }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <button onClick={() => navigate('/pilotos/mis-pilotos')} style={btnBack}>← Mis Pilotos</button>
          <h2 style={h2}>{esEdicion ? `Editar Piloto — ${codigo}` : 'Nuevo Piloto'}</h2>
        </div>
        {form.codigo && (
          <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 8, padding: '6px 14px' }}>
            <span style={{ fontSize: 12, color: '#1d4ed8', fontWeight: 700 }}>Código: </span>
            <span style={{ fontFamily: 'monospace', color: '#1e40af', fontWeight: 700 }}>{form.codigo}</span>
          </div>
        )}
      </div>

      {/* Alerta devolución */}
      {form.comentarioDevolucion && (
        <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, padding: '12px 16px', marginBottom: 16 }}>
          <div style={{ fontWeight: 700, color: '#dc2626', marginBottom: 4 }}>↩ Piloto devuelto por Gobierno</div>
          <div style={{ fontSize: 13, color: '#7f1d1d' }}>{form.comentarioDevolucion}</div>
        </div>
      )}

      {msg && (
        <div style={{
          padding: '10px 14px', borderRadius: 8, marginBottom: 16,
          background: msg.type === 'success' ? '#f0fdf4' : '#fef2f2',
          border: `1px solid ${msg.type === 'success' ? '#86efac' : '#fecaca'}`,
          color: msg.type === 'success' ? '#15803d' : '#dc2626',
          fontSize: 14,
        }}>
          {msg.text}
        </div>
      )}

      {/* Sección 1 — Datos Generales */}
      <Section title="1. Registro y Datos Generales">
        <div style={grid2}>
          <Field label="Nombre del Experimento *" error={errors.nombre}>
            <input value={form.nombre} disabled={readOnly}
              onChange={e => set('nombre', e.target.value)} style={inputS} />
          </Field>
          <Field label="Universo del Piloto *" error={errors.universo}>
            <select value={form.universo} disabled={readOnly}
              onChange={e => setUniverso(e.target.value)} style={inputS}>
              <option value="">Seleccionar...</option>
              <option value="Cliente">Cliente</option>
              <option value="Producto">Producto</option>
            </select>
          </Field>
          <Field label={`Producto${form.universo === 'Producto' ? ' *' : ''}`} error={errors.productoId}>
            <select value={form.productoId}
              disabled={readOnly || form.universo !== 'Producto'}
              onChange={e => setProducto(e.target.value)} style={inputS}>
              <option value="">Seleccionar...</option>
              {productos.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
            </select>
          </Field>
          <Field label={`Subproducto${form.universo === 'Producto' ? ' *' : ''}`} error={errors.subproductoId}>
            <select value={form.subproductoId}
              disabled={readOnly || form.universo !== 'Producto' || !form.productoId}
              onChange={e => set('subproductoId', e.target.value)} style={inputS}>
              <option value="">Seleccionar...</option>
              {subproductos.map(s => <option key={s.id} value={s.id}>{s.nombre}</option>)}
            </select>
          </Field>
          <Field label="Gerencia *" error={errors.gerenciaId}>
            <select value={form.gerenciaId} disabled={readOnly}
              onChange={e => set('gerenciaId', e.target.value)} style={inputS}>
              <option value="">Seleccionar...</option>
              {gerencias.map(g => <option key={g.id} value={g.id}>{g.nombre}</option>)}
            </select>
          </Field>
          <Field label="Equipo Responsable *" error={errors.equipoId}>
            <select value={form.equipoId} disabled={readOnly}
              onChange={e => set('equipoId', e.target.value)} style={inputS}>
              <option value="">Seleccionar...</option>
              {equipos.map(e => <option key={e.id} value={e.id}>{e.nombre}</option>)}
            </select>
          </Field>
        </div>

        <Field label="Descripción / Hipótesis *" error={errors.descripcion} style={{ marginTop: 12 }}>
          <textarea value={form.descripcion || ''} disabled={readOnly}
            onChange={e => set('descripcion', e.target.value)}
            rows={3} style={{ ...inputS, resize: 'vertical' }} />
        </Field>

        <div style={{ ...grid2, marginTop: 12 }}>
          <Field label="Fecha de Inicio *" error={errors.fechaInicio}>
            <input type="date" value={form.fechaInicio || ''} disabled={readOnly}
              onChange={e => set('fechaInicio', e.target.value)} style={inputS} />
          </Field>
          <Field label="Fecha de Fin *" error={errors.fechaFin}>
            <input type="date" value={form.fechaFin || ''} disabled={readOnly}
              max={undefined} min={form.fechaInicio || undefined}
              onChange={e => set('fechaFin', e.target.value)} style={inputS} />
          </Field>
          <Field label={`Tamaño mínimo de muestra * (1 – ${config.tamanoMaxMuestra.toLocaleString('es-CO')})`} error={errors.tamanoMuestra}>
            <input type="number" value={form.tamanoMuestra || ''} disabled={readOnly}
              min={1} max={config.tamanoMaxMuestra}
              onChange={e => set('tamanoMuestra', e.target.value)} style={inputS} />
          </Field>
          <Field label={`Distribución Control: ${form.distribucionControl}% control / ${100 - form.distribucionControl}% piloto *`}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 12, color: '#64748b' }}>1%</span>
              <input type="range" min={1} max={50} value={form.distribucionControl}
                disabled={readOnly}
                onChange={e => set('distribucionControl', Number(e.target.value))}
                style={{ flex: 1 }} />
              <span style={{ fontSize: 12, color: '#64748b' }}>50%</span>
            </div>
          </Field>
        </div>

        <Field label="Acta / Correo de aprobación *" error={errors.adjuntoNombre} style={{ marginTop: 12 }}>
          <FileInput value={form.adjuntoNombre} disabled={readOnly}
            onChange={name => set('adjuntoNombre', name)} />
        </Field>
      </Section>

      {/* Sección 2 — Universo y Variables */}
      <Section title="2. Universo y Variables">
        {!form.universo ? (
          <p style={{ color: '#94a3b8', fontSize: 13 }}>Seleccione primero el Universo del Piloto en la sección anterior.</p>
        ) : form.universo === 'Producto' && !form.productoId ? (
          <p style={{ color: '#94a3b8', fontSize: 13 }}>Seleccione primero el Producto.</p>
        ) : (
          <>
            <div style={{ marginBottom: 16 }}>
              <label style={labelStyle}>
                Grilla de Slots {form.universo === 'Producto' ? `(Producto: ${productos.find(p => p.id === form.productoId)?.nombre})` : '(Universo: Cliente)'}
                {errors.slots && <span style={errStyle}>{errors.slots}</span>}
              </label>
              <SlotGrid
                filas={grilla.filas}
                columnas={grilla.columnas}
                ocupados={slotsOcupados}
                seleccionados={form.slots}
                onChange={v => set('slots', v)}
                readOnly={readOnly}
              />
            </div>
            <div>
              <label style={labelStyle}>
                Variables
                {errors.variables && <span style={errStyle}>{errors.variables}</span>}
              </label>
              <VariablePicker
                todas={todasVariables}
                enUso={variablesEnUso}
                seleccionadas={form.variables}
                onChange={v => set('variables', v)}
                readOnly={readOnly}
              />
            </div>
          </>
        )}
      </Section>

      {/* Sección 3 — Métricas */}
      <Section title="3. Métricas de Éxito">
        {errors.metricas && <div style={{ ...errStyle, marginBottom: 8, display: 'block' }}>{errors.metricas}</div>}
        <MetricsEditor
          metricas={form.metricas}
          onChange={v => set('metricas', v)}
          readOnly={readOnly}
        />
      </Section>

      {/* Acciones */}
      {!readOnly && (
        <div style={{ display: 'flex', gap: 10, paddingTop: 8 }}>
          <button onClick={handleGuardar} style={btnSecondary}>Guardar</button>
          <button onClick={handleEnviar} style={btnPrimary}>Enviar a Aprobación</button>
          <button onClick={() => navigate('/pilotos/mis-pilotos')} style={btnCancel}>Cancelar</button>
        </div>
      )}
      {readOnly && (
        <div style={{ padding: '10px 14px', background: '#f8fafc', borderRadius: 8, fontSize: 13, color: '#64748b' }}>
          Este piloto está en estado <strong>{piloto?.estado}</strong> y no puede ser editado.
        </div>
      )}
    </div>
  );
}

// ─── sub-componentes de layout ────────────────────────────────────────────────

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

function Field({ label, error, children, style }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4, ...style }}>
      <label style={labelStyle}>{label}{error && <span style={errStyle}>{error}</span>}</label>
      {children}
    </div>
  );
}

const grid2 = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 };
const h2 = { fontSize: 20, fontWeight: 700, color: '#1e293b', margin: '4px 0 0' };
const inputS = { padding: '7px 10px', border: '1px solid #cbd5e1', borderRadius: 6, fontSize: 13, width: '100%', boxSizing: 'border-box' };
const labelStyle = { fontSize: 12, fontWeight: 600, color: '#374151' };
const errStyle = { color: '#dc2626', fontWeight: 400, fontSize: 11, marginLeft: 6 };
const btnPrimary = { background: '#2563eb', color: 'white', border: 'none', borderRadius: 8, padding: '9px 20px', cursor: 'pointer', fontWeight: 600, fontSize: 14 };
const btnSecondary = { background: '#f0fdf4', color: '#16a34a', border: '1px solid #86efac', borderRadius: 8, padding: '9px 20px', cursor: 'pointer', fontWeight: 600, fontSize: 14 };
const btnCancel = { background: '#f1f5f9', color: '#475569', border: '1px solid #e2e8f0', borderRadius: 8, padding: '9px 20px', cursor: 'pointer', fontSize: 14 };
const btnBack = { background: 'none', border: 'none', color: '#2563eb', cursor: 'pointer', fontSize: 13, padding: 0, marginBottom: 4 };
