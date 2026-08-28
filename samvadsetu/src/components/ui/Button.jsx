import { cn } from '../../utils';

const variants = {
  primary: 'bg-primary text-white hover:bg-primary-light active:bg-primary-dark shadow-sm',
  secondary: 'bg-secondary text-white hover:bg-secondary-light active:bg-secondary-dark shadow-sm',
  accent: 'bg-accent text-white hover:bg-accent-light active:bg-accent-dark shadow-sm',
  outline: 'border-2 border-primary text-primary hover:bg-primary hover:text-white',
  ghost: 'text-text-muted hover:bg-surface-alt hover:text-text',
  danger: 'bg-danger text-white hover:bg-danger-dark shadow-sm',
  success: 'bg-success text-white hover:bg-success-dark shadow-sm',
};

const sizes = {
  sm: 'px-3 py-1.5 text-body-sm gap-1.5',
  md: 'px-5 py-2.5 text-body gap-2',
  lg: 'px-7 py-3.5 text-body-lg gap-2.5',
};

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  icon: Icon,
  iconRight: IconRight,
  className = '',
  type = 'button',
  fullWidth = false,
  ...props
}) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      className={cn(
        'inline-flex items-center justify-center font-medium rounded-xl',
        'transition-all duration-200 ease-out',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
        'disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none',
        'active:scale-[0.98]',
        variants[variant],
        sizes[size],
        fullWidth && 'w-full',
        className
      )}
      {...props}
    >
      {loading ? (
        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      ) : Icon ? (
        <Icon className="h-4 w-4 flex-shrink-0" />
      ) : null}
      {children}
      {IconRight && !loading && <IconRight className="h-4 w-4 flex-shrink-0" />}
    </button>
  );
}
