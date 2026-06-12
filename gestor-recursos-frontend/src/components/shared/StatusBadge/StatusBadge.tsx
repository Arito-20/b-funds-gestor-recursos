import './StatusBadge.css';

interface Props {
  status: string;
  showDot?: boolean;
  visualOnly?: boolean;
}

const config: Record<string, { label: string; className: string }> = {
  GREEN:           { label: 'Verde',          className: 'status-badge--green' },
  AMBER:           { label: 'Ámbar',          className: 'status-badge--amber' },
  RED:             { label: 'Rojo',           className: 'status-badge--red' },
  EXPIRED:         { label: 'Vencido',        className: 'status-badge--expired' },
  ACTIVE:          { label: 'Activo',         className: 'status-badge--active' },
  INACTIVE:        { label: 'Inactivo',       className: 'status-badge--inactive' },
  CANCELLED:       { label: 'Desactivado',    className: 'status-badge--inactive' },
  PENDING:         { label: 'Pendiente',      className: 'status-badge--pending' },
  COUPA_GENERATED: { label: 'Coupa generado', className: 'status-badge--coupa' },
  SENT:            { label: 'OC enviada',     className: 'status-badge--sent' },
  APPROVED:        { label: 'Aprobada',       className: 'status-badge--approved' },
  CLOSED:          { label: 'Cerrada',        className: 'status-badge--closed' },
};

export default function StatusBadge({ status, showDot = true, visualOnly = false }: Props) {
  const item = config[status] ?? { label: status, className: 'status-badge--default' };

  if (visualOnly) {
    const indicatorClass = item.className.replace('status-badge--', 'status-indicator--');
    return (
      <span
        className={`status-indicator ${indicatorClass}`}
        title={item.label}
        aria-label={item.label}
        role="img"
      />
    );
  }

  return (
    <span className={`status-badge ${item.className}`}>
      {showDot && <span className="status-dot" />}
      {item.label}
    </span>
  );
}
