import type {
  CostByInitiative,
  DashboardSummary,
  ExpiringSoonItem,
  Initiative,
  PurchaseOrder,
  Resource,
} from '../types';

export interface EnrichedCostByInitiative extends CostByInitiative {
  budgetUsd: number;
  availableUsd: number;
  consumptionPercent: number;
}

export type BudgetRiskLevel = 'ok' | 'warning' | 'exceeded';

const EXPIRATION_PRIORITY: Record<string, number> = {
  EXPIRED: 0,
  RED: 1,
  AMBER: 2,
  GREEN: 3,
};

export function computeVisibleBudgetUsd(
  initiatives: Initiative[],
  resources: Resource[],
  role: string,
  summary?: DashboardSummary,
): number {
  if (summary?.visibleBudgetUsd != null) {
    return Number(summary.visibleBudgetUsd);
  }
  if (role === 'FINANCE' || role === 'ADMIN') {
    return initiatives.reduce((sum, i) => sum + Number(i.budgetUsd), 0);
  }
  const initiativeIds = new Set(resources.map(r => r.mainInitiativeId));
  return initiatives
    .filter(i => initiativeIds.has(i.id))
    .reduce((sum, i) => sum + Number(i.budgetUsd), 0);
}

export function computeAvailableBudgetUsd(
  visibleBudgetUsd: number,
  totalCommittedUsd: number,
  summary?: DashboardSummary,
): number {
  if (summary?.availableBudgetUsd != null) {
    return Number(summary.availableBudgetUsd);
  }
  return Math.max(visibleBudgetUsd - totalCommittedUsd, 0);
}

export function countPendingPOsThisMonth(orders: PurchaseOrder[], currentPeriod: string): number {
  return orders.filter(o => o.status === 'PENDING' && o.periodMonth === currentPeriod).length;
}

export function countPendingPOsAll(orders: PurchaseOrder[]): number {
  return orders.filter(o => o.status === 'PENDING').length;
}

export function countReviewRequiredResources(summary: DashboardSummary): number {
  return summary.expiringAmber + summary.expiringRed + summary.expired;
}

export function sortAndFilterExpiringSoon(items: ExpiringSoonItem[]): ExpiringSoonItem[] {
  return items
    .filter(item => item.expirationStatus !== 'GREEN')
    .sort((a, b) => {
      const priorityA = EXPIRATION_PRIORITY[a.expirationStatus] ?? 99;
      const priorityB = EXPIRATION_PRIORITY[b.expirationStatus] ?? 99;
      if (priorityA !== priorityB) return priorityA - priorityB;
      return a.daysRemaining - b.daysRemaining;
    });
}

export function enrichCostByInitiative(
  items: CostByInitiative[],
  initiatives: Initiative[],
): EnrichedCostByInitiative[] {
  const budgetById = new Map(initiatives.map(i => [i.id, Number(i.budgetUsd)]));

  return items.map(item => {
    const budgetUsd = item.budgetUsd != null
      ? Number(item.budgetUsd)
      : budgetById.get(item.initiativeId) ?? 0;
    const committed = Number(item.totalCostUsd);
    const availableUsd = item.availableUsd != null
      ? Number(item.availableUsd)
      : Math.max(budgetUsd - committed, 0);
    const consumptionPercent = item.usagePercentage != null
      ? Number(item.usagePercentage)
      : budgetUsd > 0
        ? Math.round((committed / budgetUsd) * 1000) / 10
        : 0;

    return {
      ...item,
      budgetUsd,
      availableUsd,
      consumptionPercent,
    };
  });
}

export function getBudgetRiskLevel(consumptionPercent: number): BudgetRiskLevel {
  if (consumptionPercent > 100) return 'exceeded';
  if (consumptionPercent >= 80) return 'warning';
  return 'ok';
}

export function getBudgetRiskLabel(level: BudgetRiskLevel): string {
  switch (level) {
    case 'exceeded': return 'Excedido';
    case 'warning': return 'Riesgo';
    default: return 'OK';
  }
}
