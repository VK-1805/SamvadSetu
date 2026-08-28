import { forwardRef } from 'react';
import { cn } from '../../utils';

const Textarea = forwardRef(function Textarea(
  { label, error, hint, required = false, className = '', id, rows = 4, maxLength, ...props },
  ref
) {
  const inputId = id || `textarea-${label?.toLowerCase().replace(/\s+/g, '-')}`;

  return (
    <div className="space-y-1.5">
      {label && (
        <label htmlFor={inputId} className="block text-body-sm font-medium text-text">
          {label}
          {required && <span className="text-danger ml-0.5">*</span>}
        </label>
      )}
      <textarea
        ref={ref}
        id={inputId}
        rows={rows}
        maxLength={maxLength}
        className={cn(
          'block w-full rounded-xl border bg-surface px-4 py-2.5',
          'text-body text-text placeholder:text-text-light',
          'transition-colors duration-200 resize-y min-h-[100px]',
          'focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary',
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
      <div className="flex justify-between items-center">
        <div>
          {error && (
            <p id={`${inputId}-error`} className="text-caption text-danger" role="alert">{error}</p>
          )}
          {hint && !error && (
            <p id={`${inputId}-hint`} className="text-caption text-text-muted">{hint}</p>
          )}
        </div>
        {maxLength && (
          <p className="text-caption text-text-light">
            {props.value?.length || 0}/{maxLength}
          </p>
        )}
      </div>
    </div>
  );
});

export default Textarea;
