import './ProgressBar.css';

type ProgressTone = 'default' | 'warning' | 'danger';

interface ProgressBarProps {
  percentage: number;
  danger?: boolean;
  tone?: ProgressTone;
  animated?: boolean;
}

export default function ProgressBar({
  percentage,
  danger = false,
  tone,
  animated = true,
}: ProgressBarProps) {
  const resolvedTone: ProgressTone = tone ?? (danger ? 'danger' : 'default');
  const width = Math.min(Math.max(percentage, 0), 100);

  return (
    <div className="progress-bar__track">
      <div
        className={`progress-bar__fill progress-bar__fill--${resolvedTone} ${animated ? 'progress-bar__fill--animated' : ''}`}
        style={{ width: `${width}%` }}
      />
    </div>
  );
}
