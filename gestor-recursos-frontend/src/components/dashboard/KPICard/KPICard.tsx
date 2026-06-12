import { formatCurrency } from '../../../utils/format';
import './KPICard.css';

export type KPIVariant = 'purple' | 'amber' | 'red' | 'gray' | 'orange';

interface KPICardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  variant?: KPIVariant;
  isCurrency?: boolean;
  icon: React.ReactNode;
  delay?: number;
}

export default function KPICard({
  title,
  value,
  subtitle,
  variant = 'purple',
  isCurrency = false,
  icon,
  delay = 0,
}: KPICardProps) {
  const displayValue = isCurrency && typeof value === 'number' ? formatCurrency(value) : value;

  return (
    <div
      className={`kpi-card kpi-card--${variant}`}
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-start gap-2.5">
        <div className={`kpi-card__icon kpi-card__icon--${variant}`}>
          {icon}
        </div>
        <div className="min-w-0 flex-1">
          <p className="kpi-card__title">{title}</p>
          <p className={`kpi-card__value kpi-card__value--${variant}`}>{displayValue}</p>
          {subtitle && <p className="kpi-card__subtitle">{subtitle}</p>}
        </div>
      </div>
    </div>
  );
}
