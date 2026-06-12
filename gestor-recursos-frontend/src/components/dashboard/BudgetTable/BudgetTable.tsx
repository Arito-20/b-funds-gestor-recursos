import type { EnrichedCostByInitiative } from '../../../utils/dashboard';
import { getBudgetRiskLevel, getBudgetRiskLabel } from '../../../utils/dashboard';
import ProgressBar from '../../shared/ProgressBar/ProgressBar';
import EmptyState from '../../shared/EmptyState/EmptyState';
import { formatCurrency } from '../../../utils/format';
import './BudgetTable.css';

interface BudgetTableProps {
  items: EnrichedCostByInitiative[];
}

export default function BudgetTable({ items }: BudgetTableProps) {
  return (
    <div className="budget-table animate-fade-in-up" style={{ animationDelay: '100ms' }}>
      <div className="budget-table__header">
        <div className="budget-table__header-icon">
          <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        </div>
        <h2 className="budget-table__title">Presupuesto por iniciativa</h2>
      </div>

      {items.length === 0 ? (
        <div className="budget-table__empty">
          <EmptyState
            title="No hay información presupuestal disponible."
            icon={
              <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
            }
          />
        </div>
      ) : (
        <div className="budget-table__body">
          {items.map(item => {
            const committed = Number(item.totalCostUsd);
            const riskLevel = getBudgetRiskLevel(item.consumptionPercent);
            const progressTone = riskLevel === 'exceeded' ? 'danger' : riskLevel === 'warning' ? 'warning' : 'default';

            return (
              <div key={item.initiativeId} className="budget-item">
                <div className="budget-item__header">
                  <div className="budget-item__info">
                    <p className="budget-item__name">{item.initiativeName}</p>
                    <p className="budget-item__count">{item.resourceCount} recurso(s)</p>
                  </div>
                  <span className={`budget-item__risk budget-item__risk--${riskLevel}`}>
                    {getBudgetRiskLabel(riskLevel)}
                  </span>
                </div>

                <div className="budget-item__amounts">
                  <div className="budget-item__amount-row">
                    <span className="budget-item__amount-label">Presupuesto</span>
                    <span className="budget-item__amount-value">
                      {item.budgetUsd > 0 ? formatCurrency(item.budgetUsd) : '—'}
                    </span>
                  </div>
                  <div className="budget-item__amount-row">
                    <span className="budget-item__amount-label">Comprometido</span>
                    <span className="budget-item__amount-value budget-item__amount-value--committed">
                      {formatCurrency(committed)}
                    </span>
                  </div>
                  <div className="budget-item__amount-row">
                    <span className="budget-item__amount-label">Disponible</span>
                    <span className="budget-item__amount-value budget-item__amount-value--available">
                      {item.budgetUsd > 0 ? formatCurrency(item.availableUsd) : '—'}
                    </span>
                  </div>
                </div>

                {item.budgetUsd > 0 && (
                  <>
                    <ProgressBar
                      percentage={item.consumptionPercent}
                      tone={progressTone}
                      animated
                    />
                    <p className="budget-item__consumption">
                      Consumo: {item.consumptionPercent}%
                    </p>
                  </>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
