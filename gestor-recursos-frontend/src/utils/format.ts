export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

export function formatDate(dateStr: string): string {
  const [year, month, day] = dateStr.split('-').map(Number);
  const dayStr = String(day).padStart(2, '0');
  const monthStr = String(month).padStart(2, '0');
  return `${dayStr}/${monthStr}/${year}`;
}

export function formatPeriodMonth(periodMonth: string): string {
  const [year, month] = periodMonth.split('-');
  const date = new Date(Number(year), Number(month) - 1, 1);
  return date.toLocaleDateString('es-PE', { month: 'long', year: 'numeric' });
}

export function formatOriginalAmount(amount: number, currency: string): string {
  return new Intl.NumberFormat('es-PE', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount) + ` ${currency}`;
}

export function getCurrentPeriodMonth(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

export function formatPONumber(poNumber: string | null | undefined): string {
  return poNumber?.trim() ? poNumber : 'Sin número';
}

export { parseLocalDate, calculateDaysRemaining } from './dates';
