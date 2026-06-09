import type { Difficulty } from '@/types';
import { DIFFICULTY_LABELS, DIFFICULTY_COLORS } from '@/types';
import { cn } from '@/lib/utils';

interface DifficultyBadgeProps {
  difficulty: Difficulty;
  size?: 'sm' | 'md' | 'lg';
  showDots?: boolean;
  className?: string;
}

const sizeClasses: Record<NonNullable<DifficultyBadgeProps['size']>, string> = {
  sm: 'text-[10px] px-1.5 py-0.5 gap-1 rounded',
  md: 'text-xs px-2.5 py-1 gap-1.5 rounded-md',
  lg: 'text-sm px-3 py-1.5 gap-2 rounded-md',
};

const customColors: Record<Difficulty, string> = {
  1: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
  2: 'bg-sky-500/15 text-sky-400 border-sky-500/30',
  3: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
  4: 'bg-rose-500/15 text-rose-400 border-rose-500/30',
};

const dotColors: Record<Difficulty, string> = {
  1: 'bg-emerald-400',
  2: 'bg-sky-400',
  3: 'bg-amber-400',
  4: 'bg-rose-400',
};

export function DifficultyBadge({
  difficulty,
  size = 'md',
  showDots = true,
  className,
}: DifficultyBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center font-semibold border transition-all',
        customColors[difficulty],
        sizeClasses[size],
        className
      )}
    >
      {showDots && (
        <span className="flex items-center gap-0.5">
          {Array.from({ length: difficulty }).map((_, i) => (
            <span
              key={i}
              className={cn(
                'w-1.5 h-1.5 rounded-full',
                dotColors[difficulty]
              )}
            />
          ))}
        </span>
      )}
      <span>{DIFFICULTY_LABELS[difficulty]}</span>
    </span>
  );
}

export { DIFFICULTY_LABELS, DIFFICULTY_COLORS };
