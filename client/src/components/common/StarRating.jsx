import React from 'react';
import { Star } from 'lucide-react';

/**
 * StarRating — reusable display + interactive component
 * Props:
 *   value        — current rating (1-5)
 *   onChange     — if provided, renders interactive mode
 *   size         — 'sm' | 'md' | 'lg'
 *   showCount    — show totalRatings number
 *   totalRatings — number of ratings
 */
export const StarRating = ({
  value = 0,
  onChange = null,
  size = 'md',
  showCount = false,
  totalRatings = 0,
  className = ''
}) => {
  const sizes = { sm: 'w-3.5 h-3.5', md: 'w-5 h-5', lg: 'w-6 h-6' };
  const starSize = sizes[size] || sizes.md;

  return (
    <div className={`flex items-center gap-0.5 ${className}`}>
      {[1, 2, 3, 4, 5].map((star) => {
        const filled = value >= star;
        const half = !filled && value >= star - 0.5;

        return (
          <button
            key={star}
            type="button"
            onClick={() => onChange && onChange(star)}
            className={`${onChange ? 'cursor-pointer hover:scale-110 transition-transform' : 'cursor-default'} focus:outline-none`}
            disabled={!onChange}
            aria-label={`${star} star`}
          >
            <Star
              className={`${starSize} transition-colors ${
                filled
                  ? 'fill-amber-400 text-amber-400'
                  : half
                  ? 'fill-amber-200 text-amber-400'
                  : 'fill-slate-100 text-slate-300'
              }`}
            />
          </button>
        );
      })}
      {showCount && (
        <span className="ml-1.5 text-xs text-slate-500 font-medium">
          {value > 0 ? value.toFixed(1) : '—'} {totalRatings > 0 && `(${totalRatings})`}
        </span>
      )}
    </div>
  );
};
