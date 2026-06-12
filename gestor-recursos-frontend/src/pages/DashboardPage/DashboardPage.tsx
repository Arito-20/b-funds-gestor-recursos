import { useEffect, useState, useCallback, useMemo } from 'react';
import { dashboardApi, catalogApi, resourcesApi, purchaseOrdersApi } from '../../services/api';
import type { DashboardSummary, Initiative, PurchaseOrder, Resource } from '../../types';
import { getCurrentDemoUser } from '../../types';
import KPICard from '../../components/dashboard/KPICard/KPICard';
import ExpirationTable from '../../components/dashboard/ExpirationTable/ExpirationTable';
import BudgetTable from '../../components/dashboard/BudgetTable/BudgetTable';
import CountryCards from '../../components/dashboard/CountryCards/CountryCards';
import { SkeletonPage } from '../../components/shared/SkeletonCard/SkeletonCard';
import { formatCurrency, getCurrentPeriodMonth } from '../../utils/format';
import {
  computeVisibleBudgetUsd,
  computeAvailableBudgetUsd,
  countPendingPOsThisMonth,
  countPendingPOsAll,
  countReviewRequiredResources,
  sortAndFilterExpiringSoon,
  enrichCostByInitiative,
} from '../../utils/dashboard';
import './DashboardPage.css';

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Buenos días';
  if (hour < 18) return 'Buenas tardes';
  return 'Buenas noches';
}

