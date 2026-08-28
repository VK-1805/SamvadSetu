import { Inbox } from 'lucide-react';
import Button from './Button';
import { cn } from '../../utils';

export default function EmptyState({
  icon: Icon = Inbox,
  title = 'Nothing here yet',
  description = '',
  action,
  actionLabel = 'Get Started',
  className = '',
}) {
  return (
    <div className={cn('flex flex-col items-center justify-center py-16 px-6 text-center', className)}>
      <div className="w-16 h-16 rounded-2xl bg-surface-alt flex items-center justify-center mb-4">
        <Icon className="h-8 w-8 text-text-muted" />
      </div>
      <h3 className="text-heading-sm text-text mb-2">{title}</h3>
      {description && (
        <p className="text-body-sm text-text-muted max-w-sm mb-6">{description}</p>
      )}
      {action && (
        <Button variant="primary" size="md" onClick={action}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
