import React, { useMemo } from 'react';

const HEARTS = ['💕', '💗', '💖', '❤️', '💘', '💞', '💓', '💝'];

const COUNTS = {
  cell: 24,
  week: 32,
  day: 56,
  chip: 18,
} as const;

interface HeartsBackdropProps {
  density?: keyof typeof COUNTS;
  className?: string;
}

export const HeartsBackdrop: React.FC<HeartsBackdropProps> = ({ density = 'day', className = '' }) => {
  const count = COUNTS[density];
  const items = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        emoji: HEARTS[i % HEARTS.length],
        left: (i * 37 + 11) % 100,
        top: (i * 53 + 7) % 100,
        size: density === 'chip' ? 9 + (i % 6) : 11 + (i * 5) % 14,
        rotate: ((i * 29) % 70) - 35,
        opacity: 0.28 + (i % 6) * 0.08,
      })),
    [count, density]
  );

  return (
    <div
      className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}
      aria-hidden
    >
      {items.map((h, i) => (
        <span
          key={i}
          className="absolute select-none leading-none"
          style={{
            left: `${h.left}%`,
            top: `${h.top}%`,
            fontSize: h.size,
            transform: `rotate(${h.rotate}deg)`,
            opacity: h.opacity,
          }}
        >
          {h.emoji}
        </span>
      ))}
    </div>
  );
};

export default HeartsBackdrop;
