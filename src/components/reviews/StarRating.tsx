'use client';

import { useState } from 'react';
import { Star } from 'lucide-react';

interface StarRatingProps {
  rating?: number;
  maxStars?: number;
  size?: 'sm' | 'md' | 'lg';
  interactive?: boolean;
  onChange?: (rating: number) => void;
  className?: string;
}

const sizeMap = { sm: 'w-4 h-4', md: 'w-5 h-5', lg: 'w-7 h-7' };

export default function StarRating({
  rating = 0,
  maxStars = 5,
  size = 'md',
  interactive = false,
  onChange,
  className = '',
}: StarRatingProps) {
  const [hovered, setHovered] = useState(0);

  const handleClick = (star: number) => {
    if (interactive && onChange) onChange(star);
  };

  const displayRating = interactive && hovered > 0 ? hovered : rating;

  return (
    <div className={`inline-flex items-center gap-0.5 ${className}`} role={interactive ? 'radiogroup' : 'img'} aria-label={`Rating: ${rating} out of ${maxStars}`}>
      {Array.from({ length: maxStars }, (_, i) => {
        const star = i + 1;
        const filled = displayRating >= star;
        const half = !filled && displayRating >= star - 0.5;
        return (
          <button
            key={i}
            type="button"
            onClick={() => handleClick(star)}
            onMouseEnter={() => interactive && setHovered(star)}
            onMouseLeave={() => interactive && setHovered(0)}
            className={`${interactive ? 'cursor-pointer hover:scale-110' : 'cursor-default'} transition-transform`}
            disabled={!interactive}
            aria-label={`${star} star${star > 1 ? 's' : ''}`}
            tabIndex={interactive ? 0 : -1}
          >
            <Star
              className={`${sizeMap[size]} transition-colors ${
                filled
                  ? 'fill-gold-400 text-gold-400'
                  : half
                  ? 'fill-gold-400/50 text-gold-400'
                  : 'fill-transparent text-warm-gray-light'
              }`}
            />
          </button>
        );
      })}
    </div>
  );
}
