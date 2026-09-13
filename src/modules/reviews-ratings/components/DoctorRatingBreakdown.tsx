// src/modules/reviews-ratings/components/DoctorRatingBreakdown.tsx
"use client";

import React from "react";
import RatingStars from "./RatingStars";
import { DoctorRatingStats } from "../types";

interface DoctorRatingBreakdownProps {
  stats: DoctorRatingStats;
  selectedRatingFilter?: number | null;
  onSelectRatingFilter?: (rating: number | null) => void;
}

export default function DoctorRatingBreakdown({
  stats,
  selectedRatingFilter = null,
  onSelectRatingFilter,
}: DoctorRatingBreakdownProps) {
  const { averageRating, totalReviews, starCounts, breakdownPercentages } = stats;

  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-5 sm:p-6 shadow-sm">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
        {/* Left Column: Big Score */}
        <div className="md:col-span-5 flex flex-col items-center justify-center text-center p-4 bg-slate-50/70 rounded-2xl border border-slate-100/80">
          <div className="text-4xl sm:text-5xl font-extrabold text-slate-800 tracking-tight">
            {totalReviews > 0 ? averageRating.toFixed(1) : "0.0"}
          </div>
          <div className="mt-2">
            <RatingStars value={averageRating} size="md" interactive={false} />
          </div>
          <p className="mt-2 text-xs font-semibold text-slate-500">
            {totalReviews === 0
              ? "No reviews yet"
              : `${totalReviews} verified patient ${totalReviews === 1 ? "review" : "reviews"}`}
          </p>
          <div className="mt-3 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-[11px] font-bold border border-emerald-100">
            <i className="fas fa-shield-halved text-emerald-500 text-[10px]"></i>
            <span>100% Authentic Consultations</span>
          </div>
        </div>

        {/* Right Column: 5-to-1 Star Breakdown Progress Bars */}
        <div className="md:col-span-7 space-y-2">
          {[5, 4, 3, 2, 1].map((star) => {
            const count = starCounts[star as keyof typeof starCounts] || 0;
            const percentage = breakdownPercentages[star as keyof typeof breakdownPercentages] || 0;
            const isSelected = selectedRatingFilter === star;

            return (
              <button
                key={star}
                type="button"
                onClick={() =>
                  onSelectRatingFilter?.(isSelected ? null : star)
                }
                className={`w-full flex items-center gap-3 p-1.5 rounded-xl text-xs font-medium transition-all ${
                  isSelected
                    ? "bg-indigo-50/80 ring-1 ring-indigo-300"
                    : "hover:bg-slate-50"
                }`}
                title={`Filter by ${star} star reviews`}
              >
                {/* Star Label */}
                <span className="w-12 text-left font-bold text-slate-700 flex items-center gap-1 shrink-0">
                  <span>{star}</span>
                  <span className="text-amber-400">★</span>
                </span>

                {/* Progress Bar Track */}
                <div className="flex-1 h-2 rounded-full bg-slate-100 overflow-hidden relative">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      star >= 4
                        ? "bg-amber-400"
                        : star === 3
                        ? "bg-amber-300"
                        : "bg-amber-200"
                    }`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>

                {/* Percentage & Count */}
                <span className="w-10 text-right text-slate-400 font-mono text-[11px] shrink-0">
                  {percentage}%
                </span>
                <span className="w-8 text-right text-slate-500 text-[11px] shrink-0 font-semibold">
                  ({count})
                </span>
              </button>
            );
          })}

          {selectedRatingFilter !== null && (
            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => onSelectRatingFilter?.(null)}
                className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800 transition-colors"
              >
                Clear filter ({selectedRatingFilter}★)
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
