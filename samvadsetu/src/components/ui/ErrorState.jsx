import { AlertTriangle, RefreshCw } from 'lucide-react';
import Button from './Button';
import { cn } from '../../utils';

export default function ErrorState({
  title = 'Something went wrong',
  message = 'An unexpected error occurred. Please try again.',
  onRetry,
  className = '',
}) {
  return (
    <div className={cn('flex flex-col items-center justify-center py-16 px-6 text-center', className)}>
      <div className="w-16 h-16 rounded-2xl bg-danger-light flex items-center justify-center mb-4">
        <AlertTriangle className="h-8 w-8 text-danger" />
      </div>
      <h3 className="text-heading-sm text-text mb-2">{title}</h3>
      <p className="text-body-sm text-text-muted max-w-sm mb-6">{message}</p>
      {onRetry && (
        <Button variant="outline" size="md" icon={RefreshCw} onClick={onRetry}>
          Try Again
        </Button>
      )}
    </div>
  );
}
