import type { RunAlertValidationResponse } from '../../../types';
import './AlertRunPanel.css';

interface AlertRunPanelProps {
  onRun: () => void;
  onTestEmail: () => void;
  running: boolean;
  testingEmail: boolean;
  hasRunBefore: boolean;
  lastResult: RunAlertValidationResponse | null;
}

export default function AlertRunPanel({
  onRun,
  onTestEmail,
  running,
  testingEmail,
  hasRunBefore,
  lastResult,
}: AlertRunPanelProps) {
  const sentCount = lastResult?.emails?.filter((e) => e.status === 'SENT').length ?? 0;
  const mockedCount = lastResult?.emails?.filter((e) => e.status === 'MOCKED').length ?? 0;

  return (
    <section className="alert-run-panel">
      <div className="alert-run-panel__main">
        <div className="alert-run-panel__info">
          <div className="alert-run-panel__icon">
            <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
          </div>
          <div>
            <p className="alert-run-panel__title">Validación proactiva</p>
            <p className="alert-run-panel__desc">
              Detecta recursos por vencer, vencidos y OCs pendientes.
            </p>
          </div>
        </div>

        <div className="alert-run-panel__actions">
          <button
            type="button"
            className="alert-run-panel__btn alert-run-panel__btn--secondary"
            onClick={onTestEmail}
            disabled={running || testingEmail}
          >
            {testingEmail ? 'Probando…' : 'Probar correo'}
          </button>
          <button
            type="button"
            className="alert-run-panel__btn"
            onClick={onRun}
            disabled={running || testingEmail}
          >
            {running && <span className="alert-run-panel__spinner" aria-hidden="true" />}
            {running ? 'Ejecutando…' : hasRunBefore ? 'Ejecutar nuevamente' : 'Ejecutar validación'}
          </button>
        </div>
      </div>

      {lastResult && (
        <div className="alert-run-panel__result">
          <div className="alert-run-panel__stats">
            <div className="alert-run-panel__stat">
              <span className="alert-run-panel__stat-label">Recursos</span>
              <span className="alert-run-panel__stat-value">{lastResult.processedResources}</span>
            </div>
            <div className="alert-run-panel__stat">
              <span className="alert-run-panel__stat-label">OCs</span>
              <span className="alert-run-panel__stat-value">{lastResult.processedPurchaseOrders}</span>
            </div>
            <div className="alert-run-panel__stat">
              <span className="alert-run-panel__stat-label">Creadas</span>
              <span className="alert-run-panel__stat-value">{lastResult.createdAlerts}</span>
            </div>
            <div className="alert-run-panel__stat">
              <span className="alert-run-panel__stat-label">Omitidas</span>
              <span className="alert-run-panel__stat-value">{lastResult.skippedDuplicates}</span>
            </div>
            <div className="alert-run-panel__stat">
              <span className="alert-run-panel__stat-label">Correos</span>
              <span className="alert-run-panel__stat-value">
                {sentCount > 0 ? `${sentCount} env.` : `${mockedCount} mock`}
              </span>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
