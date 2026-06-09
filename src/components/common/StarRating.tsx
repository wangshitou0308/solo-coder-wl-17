import { useState } from 'react';
import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Proficiency } from '@/types';

interface StarRatingProps {
  value: Proficiency | number;
  max?: number;
  onChange?: (value: Proficiency) => void;
  readOnly?: boolean;
  size?: 'sm' | 'md' | 'lg';
  showValue?: boolean;
  className?: string;
}

const sizeConfig: Record<NonNullable<StarRatingProps['size']>, { star: number; text: string; gap: string }> = {
  sm: { star: 14, text: 'text-xs', gap: 'gap-0.5' },
  md: { star: 18, text: 'text-sm', gap: 'gap-1' },
  lg: { star: 24, text: 'text-base', gap: 'gap-1.5' },
};

export function StarRating({
  value,
  max = 5,
  onChange,
  readOnly = true,
  size = 'md',
  showValue = false,
  className,
}: StarRatingProps) {
  const [hoverValue, setHoverValue] = useState<number | null>(null);
  const config = sizeConfig[size];
  const displayValue = hoverValue ?? value;

  const handleClick = (rating: number) => {
    if (!readOnly && onChange) {
      onChange(Math.min(5, Math.max(1, rating)) as Proficiency);
    }
  };

  return (
    <div className={cn('inline-flex items-center', config.gap, className)}>
      <div className={cn('inline-flex items-center', config.gap)}>
        {Array.from({ length: max }).map((_, index) => {
          const rating = index + 1;
          const isFilled = rating <= displayValue;
          const isHalfFilled = !isFilled && rating - 0.5 <= displayValue;

          return (
            <button
              key={index}
              type="button"
              disabled={readOnly}
              onClick={() => handleClick(rating)}
              onMouseEnter={() => !readOnly && setHoverValue(rating)}
              onMouseLeave={() => setHoverValue(null)}
              className={cn(
                'relative transition-all duration-150',
                !readOnly && 'cursor-pointer hover:scale-110 active:scale-95',
                readOnly && 'cursor-default'
              )}
            >
              <Star
                width={config.star}
                height={config.star}
                className={cn(
                  'transition-colors',
                  isFilled || isHalfFilled
                    ? 'text-amber-400 fill-amber-400 drop-shadow-[0_0_4px_rgba(251,191,36,0.4)]'
                    : 'text-slate-600 fill-transparent'
                )}
              />
              {isHalfFilled && !isFilled && (
                <div className="absolute inset-0 overflow-hidden" style={{ width: '50%' }}>
                  <Star
                    width={config.star}
                    height={config.star}
                    className="text-amber-400 fill-amber-400 drop-shadow-[0_0_4px_rgba(251,191,36,0.4)]"
                  />
                </div>
              )}
            </button>
          );
        })}
      </div>
      {showValue && (
        <span className={cn('font-semibold text-amber-400 ml-1', config.text)}>
          {value.toFixed(1)}
        </span>
      )}
    </div>
  );
}
