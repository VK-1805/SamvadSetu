import { forwardRef } from 'react';
import { cn } from '../../utils';
import { ChevronDown } from 'lucide-react';

const Select = forwardRef(function Select(
  { label, error, hint, required = false, options = [], placeholder, className = '', id, ...props },
  ref
) {
  const inputId = id || `select-${label?.toLowerCase().replace(/\s+/g, '-')}`;

  return (
    <div className="space-y-1.5">
      {label && (
        <label htmlFor={inputId} className="block text-body-sm font-medium text-text">
          {label}
          {required && <span className="text-danger ml-0.5">*</span>}
        </label>
      )}
      <div className="relative">
        <select
          ref={ref}
          id={inputId}
          className={cn(
            'block w-full rounded-xl border bg-surface px-4 py-2.5 pr-10',
            'text-body text-text appearance-none',
            'transition-colors duration-200',
            'focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary',
            error
              ? 'border-danger focus:ring-danger/20 focus:border-danger'
              : 'border-border hover:border-border-strong',
            'disabled:bg-surface-alt disabled:cursor-not-allowed disabled:opacity-60',
            className
          )}
          aria-invalid={error ? 'true' : undefined}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.icon ? `${opt.icon} ${opt.label}` : opt.label}
            </option>
          ))}
        </select>
        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted pointer-events-none" />
      </div>
      {error && (
        <p className="text-caption text-danger" role="alert">{error}</p>
      )}
      {hint && !error && (
        <p className="text-caption text-text-muted">{hint}</p>
      )}
    </div>
  );
});

export default Select;
