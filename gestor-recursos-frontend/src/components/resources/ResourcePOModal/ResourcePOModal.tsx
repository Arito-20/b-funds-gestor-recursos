import type { Resource, PurchaseOrder } from '../../../types';
import Modal from '../../shared/Modal/Modal';
import StatusBadge from '../../shared/StatusBadge/StatusBadge';
import EmptyState from '../../shared/EmptyState/EmptyState';
import { SkeletonTable } from '../../shared/SkeletonCard/SkeletonCard';
import { formatCurrency, formatDate, formatPeriodMonth, formatOriginalAmount } from '../../../utils/format';
import './ResourcePOModal.css';

interface ResourcePOModalProps {
  resource: Resource | null;
  purchaseOrders: PurchaseOrder[];
  loading: boolean;
  onClose: () => void;
}

export default function ResourcePOModal({ resource, purchaseOrders, loading, onClose }: ResourcePOModalProps) {
  const pendingCount = purchaseOrders.filter(po => po.status === 'PENDING').length;

  return (
    <Modal
      open={!!resource}
      onClose={onClose}
      title={`Órdenes de compra — ${resource?.consultantName ?? ''}`}
      wide
    >
      {resource && (
        <div className="resource-po-modal__summary">
          <div>
            <p className="resource-po-modal__summary-label">Proveedor</p>
            <p className="resource-po-modal__summary-value">{resource.provider?.name}</p>
          </div>
          <div>
            <p className="resource-po-modal__summary-label">Iniciativa</p>
            <p className="resource-po-modal__summary-value">{resource.mainInitiative?.name}</p>
          </div>
          <div>
            <p className="resource-po-modal__summary-label">Contrato</p>
            <p className="resource-po-modal__summary-value">
              {formatDate(resource.startDate)} → {formatDate(resource.endDate)}
            </p>
          </div>
          <div>
            <p className="resource-po-modal__summary-label">Costo mensual USD</p>
            <p className="resource-po-modal__summary-value">{formatCurrency(Number(resource.monthlyCostUsd))}</p>
          </div>
          <div>
            <p className="resource-po-modal__summary-label">Total de OCs</p>
            <p className="resource-po-modal__summary-value">{purchaseOrders.length}</p>
          </div>
          <div>
            <p className="resource-po-modal__summary-label">OCs pendientes</p>
            <p className="resource-po-modal__summary-value resource-po-modal__summary-value--highlight">
              {pendingCount}
            </p>
          </div>
        </div>
      )}

      {loading ? (
        <SkeletonTable rows={3} cols={6} />
      ) : purchaseOrders.length === 0 ? (
        <EmptyState
          title="Sin órdenes de compra"
          subtitle="Genera las OCs mensuales desde la acción 'Generar OCs' del recurso."
          icon={
            <svg width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          }
        />
      ) : (
        <div className="overflow-x-auto">
          <table className="resource-po-modal__table w-full">
            <thead>
              <tr>
                <th>Periodo</th>
                <th>N° OC</th>
                <th>Estado</th>
                <th>Monto original</th>
                <th>Monto USD</th>
                <th>Comentarios</th>
              </tr>
            </thead>
            <tbody>
              {purchaseOrders.map(po => (
                <tr key={po.id}>
                  <td className="text-[#6b7280]">{formatPeriodMonth(po.periodMonth)}</td>
                  <td className="text-[#1f2937] font-medium">{po.poNumber ?? '—'}</td>
                  <td><StatusBadge status={po.status} /></td>
                  <td className="text-[#6b7280]">
                    {formatOriginalAmount(Number(po.amountOriginal), po.currency)}
                  </td>
                  <td className="font-semibold text-[#1f2937]">{formatCurrency(Number(po.amountUsd))}</td>
                  <td className="resource-po-modal__comments">
                    {po.comments?.trim() ? po.comments : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Modal>
  );
}
