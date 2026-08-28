import { cn, getInitials } from '../../utils';

const sizes = {
  xs: 'h-6 w-6 text-[10px]',
  sm: 'h-8 w-8 text-caption',
  md: 'h-10 w-10 text-body-sm',
  lg: 'h-12 w-12 text-body',
  xl: 'h-16 w-16 text-heading',
};

const roleColors = {
  citizen: 'bg-blue-100 text-blue-700',
  student: 'bg-purple-100 text-purple-700',
  industry: 'bg-amber-100 text-amber-700',
  admin: 'bg-emerald-100 text-emerald-700',
};

export default function Avatar({ name, src, size = 'md', role, className = '' }) {
  const initials = getInitials(name);

  if (src) {
    return (
      <img
        src={src}
        alt={name || 'User avatar'}
        className={cn(
          'rounded-full object-cover flex-shrink-0 ring-2 ring-surface',
          sizes[size],
          className
        )}
      />
    );
  }

  return (
    <div
      className={cn(
        'rounded-full flex items-center justify-center font-semibold flex-shrink-0 ring-2 ring-surface',
        sizes[size],
        role ? roleColors[role] : 'bg-primary-100 text-primary',
        className
      )}
      aria-label={name || 'User avatar'}
    >
      {initials}
    </div>
  );
}
