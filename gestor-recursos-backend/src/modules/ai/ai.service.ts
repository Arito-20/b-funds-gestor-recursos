import { Injectable } from '@nestjs/common';
import { DashboardService } from '../dashboard/dashboard.service';

export interface ExecutiveSummaryMetrics {
  activeResources: number;
  monthlyCostUsd: number;
  totalCommittedUsd: number;
  pendingPurchaseOrders: number;
  riskResources: number;
}

export interface ExecutiveSummaryResponse {
  scope: string;
  summary: string;
  risks: string[];
  recommendations: string[];
  metrics: ExecutiveSummaryMetrics;
  workatoReady: boolean;
  generatedAt: string;
}

@Injectable()
export class AiService {
  constructor(private readonly dashboardService: DashboardService) {}

  async getExecutiveSummary(
    managerId?: number,
    role?: string,
    userName?: string,
  ): Promise<ExecutiveSummaryResponse> {
    const data = await this.dashboardService.getSummary(managerId, role);

    const pendingPOs =
      data.pendingPurchaseOrdersThisMonth ?? data.pendingPurchaseOrders;
    const riskResources = data.expired + data.expiringRed + data.expiringAmber;
    const isManager = role === 'MANAGER';

    const scope = isManager
      ? (userName ?? 'Manager')
      : 'Vista financiera consolidada';

    const subject = isManager ? 'Tu cartera' : 'La vista financiera consolidada';

    const summary = this.buildSummary(data, subject, riskResources);
    const risks = this.buildRisks(data, pendingPOs, riskResources);
    const recommendations = this.buildRecommendations(
      data,
      pendingPOs,
      riskResources,
    );

    return {
      scope,
      summary,
      risks,
      recommendations,
      metrics: {
        activeResources: data.activeResources,
        monthlyCostUsd: data.monthlyCostUsd,
        totalCommittedUsd: data.totalCommittedUsd,
        pendingPurchaseOrders: pendingPOs,
        riskResources,
      },
      workatoReady: true,
      generatedAt: new Date().toISOString(),
    };
  }

  private buildSummary(
    data: Awaited<ReturnType<DashboardService['getSummary']>>,
    subject: string,
    riskResources: number,
  ): string {
    const parts: string[] = [];

    if (data.expired > 0) {
      parts.push(
        `${subject} tiene ${data.expired} recurso(s) vencido(s) que requieren acción inmediata.`,
      );
    }
    if (data.expiringRed > 0) {
      parts.push(
        `Hay ${data.expiringRed} recurso(s) en estado crítico con menos de 15 días para vencer.`,
      );
    }
    if (data.expiringAmber > 0 && data.expired === 0 && data.expiringRed === 0) {
      parts.push(
        `${data.expiringAmber} recurso(s) vencen en los próximos 15 a 30 días.`,
      );
    }

    const base = `${subject} cuenta con ${data.activeResources} recurso(s) activo(s), un costo mensual de ${this.formatUsd(data.monthlyCostUsd)} y un total comprometido de ${this.formatUsd(data.totalCommittedUsd)}.`;

    if (parts.length === 0 && riskResources === 0) {
      return `${base} La cartera de vencimientos se mantiene estable.`;
    }

    return `${parts.join(' ')} ${base}`.trim();
  }

  private buildRisks(
    data: Awaited<ReturnType<DashboardService['getSummary']>>,
    pendingPOs: number,
    riskResources: number,
  ): string[] {
    const risks: string[] = [];

    if (data.expired > 0) {
      risks.push(
        `Hay ${data.expired} recurso(s) vencido(s) fuera de plazo.`,
      );
    }
    if (data.expiringRed > 0) {
      risks.push(
        `${data.expiringRed} recurso(s) en vencimiento crítico (menos de 15 días).`,
      );
    }
    if (data.expiringAmber > 0) {
      risks.push(
        `${data.expiringAmber} recurso(s) por vencer entre 15 y 30 días.`,
      );
    }
    if (pendingPOs > 0) {
      risks.push(
        `Existe${pendingPOs === 1 ? '' : 'n'} ${pendingPOs} OC(s) pendiente(s) del mes actual.`,
      );
    }

    if (riskResources === 0 && pendingPOs === 0) {
      risks.push(
        'No se detectan riesgos prioritarios de vencimiento en este momento.',
      );
    }

    return risks;
  }

  private buildRecommendations(
    data: Awaited<ReturnType<DashboardService['getSummary']>>,
    pendingPOs: number,
    riskResources: number,
  ): string[] {
    const recommendations: string[] = [];

    if (pendingPOs > 0) {
      recommendations.push('Revisar las OCs pendientes.');
    }
    if (riskResources > 0) {
      recommendations.push('Mantener seguimiento semanal de vencimientos.');
    }

    const budgetUsage =
      data.visibleBudgetUsd > 0
        ? (data.totalCommittedUsd / data.visibleBudgetUsd) * 100
        : 0;

    if (budgetUsage >= 70) {
      recommendations.push(
        'Evaluar el consumo presupuestal y priorizar iniciativas con mayor uso.',
      );
    }

    if (recommendations.length === 0) {
      recommendations.push('Continuar con el monitoreo rutinario de la cartera.');
    }

    return recommendations;
  }

  private formatUsd(value: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  }
}
