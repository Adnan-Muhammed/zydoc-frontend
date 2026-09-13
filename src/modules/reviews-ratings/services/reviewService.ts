// src/modules/reviews-ratings/services/reviewService.ts
import axiosInstance from "@/api/axiosInstance";
import { REVIEWS } from "@/api/endpoints";
import {
  CreateReviewPayload,
  DoctorReviewsResponse,
  ReviewEligibilityResponse,
  Review,
} from "../types";

export const reviewService = {
  /**
   * Submit a new review and rating for a completed appointment
   */
  async submitReview(payload: CreateReviewPayload): Promise<{ success: boolean; message: string; data: any }> {
    const response = await axiosInstance.post(REVIEWS.CREATE, payload);
    return response.data;
  },

  /**
   * Get public reviews and rating distribution breakdown for a doctor
   */
  async getDoctorReviews(
    doctorId: string,
    page: number = 1,
    limit: number = 10,
    rating?: number | null
  ): Promise<DoctorReviewsResponse> {
    const params = new URLSearchParams();
    params.append("page", String(page));
    params.append("limit", String(limit));
    if (rating) {
      params.append("rating", String(rating));
    }

    const response = await axiosInstance.get(
      `${REVIEWS.BY_DOCTOR(doctorId)}?${params.toString()}`
    );
    return response.data.data;
  },

  /**
   * Check if logged-in patient has completed consultations eligible for review with a doctor
   */
  async checkEligibility(doctorId: string): Promise<ReviewEligibilityResponse> {
    const response = await axiosInstance.get(REVIEWS.ELIGIBILITY(doctorId));
    return response.data.data;
  },

  /**
   * Get review status and existing review for a specific appointment
   */
  async getAppointmentReview(
    appointmentId: string
  ): Promise<{ reviewed: boolean; review: Review | null }> {
    const response = await axiosInstance.get(REVIEWS.BY_APPOINTMENT(appointmentId));
    return response.data.data;
  },
};
