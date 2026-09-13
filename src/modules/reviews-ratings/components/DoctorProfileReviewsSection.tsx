// src/modules/reviews-ratings/components/DoctorProfileReviewsSection.tsx
"use client";

import React, { useState, useEffect, useCallback } from "react";
import DoctorRatingBreakdown from "./DoctorRatingBreakdown";
import DoctorReviewsList from "./DoctorReviewsList";
import { reviewService } from "../services/reviewService";
import { DoctorRatingStats, Review } from "../types";

interface DoctorProfileReviewsSectionProps {
  doctorId: string;
  doctorName?: string;
  specialty?: string;
  avatarUrl?: string;
}

export default function DoctorProfileReviewsSection({
  doctorId,
}: DoctorProfileReviewsSectionProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [stats, setStats] = useState<DoctorRatingStats>({
    averageRating: 0,
    totalReviews: 0,
    starCounts: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
    breakdownPercentages: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [ratingFilter, setRatingFilter] = useState<number | null>(null);
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);

  // Fetch reviews & stats
  const fetchReviews = useCallback(async () => {
    if (!doctorId) return;
    try {
      setIsLoading(true);
      const res = await reviewService.getDoctorReviews(doctorId, page, 10, ratingFilter);
      setReviews(res.reviews || []);
      setTotalPages(res.pagination?.totalPages || 1);
      if (res.stats) {
        setStats(res.stats);
      }
    } catch (err) {
      console.error("Failed to load doctor reviews:", err);
    } finally {
      setIsLoading(false);
    }
  }, [doctorId, page, ratingFilter]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  return (
    <div className="space-y-6">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
        <div>
          <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <i className="fas fa-star text-amber-400"></i>
            Patient Reviews & Ratings
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Verified ratings and feedback from patients who completed consultations.
          </p>
        </div>
      </div>

      {/* Rating Breakdown Summary Card */}
      <DoctorRatingBreakdown
        stats={stats}
        selectedRatingFilter={ratingFilter}
        onSelectRatingFilter={(r) => {
          setRatingFilter(r);
          setPage(1);
        }}
      />

      {/* Filter status header if active */}
      <div className="flex items-center justify-between text-xs text-slate-500">
        <span className="font-semibold">
          {ratingFilter
            ? `Showing ${ratingFilter}-star reviews (${reviews.length})`
            : `All Reviews (${stats.totalReviews})`}
        </span>
        {ratingFilter && (
          <button
            onClick={() => {
              setRatingFilter(null);
              setPage(1);
            }}
            className="text-indigo-600 hover:underline font-medium"
          >
            Show all
          </button>
        )}
      </div>

      {/* Reviews List */}
      <DoctorReviewsList reviews={reviews} isLoading={isLoading} />

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-2">
          <button
            type="button"
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:pointer-events-none"
          >
            Previous
          </button>
          <span className="text-xs text-slate-500 font-medium px-2">
            Page {page} of {totalPages}
          </span>
          <button
            type="button"
            disabled={page >= totalPages}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:pointer-events-none"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
