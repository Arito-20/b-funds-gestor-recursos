import { useState, useMemo, useEffect } from 'react';
import type { PurchaseOrder } from '../../../types';
import { PO_STATUS_OPTIONS } from '../../../types';
import StatusBadge from '../../shared/StatusBadge/StatusBadge';
import EmptyState from '../../shared/EmptyState/EmptyState';
import { formatCurrency, formatPeriodMonth, formatPONumber } from '../../../utils/format';
import './POTable.css';

const PAGE_SIZE = 10;

const COUNTRY_OPTIONS = ['Peru', 'Colombia', 'Bolivia', 'Argentina', 'Chile', 'Regional'];

interface POTableProps {
  orders: PurchaseOrder[];
  onEdit: (order: PurchaseOrder) => void;
}

export default function POTable({ orders, onEdit }: POTableProps) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [periodFilter, setPeriodFilter] = useState('');
  const [countryFilter, setCountryFilter] = useState('');
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return orders.filter(o => {
      const consultant = o.resource?.consultantName ?? '';
      const provider = o.resource?.provider?.name ?? o.provider?.name ?? '';
      const initiative = o.resource?.mainInitiative?.name ?? '';
      const poNum = o.poNumber ?? '';

      const matchSearch =
        !q ||
        consultant.toLowerCase().includes(q) ||
        provider.toLowerCase().includes(q) ||
        initiative.toLowerCase().includes(q) ||
        poNum.toLowerCase().includes(q);

      const matchStatus = !statusFilter || o.status === statusFilter;
      const matchPeriod = !periodFilter || o.periodMonth === periodFilter;
      const matchCountry = !countryFilter || o.resource?.country === countryFilter;

      return matchSearch && matchStatus && matchPeriod && matchCountry;
    });
  }, [orders, search, statusFilter, periodFilter, countryFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const startIdx = (safePage - 1) * PAGE_SIZE;
  const endIdx = Math.min(startIdx + PAGE_SIZE, filtered.length);
  const paginated = filtered.slice(startIdx, endIdx);

  const isEmpty = orders.length === 0;
  const isFilteredEmpty = !isEmpty && filtered.length === 0;
  const hasActiveFilters = search || statusFilter || periodFilter || countryFilter;

  useEffect(() => {
    setPage(1);
  }, [search, statusFilter, periodFilter, countryFilter]);

  const clearFilters = () => {
    setSearch('');
    setStatusFilter('');
    setPeriodFilter('');
    setCountryFilter('');
    setPage(1);
  };

  return (
    <div className="po-table-page">
      <div className="po-table-page__filters">
        <input
          type="text"
          placeholder="Buscar consultor, proveedor, iniciativa o N° OC..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="po-table__filter po-table-page__search"
        />
        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          className="po-table__filter po-table-page__filter-select"
          aria-label="Filtrar por estado"
        >
          <option value="">Estado: todos</option>
          {PO_STATUS_OPTIONS.map(s => (
            <option key={s.value} value={s.value}>{s.label}</option>
          ))}
        </select>
        <input
          type="month"
          value={periodFilter}
          onChange={e => setPeriodFilter(e.target.value)}
          className="po-table__filter po-table-page__period"
          aria-label="Filtrar por periodo"
        />
        <select
          value={countryFilter}
          onChange={e => setCountryFilter(e.target.value)}
          className="po-table__filter po-table-page__filter-select"
          aria-label="Filtrar por país"
        >
          <option value="">País: todos</option>
          {COUNTRY_OPTIONS.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        {hasActiveFilters && (
          <button type="button" onClick={clearFilters} className="po-table__btn-clear">
            Limpiar filtros
          </button>
        )}
      </div>

      <div className="po-table">
        {isEmpty ? (
          <div className="po-table__empty">
            <EmptyState
              title="Sin órdenes de compra"
              subtitle="Genera OCs mensuales desde el módulo de Recursos"
              icon={
                <svg width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              }
            />
          </div>
        ) : isFilteredEmpty ? (
          <div className="po-table__empty">
            <EmptyState
              title="Sin resultados"
              subtitle="Prueba con otros términos de búsqueda o filtros"
              icon={
                <svg width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              }
            />
            <button type="button" onClick={clearFilters} className="po-table__btn-clear">
              Limpiar filtros
            </button>
          </div>
        ) : (
          <>
            <div className="po-table__scroll">
              <table className="po-table__table w-full">
                <thead className="po-table__thead">
                  <tr>
                    <th className="po-table__th">Periodo</th>
                    <th className="po-table__th">Consultor</th>
                    <th className="po-table__th">Perfil</th>
                    <th className="po-table__th">Proveedor</th>
                    <th className="po-table__th">Iniciativa</th>
                    <th className="po-table__th">Manager</th>
                    <th className="po-table__th">Estado</th>
                    <th className="po-table__th">N° OC</th>
                    <th className="po-table__th">Monto USD</th>
                    <th className="po-table__th">Acción</th>
                  </tr>
                </thead>
                <tbody>
                  {paginated.map(order => (
                    <tr key={order.id} className="po-table__row">
                      <td className="po-table__td po-table__td--period">
                        {formatPeriodMonth(order.periodMonth)}
                      </td>
                      <td className="po-table__td">
                        <span className="po-table__consultant">
                          {order.resource?.consultantName ?? `Recurso #${order.resourceId}`}
                        </span>
                      </td>
                      <td className="po-table__td po-table__td--muted">
                        {order.resource?.profile ?? '—'}
                      </td>
                      <td className="po-table__td po-table__td--muted">
                        {order.resource?.provider?.name ?? order.provider?.name ?? '—'}
                      </td>
                      <td className="po-table__td">
                        <span className="po-table__initiative">
                          {order.resource?.mainInitiative?.name ?? '—'}
                        </span>
                      </td>
                      <td className="po-table__td po-table__td--muted">
                        {order.resource?.manager?.name ?? '—'}
                      </td>
                      <td className="po-table__td">
                        <StatusBadge status={order.status} />
                      </td>
                      <td className="po-table__td">
                        <span className={!order.poNumber?.trim() ? 'po-table__po-empty' : ''}>
                          {formatPONumber(order.poNumber)}
                        </span>
                      </td>
                      <td className="po-table__td po-table__td--amount">
                        {formatCurrency(Number(order.amountUsd))}
                      </td>
                      <td className="po-table__td">
                        <button
                          type="button"
                          onClick={() => onEdit(order)}
                          className="po-table__action-btn"
                        >
                          Actualizar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="po-table__pagination">
              <span className="po-table__pagination-info">
                Mostrando {startIdx + 1}-{endIdx} de {filtered.length} OC{filtered.length !== 1 ? 's' : ''}
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={safePage <= 1}
                  onClick={() => setPage(p => p - 1)}
                  className="po-table__page-btn"
                >
                  Anterior
                </button>
                {Array.from({ length: totalPages }).map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setPage(i + 1)}
                    className={`po-table__page-btn ${safePage === i + 1 ? 'po-table__page-btn--active' : ''}`}
                  >
                    {i + 1}
                  </button>
                ))}
                <button
                  type="button"
                  disabled={safePage >= totalPages}
                  onClick={() => setPage(p => p + 1)}
                  className="po-table__page-btn"
                >
                  Siguiente
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
