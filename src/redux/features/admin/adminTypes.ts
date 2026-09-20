// src/redux/features/admin/adminTypes.ts
import { Transaction, Pagination } from '@/types';

export interface SystemStats {
    totalUsers?: number;
    totalPatients?: number;
    totalDoctors?: number;
    appointments?: number;
    completedAppts?: number;
    upcomingAppts?: number;
    revenue?: string;
    commission?: string;
    pendingApprovals?: number;
    uptime?: string;
    responseTime?: string;
    openTickets?: number;
}

export interface Qualification {
    id?: string;
    degree: string;
    institution: string;
    year: number;
    certificateName?: string;
    certificateUrl?: string;
    certificateStatus?: string;
    rejectionReason?: string;
}

export interface TimeSlot {
    id?: string;
    start: string;
    end: string;
}

export interface DoctorBankDetails {
    accountNumber?: string;
    ifscCode?: string;
    bankName?: string;
    accountHolderName?: string;
}

export interface DoctorConsultationConfig {
    online?: { enabled?: boolean; fee?: number };
    offline?: {
        enabled?: boolean;
        fee?: number;
        clinicName?: string;
        clinicAddress?: string;
    };
    video?: { enabled?: boolean; fee?: number };
    physical?: {
        enabled?: boolean;
        fee?: number;
        clinicName?: string;
        clinicAddress?: string;
    };
    fee?: number;
    onlineFee?: number;
    offlineFee?: number;
    durationMinutes?: number;
}

export interface DoctorWorkingHours {
    online?: Record<string, TimeSlot[]>;
    offline?: Record<string, TimeSlot[]>;
}

export interface DoctorProfileData {
    _id: string;
    firstName: string;
    lastName: string;
    specialty: string;
    phone?: string;
    licenseNumber?: string;
    yearsOfExperience?: number;
    bio?: string;
    avatarUrl?: string;
    verificationStatus: 'pending' | 'approved' | 'rejected';
    medicalCertificateUrl?: string;
    medicalCertificateStatus?: string;
    medicalCertificateRejectionReason?: string;
    governmentIdUrl?: string;
    governmentIdStatus?: string;
    governmentIdRejectionReason?: string;
    expertiseTags?: string[];
    languages?: string[];
    slotDuration?: number;
    timezone?: string;
    consultationSettings?: DoctorConsultationConfig;
    workingHours?: DoctorWorkingHours;
    bankDetails?: DoctorBankDetails;
    qualifications?: Qualification[];
    rejectionReason?: string;
    verifiedAt?: string;
    verifiedBy?: string;
    createdAt?: string;
}

export interface PendingDoctor {
    userId: string;
    email: string;
    accountStatus: string;
    createdAt: string;
    profile: DoctorProfileData;
}

// ── Master Doctor Data ───────────────────────────────────────────
export interface MasterDoctor {
    userId: string;
    email: string;
    accountStatus: 'active' | 'suspended' | string;
    isProfileCompleted?: boolean;
    createdAt: string;
    profile: {
        _id?: string;
        firstName?: string;
        lastName?: string;
        specialty?: string;
        phone?: string;
        avatarUrl?: string;
        verificationStatus?: string;
        licenseNumber?: string;
        yearsOfExperience?: number;
        bio?: string;
        expertiseTags?: string[];
        languages?: string[];
        slotDuration?: number;
        timezone?: string;
        rating?: number;
        reviewCount?: number;
        consultationSettings?: DoctorConsultationConfig;
        workingHours?: DoctorWorkingHours;
        bankDetails?: DoctorBankDetails;
        qualifications?: Qualification[];
        rejectionReason?: string;
        verifiedAt?: string;
        verifiedBy?: string;
        createdAt?: string;
    };
}

// ── Master Patient Data ──────────────────────────────────────────
export interface MasterPatient {
    userId: string;
    email: string;
    accountStatus: string;
    isProfileCompleted?: boolean;
    createdAt: string;
    profile: {
        firstName?: string;
        lastName?: string;
        fullName: string;
        phone?: string;
        gender?: string;
        bloodGroup?: string;
        dateOfBirth?: string | null;
        avatarUrl?: string;
        walletBalance: number;
        emergencyContact?: any;
        address?: any;
    };
    stats: {
        totalAppointments: number;
        completedAppointments: number;
        cancelledAppointments: number;
        currentWalletBalance: number;
    };
}

// ── Master Appointment Data ──────────────────────────────────────
export interface MasterAppointment {
    _id: string;
    appointmentDate: string;
    appointmentTime: string;
    consultationType: 'ONLINE' | 'OFFLINE' | string;
    patientType?: string;
    status: string;
    paymentStatus: string;
    paymentMethod?: string;
    fee: number;
    feeBreakdown?: {
        totalFee?: number;
        walletDeducted?: number;
        onlinePaid?: number;
    };
    adminCommission?: number;
    commissionRate?: number | null;
    doctorAmount?: number;
    payoutStatus?: string;
    patient: {
        id: string | null;
        name: string;
        email: string;
        phone?: string;
        avatarUrl?: string;
        gender?: string;
    };
    doctor: {
        id: string | null;
        name: string;
        specialty?: string;
        phone?: string;
        avatarUrl?: string;
    };
}

