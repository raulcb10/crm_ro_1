export default function SlotGrid({ filas, columnas, ocupados, seleccionados, onChange, readOnly }) {
  const toggle = (slot) => {
    if (readOnly || ocupados.includes(slot)) return;
    const next = seleccionados.includes(slot)
      ? seleccionados.filter(s => s !== slot)
      : [...seleccionados, slot];
    onChange(next);
  };

  return (
    <div>
      <div style={{ display: 'flex', gap: 4, marginBottom: 6, flexWrap: 'wrap' }}>
        <span style={legendItem('#d1fae5', '#16a34a')}>Libre</span>
        <span style={legendItem('#bfdbfe', '#1d4ed8')}>Seleccionado</span>
        <span style={legendItem('#fee2e2', '#dc2626')}>Ocupado</span>
      </div>
      <div style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${columnas}, 36px)`,
        gap: 4,
        maxWidth: columnas * 40,
      }}>
        {Array.from({ length: filas }, (_, r) =>
          Array.from({ length: columnas }, (_, c) => {
            const slot = `R${r + 1}-C${c + 1}`;
            const isOcupado = ocupados.includes(slot);
            const isSelected = seleccionados.includes(slot);
            let bg = '#d1fae5', border = '#86efac', color = '#166534';
            if (isOcupado) { bg = '#fee2e2'; border = '#fca5a5'; color = '#991b1b'; }
            else if (isSelected) { bg = '#bfdbfe'; border = '#3b82f6'; color = '#1e40af'; }
            return (
              <button
                key={slot}
                title={slot + (isOcupado ? ' (ocupado)' : '')}
                onClick={() => toggle(slot)}
                disabled={isOcupado || readOnly}
                style={{
                  width: 36, height: 36, borderRadius: 4,
                  border: `2px solid ${border}`,
                  background: bg, color,
                  fontSize: 9, fontWeight: 600,
                  cursor: isOcupado || readOnly ? 'not-allowed' : 'pointer',
                  transition: 'transform 0.1s',
                  padding: 0,
                }}
              >
                {`R${r+1}C${c+1}`}
              </button>
            );
          })
        )}
      </div>
      {seleccionados.length > 0 && (
        <div style={{ marginTop: 8, fontSize: 12, color: '#374151' }}>
          Seleccionados ({seleccionados.length}): {seleccionados.join(', ')}
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
