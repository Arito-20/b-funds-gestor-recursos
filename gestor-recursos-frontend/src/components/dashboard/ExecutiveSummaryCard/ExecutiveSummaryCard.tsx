import { useCallback, useEffect, useRef, useState } from 'react';
import { aiApi } from '../../../services/api';
import type { ExecutiveSummaryResponse } from '../../../types';
import { formatCurrency } from '../../../utils/format';
import './ExecutiveSummaryCard.css';

function formatLastUpdated(date: Date): string {
  return date.toLocaleTimeString('es-PE', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });
}

export default function ExecutiveSummaryCard() {
  const [data, setData] = useState<ExecutiveSummaryResponse | null>(null);
  const [initialLoading, setInitialLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [initialError, setInitialError] = useState<string | null>(null);
  const [refreshFeedback, setRefreshFeedback] = useState<'success' | 'error' | null>(null);
  const [lastUpdatedAt, setLastUpdatedAt] = useState<Date | null>(null);
  const feedbackTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearFeedbackTimer = useCallback(() => {
    if (feedbackTimerRef.current) {
      clearTimeout(feedbackTimerRef.current);
      feedbackTimerRef.current = null;
    }
  }, []);

  const showRefreshFeedback = useCallback((status: 'success' | 'error') => {
    clearFeedbackTimer();
    setRefreshFeedback(status);
    feedbackTimerRef.current = setTimeout(() => {
      setRefreshFeedback(null);
      feedbackTimerRef.current = null;
    }, 2000);
  }, [clearFeedbackTimer]);

  const loadSummary = useCallback(async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
      setRefreshFeedback(null);
      clearFeedbackTimer();
    } else {
      setInitialLoading(true);
      setInitialError(null);
    }

    try {
      const res = await aiApi.getExecutiveSummary();
      setData(res.data);
      setLastUpdatedAt(new Date());
      if (isRefresh) {
        showRefreshFeedback('success');
      }
    } catch {
      if (isRefresh) {
        showRefreshFeedback('error');
      } else {
        setInitialError('No pudimos generar el resumen ejecutivo.');
        setData(null);
      }
    } finally {
      if (isRefresh) {
        setRefreshing(false);
      } else {
        setInitialLoading(false);
      }
    }
  }, [clearFeedbackTimer, showRefreshFeedback]);

  useEffect(() => {
    loadSummary(false);
  }, [loadSummary]);

  useEffect(() => () => clearFeedbackTimer(), [clearFeedbackTimer]);

  const isRefreshing = refreshing;
  const cardClassName = [
    'executive-summary-card',
    'animate-fade-in-up',
    isRefreshing ? 'executive-summary-card--refreshing' : '',
    refreshFeedback === 'success' ? 'executive-summary-card--updated' : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <section className={cardClassName}>
      <div className={`executive-summary-card__header${isRefreshing ? ' executive-summary-card__header--shimmer' : ''}`}>
        <div className="executive-summary-card__heading">
          <div className="executive-summary-card__icon">
            <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </div>
          <div>
            <div className="executive-summary-card__title-row">
              <h2 className="executive-summary-card__title">Resumen ejecutivo</h2>
              <span className="executive-summary-card__badge">Workato GO-ready</span>
            </div>
            <p className="executive-summary-card__subtitle">Lectura automática del estado del área</p>
          </div>
        </div>

        <button
          type="button"
          className="executive-summary-card__refresh"
          onClick={() => loadSummary(true)}
          disabled={initialLoading || isRefreshing}
        >
          {isRefreshing && <span className="executive-summary-card__spinner" aria-hidden="true" />}
          {isRefreshing ? 'Actualizando...' : 'Actualizar resumen'}
        </button>
      </div>

      {(refreshFeedback || lastUpdatedAt) && (
        <div className="executive-summary-card__status" aria-live="polite">
          {refreshFeedback === 'success' && (
            <span className="executive-summary-card__status-message executive-summary-card__status-message--success">
              Resumen actualizado
            </span>
          )}
          {refreshFeedback === 'error' && (
            <span className="executive-summary-card__status-message executive-summary-card__status-message--error">
              No se pudo actualizar el resumen
            </span>
          )}
          {lastUpdatedAt && (
            <span className="executive-summary-card__status-time">
              Última actualización: {formatLastUpdated(lastUpdatedAt)}
            </span>
          )}
        </div>
      )}

      {initialLoading && !data && (
        <p className="executive-summary-card__loading">Consultando resumen...</p>
      )}

      {initialError && !data && (
        <p className="executive-summary-card__error">{initialError}</p>
      )}

      {data && (
        <div className={`executive-summary-card__content${isRefreshing ? ' executive-summary-card__content--dimmed' : ''}`}>
          <p className="executive-summary-card__scope">{data.scope}</p>
          <p className="executive-summary-card__summary">{data.summary}</p>

          <div className="executive-summary-card__columns">
            <div className="executive-summary-card__block">
              <p className="executive-summary-card__block-title">Riesgos</p>
              <ul className="executive-summary-card__list">
                {data.risks.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
            <div className="executive-summary-card__block">
              <p className="executive-summary-card__block-title">Recomendaciones</p>
              <ul className="executive-summary-card__list executive-summary-card__list--recommendations">
                {data.recommendations.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          </div>

          <div className="executive-summary-card__metrics">
            <div className="executive-summary-card__metric">
              <span className="executive-summary-card__metric-label">Recursos activos</span>
              <span className="executive-summary-card__metric-value">{data.metrics.activeResources}</span>
            </div>
            <div className="executive-summary-card__metric">
              <span className="executive-summary-card__metric-label">Costo mensual</span>
              <span className="executive-summary-card__metric-value">{formatCurrency(data.metrics.monthlyCostUsd)}</span>
            </div>
            <div className="executive-summary-card__metric">
              <span className="executive-summary-card__metric-label">Comprometido</span>
              <span className="executive-summary-card__metric-value">{formatCurrency(data.metrics.totalCommittedUsd)}</span>
            </div>
            <div className="executive-summary-card__metric">
              <span className="executive-summary-card__metric-label">OCs pendientes</span>
              <span className="executive-summary-card__metric-value">{data.metrics.pendingPurchaseOrders}</span>
            </div>
            <div className="executive-summary-card__metric">
              <span className="executive-summary-card__metric-label">En riesgo</span>
              <span className="executive-summary-card__metric-value">{data.metrics.riskResources}</span>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