// ── Commission Types ─────────────────────────────────────────────
export interface RateChangeHistory {
    changedBy?: string | { _id: string; email?: string; name?: string };
    previousOnlineRate: number;
    previousOfflineRate: number;
    newOnlineRate: number;
    newOfflineRate: number;
    note?: string;
    changedAt: string;
}

export interface CommissionConfig {
    _id: string;
    onlineCommissionRate: number;
    offlineCommissionRate: number;
    changeHistory: RateChangeHistory[];
    createdAt?: string;
    updatedAt?: string;
}

// ── Refund Queue Types ───────────────────────────────────────────
export interface RefundPatientProfile {
    firstName: string;
    lastName?: string;
    phone?: string;
    avatarUrl?: string;
    walletBalance?: number;
    bloodGroup?: string;
    emergencyContact?: string;
}

export interface RefundPatient {
    _id: string;
    email: string;
    role: string;
    profileId?: RefundPatientProfile;
    accountStatus?: string;
}

export interface RefundDoctor {
    _id: string;
    firstName: string;
    lastName?: string;
    specialty: string;
    phone?: string;
    avatarUrl?: string;
    clinicAddress?: any;
    consultationFee?: number;
}

export interface RefundAppointment {
    _id: string;
    appointmentDate?: string;
    appointmentTime?: string;
    consultationType?: 'ONLINE' | 'OFFLINE' | string;
    patientType?: string;
    status?: string;
    paymentStatus?: string;
    fee?: number;
    feeBreakdown?: {
        consultationFee?: number;
        adminCommission?: number;
        doctorEarnings?: number;
        serviceFee?: number;
    };
    paymentMethod?: string;
    offlineOTP?: string;
    offlineOTPVerifiedAt?: string;
    scheduledStartAt?: string;
    scheduledEndAt?: string;
}

export interface RefundTicket {
    _id: string;
    appointmentId?: RefundAppointment;
    patientId?: RefundPatient;
    doctorId?: RefundDoctor;
    issueCategory: 'DOCTOR_UNAVAILABLE' | 'SERVICE_NOT_RENDERED' | 'WRONG_APPOINTMENT' | 'OTHER' | string;
    issueDescription: string;
    proofUrl?: string;
    status: 'PENDING' | 'UNDER_REVIEW' | 'APPROVED' | 'REJECTED';
    resolvedBy?: { _id: string; email?: string; role?: string } | null;
    adminNote?: string;
    rejectionReason?: string;
    resolvedAt?: string | null;
    refundAmount?: number;
    razorpayPayoutId?: string;
    requestedBankTransfer?: boolean;
    createdAt: string;
    updatedAt?: string;
}

// ── Analytics & KPI Types ─────────────────────────────────────────
export interface TodayAppointmentsBreakdown {
    total: number;
    completed: number;
    ongoing: number;
    scheduled: number;
    cancelled: number;
}

export interface OverallMetricsBreakdown {
    completed: number;
    scheduled: number;
    refunded: number;
    cancelled: number;
}

export interface AnalyticsSummary {
    activeDoctors: number;
    totalDoctors: number;
    registeredPatients: number;
    activePatients: number;
    totalPlatformRevenue: number;
    totalGrossVolume: number;
    totalDoctorPayouts: number;
    paidAppointmentsCount: number;
    todayAppointments: TodayAppointmentsBreakdown;
    overallMetrics: OverallMetricsBreakdown;
}

export interface RevenueChartPoint {
    date: string;
    totalRevenue: number;
    adminCommission: number;
    doctorPayout: number;
    appointmentCount: number;
}

export interface RevenueChartData {
    timeframe: string;
    range: {
        from: string | null;
        to: string;
    };
    summary: {
        totalRevenue: number;
        adminCommission: number;
        doctorPayout: number;
        appointmentsCount: number;
    };
    chartData: RevenueChartPoint[];
}

export interface TopDoctorAnalytics {
    doctorId: string;
    userId: string | null;
    name: string;
    firstName?: string;
    lastName?: string;
    specialty: string;
    email: string;
    phone?: string;
    avatarUrl?: string;
    rating: number;
    reviewCount: number;
    accountStatus: 'active' | 'suspended' | string;
    completedConsultations: number;
    totalRevenueGenerated: number;
    doctorEarnings: number;
    adminCommissionGenerated: number;
}

// ── Clinical Intelligence Healthcare Analytics Types ─────────────
export interface ClinicalTimeSeriesPoint {
    label: string;
    videoConsultations: number;
    clinicVisits: number;
    cancellations: number;
    grossRevenue: number;
    platformCommission: number;
    activeUsers: number;
}