export default function DashboardPage() {
  const demoUser = getCurrentDemoUser();
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [initiatives, setInitiatives] = useState<Initiative[]>([]);
  const [resources, setResources] = useState<Resource[]>([]);
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [summaryRes, initiativesRes, resourcesRes, ordersRes] = await Promise.all([
        dashboardApi.getSummary(),
        catalogApi.getInitiatives(),
        resourcesApi.getAll(),
        purchaseOrdersApi.getAll(),
      ]);
      setSummary(summaryRes.data);
      setInitiatives(initiativesRes.data);
      setResources(resourcesRes.data);
      setPurchaseOrders(ordersRes.data);
    } catch {
      setError('No pudimos cargar el dashboard. Verifica que el backend esté corriendo.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const currentPeriod = getCurrentPeriodMonth();

  const visibleBudgetUsd = useMemo(() => {
    if (!summary) return 0;
    return computeVisibleBudgetUsd(initiatives, resources, demoUser.role, summary);
  }, [summary, initiatives, resources, demoUser.role]);

  const availableBudgetUsd = useMemo(() => {
    if (!summary) return 0;
    return computeAvailableBudgetUsd(visibleBudgetUsd, summary.totalCommittedUsd, summary);
  }, [summary, visibleBudgetUsd]);

  const pendingThisMonth = useMemo(() => {
    if (summary?.pendingPurchaseOrdersThisMonth != null) {
      return summary.pendingPurchaseOrdersThisMonth;
    }
    return countPendingPOsThisMonth(purchaseOrders, currentPeriod);
  }, [summary, purchaseOrders, currentPeriod]);

  const pendingAll = useMemo(() => {
    if (purchaseOrders.length > 0) {
      return countPendingPOsAll(purchaseOrders);
    }
    return summary?.pendingPurchaseOrders ?? 0;
  }, [purchaseOrders, summary]);

  const pendingIsMonthly =
    summary?.pendingPurchaseOrdersThisMonth != null ||
    (purchaseOrders.length > 0 && summary?.pendingPurchaseOrdersThisMonth === undefined);

  const expiringItems = useMemo(
    () => (summary ? sortAndFilterExpiringSoon(summary.expiringSoon) : []),
    [summary],
  );

  const enrichedBudgetItems = useMemo(
    () => (summary ? enrichCostByInitiative(summary.costByInitiative, initiatives) : []),
    [summary, initiatives],
  );

  const reviewRequiredCount = summary ? countReviewRequiredResources(summary) : 0;
  const stableResourcesCount = summary
    ? Math.max(summary.activeResources - reviewRequiredCount, 0)
    : 0;

  if (loading) return <SkeletonPage />;
  if (error || !summary) {
    return (
      <div className="dashboard-page">
        <div className="dashboard-error">
          <span>{error ?? 'Error desconocido'}</span>
          <button type="button" onClick={loadData} className="dashboard-error__retry">Reintentar</button>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-page">
      <header className="dashboard-greeting">
        <h1 className="dashboard-greeting__title text-gradient">
          {getGreeting()}, {demoUser.name}
        </h1>
      </header>

      <section className="dashboard-priorities animate-fade-in-up">
        <p className="dashboard-priorities__title">Prioridades del área</p>
        <div className="dashboard-priorities__grid">
          <div className="dashboard-priority-item">
            <div className="dashboard-priority-item__icon-wrap dashboard-priority-item__icon-wrap--time">
              <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="dashboard-priority-item__label">Tiempo de asignación</p>
              <p className="dashboard-priority-item__value">
                {reviewRequiredCount} recurso(s) requieren revisión por vencimiento
              </p>
            </div>
          </div>
          <div className="dashboard-priority-item">
            <div className="dashboard-priority-item__icon-wrap dashboard-priority-item__icon-wrap--budget">
              <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="dashboard-priority-item__label">Control presupuestal</p>
              <p className="dashboard-priority-item__value">
                {formatCurrency(summary.totalCommittedUsd)} comprometido · {formatCurrency(availableBudgetUsd)} disponible
              </p>
            </div>
          </div>
          <div className="dashboard-priority-item">
            <div className="dashboard-priority-item__icon-wrap dashboard-priority-item__icon-wrap--coupa">
              <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div>
              <p className="dashboard-priority-item__label">Status de Coupas</p>
              <p className="dashboard-priority-item__value">
                {pendingIsMonthly
                  ? `${pendingThisMonth} OC(s) pendientes del mes actual`
                  : `${pendingAll} OC(s) pendientes`}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="dashboard-kpi-grid dashboard-kpi-grid--primary">
        <KPICard
          title="Recursos activos"
          value={summary.activeResources}
          variant="purple"
          delay={0}
          icon={
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          }
        />
        <KPICard
          title="Por vencer"
          value={summary.expiringAmber}
          subtitle="Entre 15 y 30 días"
          variant="amber"
          delay={50}
          icon={
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />
        <KPICard
          title="Críticos"
          value={summary.expiringRed}
          subtitle="Menos de 15 días"
          variant="red"
          delay={100}
          icon={
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          }
        />
        <KPICard
          title="Vencidos"
          value={summary.expired}
          subtitle="Fecha fin vencida"
          variant="gray"
          delay={150}
          icon={
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
            </svg>
          }
        />
      </section>

      <section className="dashboard-kpi-grid dashboard-kpi-grid--secondary">
        <KPICard
          title="Costo mensual USD"
          value={summary.monthlyCostUsd}
          isCurrency
          variant="purple"
          delay={200}
          icon={
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />
        <KPICard
          title="Total comprometido USD"
          value={summary.totalCommittedUsd}
          isCurrency
          variant="purple"
          delay={250}
          icon={
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />
        <KPICard
          title={pendingIsMonthly ? 'OCs pendientes del mes actual' : 'OCs pendientes'}
          value={pendingIsMonthly ? pendingThisMonth : pendingAll}
          subtitle={pendingIsMonthly && pendingAll !== pendingThisMonth
            ? `${pendingAll} pendientes en total`
            : undefined}
          variant="orange"
          delay={300}
          icon={
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          }
        />
      </section>

      <section className="dashboard-lower-grid">
        <div className="dashboard-left-stack">
          <ExpirationTable items={expiringItems} stableCount={stableResourcesCount} />
          <CountryCards items={summary.resourcesByCountry} embedded />
        </div>
        <div className="dashboard-right-stack">
          <BudgetTable items={enrichedBudgetItems} />
        </div>
      </section>
    </div>
  );
}
