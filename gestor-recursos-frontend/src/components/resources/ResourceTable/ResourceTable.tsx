import { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import type { Resource } from '../../../types';
import { getCurrentDemoUser } from '../../../types';
import StatusBadge from '../../shared/StatusBadge/StatusBadge';
import EmptyState from '../../shared/EmptyState/EmptyState';
import { formatCurrency, formatDate, formatOriginalAmount } from '../../../utils/format';
import './ResourceTable.css';

const PAGE_SIZE = 10;
const COLUMN_ORDER_STORAGE_KEY = 'bfunds-resource-table-column-order';
const COLUMN_WIDTHS_STORAGE_KEY = 'bfunds.resources.columnWidths';

const DEFAULT_COLUMN_ORDER = [
  'consultant',
  'provider',
  'initiative',
  'manager',
  'country',
  'monthlyCost',
  'contract',
  'daysRemaining',
  'status',
] as const;

type DataColumnId = (typeof DEFAULT_COLUMN_ORDER)[number];

interface ColumnMeta {
  label: string;
  minWidth: number;
  defaultWidth: number;
  maxWidth: number;
}

const COLUMN_META: Record<DataColumnId, ColumnMeta> = {
  consultant: { label: 'Consultor', minWidth: 108, defaultWidth: 136, maxWidth: 250 },
  provider: { label: 'Proveedor', minWidth: 78, defaultWidth: 96, maxWidth: 170 },
  initiative: { label: 'Iniciativa', minWidth: 88, defaultWidth: 112, maxWidth: 190 },
  manager: { label: 'Manager', minWidth: 78, defaultWidth: 96, maxWidth: 150 },
  country: { label: 'País', minWidth: 64, defaultWidth: 76, maxWidth: 110 },
  monthlyCost: { label: 'Costo mensual', minWidth: 92, defaultWidth: 108, maxWidth: 150 },
  contract: { label: 'Contrato', minWidth: 118, defaultWidth: 140, maxWidth: 230 },
  daysRemaining: { label: 'Días restantes', minWidth: 84, defaultWidth: 100, maxWidth: 160 },
  status: { label: 'Estado', minWidth: 48, defaultWidth: 56, maxWidth: 72 },
};

const CENTERED_COLUMNS: DataColumnId[] = ['country', 'contract', 'daysRemaining', 'status'];

const ACTIONS_COLUMN_META: ColumnMeta = {
  label: 'Acciones',
  minWidth: 200,
  defaultWidth: 228,
  maxWidth: 300,
};

function buildDefaultColumnWidths(): Record<DataColumnId, number> {
  return Object.fromEntries(
    DEFAULT_COLUMN_ORDER.map(id => [id, COLUMN_META[id].defaultWidth]),
  ) as Record<DataColumnId, number>;
}

function clampWidth(value: number, meta: ColumnMeta): number {
  return Math.min(meta.maxWidth, Math.max(meta.minWidth, value));
}

function loadColumnOrder(): DataColumnId[] {
  try {
    const stored = localStorage.getItem(COLUMN_ORDER_STORAGE_KEY);
    if (!stored) return [...DEFAULT_COLUMN_ORDER];
    const parsed = JSON.parse(stored) as unknown;
    if (!Array.isArray(parsed)) return [...DEFAULT_COLUMN_ORDER];
    const isValid =
      parsed.length === DEFAULT_COLUMN_ORDER.length &&
      DEFAULT_COLUMN_ORDER.every(col => parsed.includes(col));
    return isValid ? (parsed as DataColumnId[]) : [...DEFAULT_COLUMN_ORDER];
  } catch {
    return [...DEFAULT_COLUMN_ORDER];
  }
}

interface StoredColumnWidths {
  actions?: number;
  [key: string]: number | undefined;
}

function loadColumnWidths(): { data: Record<DataColumnId, number>; actions: number } {
  const data = buildDefaultColumnWidths();
  let actions = ACTIONS_COLUMN_META.defaultWidth;

  try {
    const stored = localStorage.getItem(COLUMN_WIDTHS_STORAGE_KEY);
    if (!stored) return { data, actions };
    const parsed = JSON.parse(stored) as StoredColumnWidths;

    for (const id of DEFAULT_COLUMN_ORDER) {
      const value = parsed[id];
      if (typeof value === 'number') {
        data[id] = clampWidth(value, COLUMN_META[id]);
      }
    }

    if (typeof parsed.actions === 'number') {
      actions = clampWidth(parsed.actions, ACTIONS_COLUMN_META);
    }
  } catch {
    return { data, actions };
  }

  return { data, actions };
}

const PROFILE_OPTIONS = [
  'ABAP', 'FI', 'Full Stack', 'Workato', 'BW',
  'SAP MM', 'SAP SD', 'Arquitecto', 'QA', 'PMO', 'Otro',
];

const COUNTRY_OPTIONS = ['Peru', 'Colombia', 'Bolivia', 'Argentina', 'Chile', 'Regional'];

function getDaysToneClass(daysRemaining: number, expirationStatus: string): string {
  if (expirationStatus === 'EXPIRED' || daysRemaining <= 0) return 'resource-table__days--expired';
  if (daysRemaining < 15) return 'resource-table__days--red';
  if (daysRemaining < 30) return 'resource-table__days--amber';
  return 'resource-table__days--green';
}

interface ResourceTableProps {
  resources: Resource[];
  onNew: () => void;
  onViewPOs: (resource: Resource) => void;
  onEdit: (resource: Resource) => void;
  onGeneratePOs: (resource: Resource) => void;
  onDeactivate: (resource: Resource) => void;
  actionLoading: number | null;
}

export default function ResourceTable({
  resources,
  onNew,
  onViewPOs,
  onEdit,
  onGeneratePOs,
  onDeactivate,
  actionLoading,
}: ResourceTableProps) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [countryFilter, setCountryFilter] = useState('');
  const [profileFilter, setProfileFilter] = useState('');
  const [page, setPage] = useState(1);
  const [openMenu, setOpenMenu] = useState<number | null>(null);
  const [initialLayout] = useState(loadColumnWidths);
  const [columnOrder, setColumnOrder] = useState<DataColumnId[]>(loadColumnOrder);
  const [columnWidths, setColumnWidths] = useState<Record<DataColumnId, number>>(initialLayout.data);
  const [actionsWidth, setActionsWidth] = useState(initialLayout.actions);
  const [dragColumn, setDragColumn] = useState<DataColumnId | null>(null);
  const [dropTarget, setDropTarget] = useState<DataColumnId | null>(null);
  const widthsRef = useRef({ data: columnWidths, actions: actionsWidth });
  const currentUser = getCurrentDemoUser();
  const isManagerView = currentUser.role === 'MANAGER';

  useEffect(() => {
    widthsRef.current = { data: columnWidths, actions: actionsWidth };
  }, [columnWidths, actionsWidth]);

  useEffect(() => {
    if (openMenu === null) return;
    const close = () => setOpenMenu(null);
    document.addEventListener('click', close);
    return () => document.removeEventListener('click', close);
  }, [openMenu]);

  const persistColumnOrder = useCallback((order: DataColumnId[]) => {
    localStorage.setItem(COLUMN_ORDER_STORAGE_KEY, JSON.stringify(order));
  }, []);

  const persistColumnWidths = useCallback((data: Record<DataColumnId, number>, actions: number) => {
    localStorage.setItem(
      COLUMN_WIDTHS_STORAGE_KEY,
      JSON.stringify({ ...data, actions }),
    );
  }, []);

  const handleDragStart = (columnId: DataColumnId) => (e: React.DragEvent<HTMLTableCellElement>) => {
    if ((e.target as HTMLElement).closest('.resource-table__resize-handle')) {
      e.preventDefault();
      return;
    }
    setDragColumn(columnId);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', columnId);
  };

  const handleDragOver = (columnId: DataColumnId) => (e: React.DragEvent<HTMLTableCellElement>) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragColumn && dragColumn !== columnId) {
      setDropTarget(columnId);
    }
  };

  const handleDragLeave = () => {
    setDropTarget(null);
  };

  const handleDrop = (targetColumnId: DataColumnId) => (e: React.DragEvent<HTMLTableCellElement>) => {
    e.preventDefault();
    if (!dragColumn || dragColumn === targetColumnId) {
      setDragColumn(null);
      setDropTarget(null);
      return;
    }

    setColumnOrder(prev => {
      const next = [...prev];
      const fromIndex = next.indexOf(dragColumn);
      const toIndex = next.indexOf(targetColumnId);
      next.splice(fromIndex, 1);
      next.splice(toIndex, 0, dragColumn);
      persistColumnOrder(next);
      return next;
    });
    setDragColumn(null);
    setDropTarget(null);
  };

  const handleDragEnd = () => {
    setDragColumn(null);
    setDropTarget(null);
  };

  const handleResizeStart = (
    columnKey: DataColumnId | 'actions',
    meta: ColumnMeta,
  ) => (e: React.MouseEvent<HTMLSpanElement>) => {
    e.preventDefault();
    e.stopPropagation();

    const startX = e.clientX;
    const startWidth = columnKey === 'actions'
      ? widthsRef.current.actions
      : widthsRef.current.data[columnKey];

    const onMouseMove = (moveEvent: MouseEvent) => {
      const delta = moveEvent.clientX - startX;
      const nextWidth = clampWidth(startWidth + delta, meta);

      if (columnKey === 'actions') {
        widthsRef.current.actions = nextWidth;
        setActionsWidth(nextWidth);
      } else {
        const nextData = { ...widthsRef.current.data, [columnKey]: nextWidth };
        widthsRef.current.data = nextData;
        setColumnWidths(nextData);
      }
    };

    const onMouseUp = () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
      document.body.classList.remove('resource-table--resizing');
      persistColumnWidths(widthsRef.current.data, widthsRef.current.actions);
    };

    document.body.classList.add('resource-table--resizing');
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  };

  const tableWidth = useMemo(() => {
    const dataWidth = columnOrder.reduce((sum, id) => sum + columnWidths[id], 0);
    return dataWidth + actionsWidth;
  }, [columnOrder, columnWidths, actionsWidth]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return resources.filter(r => {
      const matchSearch =
        !q ||
        r.consultantName.toLowerCase().includes(q) ||
        (r.provider?.name ?? '').toLowerCase().includes(q) ||
        (r.mainInitiative?.name ?? '').toLowerCase().includes(q) ||
        r.analystResponsible.toLowerCase().includes(q);
      const matchStatus = !statusFilter || r.expirationStatus === statusFilter;
      const matchCountry = !countryFilter || r.country === countryFilter;
      const matchProfile = !profileFilter || r.profile === profileFilter;
      return matchSearch && matchStatus && matchCountry && matchProfile;
    });
  }, [resources, search, statusFilter, countryFilter, profileFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const startIdx = (safePage - 1) * PAGE_SIZE;
  const endIdx = Math.min(startIdx + PAGE_SIZE, filtered.length);
  const paginated = filtered.slice(startIdx, endIdx);

  const isEmpty = resources.length === 0;
  const isFilteredEmpty = !isEmpty && filtered.length === 0;

  const hasActiveFilters = search || statusFilter || countryFilter || profileFilter;

  const clearFilters = () => {
    setSearch('');
    setStatusFilter('');
    setCountryFilter('');
    setProfileFilter('');
    setPage(1);
  };

  const renderCell = (columnId: DataColumnId, resource: Resource) => {
    switch (columnId) {
      case 'consultant':
        return (
          <>
            <p className="resource-table__consultant-name">{resource.consultantName}</p>
            <p className="resource-table__consultant-profile">{resource.profile}</p>
          </>
        );
      case 'provider':
        return resource.provider?.name;
      case 'initiative':
        return <p className="resource-table__initiative">{resource.mainInitiative?.name}</p>;
      case 'manager':
        return resource.manager?.name;
      case 'country':
        return resource.country;
      case 'monthlyCost':
        return (
          <>
            <p className="font-medium text-[#1f2937]">{formatCurrency(Number(resource.monthlyCostUsd))}</p>
            <p className="resource-table__cost-original">
              {formatOriginalAmount(Number(resource.monthlyCostOriginal), resource.currency)}
            </p>
          </>
        );
      case 'contract':
        return (
          <span className="resource-table__contract-dates">
            {formatDate(resource.startDate)} → {formatDate(resource.endDate)}
          </span>
        );
      case 'daysRemaining':
        if (resource.expirationStatus === 'EXPIRED' || resource.daysRemaining <= 0) {
          return (
            <span className="resource-table__days resource-table__days--expired">Vencido</span>
          );
        }
        return (
          <div className={`resource-table__days-block ${getDaysToneClass(resource.daysRemaining, resource.expirationStatus)}`}>
            <span className="resource-table__days-number">{resource.daysRemaining}</span>
            <span className="resource-table__days-label">días</span>
          </div>
        );
      case 'status':
        return <StatusBadge status={resource.expirationStatus} visualOnly />;
      default:
        return null;
    }
  };

  const getCellClassName = (columnId: DataColumnId): string => {
    const classes = ['resource-table__td'];
    const mutedColumns: DataColumnId[] = ['provider', 'manager', 'country', 'contract'];
    if (mutedColumns.includes(columnId)) {
      classes.push('text-[#6b7280]');
    }
    if (CENTERED_COLUMNS.includes(columnId)) {
      classes.push('resource-table__td--center');
    }
    return classes.join(' ');
  };

  return (
    <div className="resource-table-page">
      <div className="resource-table-page__header">
        <div>
          <h1 className="resource-table-page__title text-gradient">Recursos Externos</h1>
          <p className="resource-table-page__subtitle">
            Gestión de consultores y especialistas externos
          </p>
          {isManagerView && (
            <p className="resource-table-page__visibility-note">
              <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Vista filtrada por tu cartera de manager.
            </p>
          )}
        </div>
      </div>

      <div className="resource-table-page__actions">
        <input
          type="text"
          placeholder="Buscar consultor, proveedor, iniciativa o analista..."
          value={search}
          onChange={e => { setSearch(e.target.value); setPage(1); }}
          className="resource-table__filter resource-table-page__search"
        />
        <select
          value={statusFilter}
          onChange={e => { setStatusFilter(e.target.value); setPage(1); }}
          className="resource-table__filter resource-table-page__filter-select"
          aria-label="Filtrar por estado"
        >
          <option value="">Estado: todos</option>
          <option value="GREEN">Verde</option>
          <option value="AMBER">Ámbar</option>
          <option value="RED">Rojo</option>
          <option value="EXPIRED">Vencido</option>
        </select>
        <select
          value={countryFilter}
          onChange={e => { setCountryFilter(e.target.value); setPage(1); }}
          className="resource-table__filter resource-table-page__filter-select"
          aria-label="Filtrar por país"
        >
          <option value="">País: todos</option>
          {COUNTRY_OPTIONS.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <select
          value={profileFilter}
          onChange={e => { setProfileFilter(e.target.value); setPage(1); }}
          className="resource-table__filter resource-table-page__filter-select"
          aria-label="Filtrar por perfil"
        >
          <option value="">Perfil: todos</option>
          {PROFILE_OPTIONS.map(p => <option key={p} value={p}>{p}</option>)}
        </select>
        {hasActiveFilters && (
          <button type="button" onClick={clearFilters} className="resource-table__btn-clear">
            Limpiar filtros
          </button>
        )}
        <button type="button" onClick={onNew} className="resource-table__btn-new">
          <span className="text-lg leading-none">＋</span>
          Nuevo Recurso
        </button>
      </div>

      <div className="resource-table">
        {isEmpty ? (
          <div className="resource-table__empty">
            <EmptyState
              title="No hay recursos registrados"
              subtitle="Comienza agregando tu primer consultor externo"
              icon={
                <svg width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              }
            />
            <button type="button" onClick={onNew} className="resource-table__btn-new resource-table__empty-btn">
              <span className="text-lg leading-none">＋</span>
              Crear primer recurso
            </button>
          </div>
        ) : isFilteredEmpty ? (
          <div className="resource-table__empty">
            <EmptyState
              title="Sin resultados"
              subtitle="Prueba con otros términos de búsqueda o filtros"
              icon={
                <svg width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              }
            />
            {hasActiveFilters && (
              <button type="button" onClick={clearFilters} className="resource-table__btn-clear">
                Limpiar filtros
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="resource-table__scroll">
              <table
                className="resource-table__table"
                style={{ width: tableWidth, minWidth: '100%' }}
              >
                <colgroup>
                  {columnOrder.map(columnId => (
                    <col key={columnId} style={{ width: columnWidths[columnId] }} />
                  ))}
                  <col style={{ width: actionsWidth }} />
                </colgroup>
                <thead className="resource-table__thead">
                  <tr>
                    {columnOrder.map(columnId => (
                      <th
                        key={columnId}
                        draggable
                        onDragStart={handleDragStart(columnId)}
                        onDragOver={handleDragOver(columnId)}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop(columnId)}
                        onDragEnd={handleDragEnd}
                        className={[
                          'resource-table__th',
                          'resource-table__th--draggable',
                          CENTERED_COLUMNS.includes(columnId) ? 'resource-table__th--center' : '',
                          dragColumn === columnId ? 'resource-table__th--dragging' : '',
                          dropTarget === columnId ? 'resource-table__th--drop-target' : '',
                        ].filter(Boolean).join(' ')}
                        title="Arrastra para reordenar"
                      >
                        <span className="resource-table__th-content">
                          <span className="resource-table__th-grip" aria-hidden="true">⠿</span>
                          {COLUMN_META[columnId].label}
                        </span>
                        <span
                          className="resource-table__resize-handle"
                          onMouseDown={handleResizeStart(columnId, COLUMN_META[columnId])}
                          aria-hidden="true"
                        />
                      </th>
                    ))}
                    <th className="resource-table__th resource-table__th--fixed">
                      <span className="resource-table__th-content">{ACTIONS_COLUMN_META.label}</span>
                      <span
                        className="resource-table__resize-handle"
                        onMouseDown={handleResizeStart('actions', ACTIONS_COLUMN_META)}
                        aria-hidden="true"
                      />
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {paginated.map(resource => (
                    <tr key={resource.id} className="resource-table__row">
                      {columnOrder.map(columnId => (
                        <td key={columnId} className={getCellClassName(columnId)}>
                          {renderCell(columnId, resource)}
                        </td>
                      ))}
                      <td className="resource-table__td">
                        <div className="resource-table__actions">
                          <button
                            type="button"
                            onClick={() => onViewPOs(resource)}
                            className="resource-table__action-btn resource-table__action-btn--secondary"
                          >
                            Ver OCs
                          </button>
                          <button
                            type="button"
                            onClick={() => onEdit(resource)}
                            className="resource-table__action-btn resource-table__action-btn--icon"
                            title="Editar"
                            aria-label={`Editar ${resource.consultantName}`}
                          >
                            <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          <button
                            type="button"
                            onClick={() => onGeneratePOs(resource)}
                            disabled={actionLoading === resource.id}
                            className="resource-table__action-btn resource-table__action-btn--primary"
                          >
                            {actionLoading === resource.id ? 'Generando...' : 'Generar OCs'}
                          </button>
                          <div className="resource-table__menu">
                            <button
                              type="button"
                              title="Más acciones"
                              onClick={e => { e.stopPropagation(); setOpenMenu(openMenu === resource.id ? null : resource.id); }}
                              className="resource-table__action-btn resource-table__action-btn--menu"
                              aria-label="Más acciones"
                            >
                              ⋯
                            </button>
                            {openMenu === resource.id && (
                              <div className="resource-table__dropdown" onClick={e => e.stopPropagation()}>
                                <button
                                  type="button"
                                  className="resource-table__dropdown-item"
                                  disabled={resource.status === 'CANCELLED' || actionLoading === resource.id}
                                  onClick={() => { setOpenMenu(null); onDeactivate(resource); }}
                                >
                                  Desactivar
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="resource-table__pagination">
              <span className="resource-table__pagination-info">
                Mostrando {startIdx + 1}-{endIdx} de {filtered.length} recurso{filtered.length !== 1 ? 's' : ''}
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={safePage <= 1}
                  onClick={() => setPage(p => p - 1)}
                  className="resource-table__page-btn"
                >
                  Anterior
                </button>
                {Array.from({ length: totalPages }).map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setPage(i + 1)}
                    className={`resource-table__page-btn ${safePage === i + 1 ? 'resource-table__page-btn--active' : ''}`}
                  >
                    {i + 1}
                  </button>
                ))}
                <button
                  type="button"
                  disabled={safePage >= totalPages}
                  onClick={() => setPage(p => p + 1)}
                  className="resource-table__page-btn"
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
