import { useState, useMemo } from 'react';
import type { AlertNotification, AlertType, AlertStatus } from '../../../types';
import EmptyState from '../../shared/EmptyState/EmptyState';
import { formatDateTime, formatPeriodMonth } from '../../../utils/format';
import './AlertsTable.css';

const ALERT_TYPE_OPTIONS: { value: AlertType; label: string }[] = [
  { value: 'EXPIRATION_AMBER', label: 'Por vencer' },
  { value: 'EXPIRATION_RED', label: 'Crítica' },
  { value: 'EXPIRED', label: 'Vencida' },
  { value: 'PO_PENDING', label: 'OC pendiente' },
];

const ALERT_STATUS_OPTIONS: { value: AlertStatus; label: string }[] = [
  { value: 'MOCKED', label: 'Mock correo' },
  { value: 'SENT', label: 'Enviado' },
  { value: 'FAILED', label: 'Fallido' },
];

const TYPE_LABELS: Record<AlertType, string> = {
  EXPIRATION_AMBER: 'Por vencer',
  EXPIRATION_RED: 'Crítica',
  EXPIRED: 'Vencida',
  PO_PENDING: 'OC pendiente',
};

const STATUS_LABELS: Record<AlertStatus, string> = {
  MOCKED: 'Mock correo',
  SENT: 'Enviado',
  FAILED: 'Fallido',
};

const TYPE_BADGE_CLASS: Record<AlertType, string> = {
  EXPIRATION_AMBER: 'alert-badge--amber',
  EXPIRATION_RED: 'alert-badge--red',
  EXPIRED: 'alert-badge--expired',
  PO_PENDING: 'alert-badge--po',
};

const STATUS_BADGE_CLASS: Record<AlertStatus, string> = {
  MOCKED: 'alert-badge--mocked',
  SENT: 'alert-badge--sent',
  FAILED: 'alert-badge--failed',
};

interface AlertsTableProps {
  alerts: AlertNotification[];
}

function getManagerName(alert: AlertNotification): string {
  return alert.manager?.name ?? alert.resource?.manager?.name ?? '—';
}

function getInitiativeName(alert: AlertNotification): string {
  return alert.resource?.mainInitiative?.name ?? '—';
}

export default function AlertsTable({ alerts }: AlertsTableProps) {
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return alerts.filter((alert) => {
      const consultant = alert.resource?.consultantName ?? '';
      const manager = getManagerName(alert);
      const message = alert.message ?? '';

      const matchSearch =
        !q ||
        consultant.toLowerCase().includes(q) ||
        manager.toLowerCase().includes(q) ||
        message.toLowerCase().includes(q);

      const matchType = !typeFilter || alert.alertType === typeFilter;
      const matchStatus = !statusFilter || alert.status === statusFilter;

      return matchSearch && matchType && matchStatus;
    });
  }, [alerts, search, typeFilter, statusFilter]);

  const hasActiveFilters = search || typeFilter || statusFilter;
  const isEmpty = alerts.length === 0;
  const isFilteredEmpty = !isEmpty && filtered.length === 0;

  const clearFilters = () => {
    setSearch('');
    setTypeFilter('');
    setStatusFilter('');
  };

  if (isEmpty) {
    return (
      <EmptyState
        icon={
          <svg width="32" height="32" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
        }
        title="No hay alertas registradas"
        subtitle="Ejecuta una validación para detectar riesgos."
      />
    );
  }

  return (
    <div className="alerts-table-page">
      <div className="alerts-table-page__filters">
        <input
          type="text"
          placeholder="Buscar consultor, manager o mensaje..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="alerts-table__filter alerts-table-page__search"
        />
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="alerts-table__filter alerts-table-page__filter-select"
        >
          <option value="">Todos los tipos</option>
          {ALERT_TYPE_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="alerts-table__filter alerts-table-page__filter-select"
        >
          <option value="">Todos los estados</option>
          {ALERT_STATUS_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
        {hasActiveFilters && (
          <button type="button" className="alerts-table-page__clear" onClick={clearFilters}>
            Limpiar filtros
          </button>
        )}
      </div>

      {isFilteredEmpty ? (
        <EmptyState
          icon={
            <svg width="32" height="32" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          }
          title="Sin resultados"
          subtitle="Prueba con otros filtros o términos de búsqueda."
        />
      ) : (
        <div className="alerts-table">
          <div className="alerts-table__scroll">
            <table className="alerts-table__table">
              <thead className="alerts-table__thead">
                <tr>
                  <th className="alerts-table__th">Tipo</th>
                  <th className="alerts-table__th">Consultor / OC</th>
                  <th className="alerts-table__th">Manager</th>
                  <th className="alerts-table__th">Iniciativa</th>
                  <th className="alerts-table__th">Mensaje</th>
                  <th className="alerts-table__th">Estado</th>
                  <th className="alerts-table__th">Fecha</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((alert) => (
                  <tr key={alert.id} className="alerts-table__row">
                    <td className="alerts-table__td">
                      <span className={`alert-badge ${TYPE_BADGE_CLASS[alert.alertType]}`}>
                        {TYPE_LABELS[alert.alertType]}
                      </span>
                    </td>
                    <td className="alerts-table__td">
                      <span className="alerts-table__consultant">
                        {alert.resource?.consultantName ?? '—'}
                      </span>
                      {alert.purchaseOrder?.periodMonth && (
                        <span className="alerts-table__period">
                          {formatPeriodMonth(alert.purchaseOrder.periodMonth)}
                        </span>
                      )}
                    </td>
                    <td className="alerts-table__td">{getManagerName(alert)}</td>
                    <td className="alerts-table__td alerts-table__muted">{getInitiativeName(alert)}</td>
                    <td className="alerts-table__td">
                      <span className="alerts-table__message" title={alert.message ?? undefined}>
                        {alert.message ?? '—'}
                      </span>
                    </td>
                    <td className="alerts-table__td">
                      <span className={`alert-badge ${STATUS_BADGE_CLASS[alert.status]}`}>
                        {STATUS_LABELS[alert.status]}
                      </span>
                    </td>
                    <td className="alerts-table__td alerts-table__muted">
                      {formatDateTime(alert.sentAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
