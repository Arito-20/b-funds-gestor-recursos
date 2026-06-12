import { useCallback, useEffect, useState } from 'react';
import { alertsApi } from '../../services/api';
import type {
  AlertNotification,
  AlertsSummary,
  RunAlertValidationResponse,
} from '../../types';
import AlertRunPanel from '../../components/alerts/AlertRunPanel/AlertRunPanel';
import AlertsTable from '../../components/alerts/AlertsTable/AlertsTable';
import KPICard from '../../components/dashboard/KPICard/KPICard';
import { SkeletonTable } from '../../components/shared/SkeletonCard/SkeletonCard';
import './AlertsPage.css';

const EMPTY_SUMMARY: AlertsSummary = {
  total: 0,
  expirationAmber: 0,
  expirationRed: 0,
  expired: 0,
  poPending: 0,
  mocked: 0,
  failed: 0,
};

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<AlertNotification[]>([]);
  const [summary, setSummary] = useState<AlertsSummary>(EMPTY_SUMMARY);
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastResult, setLastResult] = useState<RunAlertValidationResponse | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (message: string) => {
    setToast(message);
    setTimeout(() => setToast(null), 3500);
  };

  const loadData = useCallback(async () => {
    setError(null);
    try {
      const [alertsRes, summaryRes] = await Promise.all([
        alertsApi.getAlerts(),
        alertsApi.getAlertsSummary(),
      ]);
      setAlerts(alertsRes.data);
      setSummary(summaryRes.data);
    } catch {
      setError('No pudimos cargar las alertas. Verifica que el backend esté corriendo.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleRunValidation = async () => {
    setRunning(true);
    try {
      const res = await alertsApi.runAlertValidation();
      setLastResult(res.data);
      await loadData();

      const { createdAlerts, skippedDuplicates } = res.data;
      if (createdAlerts > 0) {
        showToast(`${createdAlerts} alerta${createdAlerts !== 1 ? 's' : ''} creada${createdAlerts !== 1 ? 's' : ''}`);
      } else if (skippedDuplicates > 0) {
        showToast(`Validación completada: ${skippedDuplicates} duplicado${skippedDuplicates !== 1 ? 's' : ''} omitido${skippedDuplicates !== 1 ? 's' : ''}`);
      } else {
        showToast('Validación completada sin nuevas alertas');
      }
    } catch {
      showToast('Error al ejecutar la validación');
    } finally {
      setRunning(false);
    }
  };

  if (loading) return <SkeletonTable rows={6} cols={7} />;

  if (error) {
    return (
      <div className="alerts-page__error">
        {error}
        <button type="button" className="alerts-page__error-retry" onClick={loadData}>
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <div className="alerts-page">
      {toast && <div className="toast-notification">{toast}</div>}

      <header className="alerts-page__header">
        <h1 className="text-2xl font-bold text-gradient">Alertas</h1>
        <p className="text-sm text-[#6b7280] mt-1">
          Validación proactiva de vencimientos y OCs pendientes
        </p>
      </header>

      <AlertRunPanel
        onRun={handleRunValidation}
        running={running}
        lastResult={lastResult}
      />

      <div className="alerts-page__kpi-grid">
        <KPICard
          title="Total alertas"
          value={summary.total}
          variant="purple"
          delay={0}
          icon={
            <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
          }
        />
        <KPICard
          title="Por vencer"
          value={summary.expirationAmber}
          variant="amber"
          delay={50}
          icon={
            <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />
        <KPICard
          title="Críticas"
          value={summary.expirationRed}
          variant="red"
          delay={100}
          icon={
            <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          }
        />
        <KPICard
          title="Vencidas"
          value={summary.expired}
          variant="gray"
          delay={150}
          icon={
            <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
            </svg>
          }
        />
        <KPICard
          title="OCs pendientes"
          value={summary.poPending}
          variant="orange"
          delay={200}
          icon={
            <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          }
        />
      </div>

      <AlertsTable alerts={alerts} />
    </div>
  );
}
