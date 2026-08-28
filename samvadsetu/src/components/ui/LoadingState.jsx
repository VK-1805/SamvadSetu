import { cn } from '../../utils';

export default function LoadingState({ message = 'Loading...', className = '' }) {
  return (
    <div className={cn('flex flex-col items-center justify-center py-16 px-6', className)}>
      <div className="relative mb-4">
        <div className="h-12 w-12 rounded-full border-4 border-surface-alt border-t-primary animate-spin" />
      </div>
      <p className="text-body-sm text-text-muted animate-pulse-soft">{message}</p>
    </div>
  );
}
