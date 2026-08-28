import { cn } from '../../utils';

const colorMap = {
  primary: 'bg-primary-50 text-primary border-primary-200',
  secondary: 'bg-secondary-50 text-secondary border-secondary-200',
  accent: 'bg-accent-50 text-accent border-accent-200',
  success: 'bg-success-light text-success-dark border-emerald-200',
  warning: 'bg-warning-light text-warning-dark border-amber-200',
  danger: 'bg-danger-light text-danger-dark border-red-200',
  info: 'bg-info-light text-info-dark border-blue-200',
  neutral: 'bg-surface-alt text-text-muted border-border',
};

export default function Badge({ children, color = 'neutral', size = 'sm', icon: Icon, className = '' }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full border font-medium',
        size === 'sm' ? 'px-2 py-0.5 text-caption' : 'px-3 py-1 text-body-sm',
        colorMap[color],
        className
      )}
    >
      {Icon && <Icon className="h-3 w-3 flex-shrink-0" />}
      {children}
    </span>
  );
}
