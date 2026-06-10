export default function MetricsEditor({ metricas, onChange, readOnly }) {
  const add = () => onChange([...metricas, { nombre: '', tipo: 'Proporciones', limite: '', esperado: '' }]);
  const remove = (i) => onChange(metricas.filter((_, idx) => idx !== i));
  const update = (i, field, val) => {
    const updated = metricas.map((m, idx) => idx === i ? { ...m, [field]: val } : m);
    onChange(updated);
  };

  return (
    <div>
      {metricas.map((m, i) => (
        <div key={i} style={{
          display: 'grid', gridTemplateColumns: '1fr 140px 120px 120px auto',
          gap: 8, alignItems: 'center', marginBottom: 8,
          padding: 10, background: '#f8fafc', borderRadius: 6, border: '1px solid #e2e8f0',
        }}>
          <input
            placeholder="Nombre de la métrica"
            value={m.nombre}
            disabled={readOnly}
            onChange={e => update(i, 'nombre', e.target.value)}
            style={inputStyle}
          />
          <select
            value={m.tipo}
            disabled={readOnly}
            onChange={e => update(i, 'tipo', e.target.value)}
            style={inputStyle}
          >
            <option>Proporciones</option>
            <option>Media</option>
          </select>
          <input
            type="number"
            placeholder="Límite"
            value={m.limite}
            disabled={readOnly}
            onChange={e => update(i, 'limite', e.target.value)}
            style={inputStyle}
          />
          <input
            type="number"
            placeholder="Esperado"
            value={m.esperado}
            disabled={readOnly}
            onChange={e => update(i, 'esperado', e.target.value)}
            style={inputStyle}
          />
          {!readOnly && (
            <button onClick={() => remove(i)} style={btnRemove}>✕</button>
          )}
        </div>
      ))}
      {!readOnly && (
        <button onClick={add} style={btnAdd}>+ Agregar métrica</button>
      )}
    </div>
  );
}

const inputStyle = {
  padding: '5px 8px', border: '1px solid #cbd5e1', borderRadius: 4,
  fontSize: 13, width: '100%', background: 'white',
};
const btnRemove = {
  background: '#fee2e2', color: '#dc2626', border: 'none',
  borderRadius: 4, padding: '4px 8px', cursor: 'pointer', fontWeight: 700,
};
const btnAdd = {
  background: '#f0fdf4', color: '#16a34a', border: '1px dashed #86efac',
  borderRadius: 6, padding: '6px 14px', cursor: 'pointer', fontSize: 13, marginTop: 4,
};
