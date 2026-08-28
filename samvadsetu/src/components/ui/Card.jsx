import { cn } from '../../utils';

export default function Card({ children, className = '', hover = false, padding = true, ...props }) {
  return (
    <div
      className={cn(
        'bg-surface rounded-2xl border border-border',
        hover ? 'shadow-card transition-all duration-250 hover:shadow-card-hover hover:border-border-strong cursor-pointer' : 'shadow-card',
        padding && 'p-5 sm:p-6',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ children, className = '' }) {
  return (
    <div className={cn('mb-4', className)}>
      {children}
    </div>
  );
}

export function CardContent({ children, className = '' }) {
  return (
    <div className={cn('', className)}>
      {children}
    </div>
  );
}

export function CardFooter({ children, className = '' }) {
  return (
    <div className={cn('mt-4 pt-4 border-t border-border', className)}>
      {children}
    </div>
  );
}
