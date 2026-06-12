import { useEffect, useState, useCallback, useMemo } from 'react';
import { purchaseOrdersApi } from '../../services/api';
import type { PurchaseOrder } from '../../types';
import POTable from '../../components/purchase-orders/POTable/POTable';
import POUpdateModal from '../../components/purchase-orders/POUpdateModal/POUpdateModal';
import KPICard from '../../components/dashboard/KPICard/KPICard';
import { SkeletonTable } from '../../components/shared/SkeletonCard/SkeletonCard';
import { formatPeriodMonth, getCurrentPeriodMonth } from '../../utils/format';
import './PurchaseOrdersPage.css';

export default function PurchaseOrdersPage() {
  const [orders, setOrders] = useState<PurchaseOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingOrder, setEditingOrder] = useState<PurchaseOrder | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (message: string) => {
    setToast(message);
    setTimeout(() => setToast(null), 3000);
  };

  const loadOrders = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await purchaseOrdersApi.getAll();
      setOrders(res.data);
    } catch {
      setError('No pudimos cargar las órdenes de compra. Verifica que el backend esté corriendo.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadOrders(); }, [loadOrders]);

  const stats = useMemo(() => {
    const total = orders.length;
    const pending = orders.filter(o => o.status === 'PENDING').length;
    const coupaOrSent = orders.filter(o => o.status === 'COUPA_GENERATED' || o.status === 'SENT').length;
    const approvedOrClosed = orders.filter(o => o.status === 'APPROVED' || o.status === 'CLOSED').length;
    const totalUsd = orders.reduce((sum, o) => sum + Number(o.amountUsd), 0);
    const currentPeriod = getCurrentPeriodMonth();
    const pendingThisMonth = orders.filter(
      o => o.status === 'PENDING' && o.periodMonth === currentPeriod
    ).length;

    return { total, pending, coupaOrSent, approvedOrClosed, totalUsd, pendingThisMonth, currentPeriod };
  }, [orders]);

  const handleSave = async (
    id: number,
    data: { status: PurchaseOrder['status']; poNumber?: string; comments?: string }
  ) => {
    try {
      await purchaseOrdersApi.update(id, data);
      showToast('Orden de compra actualizada');
      await loadOrders();
    } catch {
      showToast('Error al actualizar la orden de compra');
      throw new Error('update failed');
    }
  };

  if (loading) return <SkeletonTable rows={8} cols={6} />;
  if (error) {
    return (
      <div className="po-error">
        {error}
        <button type="button" onClick={loadOrders} className="po-error__retry">
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <div className="po-page">
      {toast && <div className="toast-notification">{toast}</div>}

      <header className="po-page__header">
        <h1 className="text-2xl font-bold text-gradient">Órdenes de Compra</h1>
        <p className="text-sm text-[#6b7280] mt-1">
          Seguimiento mensual de Coupas y OCs por recurso externo
        </p>
      </header>

      <div className="po-page__kpi-grid">
        <KPICard
          title="Total de OCs"
          value={stats.total}
          variant="purple"
          delay={0}
          icon={
            <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          }
        />
        <KPICard
          title="Pendientes"
          value={stats.pending}
          variant="orange"
          delay={50}
          icon={
            <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />
        <KPICard
          title="Coupa generado / Enviadas"
          value={stats.coupaOrSent}
          subtitle="En proceso de Coupa"
          variant="amber"
          delay={100}
          icon={
            <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
            </svg>
          }
        />
        <KPICard
          title="Aprobadas / Cerradas"
          value={stats.approvedOrClosed}
          subtitle="OCs finalizadas"
          variant="purple"
          delay={150}
          icon={
            <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />
        <KPICard
          title="Monto total USD"
          value={stats.totalUsd}
          isCurrency
          variant="purple"
          delay={200}
          icon={
            <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />
      </div>

      <div className="po-page__alert">
        <div className="po-page__alert-icon">
          <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <div>
          <p className="po-page__alert-title">OCs pendientes del mes actual</p>
          <p className="po-page__alert-text">
            {stats.pendingThisMonth === 0 ? (
              <>No hay OCs pendientes para {formatPeriodMonth(stats.currentPeriod)}.</>
            ) : (
              <>
                <strong>{stats.pendingThisMonth}</strong> OC{stats.pendingThisMonth !== 1 ? 's' : ''} pendiente{stats.pendingThisMonth !== 1 ? 's' : ''} en{' '}
                {formatPeriodMonth(stats.currentPeriod)} requieren seguimiento.
              </>
            )}
          </p>
        </div>
      </div>

      <POTable orders={orders} onEdit={setEditingOrder} />

      <POUpdateModal
        order={editingOrder}
        onClose={() => setEditingOrder(null)}
        onSave={handleSave}
      />
    </div>
  );
}
