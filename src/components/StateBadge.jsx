const ESTADOS = {
  REGISTRADO: { label: 'Registrado', color: '#6b7280', bg: '#f3f4f6' },
  ENVIADO_A_APROBACION: { label: 'En revisión', color: '#2563eb', bg: '#dbeafe' },
  APROBADO: { label: 'Aprobado', color: '#7c3aed', bg: '#ede9fe' },
  VIGENTE: { label: 'Vigente', color: '#059669', bg: '#d1fae5' },
  APAGADO: { label: 'Apagado', color: '#9ca3af', bg: '#f9fafb' },
  ESCALADO: { label: 'Escalado', color: '#0891b2', bg: '#cffafe' },
};

export default function StateBadge({ estado }) {
  const s = ESTADOS[estado] || { label: estado, color: '#6b7280', bg: '#f3f4f6' };
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
      whiteSpace: 'nowrap',
    }}>
      {s.label}
    </span>
  );
}
