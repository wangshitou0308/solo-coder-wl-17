import type { LucideIcon } from 'lucide-react';
import { PackageOpen, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: LucideIcon;
  actionLabel?: string;
  onAction?: () => void;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizeStyles: Record<NonNullable<EmptyStateProps['size']>, {
  container: string;
  iconWrapper: string;
  icon: number;
  title: string;
  description: string;
}> = {
  sm: {
    container: 'py-8 px-4',
    iconWrapper: 'w-14 h-14 rounded-xl',
    icon: 24,
    title: 'text-base',
    description: 'text-xs',
  },
  md: {
    container: 'py-12 px-6',
    iconWrapper: 'w-20 h-20 rounded-2xl',
    icon: 32,
    title: 'text-lg',
    description: 'text-sm',
  },
  lg: {
    container: 'py-20 px-8',
    iconWrapper: 'w-28 h-28 rounded-3xl',
    icon: 44,
    title: 'text-xl',
    description: 'text-base',
  },
};

export function EmptyState({
  title,
  description,
  icon: Icon = PackageOpen,
  actionLabel,
  onAction,
  size = 'md',
  className,
}: EmptyStateProps) {
  const styles = sizeStyles[size];

  return (
    <div
      className={cn(
        'relative flex flex-col items-center justify-center text-center',
        styles.container,
        className
      )}
    >
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-5">
        <div className="w-64 h-64 rounded-full bg-primary-500 blur-3xl" />
      </div>

      <div className="relative flex flex-col items-center gap-4 max-w-sm">
        <div
          className={cn(
            'relative flex items-center justify-center bg-slate-800/60 border border-slate-700/60 transition-transform duration-300 hover:scale-105',
            styles.iconWrapper
          )}
        >
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary-500/10 to-transparent" />
          <Icon
            className={cn(
              'relative z-10 text-slate-500 transition-colors duration-300 group-hover:text-primary-400'
            )}
            style={{ width: styles.icon, height: styles.icon }}
          />
          <div
            className={cn(
              'absolute inset-0 rounded-2xl blur-2xl opacity-0 transition-opacity duration-300 hover:opacity-30 bg-primary-500'
            )}
          />
        </div>

        <div className="space-y-1.5">
          <h3 className={cn('font-semibold text-white', styles.title)}>
            {title}
          </h3>
          {description && (
            <p className={cn('text-slate-500 leading-relaxed max-w-xs mx-auto', styles.description)}>
              {description}
            </p>
          )}
        </div>

        {actionLabel && onAction && (
          <button
            onClick={onAction}
            className="group relative mt-2 inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 bg-primary-600 hover:bg-primary-500 text-white shadow-glow-sm hover:shadow-glow"
          >
            <Plus className="w-4 h-4 transition-transform duration-200 group-hover:rotate-90" />
            {actionLabel}
          </button>
        )}
      </div>
    </div>
  );
}
