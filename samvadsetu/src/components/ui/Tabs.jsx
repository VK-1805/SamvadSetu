import { cn } from '../../utils';

export default function Tabs({ tabs, activeTab, onChange, className = '' }) {
  return (
    <div className={cn('flex border-b border-border overflow-x-auto scrollbar-hide', className)}>
      {tabs.map((tab) => (
        <button
          key={tab.value}
          onClick={() => onChange(tab.value)}
          className={cn(
            'flex items-center gap-2 px-4 py-3 text-body-sm font-medium whitespace-nowrap',
            'border-b-2 transition-all duration-200 -mb-px',
            activeTab === tab.value
              ? 'border-primary text-primary'
              : 'border-transparent text-text-muted hover:text-text hover:border-border-strong'
          )}
          role="tab"
          aria-selected={activeTab === tab.value}
        >
          {tab.icon && <tab.icon className="h-4 w-4" />}
          {tab.label}
          {tab.count !== undefined && (
            <span
              className={cn(
                'rounded-full px-1.5 py-0.5 text-caption font-medium',
                activeTab === tab.value
                  ? 'bg-primary-50 text-primary'
                  : 'bg-surface-alt text-text-muted'
              )}
            >
              {tab.count}
            </span>
          )}
        </button>
      ))}
    </div>
  );
}
