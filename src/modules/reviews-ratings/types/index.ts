// src/modules/reviews-ratings/types/index.ts

export interface ReviewPatient {
  _id?: string;
  firstName?: string;
  lastName?: string;
  googleName?: string;
  avatarUrl?: string;
  profileId?: {
    firstName?: string;
    lastName?: string;
    avatarUrl?: string;
  };
}

export interface Review {
  _id: string;
  doctorId: string;
  patientId: ReviewPatient;
  appointmentId: string;
  rating: number;
  comment: string;
  tags: string[];
  isAnonymous: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface DoctorRatingStats {
  averageRating: number;
  totalReviews: number;
  starCounts: {
    1: number;
    2: number;
    3: number;
    4: number;
    5: number;
  };
  breakdownPercentages: {
    1: number;
    2: number;
    3: number;
    4: number;
    5: number;
  };
}

export interface DoctorReviewsResponse {
  reviews: Review[];
  pagination: {
    total: number;
    page: number;
    totalPages: number;
    limit: number;
  };
  stats: DoctorRatingStats;
}

export interface ReviewEligibilityResponse {
  canReview: boolean;
  hasReviewed: boolean;
  eligibleAppointment?: {
    _id: string;
    doctorId: string;
    appointmentDate: string;
    appointmentTime: string;
    consultationType: string;
  } | null;
  existingReview?: Review | null;
  totalCompletedConsultations: number;
}

export interface CreateReviewPayload {
  appointmentId: string;
  rating: number;
  comment?: string;
  tags?: string[];
  isAnonymous?: boolean;
}
