import type { ReactNode } from 'react';
import './EmptyState.css';

interface EmptyStateProps {
  icon: ReactNode;
  title: string;
  subtitle?: string;
  variant?: 'success' | 'neutral';
}

export default function EmptyState({ icon, title, subtitle, variant = 'neutral' }: EmptyStateProps) {
  return (
    <div className="empty-state animate-fade-in">
      <div className={`empty-state__icon empty-state__icon--${variant}`}>
        {icon}
      </div>
      <p className="empty-state__title">{title}</p>
      {subtitle && <p className="empty-state__subtitle">{subtitle}</p>}
    </div>
  );
}
