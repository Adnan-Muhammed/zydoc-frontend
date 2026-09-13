// src/modules/reviews-ratings/components/ReviewModal.tsx
"use client";

import React, { useState, useEffect } from "react";
import RatingStars from "./RatingStars";
import { reviewService } from "../services/reviewService";

interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  appointmentId: string;
  doctor: {
    id?: string;
    name: string;
    specialty?: string;
    avatarUrl?: string;
  };
}

const QUICK_TAGS = [
  "Clear Explanation",
  "Attentive & Caring",
  "Punctual",
  "Thorough Examination",
  "Great Listener",
  "Comforting Advice",
];

export default function ReviewModal({
  isOpen,
  onClose,
  onSuccess,
  appointmentId,
  doctor,
}: ReviewModalProps) {
  const [rating, setRating] = useState<number>(5);
  const [comment, setComment] = useState<string>("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [isAnonymous, setIsAnonymous] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);

  // Reset state when opening
  useEffect(() => {
    if (isOpen) {
      setRating(5);
      setComment("");
      setSelectedTags([]);
      setIsAnonymous(false);
      setIsSubmitting(false);
      setErrorMessage(null);
      setIsSuccess(false);
    }
  }, [isOpen]);

  // Handle ESC key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !isSubmitting) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, isSubmitting, onClose]);

  if (!isOpen) return null;

  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter((t) => t !== tag));
    } else {
      if (selectedTags.length < 5) {
        setSelectedTags([...selectedTags, tag]);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!appointmentId) {
      setErrorMessage("Missing appointment details.");
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMessage(null);

      await reviewService.submitReview({
        appointmentId,
        rating,
        comment: comment.trim(),
        tags: selectedTags,
        isAnonymous,
      });

      setIsSuccess(true);
      setTimeout(() => {
        onSuccess?.();
        onClose();
      }, 1500);
    } catch (err: any) {
      console.error("Submit review error:", err);
      const msg =
        err.response?.data?.message || err.message || "Failed to submit review. Please try again.";
      setErrorMessage(msg);
      setIsSubmitting(false);
    }
  };

  const doctorName = doctor.name.toLowerCase().includes("dr.")
    ? doctor.name
    : `Dr. ${doctor.name}`;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200"
    >
      <div className="relative w-full max-w-lg rounded-3xl bg-white border border-slate-100 shadow-2xl shadow-indigo-950/20 overflow-hidden text-slate-800 transition-all">
        {/* Top Glow & Accent Header */}
        <div className="h-2.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 w-full" />

        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          disabled={isSubmitting}
          className="absolute top-5 right-5 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-400 hover:text-slate-600 flex items-center justify-center transition-colors text-sm"
          title="Dismiss"
        >
          ✕
        </button>

        {isSuccess ? (
          <div className="p-8 text-center space-y-4 animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-500 flex items-center justify-center text-3xl mx-auto shadow-inner">
              <i className="fas fa-check"></i>
            </div>
            <h3 className="text-xl font-bold text-slate-800">Thank You!</h3>
            <p className="text-sm text-slate-500 max-w-xs mx-auto">
              Your feedback helps {doctorName} and fellow patients in our healthcare community.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 sm:p-7 space-y-5">
            {/* Header: Doctor Details */}
            <div className="flex items-center gap-3.5 pb-4 border-b border-slate-100">
              <div className="w-14 h-14 rounded-2xl bg-indigo-50 border border-indigo-100 overflow-hidden shrink-0 flex items-center justify-center text-indigo-600 font-bold text-lg shadow-sm">
                {doctor.avatarUrl ? (
                  <img
                    src={doctor.avatarUrl}
                    alt={doctorName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <i className="fas fa-user-doctor text-xl"></i>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">
                  Consultation Completed
                </span>
                <h3 className="text-base font-bold text-slate-800 truncate mt-1">
                  How was your visit with {doctorName}?
                </h3>
                <p className="text-xs text-slate-400 truncate">
                  {doctor.specialty || "Medical Specialist"}
                </p>
              </div>
            </div>

            {/* Error Banner */}
            {errorMessage && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2 animate-in fade-in">
                <i className="fas fa-circle-exclamation shrink-0"></i>
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Rating Stars Section */}
            <div className="text-center py-2 bg-slate-50/70 rounded-2xl border border-slate-100/80">
              <p className="text-xs font-semibold text-slate-500 mb-2">Tap to rate your experience</p>
              <RatingStars
                value={rating}
                onChange={setRating}
                interactive={true}
                size="lg"
                showSentiment={true}
              />
            </div>

            {/* Quick Feedback Highlight Tags */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">What went well? (Optional)</label>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {QUICK_TAGS.map((tag) => {
                  const isSelected = selectedTags.includes(tag);
                  return (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => toggleTag(tag)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-all ${
                        isSelected
                          ? "bg-indigo-600 border-indigo-600 text-white shadow-sm shadow-indigo-600/30"
                          : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100 hover:border-slate-300"
                      }`}
                    >
                      {isSelected && <i className="fas fa-check mr-1.5 text-[10px]"></i>}
                      {tag}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Written Review Feedback */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-700">
                  Detailed Review <span className="text-slate-400 font-normal">(Optional)</span>
                </label>
                <span className="text-[11px] text-slate-400">{comment.length}/1000</span>
              </div>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                maxLength={1000}
                rows={3}
                placeholder="Share your experience to help other patients (e.g. communication, consultation quality, ease of recovery)..."
                className="w-full text-xs p-3 rounded-xl border border-slate-200 bg-white text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all resize-none"
              />
            </div>

            {/* Anonymous Toggle */}
            <div className="flex items-center justify-between pt-1">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="anonymous-toggle"
                  checked={isAnonymous}
                  onChange={(e) => setIsAnonymous(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                />
                <label
                  htmlFor="anonymous-toggle"
                  className="text-xs text-slate-600 select-none cursor-pointer font-medium"
                >
                  Post review anonymously
                </label>
              </div>
              <span className="text-[11px] text-slate-400 italic">
                {isAnonymous ? "Your name will be hidden" : "Shows your verified patient name"}
              </span>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="px-4 py-2 text-xs font-semibold text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-all"
              >
                Maybe Later
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 active:scale-95 rounded-xl shadow-md shadow-indigo-600/30 transition-all flex items-center gap-2 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <i className="fas fa-spinner fa-spin text-xs"></i>
                    <span>Submitting...</span>
                  </>
                ) : (
                  <>
                    <i className="fas fa-paper-plane text-xs"></i>
                    <span>Submit Review</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
