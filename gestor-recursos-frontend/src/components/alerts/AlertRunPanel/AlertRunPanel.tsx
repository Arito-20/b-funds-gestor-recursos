import type { RunAlertValidationResponse } from '../../../types';
import './AlertRunPanel.css';

interface AlertRunPanelProps {
  onRun: () => void;
  running: boolean;
  lastResult: RunAlertValidationResponse | null;
}

export default function AlertRunPanel({ onRun, running, lastResult }: AlertRunPanelProps) {
  return (
    <section className="alert-run-panel">
      <div className="alert-run-panel__header">
        <div className="alert-run-panel__info">
          <div className="alert-run-panel__icon">
            <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
          </div>
          <div>
            <p className="alert-run-panel__title">Validación proactiva</p>
            <p className="alert-run-panel__desc">
              Ejecuta una validación para detectar recursos por vencer, vencidos y OCs pendientes.
            </p>
          </div>
        </div>
        <button
          type="button"
          className="alert-run-panel__btn"
          onClick={onRun}
          disabled={running}
        >
          {running && <span className="alert-run-panel__spinner" aria-hidden="true" />}
          {running ? 'Ejecutando…' : 'Ejecutar validación'}
        </button>
      </div>

      {lastResult && (
        <div className="alert-run-panel__result">
          <p className="alert-run-panel__result-title">Resultado de última validación</p>
          <div className="alert-run-panel__stats">
            <div className="alert-run-panel__stat">
              <p className="alert-run-panel__stat-label">Recursos procesados</p>
              <p className="alert-run-panel__stat-value">{lastResult.processedResources}</p>
            </div>
            <div className="alert-run-panel__stat">
              <p className="alert-run-panel__stat-label">OCs procesadas</p>
              <p className="alert-run-panel__stat-value">{lastResult.processedPurchaseOrders}</p>
            </div>
            <div className="alert-run-panel__stat">
              <p className="alert-run-panel__stat-label">Alertas creadas</p>
              <p className="alert-run-panel__stat-value">{lastResult.createdAlerts}</p>
            </div>
            <div className="alert-run-panel__stat">
              <p className="alert-run-panel__stat-label">Duplicados omitidos</p>
              <p className="alert-run-panel__stat-value">{lastResult.skippedDuplicates}</p>
            </div>
          </div>
          <div className="alert-run-panel__emails">
            <p className="alert-run-panel__emails-count">
              <strong>{lastResult.mockedEmails.length}</strong> correo
              {lastResult.mockedEmails.length !== 1 ? 's' : ''} mock generado
              {lastResult.mockedEmails.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>
      )}
    </section>
  );
}
