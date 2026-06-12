import { ExpirationStatus } from '../enums';

export class ResourceCalculationsService {

  static calculateMonthlyCostUsd(
    monthlyCostOriginal: number,
    exchangeRateToUsd: number,
  ): number {
    if (exchangeRateToUsd <= 0) throw new Error('El tipo de cambio debe ser mayor a 0');
    return Math.round((monthlyCostOriginal / exchangeRateToUsd) * 100) / 100;
  }

  static parseLocalDate(value: string): Date {
    const [year, month, day] = value.split('-').map(Number);
    return new Date(year, month - 1, day);
  }

  static calculateDurationMonths(startDate: string, endDate: string): number {
    const start = this.parseLocalDate(startDate);
    const end = this.parseLocalDate(endDate);
    const months =
      (end.getFullYear() - start.getFullYear()) * 12 +
      (end.getMonth() - start.getMonth()) + 1;
    return Math.max(1, months);
  }

  static calculateTotalCostUsd(
    monthlyCostUsd: number,
    durationMonths: number,
  ): number {
    return Math.round(monthlyCostUsd * durationMonths * 100) / 100;
  }

  static getExpirationStatus(endDate: string): ExpirationStatus {
    const daysRemaining = this.getDaysRemaining(endDate);

    if (daysRemaining < 0) return ExpirationStatus.EXPIRED;
    if (daysRemaining < 15) return ExpirationStatus.RED;
    if (daysRemaining <= 30) return ExpirationStatus.AMBER;
    return ExpirationStatus.GREEN;
  }

  static getDaysRemaining(endDate: string): number {
    const end = this.parseLocalDate(endDate);
    const today = new Date();
    const ref = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const diffMs = end.getTime() - ref.getTime();
    return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  }
}