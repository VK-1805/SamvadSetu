import { forwardRef } from 'react';
import { cn } from '../../utils';

const Input = forwardRef(function Input(
  {
    label,
    error,
    hint,
    icon: Icon,
    required = false,
    className = '',
    id,
    ...props
  },
  ref
) {
  const inputId = id || `input-${label?.toLowerCase().replace(/\s+/g, '-')}`;

  return (
    <div className="space-y-1.5">
      {label && (
        <label
          htmlFor={inputId}
          className="block text-body-sm font-medium text-text"
        >
          {label}
          {required && <span className="text-danger ml-0.5">*</span>}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Icon className="h-4 w-4 text-text-muted" />
          </div>
        )}
        <input
          ref={ref}
          id={inputId}
          className={cn(
            'block w-full rounded-xl border bg-surface px-4 py-2.5',
            'text-body text-text placeholder:text-text-light',
            'transition-colors duration-200',
            'focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary',
            Icon && 'pl-10',
            error
              ? 'border-danger focus:ring-danger/20 focus:border-danger'
              : 'border-border hover:border-border-strong',
            'disabled:bg-surface-alt disabled:cursor-not-allowed disabled:opacity-60',
            className
          )}
          aria-invalid={error ? 'true' : undefined}
          aria-describedby={error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined}
          {...props}
        />
      </div>
      {error && (
        <p id={`${inputId}-error`} className="text-caption text-danger flex items-center gap-1" role="alert">
          <svg className="h-3.5 w-3.5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          {error}
        </p>
      )}
      {hint && !error && (
        <p id={`${inputId}-hint`} className="text-caption text-text-muted">{hint}</p>
      )}
    </div>
  );
});

export default Input;
