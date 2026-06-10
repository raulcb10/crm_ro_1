export default function HealthBadge({ salud }) {
  const map = {
    SALUDABLE: { label: 'Saludable', color: '#16a34a', bg: '#dcfce7' },
    EN_OBSERVACION: { label: 'En Observación', color: '#d97706', bg: '#fef9c3' },
    ALERTA: { label: 'Alerta', color: '#dc2626', bg: '#fee2e2' },
  };
  const s = map[salud] || map.SALUDABLE;
  return (
    <span style={{
      display: 'inline-block',
      padding: '2px 10px',
      borderRadius: 12,
      fontSize: 12,
      fontWeight: 600,
      color: s.color,
      background: s.bg,
      border: `1px solid ${s.color}40`,
    }}>
      ● {s.label}
    </span>
  );
}
