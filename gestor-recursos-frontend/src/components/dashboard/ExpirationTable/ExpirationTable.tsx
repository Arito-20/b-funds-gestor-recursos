import type { ExpiringSoonItem } from '../../../types';
import StatusBadge from '../../shared/StatusBadge/StatusBadge';
import { formatDate } from '../../../utils/format';
import './ExpirationTable.css';

interface ExpirationTableProps {
  items: ExpiringSoonItem[];
  stableCount?: number;
}

function getSuggestedAction(item: ExpiringSoonItem): { label: string; className: string } | null {
  if (item.expirationStatus === 'EXPIRED' || item.daysRemaining <= 0) {
    return { label: 'Revisar continuidad', className: 'action-badge--expired' };
  }
  if (item.expirationStatus === 'RED') {
    return { label: 'Renovar urgente', className: 'action-badge--urgent' };
  }
  if (item.expirationStatus === 'AMBER') {
    return { label: 'Planificar renovación', className: 'action-badge--plan' };
  }
  return null;
}

function getDaysDisplay(item: ExpiringSoonItem): { text: string; className: string } {
  if (item.expirationStatus === 'EXPIRED' || item.daysRemaining <= 0) {
    return { text: 'Vencido', className: 'expiration-table__days--expired' };
  }
  if (item.expirationStatus === 'RED') {
    return { text: `${item.daysRemaining}d`, className: 'expiration-table__days--red' };
  }
  if (item.expirationStatus === 'AMBER') {
    return { text: `${item.daysRemaining}d`, className: 'expiration-table__days--amber' };
  }
  return { text: `${item.daysRemaining}d`, className: '' };
}

export default function ExpirationTable({ items, stableCount = 0 }: ExpirationTableProps) {
  return (
    <div className="expiration-table animate-fade-in-up">
      <div className="expiration-table__header">
        <div className="expiration-table__header-icon">
          <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h2 className="expiration-table__title">Recursos próximos a vencer</h2>
      </div>

      {items.length === 0 ? (
        <div className="expiration-table__empty">
          <div className="expiration-table__empty-icon" aria-hidden="true">
            <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="expiration-table__empty-text">
            <p className="expiration-table__empty-title">No hay recursos en riesgo de vencimiento.</p>
            {stableCount > 0 && (
              <p className="expiration-table__empty-subtitle">
                {stableCount} recurso(s) se encuentran estables.
              </p>
            )}
          </div>
        </div>
      ) : (
        <div className="expiration-table__scroll">
          <table className="expiration-table__table w-full">
            <thead className="expiration-table__thead">
              <tr>
                <th className="expiration-table__th">Consultor</th>
                <th className="expiration-table__th">Perfil</th>
                <th className="expiration-table__th">Manager</th>
                <th className="expiration-table__th">Fecha fin</th>
                <th className="expiration-table__th">Días restantes</th>
                <th className="expiration-table__th">Semáforo</th>
                <th className="expiration-table__th">Acción sugerida</th>
              </tr>
            </thead>
            <tbody>
              {items.map(item => {
                const action = getSuggestedAction(item);
                const days = getDaysDisplay(item);
                return (
                  <tr
                    key={item.id}
                    className={`expiration-table__row ${item.expirationStatus === 'EXPIRED' ? 'expiration-table__row--expired' : ''}`}
                  >
                    <td className="expiration-table__td expiration-table__td--name">{item.consultantName}</td>
                    <td className="expiration-table__td expiration-table__td--muted">{item.profile}</td>
                    <td className="expiration-table__td expiration-table__td--muted">{item.managerName}</td>
                    <td className="expiration-table__td expiration-table__td--muted">{formatDate(item.endDate)}</td>
                    <td className="expiration-table__td">
                      <span className={`expiration-table__days ${days.className}`}>{days.text}</span>
                    </td>
                    <td className="expiration-table__td">
                      <StatusBadge status={item.expirationStatus} />
                    </td>
                    <td className="expiration-table__td">
                      {action ? (
                        <span className={`action-badge ${action.className}`}>{action.label}</span>
                      ) : (
                        <span className="expiration-table__td--muted">—</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
