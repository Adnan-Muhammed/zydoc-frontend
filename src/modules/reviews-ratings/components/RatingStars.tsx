// src/modules/reviews-ratings/components/RatingStars.tsx
"use client";

import React, { useState } from "react";

interface RatingStarsProps {
  value: number;
  onChange?: (rating: number) => void;
  interactive?: boolean;
  size?: "sm" | "md" | "lg";
  showSentiment?: boolean;
}

const SENTIMENT_LABELS: Record<number, { text: string; color: string }> = {
  1: { text: "Poor", color: "text-rose-500" },
  2: { text: "Fair", color: "text-amber-500" },
  3: { text: "Good", color: "text-amber-500" },
  4: { text: "Very Good", color: "text-emerald-500" },
  5: { text: "Excellent!", color: "text-indigo-600 font-bold" },
};

export default function RatingStars({
  value = 0,
  onChange,
  interactive = false,
  size = "md",
  showSentiment = false,
}: RatingStarsProps) {
  const [hoverRating, setHoverRating] = useState<number | null>(null);

  const activeRating = interactive && hoverRating !== null ? hoverRating : value;

  const sizeDimensions = {
    sm: "w-3.5 h-3.5",
    md: "w-5 h-5",
    lg: "w-8 h-8 sm:w-9 sm:h-9",
  }[size];

  const gapClass = {
    sm: "gap-0.5",
    md: "gap-1",
    lg: "gap-1.5",
  }[size];

  return (
    <div className="inline-flex flex-col items-center gap-1.5">
      <div className={`flex items-center ${gapClass}`}>
        {[1, 2, 3, 4, 5].map((star) => {
          const isFilled = activeRating > 0 && star <= Math.round(activeRating);

          return (
            <button
              key={star}
              type="button"
              disabled={!interactive}
              onClick={() => interactive && onChange?.(star)}
              onMouseEnter={() => interactive && setHoverRating(star)}
              onMouseLeave={() => interactive && setHoverRating(null)}
              className={`transition-transform duration-150 outline-none ${
                interactive
                  ? "cursor-pointer transform hover:scale-125 active:scale-95 p-0.5"
                  : "cursor-default pointer-events-none"
              }`}
              title={interactive ? `${star} star${star > 1 ? "s" : ""}` : undefined}
            >
              <svg
                className={`${sizeDimensions} transition-colors duration-200 ${
                  isFilled
                    ? "fill-amber-400 stroke-amber-400 drop-shadow-[0_1px_3px_rgba(251,191,36,0.5)]"
                    : "fill-transparent stroke-amber-400 hover:stroke-amber-500"
                }`}
                viewBox="0 0 24 24"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
              </svg>
            </button>
          );
        })}
      </div>

      {showSentiment && activeRating > 0 && (
        <span
          className={`text-xs tracking-wide transition-all duration-200 ${
            SENTIMENT_LABELS[Math.round(activeRating)]?.color || "text-slate-600"
          }`}
        >
          {SENTIMENT_LABELS[Math.round(activeRating)]?.text}
        </span>
      )}
    </div>
  );
}
