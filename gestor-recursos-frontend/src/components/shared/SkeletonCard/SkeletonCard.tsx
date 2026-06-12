import './SkeletonCard.css';

interface SkeletonCardProps {
  height?: number;
  className?: string;
}

export function SkeletonBlock({ height = 16, className = '' }: SkeletonCardProps) {
  return (
    <div
      className={`skeleton-block ${className}`}
      style={{ height }}
    />
  );
}

export function SkeletonKPICard() {
  return (
    <div className="skeleton-card">
      <div className="flex items-start gap-4">
        <SkeletonBlock height={40} className="w-10 shrink-0 rounded-xl" />
        <div className="flex-1 space-y-3">
          <SkeletonBlock height={14} className="w-2/3" />
          <SkeletonBlock height={32} className="w-1/2" />
          <SkeletonBlock height={12} className="w-1/3" />
        </div>
      </div>
    </div>
  );
}

export function SkeletonTable({ rows = 5, cols = 6 }: { rows?: number; cols?: number }) {
  return (
    <div className="skeleton-card overflow-hidden p-0">
      <div className="px-6 py-4 border-b border-[#e5e7eb]">
        <SkeletonBlock height={20} className="w-48" />
      </div>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="skeleton-table-row">
          {Array.from({ length: cols }).map((_, j) => (
            <SkeletonBlock key={j} height={14} className="flex-1" />
          ))}
        </div>
      ))}
    </div>
  );
}

export function SkeletonPage() {
  return (
    <div className="skeleton-page">
      <div className="space-y-2">
        <SkeletonBlock height={32} className="w-72" />
        <SkeletonBlock height={16} className="w-96" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <SkeletonKPICard key={i} />
        ))}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <SkeletonKPICard key={i} />
        ))}
      </div>
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <SkeletonTable rows={4} cols={5} />
        <SkeletonTable rows={4} cols={3} />
      </div>
    </div>
  );
}

export default function SkeletonCard() {
  return <SkeletonKPICard />;
}