export interface ClinicalAnalyticsData {
    range: '7d' | '30d' | '90d' | '1y';
    timeSeries: ClinicalTimeSeriesPoint[];
    channelBreakdown: {
        onlineRevenue: number;
        clinicRevenue: number;
        onlinePercentage: number;
        clinicPercentage: number;
    };
    specialtyPerformance: {
        specialty: string;
        consultationsCount: number;
        totalRevenue: number;
        utilizationRate: number;
    }[];
    doctorUtilization: {
        overallRate: number;
        topUtilizedDoctors: {
            name: string;
            specialty: string;
            rate: number;
            completed?: number;
        }[];
    };
    patientRetention: {
        newPatients: number;
        returningPatients: number;
        repeatConsultationRate: number;
        retentionRate: number;
    };
    cancellationAnalysis: {
        totalCancelled: number;
        cancellationRate: number;
        reasonsBreakdown: {
            reason: string;
            count: number;
            percentage: number;
        }[];
    };
    overviewStats?: {
        activeDoctors: number;
        totalConsultations: number;
    };
}

export interface ToggleStatusResult {
    userId: string;
    profileId?: string;
    email: string;
    role: string;
    previousStatus: string;
    newStatus: 'active' | 'suspended';
    message: string;
}

export interface AdminUser {
    _id: string;
    name: string;
    role: string;
    email?: string;
    isApproved?: boolean;
}

// ── Financial Ledger & Settlement Types (Phase 3) ────────────────
export interface LedgerTransaction {
    _id: string;
    paymentId: string;
    amount: number;
    adminCommission: number;
    doctorAmount: number;
    status: 'pending' | 'completed' | 'settled' | 'failed' | string;
    settledAt?: string | null;
    createdAt: string;
    doctor: {
        _id: string | null;
        name: string;
        specialty?: string;
        bankDetails?: {
            accountHolderName?: string;
            accountNumber?: string;
            bankName?: string;
            ifscCode?: string;
            upiId?: string;
        } | null;
    };
    patient: {
        _id: string | null;
        name: string;
        email?: string;
    };
    appointment: {
        _id: string | null;
        date?: string;
        time?: string;
        type?: string;
        status?: string;
    };
}

export interface LedgerSummary {
    totalVolume: number;
    totalAdminCommission: number;
    totalDoctorPayouts: number;
    settledCount: number;
    pendingCount: number;
}

// ── Admin Notifications & System Alerts (Phase 3) ────────────────
export interface AdminNotification {
    _id: string;
    type: 'APPROVAL_PENDING' | 'REFUND_PENDING' | 'SYSTEM' | string;
    title: string;
    message: string;
    link?: string;
    count?: number;
    isRead: boolean;
    createdAt: string;
    priority?: 'high' | 'normal' | 'low';
}

export interface AdminState {
    stats: SystemStats | null;
    users: AdminUser[];
    
    // Doctor Approvals
    pendingDoctors: PendingDoctor[];
    pendingDoctorsTotal: number;
    pendingDoctorsLoading: boolean;
    actionLoading: boolean;

    // Master Doctors
    doctorsList: MasterDoctor[];
    doctorsTotal: number;
    doctorsLoading: boolean;
    doctorsPage: number;
    doctorsLimit: number;

    // Master Patients
    patientsList: MasterPatient[];
    patientsTotal: number;
    patientsLoading: boolean;
    patientsPage: number;
    patientsLimit: number;

    // Master Appointments
    appointmentsList: MasterAppointment[];
    appointmentsTotal: number;
    appointmentsLoading: boolean;
    appointmentsPage: number;
    appointmentsLimit: number;

    // Commission Configuration
    commissionConfig: CommissionConfig | null;
    commissionLoading: boolean;
    commissionSaving: boolean;

    // Refund Queue
    pendingRefunds: RefundTicket[];
    pendingRefundsTotal: number;
    pendingRefundsLoading: boolean;
    refundActionLoading: boolean;

    // Analytics Dashboard (Phase 2)
    analyticsSummary: AnalyticsSummary | null;
    analyticsSummaryLoading: boolean;
    revenueChart: RevenueChartData | null;
    revenueChartLoading: boolean;
    topDoctors: TopDoctorAnalytics[];
    topDoctorsLoading: boolean;

    // Clinical Intelligence Analytics
    clinicalAnalytics: ClinicalAnalyticsData | null;
    clinicalAnalyticsLoading: boolean;

    // User Management Status Toggle (Phase 2)
    userToggleLoading: boolean;

    // Financial Ledger (Phase 3)
    ledgerTransactions: LedgerTransaction[];
    ledgerTotal: number;
    ledgerPage: number;
    ledgerLimit: number;
    ledgerTotalPages: number;
    ledgerSummary: LedgerSummary | null;
    ledgerLoading: boolean;
    settlePayoutLoading: boolean;

    // Admin Notifications (Phase 3)
    adminNotifications: AdminNotification[];
    adminUnreadCount: number;
    adminNotificationsLoading: boolean;

    logs: Record<string, unknown>[];
    transactions: Transaction[];
    transactionsPagination: Pagination | null;
    isLoading: boolean;
    isSettlingPayout: boolean;
    error: string | null;
}