import { TrendingUp, TrendingDown, type LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

type TrendType = 'up' | 'down' | 'neutral';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  description?: string;
  trend?: TrendType;
  trendValue?: string;
  accent?: 'primary' | 'emerald' | 'amber' | 'rose' | 'cyan';
  className?: string;
}

const accentStyles: Record<NonNullable<StatCardProps['accent']>, {
  iconBg: string;
  iconColor: string;
  borderGlow: string;
  gradient: string;
}> = {
  primary: {
    iconBg: 'bg-primary-500/20',
    iconColor: 'text-primary-400',
    borderGlow: 'group-hover:border-primary-500/40',
    gradient: 'from-primary-500/5 to-transparent',
  },
  emerald: {
    iconBg: 'bg-emerald-500/20',
    iconColor: 'text-emerald-400',
    borderGlow: 'group-hover:border-emerald-500/40',
    gradient: 'from-emerald-500/5 to-transparent',
  },
  amber: {
    iconBg: 'bg-amber-500/20',
    iconColor: 'text-amber-400',
    borderGlow: 'group-hover:border-amber-500/40',
    gradient: 'from-amber-500/5 to-transparent',
  },
  rose: {
    iconBg: 'bg-rose-500/20',
    iconColor: 'text-rose-400',
    borderGlow: 'group-hover:border-rose-500/40',
    gradient: 'from-rose-500/5 to-transparent',
  },
  cyan: {
    iconBg: 'bg-cyan-500/20',
    iconColor: 'text-cyan-400',
    borderGlow: 'group-hover:border-cyan-500/40',
    gradient: 'from-cyan-500/5 to-transparent',
  },
};

const trendColors: Record<TrendType, string> = {
  up: 'text-emerald-400',
  down: 'text-rose-400',
  neutral: 'text-slate-400',
};

export function StatCard({
  title,
  value,
  icon: Icon,
  description,
  trend,
  trendValue,
  accent = 'primary',
  className,
}: StatCardProps) {
  const styles = accentStyles[accent];

  return (
    <div
      className={cn(
        'group relative overflow-hidden rounded-xl bg-slate-900/60 border border-slate-700/60 p-5 transition-all duration-300 hover:shadow-industrial',
        styles.borderGlow,
        className
      )}
    >
      <div className={cn('absolute inset-0 bg-gradient-to-br pointer-events-none opacity-60', styles.gradient)} />

      <div className="relative flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">
            {title}
          </p>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-white tracking-tight">
              {value}
            </span>
            {trend && trendValue && (
              <span className={cn('inline-flex items-center gap-0.5 text-xs font-semibold', trendColors[trend])}>
                {trend === 'up' && <TrendingUp className="w-3.5 h-3.5" />}
                {trend === 'down' && <TrendingDown className="w-3.5 h-3.5" />}
                {trendValue}
              </span>
            )}
          </div>
          {description && (
            <p className="mt-1.5 text-xs text-slate-500 leading-relaxed">
              {description}
            </p>
          )}
        </div>

        <div
          className={cn(
            'relative shrink-0 w-12 h-12 rounded-xl flex items-center justify-center transition-transform duration-300 group-hover:scale-110',
            styles.iconBg
          )}
        >
          <Icon className={cn('w-6 h-6 transition-colors', styles.iconColor)} />
          <div
            className={cn(
              'absolute inset-0 rounded-xl blur-xl opacity-40 transition-opacity duration-300 group-hover:opacity-70',
              styles.iconBg
            )}
          />
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-slate-700/60 to-transparent" />
    </div>
  );
}
