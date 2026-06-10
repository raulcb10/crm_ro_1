import { useState } from 'react';

export default function VariablePicker({ todas, enUso, seleccionadas, onChange, readOnly }) {
  const [filtro, setFiltro] = useState('');

  const toggle = (v) => {
    if (readOnly || enUso.includes(v)) return;
    const next = seleccionadas.includes(v)
      ? seleccionadas.filter(x => x !== v)
      : [...seleccionadas, v];
    onChange(next);
  };

  const visibles = todas.filter(v => v.includes(filtro.toLowerCase()));

  return (
    <div>
      <input
        placeholder="Filtrar variable..."
        value={filtro}
        onChange={e => setFiltro(e.target.value)}
        disabled={readOnly}
        style={{
          padding: '5px 10px', border: '1px solid #cbd5e1', borderRadius: 6,
          fontSize: 13, marginBottom: 8, width: 200,
        }}
      />
      <div style={{ display: 'flex', gap: 4, marginBottom: 6 }}>
        <span style={legendItem('#d1fae5', '#16a34a')}>Disponible</span>
        <span style={legendItem('#bfdbfe', '#1d4ed8')}>Seleccionada</span>
        <span style={legendItem('#fee2e2', '#dc2626')}>En uso</span>
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, maxHeight: 200, overflowY: 'auto' }}>
        {visibles.map(v => {
          const isEnUso = enUso.includes(v);
          const isSelected = seleccionadas.includes(v);
          let bg = '#d1fae5', border = '#86efac', color = '#166534';
          if (isEnUso) { bg = '#fee2e2'; border = '#fca5a5'; color = '#991b1b'; }
          else if (isSelected) { bg = '#bfdbfe'; border = '#3b82f6'; color = '#1e40af'; }
          return (
            <button
              key={v}
              onClick={() => toggle(v)}
              disabled={isEnUso || readOnly}
              title={isEnUso ? `${v} (en uso por otro piloto)` : v}
              style={{
                padding: '3px 8px', borderRadius: 4,
                border: `1px solid ${border}`, background: bg, color,
                fontSize: 12, cursor: isEnUso || readOnly ? 'not-allowed' : 'pointer',
                fontWeight: isSelected ? 700 : 400,
              }}
            >
              {v}
            </button>
          );
        })}
      </div>
      {seleccionadas.length > 0 && (
        <div style={{ marginTop: 8, fontSize: 12, color: '#374151' }}>
          Seleccionadas ({seleccionadas.length}): {seleccionadas.join(', ')}
        </div>
      )}
    </div>
  );
}

function legendItem(bg, color) {
  return {
    display: 'inline-block', padding: '2px 8px', borderRadius: 10,
    background: bg, color, fontSize: 11, fontWeight: 600,
    border: `1px solid ${color}60`,
  };
}
