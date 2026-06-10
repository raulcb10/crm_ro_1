export default function FileInput({ value, onChange, disabled }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <label style={{
        display: 'inline-block',
        padding: '5px 12px',
        background: disabled ? '#f3f4f6' : '#e0e7ff',
        color: disabled ? '#9ca3af' : '#3730a3',
        borderRadius: 6,
        cursor: disabled ? 'not-allowed' : 'pointer',
        fontSize: 13,
        fontWeight: 500,
        border: '1px solid #c7d2fe',
      }}>
        {value ? 'Cambiar archivo' : 'Seleccionar archivo'}
        <input
          type="file"
          style={{ display: 'none' }}
          disabled={disabled}
          onChange={e => onChange && onChange(e.target.files[0]?.name || null)}
        />
      </label>
      {value && (
        <span style={{ fontSize: 13, color: '#374151' }}>
          📎 {value}
        </span>
      )}
    </div>
  );
}
