import { STATUS_CONFIG } from '../../constants';
import { cn } from '../../utils';
import {
  Circle, MessageCircle, Lightbulb, FileText,
  ShieldCheck, CheckCheck, AlertTriangle
} from 'lucide-react';

const statusIcons = {
  open: Circle,
  in_discussion: MessageCircle,
  solution_proposed: Lightbulb,
  evidence_submitted: FileText,
  verification: ShieldCheck,
  verified_solved: CheckCheck,
  needs_attention: AlertTriangle,
};

export default function StatusBadge({ status, size = 'sm', showIcon = true, className = '' }) {
  const config = STATUS_CONFIG[status];
  if (!config) return null;

  const Icon = statusIcons[status];

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border font-medium',
        size === 'sm' ? 'px-2.5 py-0.5 text-caption' : 'px-3 py-1 text-body-sm',
        config.bgClass,
        className
      )}
      title={config.description}
    >
      {showIcon && Icon && (
        <Icon className={cn('flex-shrink-0', size === 'sm' ? 'h-3 w-3' : 'h-3.5 w-3.5')} />
      )}
      {config.label}
    </span>
  );
}
