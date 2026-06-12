export function parseLocalDate(value: string): Date {
  const [year, month, day] = value.split('-').map(Number);
  return new Date(year, month - 1, day);
}

export function calculateDaysRemaining(endDate: string, referenceDate?: Date): number {
  const end = parseLocalDate(endDate);
  const today = referenceDate ?? new Date();
  const ref = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const diffMs = end.getTime() - ref.getTime();
  return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
}
