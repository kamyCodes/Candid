'use client';

interface StarRatingProps {
  rating: number;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  onChange?: (rating: number) => void;
  emptyClassName?: string;
}

const SIZE_CLASS: Record<NonNullable<StarRatingProps['size']>, string> = {
  xs: 'w-3 h-3',
  sm: 'w-4 h-4',
  md: 'w-5 h-5',
  lg: 'w-6 h-6',
};

export default function StarRating({
  rating,
  size = 'sm',
  onChange,
  emptyClassName = 'text-[#dcdfe5]',
}: StarRatingProps) {
  const interactive = !!onChange;
  const sizeClass = SIZE_CLASS[size];

  if (!interactive) {
    return (
      <div className="flex" aria-label={`${rating} out of 5 stars`}>
        {[1, 2, 3, 4, 5].map((star) => (
          <svg
            key={star}
            className={`${sizeClass} ${star <= rating ? 'text-gold' : emptyClassName}`}
            fill="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
          </svg>
        ))}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          aria-label={`Rate ${star} out of 5`}
          onClick={() => onChange(star === rating ? 0 : star)}
          className="p-0.5 transition-transform duration-150 hover:scale-125 active:scale-90"
        >
          <svg
            className={`${sizeClass} ${
              star <= rating ? 'text-gold' : emptyClassName
            }`}
            fill="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
          </svg>
        </button>
      ))}
    </div>
  );
}
