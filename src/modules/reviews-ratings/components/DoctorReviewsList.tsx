// src/modules/reviews-ratings/components/DoctorReviewsList.tsx
"use client";

import React from "react";
import RatingStars from "./RatingStars";
import { Review } from "../types";

interface DoctorReviewsListProps {
  reviews: Review[];
  isLoading?: boolean;
}

export default function DoctorReviewsList({
  reviews,
  isLoading = false,
}: DoctorReviewsListProps) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((n) => (
          <div
            key={n}
            className="p-5 rounded-2xl bg-white border border-slate-100 animate-pulse space-y-3"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-slate-200"></div>
              <div className="space-y-1.5 flex-1">
                <div className="w-32 h-3.5 bg-slate-200 rounded"></div>
                <div className="w-20 h-2.5 bg-slate-100 rounded"></div>
              </div>
            </div>
            <div className="w-full h-3 bg-slate-100 rounded"></div>
            <div className="w-3/4 h-3 bg-slate-100 rounded"></div>
          </div>
        ))}
      </div>
    );
  }

  if (reviews.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 border-dashed p-10 text-center">
        <div className="w-12 h-12 rounded-full bg-indigo-50 text-indigo-400 flex items-center justify-center mx-auto mb-3 text-lg">
          <i className="far fa-comment-dots"></i>
        </div>
        <h4 className="text-sm font-bold text-slate-700">No reviews found</h4>
        <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
          Patients who complete a consultation with this doctor can leave feedback here.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3.5">
      {reviews.map((rev) => {
        const patientName = rev.isAnonymous
          ? "Anonymous Patient"
          : rev.patientId?.firstName
          ? `${rev.patientId.firstName} ${rev.patientId.lastName || ""}`.trim()
          : rev.patientId?.googleName || "Verified Patient";

        const initials = rev.isAnonymous
          ? "AP"
          : (rev.patientId?.firstName?.[0] || "P") +
            (rev.patientId?.lastName?.[0] || "");

        const formattedDate = new Date(rev.createdAt).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        });

        const avatarUrl = !rev.isAnonymous
          ? rev.patientId?.avatarUrl || rev.patientId?.profileId?.avatarUrl
          : null;

        return (
          <div
            key={rev._id}
            className="p-5 rounded-2xl bg-white border border-slate-100 shadow-2xs hover:shadow-xs transition-shadow space-y-3"
          >
            {/* Header: Patient Info + Rating & Date */}
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-100 to-indigo-50 border border-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-xs shrink-0 overflow-hidden">
                  {avatarUrl ? (
                    <img
                      src={avatarUrl}
                      alt={patientName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span>{initials.toUpperCase()}</span>
                  )}
                </div>

                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h5 className="text-xs font-bold text-slate-800 truncate">
                      {patientName}
                    </h5>
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-100/70">
                      <i className="fas fa-check-circle text-[9px]"></i>
                      Verified Patient
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-400 font-medium">
                    {formattedDate}
                  </span>
                </div>
              </div>

              {/* Star Rating */}
              <div className="shrink-0 flex items-center gap-1 bg-amber-50/70 px-2 py-1 rounded-lg border border-amber-100/80">
                <RatingStars value={rev.rating} size="sm" interactive={false} />
                <span className="text-xs font-bold text-amber-700 ml-1">
                  {rev.rating.toFixed(1)}
                </span>
              </div>
            </div>

            {/* Quick highlight tags */}
            {rev.tags && rev.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-0.5">
                {rev.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-2.5 py-0.5 rounded-md bg-slate-50 text-slate-600 border border-slate-200/80 text-[11px] font-medium"
                  >
                    ✓ {tag}
                  </span>
                ))}
              </div>
            )}

            {/* Review Comment */}
            {rev.comment && (
              <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-wrap">
                "{rev.comment}"
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}
