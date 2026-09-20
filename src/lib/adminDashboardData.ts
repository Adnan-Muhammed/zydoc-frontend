// src/lib/adminDashboardData.ts
/**
 * Dynamic Data Model and Derivation Engine for Zydoc Admin Platform
 * Provides realistic, relational datasets for doctors, patients, appointments,
 * transactions, and platform metrics with dynamic derivation functions.
 */

export type Role = 'admin' | 'doctor' | 'patient';
export type DoctorVerificationStatus = 'approved' | 'pending' | 'rejected';
export type AccountStatus = 'active' | 'suspended';
export type AppointmentStatus = 'completed' | 'upcoming' | 'cancelled' | 'no_show';
export type AppointmentType = 'video' | 'clinic';
export type TransactionType = 'consultation_fee' | 'doctor_payout' | 'refund' | 'platform_commission';
export type TransactionStatus = 'completed' | 'pending' | 'failed';

export interface DoctorRecord {
    id: string;
    name: string;
    email: string;
    avatar: string;
    specialty: string;
    experienceYears: number;
    rating: number;
    reviewCount: number;
    consultationFee: number;
    verificationStatus: DoctorVerificationStatus;
    accountStatus: AccountStatus;
    joinedDate: string; // YYYY-MM-DD
    totalConsultations: number;
    weeklyAvailableHours: number;
    bookedHours: number; // For utilization calculation
}

export interface PatientRecord {
    id: string;
    name: string;
    email: string;
    avatar: string;
    gender: 'Male' | 'Female' | 'Other';
    age: number;
    phone: string;
    city: string;
    totalVisits: number;
    joinedDate: string;
    lastVisitDate: string;
    status: 'active' | 'inactive';
}

export interface AppointmentRecord {
    id: string;
    appointmentNumber: string;
    patientId: string;
    patientName: string;
    patientAvatar: string;
    doctorId: string;
    doctorName: string;
    doctorSpecialty: string;
    doctorAvatar: string;
    date: string; // ISO or YYYY-MM-DD
    timeSlot: string;
    type: AppointmentType;
    status: AppointmentStatus;
    fee: number;
    commissionRate: number; // e.g. 0.15 = 15%
    notes?: string;
}

export interface TransactionRecord {
    id: string;
    referenceNumber: string;
    appointmentId?: string;
    userName: string;
    userRole: Role;
    type: TransactionType;
    amount: number;
    status: TransactionStatus;
    createdAt: string;
    paymentMethod: 'Razorpay' | 'UPI' | 'Card' | 'NetBanking' | 'BankTransfer';
}

// ---------------------------------------------------------------------------
// 1. Core Mock Data Collections (Reflecting realistic platform scale & diversity)
// ---------------------------------------------------------------------------

export const MOCK_DOCTORS: DoctorRecord[] = [
    {
        id: 'doc-001',
        name: 'Dr. Ananya Sharma',
        email: 'ananya.sharma@zydoc.com',
        avatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150&auto=format&fit=crop&q=80',
        specialty: 'Cardiology',
        experienceYears: 14,
        rating: 4.9,
        reviewCount: 184,
        consultationFee: 1200,
        verificationStatus: 'approved',
        accountStatus: 'active',
        joinedDate: '2025-01-15',
        totalConsultations: 342,
        weeklyAvailableHours: 35,
        bookedHours: 31.5,
    },
    {
        id: 'doc-002',
        name: 'Dr. Rajesh Patel',
        email: 'rajesh.patel@zydoc.com',
        avatar: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=150&auto=format&fit=crop&q=80',
        specialty: 'Dermatology',
        experienceYears: 9,
        rating: 4.7,
        reviewCount: 142,
        consultationFee: 900,
        verificationStatus: 'approved',
        accountStatus: 'active',
        joinedDate: '2025-02-10',
        totalConsultations: 278,
        weeklyAvailableHours: 30,
        bookedHours: 25.5,
    },
    {
        id: 'doc-003',
        name: 'Dr. Priya Nambiar',
        email: 'priya.nambiar@zydoc.com',
        avatar: 'https://images.unsplash.com/photo-1594824813576-f83196aa6bf7?w=150&auto=format&fit=crop&q=80',
        specialty: 'Pediatrics',
        experienceYears: 11,
        rating: 4.95,
        reviewCount: 220,
        consultationFee: 800,
        verificationStatus: 'approved',
        accountStatus: 'active',
        joinedDate: '2025-01-20',
        totalConsultations: 410,
        weeklyAvailableHours: 40,
        bookedHours: 37.0,
    },
    {
        id: 'doc-004',
        name: 'Dr. Vikramaditya Rao',
        email: 'vikram.rao@zydoc.com',
        avatar: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=150&auto=format&fit=crop&q=80',
        specialty: 'Neurology',
        experienceYears: 18,
        rating: 4.85,
        reviewCount: 98,
        consultationFee: 1500,
        verificationStatus: 'approved',
        accountStatus: 'active',
        joinedDate: '2025-03-05',
        totalConsultations: 195,
        weeklyAvailableHours: 25,
        bookedHours: 21.0,
    },
    {
        id: 'doc-005',
        name: 'Dr. Sneha Roy',
        email: 'sneha.roy@zydoc.com',
        avatar: 'https://images.unsplash.com/photo-1651008376811-b90baee60c1f?w=150&auto=format&fit=crop&q=80',
        specialty: 'Orthopedics',
        experienceYears: 8,
        rating: 4.65,
        reviewCount: 86,
        consultationFee: 1000,
        verificationStatus: 'approved',
        accountStatus: 'active',
        joinedDate: '2025-04-12',
        totalConsultations: 164,
        weeklyAvailableHours: 30,
        bookedHours: 22.5,
    },
    {
        id: 'doc-006',
        name: 'Dr. Anjali Menon',
        email: 'anjali.menon@gmail.com',
        avatar: 'https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=150&auto=format&fit=crop&q=80',
        specialty: 'Cardiology',
        experienceYears: 7,
        rating: 4.5,
        reviewCount: 12,
        consultationFee: 1100,
        verificationStatus: 'pending',
        accountStatus: 'active',
        joinedDate: '2026-04-25',
        totalConsultations: 0,
        weeklyAvailableHours: 30,
        bookedHours: 0,
    },
    {
        id: 'doc-007',
        name: 'Dr. Kevin Joseph',
        email: 'kevin.joseph@outlook.com',
        avatar: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=150&auto=format&fit=crop&q=80',
        specialty: 'Pediatrics',
        experienceYears: 5,
        rating: 4.3,
        reviewCount: 8,
        consultationFee: 750,
        verificationStatus: 'pending',
        accountStatus: 'active',
        joinedDate: '2026-04-26',
        totalConsultations: 0,
        weeklyAvailableHours: 25,
        bookedHours: 0,
    },
    {
        id: 'doc-008',
        name: 'Dr. Sarah Ahmed',
        email: 'sarah.ahmed@medicare.in',
        avatar: 'https://images.unsplash.com/photo-1527613426441-4da17471b66d?w=150&auto=format&fit=crop&q=80',
        specialty: 'Dermatology',
        experienceYears: 12,
        rating: 4.8,
        reviewCount: 15,
        consultationFee: 950,
        verificationStatus: 'pending',
        accountStatus: 'active',
        joinedDate: '2026-04-24',
        totalConsultations: 0,
        weeklyAvailableHours: 35,
        bookedHours: 0,
    },
    {
        id: 'doc-009',
        name: 'Dr. Harish Kulkarni',
        email: 'harish.kulkarni@zydoc.com',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
        specialty: 'General Medicine',
        experienceYears: 20,
        rating: 4.9,
        reviewCount: 310,
        consultationFee: 700,
        verificationStatus: 'approved',
        accountStatus: 'active',
        joinedDate: '2025-01-02',
        totalConsultations: 620,
        weeklyAvailableHours: 40,
        bookedHours: 38.0,
    },
    {
        id: 'doc-010',
        name: 'Dr. Farhana Sheikh',
        email: 'farhana.sheikh@zydoc.com',
        avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
        specialty: 'Psychiatry',
        experienceYears: 10,
        rating: 4.92,
        reviewCount: 165,
        consultationFee: 1400,
        verificationStatus: 'approved',
        accountStatus: 'active',
        joinedDate: '2025-02-18',
        totalConsultations: 285,
        weeklyAvailableHours: 30,
        bookedHours: 27.5,
    },
    {
        id: 'doc-011',
        name: 'Dr. Mohit Verma',
        email: 'mohit.verma@zydoc.com',
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
        specialty: 'Orthopedics',
        experienceYears: 6,
        rating: 3.9,
        reviewCount: 24,
        consultationFee: 850,
        verificationStatus: 'approved',
        accountStatus: 'suspended',
        joinedDate: '2025-08-11',
        totalConsultations: 45,
        weeklyAvailableHours: 20,
        bookedHours: 0,
    }
];

export const MOCK_PATIENTS: PatientRecord[] = [
    {
        id: 'pat-001',
        name: 'Arjun Das',
        email: 'arjun.das@gmail.com',
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=80',
        gender: 'Male',
        age: 34,
        phone: '+91 98450 12345',
        city: 'Bengaluru',
        totalVisits: 6,
        joinedDate: '2025-02-12',
        lastVisitDate: '2026-04-20',
        status: 'active',
    },
    {
        id: 'pat-002',
        name: 'Meera Krishnan',
        email: 'meera.k@yahoo.com',
        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&auto=format&fit=crop&q=80',
        gender: 'Female',
        age: 28,
        phone: '+91 97110 54321',
        city: 'Kochi',
        totalVisits: 4,
        joinedDate: '2025-03-01',
        lastVisitDate: '2026-04-22',
        status: 'active',
    },
    {
        id: 'pat-003',
        name: 'Rohit Shenoy',
        email: 'rohit.s@outlook.com',
        avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=120&auto=format&fit=crop&q=80',
        gender: 'Male',
        age: 45,
        phone: '+91 99001 88776',
        city: 'Mumbai',
        totalVisits: 8,
        joinedDate: '2025-01-10',
        lastVisitDate: '2026-04-18',
        status: 'active',
    },
    {
        id: 'pat-004',
        name: 'Kavita Sundaram',
        email: 'kavita.sun@gmail.com',
        avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=120&auto=format&fit=crop&q=80',
        gender: 'Female',
        age: 39,
        phone: '+91 98200 33445',
        city: 'Chennai',
        totalVisits: 5,
        joinedDate: '2025-04-05',
        lastVisitDate: '2026-04-24',
        status: 'active',
    },
    {
        id: 'pat-005',
        name: 'Deepak Chopra',
        email: 'deepak.c@hotmail.com',
        avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=120&auto=format&fit=crop&q=80',
        gender: 'Male',
        age: 52,
        phone: '+91 94430 99887',
        city: 'Delhi',
        totalVisits: 2,
        joinedDate: '2025-07-19',
        lastVisitDate: '2026-04-15',
        status: 'active',
    },
    {
        id: 'pat-006',
        name: 'Aisha Siddiqui',
        email: 'aisha.siddiqui@gmail.com',
        avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=120&auto=format&fit=crop&q=80',
        gender: 'Female',
        age: 26,
        phone: '+91 91234 56789',
        city: 'Hyderabad',
        totalVisits: 3,
        joinedDate: '2025-06-14',
        lastVisitDate: '2026-04-21',
        status: 'active',
    },
];

export const MOCK_APPOINTMENTS: AppointmentRecord[] = [
    {
        id: 'apt-101',
        appointmentNumber: 'ZY-2026-0401',
        patientId: 'pat-001',
        patientName: 'Arjun Das',
        patientAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=80',
        doctorId: 'doc-001',
        doctorName: 'Dr. Ananya Sharma',
        doctorSpecialty: 'Cardiology',
        doctorAvatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150&auto=format&fit=crop&q=80',
        date: '2026-04-27',
        timeSlot: '10:30 AM',
        type: 'video',
        status: 'completed',
        fee: 1200,
        commissionRate: 0.15,
        notes: 'Follow-up for hypertension management.',
    },
    {
        id: 'apt-102',
        appointmentNumber: 'ZY-2026-0402',
        patientId: 'pat-002',
        patientName: 'Meera Krishnan',
        patientAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&auto=format&fit=crop&q=80',
        doctorId: 'doc-002',
        doctorName: 'Dr. Rajesh Patel',
        doctorSpecialty: 'Dermatology',
        doctorAvatar: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=150&auto=format&fit=crop&q=80',
        date: '2026-04-27',
        timeSlot: '11:15 AM',
        type: 'clinic',
        status: 'completed',
        fee: 900,
        commissionRate: 0.15,
        notes: 'Eczema skin consultation and prescription review.',
    },
    {
        id: 'apt-103',
        appointmentNumber: 'ZY-2026-0403',
        patientId: 'pat-003',
        patientName: 'Rohit Shenoy',
        patientAvatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=120&auto=format&fit=crop&q=80',
        doctorId: 'doc-003',
        doctorName: 'Dr. Priya Nambiar',
        doctorSpecialty: 'Pediatrics',
        doctorAvatar: 'https://images.unsplash.com/photo-1594824813576-f83196aa6bf7?w=150&auto=format&fit=crop&q=80',
        date: '2026-04-27',
        timeSlot: '02:00 PM',
        type: 'video',
        status: 'upcoming',
        fee: 800,
        commissionRate: 0.15,
    },
    {
        id: 'apt-104',
        appointmentNumber: 'ZY-2026-0404',
        patientId: 'pat-004',
        patientName: 'Kavita Sundaram',
        patientAvatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=120&auto=format&fit=crop&q=80',
        doctorId: 'doc-004',
        doctorName: 'Dr. Vikramaditya Rao',
        doctorSpecialty: 'Neurology',
        doctorAvatar: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=150&auto=format&fit=crop&q=80',
        date: '2026-04-27',
        timeSlot: '03:45 PM',
        type: 'video',
        status: 'upcoming',
        fee: 1500,
        commissionRate: 0.15,
    },
    {
        id: 'apt-105',
        appointmentNumber: 'ZY-2026-0405',
        patientId: 'pat-005',
        patientName: 'Deepak Chopra',
        patientAvatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=120&auto=format&fit=crop&q=80',
        doctorId: 'doc-005',
        doctorName: 'Dr. Sneha Roy',
        doctorSpecialty: 'Orthopedics',
        doctorAvatar: 'https://images.unsplash.com/photo-1651008376811-b90baee60c1f?w=150&auto=format&fit=crop&q=80',
        date: '2026-04-26',
        timeSlot: '04:30 PM',
        type: 'clinic',
        status: 'cancelled',
        fee: 1000,
        commissionRate: 0.15,
        notes: 'Patient requested reschedule due to travel conflict.',
    },
    {
        id: 'apt-106',
        appointmentNumber: 'ZY-2026-0406',
        patientId: 'pat-006',
        patientName: 'Aisha Siddiqui',
        patientAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=120&auto=format&fit=crop&q=80',
        doctorId: 'doc-010',
        doctorName: 'Dr. Farhana Sheikh',
        doctorSpecialty: 'Psychiatry',
        doctorAvatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
        date: '2026-04-26',
        timeSlot: '05:00 PM',
        type: 'video',
        status: 'completed',
        fee: 1400,
        commissionRate: 0.15,
    },
    {
        id: 'apt-107',
        appointmentNumber: 'ZY-2026-0407',
        patientId: 'pat-001',
        patientName: 'Arjun Das',
        patientAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=80',
        doctorId: 'doc-009',
        doctorName: 'Dr. Harish Kulkarni',
        doctorSpecialty: 'General Medicine',
        doctorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
        date: '2026-04-25',
        timeSlot: '09:00 AM',
        type: 'clinic',
        status: 'completed',
        fee: 700,
        commissionRate: 0.15,
    },
    {
        id: 'apt-108',
        appointmentNumber: 'ZY-2026-0408',
        patientId: 'pat-002',
        patientName: 'Meera Krishnan',
        patientAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&auto=format&fit=crop&q=80',
        doctorId: 'doc-001',
        doctorName: 'Dr. Ananya Sharma',
        doctorSpecialty: 'Cardiology',
        doctorAvatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150&auto=format&fit=crop&q=80',
        date: '2026-04-24',
        timeSlot: '11:00 AM',
        type: 'video',
        status: 'no_show',
        fee: 1200,
        commissionRate: 0.15,
    },
    {
        id: 'apt-109',
        appointmentNumber: 'ZY-2026-0409',
        patientId: 'pat-003',
        patientName: 'Rohit Shenoy',
        patientAvatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=120&auto=format&fit=crop&q=80',
        doctorId: 'doc-009',
        doctorName: 'Dr. Harish Kulkarni',
        doctorSpecialty: 'General Medicine',
        doctorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
        date: '2026-04-23',
        timeSlot: '01:30 PM',
        type: 'video',
        status: 'completed',
        fee: 700,
        commissionRate: 0.15,
    },
    {
        id: 'apt-110',
        appointmentNumber: 'ZY-2026-0410',
        patientId: 'pat-004',
        patientName: 'Kavita Sundaram',
        patientAvatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=120&auto=format&fit=crop&q=80',
        doctorId: 'doc-002',
        doctorName: 'Dr. Rajesh Patel',
        doctorSpecialty: 'Dermatology',
        doctorAvatar: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=150&auto=format&fit=crop&q=80',
        date: '2026-04-22',
        timeSlot: '03:15 PM',
        type: 'video',
        status: 'completed',
        fee: 900,
        commissionRate: 0.15,
    }
];

export const MOCK_TRANSACTIONS: TransactionRecord[] = [
    {
        id: 'tx-01',
        referenceNumber: 'TXN-908123',
        appointmentId: 'apt-101',
        userName: 'Arjun Das',
        userRole: 'patient',
        type: 'consultation_fee',
        amount: 1200,
        status: 'completed',
        createdAt: '2026-04-27 10:25 AM',
        paymentMethod: 'UPI',
    },
    {
        id: 'tx-02',
        referenceNumber: 'TXN-908124',
        appointmentId: 'apt-102',
        userName: 'Meera Krishnan',
        userRole: 'patient',
        type: 'consultation_fee',
        amount: 900,
        status: 'completed',
        createdAt: '2026-04-27 11:10 AM',
        paymentMethod: 'Card',
    },
    {
        id: 'tx-03',
        referenceNumber: 'TXN-908125',
        appointmentId: 'apt-105',
        userName: 'Deepak Chopra',
        userRole: 'patient',
        type: 'refund',
        amount: 1000,
        status: 'completed',
        createdAt: '2026-04-26 05:15 PM',
        paymentMethod: 'Razorpay',
    },
    {
        id: 'tx-04',
        referenceNumber: 'TXN-908126',
        appointmentId: 'apt-106',
        userName: 'Dr. Farhana Sheikh',
        userRole: 'doctor',
        type: 'doctor_payout',
        amount: 1190, // 1400 - 15% platform commission
        status: 'completed',
        createdAt: '2026-04-26 06:30 PM',
        paymentMethod: 'BankTransfer',
    },
    {
        id: 'tx-05',
        referenceNumber: 'TXN-908127',
        appointmentId: 'apt-107',
        userName: 'Dr. Harish Kulkarni',
        userRole: 'doctor',
        type: 'doctor_payout',
        amount: 595, // 700 - 15%
        status: 'completed',
        createdAt: '2026-04-25 04:00 PM',
        paymentMethod: 'BankTransfer',
    }
];

// ---------------------------------------------------------------------------
// 2. Dynamic Derivation Functions
// ---------------------------------------------------------------------------

export interface DerivedDashboardStats {
    totalUsers: number;
    totalDoctors: number;
    activeDoctors: number;
    pendingApprovals: number;
    suspendedDoctors: number;
    totalPatients: number;
    activePatients: number;
    
    totalAppointments: number; 
    completedAppointments: number;
    upcomingAppointments: number;
    cancelledAppointments: number;
    noShowAppointments: number;
    completionRate: number;
    cancellationRate: number;

    grossRevenue: number;
    platformCommission: number;
    doctorPayouts: number;
    totalRefunds: number;

    averageDoctorRating: number;
    systemUptime: string;
    openTicketsCount: number;
    pendingVerificationList: DoctorRecord[];
    recentAppointments: AppointmentRecord[];
}

export function computeDashboardStats(
    doctors: DoctorRecord[] = MOCK_DOCTORS,
    patients: PatientRecord[] = MOCK_PATIENTS,
    appointments: AppointmentRecord[] = MOCK_APPOINTMENTS,
    transactions: TransactionRecord[] = MOCK_TRANSACTIONS
): DerivedDashboardStats {
    const totalDoctors = doctors.length;
    const activeDoctors = doctors.filter(d => d.verificationStatus === 'approved' && d.accountStatus === 'active').length;
    const pendingApprovals = doctors.filter(d => d.verificationStatus === 'pending').length;
    const suspendedDoctors = doctors.filter(d => d.accountStatus === 'suspended').length;

    const totalPatients = patients.length;
    const activePatients = patients.filter(p => p.status === 'active').length;
    const totalUsers = totalDoctors + totalPatients;

    const totalAppointments = appointments.length;
    const completedAppointments = appointments.filter(a => a.status === 'completed').length;
    const upcomingAppointments = appointments.filter(a => a.status === 'upcoming').length;
    const cancelledAppointments = appointments.filter(a => a.status === 'cancelled').length;
    const noShowAppointments = appointments.filter(a => a.status === 'no_show').length;

    const completionRate = totalAppointments > 0 ? (completedAppointments / totalAppointments) * 100 : 0;
    const cancellationRate = totalAppointments > 0 ? (cancelledAppointments / totalAppointments) * 100 : 0;

    // Financial calculations dynamically from completed appointments
    const completedList = appointments.filter(a => a.status === 'completed');
    const grossRevenue = completedList.reduce((acc, curr) => acc + curr.fee, 0);
    const platformCommission = completedList.reduce((acc, curr) => acc + (curr.fee * curr.commissionRate), 0);
    const doctorPayouts = grossRevenue - platformCommission;

    const totalRefunds = transactions
        .filter(t => t.type === 'refund' && t.status === 'completed')
        .reduce((acc, curr) => acc + curr.amount, 0);

    const approvedDocs = doctors.filter(d => d.verificationStatus === 'approved');
    const averageDoctorRating = approvedDocs.length > 0
        ? approvedDocs.reduce((acc, d) => acc + d.rating, 0) / approvedDocs.length
        : 0;

    const pendingVerificationList = doctors.filter(d => d.verificationStatus === 'pending');
    const recentAppointments = [...appointments].slice(0, 6);

    return {
        totalUsers,
        totalDoctors,
        activeDoctors,
        pendingApprovals,
        suspendedDoctors,
        totalPatients,
        activePatients,

        totalAppointments,
        completedAppointments,
        upcomingAppointments,
        cancelledAppointments,
        noShowAppointments,
        completionRate: Number(completionRate.toFixed(1)),
        cancellationRate: Number(cancellationRate.toFixed(1)),

        grossRevenue,
        platformCommission,
        doctorPayouts,
        totalRefunds,

        averageDoctorRating: Number(averageDoctorRating.toFixed(2)),
        systemUptime: '99.98%',
        openTicketsCount: 8,
        pendingVerificationList,
        recentAppointments,
    };
}

// ---------------------------------------------------------------------------
// 3. Analytics Metric Models & Multi-Horizon Timeseries Builders
// ---------------------------------------------------------------------------

export interface TimeSeriesPoint {
    label: string;
    videoConsultations: number;
    clinicVisits: number;
    cancellations: number;
    grossRevenue: number;
    platformCommission: number;
    activeUsers: number;
}

export interface SpecialtyPerformance {
    specialty: string;
    consultationsCount: number;
    totalRevenue: number;
    averageFee: number;
    doctorCount: number;
    utilizationRate: number; // percentage
}

export interface AnalyticsEngineResult {
    range: '7d' | '30d' | '90d' | '1y';
    timeSeries: TimeSeriesPoint[];
    channelBreakdown: {
        onlineConsultationsCount: number;
        onlineRevenue: number;
        clinicVisitsCount: number;
        clinicRevenue: number;
        onlinePercentage: number;
        clinicPercentage: number;
    };
    specialtyPerformance: SpecialtyPerformance[];
    doctorUtilization: {
        overallRate: number;
        topUtilizedDoctors: Array<{ name: string; specialty: string; rate: number }>;
    };
    patientRetention: {
        newPatients: number;
        returningPatients: number;
        retentionRate: number;
        repeatConsultationRate: number;
    };
    cancellationAnalysis: {
        totalCancelled: number;
        cancellationRate: number;
        reasonsBreakdown: Array<{ reason: string; count: number; percentage: number }>;
    };
}

export function generateAnalyticsData(range: '7d' | '30d' | '90d' | '1y' = '30d'): AnalyticsEngineResult {
    let timeSeries: TimeSeriesPoint[] = [];

    if (range === '7d') {
        timeSeries = [
            { label: 'Mon', videoConsultations: 42, clinicVisits: 28, cancellations: 3, grossRevenue: 64200, platformCommission: 9630, activeUsers: 410 },
            { label: 'Tue', videoConsultations: 55, clinicVisits: 31, cancellations: 4, grossRevenue: 78500, platformCommission: 11775, activeUsers: 480 },
            { label: 'Wed', videoConsultations: 48, clinicVisits: 26, cancellations: 2, grossRevenue: 68100, platformCommission: 10215, activeUsers: 430 },
            { label: 'Thu', videoConsultations: 62, clinicVisits: 35, cancellations: 5, grossRevenue: 89400, platformCommission: 13410, activeUsers: 540 },
            { label: 'Fri', videoConsultations: 58, clinicVisits: 39, cancellations: 3, grossRevenue: 86700, platformCommission: 13005, activeUsers: 510 },
            { label: 'Sat', videoConsultations: 71, clinicVisits: 44, cancellations: 6, grossRevenue: 108300, platformCommission: 16245, activeUsers: 620 },
            { label: 'Sun', videoConsultations: 65, clinicVisits: 22, cancellations: 4, grossRevenue: 81200, platformCommission: 12180, activeUsers: 490 },
        ];
    } else if (range === '30d') {
        timeSeries = [
            { label: 'Week 1', videoConsultations: 310, clinicVisits: 185, cancellations: 24, grossRevenue: 472500, platformCommission: 70875, activeUsers: 2150 },
            { label: 'Week 2', videoConsultations: 345, clinicVisits: 210, cancellations: 19, grossRevenue: 538200, platformCommission: 80730, activeUsers: 2410 },
            { label: 'Week 3', videoConsultations: 390, clinicVisits: 235, cancellations: 28, grossRevenue: 612400, platformCommission: 91860, activeUsers: 2790 },
            { label: 'Week 4', videoConsultations: 425, clinicVisits: 260, cancellations: 22, grossRevenue: 678900, platformCommission: 101835, activeUsers: 3050 },
        ];
    } else if (range === '90d') {
        timeSeries = [
            { label: 'Feb', videoConsultations: 1240, clinicVisits: 780, cancellations: 85, grossRevenue: 1920000, platformCommission: 288000, activeUsers: 8400 },
            { label: 'Mar', videoConsultations: 1480, clinicVisits: 910, cancellations: 94, grossRevenue: 2295000, platformCommission: 344250, activeUsers: 9850 },
            { label: 'Apr', videoConsultations: 1680, clinicVisits: 1040, cancellations: 102, grossRevenue: 2618000, platformCommission: 392700, activeUsers: 11200 },
        ];
    } else {
        // 1 Year
        timeSeries = [
            { label: 'Q1', videoConsultations: 3400, clinicVisits: 2100, cancellations: 240, grossRevenue: 5200000, platformCommission: 780000, activeUsers: 22000 },
            { label: 'Q2', videoConsultations: 4100, clinicVisits: 2550, cancellations: 290, grossRevenue: 6350000, platformCommission: 952500, activeUsers: 27500 },
            { label: 'Q3', videoConsultations: 4900, clinicVisits: 2950, cancellations: 310, grossRevenue: 7520000, platformCommission: 1128000, activeUsers: 33100 },
            { label: 'Q4', videoConsultations: 5600, clinicVisits: 3400, cancellations: 360, grossRevenue: 8740000, platformCommission: 1311000, activeUsers: 38400 },
        ];
    }

    const totalVideo = timeSeries.reduce((acc, t) => acc + t.videoConsultations, 0);
    const totalClinic = timeSeries.reduce((acc, t) => acc + t.clinicVisits, 0);
    const totalConsultations = totalVideo + totalClinic;

    const onlineRevenue = Math.round(timeSeries.reduce((acc, t) => acc + (t.grossRevenue * 0.62), 0));
    const clinicRevenue = Math.round(timeSeries.reduce((acc, t) => acc + (t.grossRevenue * 0.38), 0));
    const onlinePct = totalConsultations > 0 ? (totalVideo / totalConsultations) * 100 : 60;
    const clinicPct = 100 - onlinePct;

    // Specialty Breakdown
    const specialtyPerformance: SpecialtyPerformance[] = [
        { specialty: 'Cardiology', consultationsCount: 485, totalRevenue: 582000, averageFee: 1200, doctorCount: 3, utilizationRate: 88.5 },
        { specialty: 'Dermatology', consultationsCount: 420, totalRevenue: 378000, averageFee: 900, doctorCount: 3, utilizationRate: 82.0 },
        { specialty: 'Pediatrics', consultationsCount: 540, totalRevenue: 432000, averageFee: 800, doctorCount: 2, utilizationRate: 92.5 },
        { specialty: 'Neurology', consultationsCount: 260, totalRevenue: 390000, averageFee: 1500, doctorCount: 2, utilizationRate: 84.0 },
        { specialty: 'General Medicine', consultationsCount: 710, totalRevenue: 497000, averageFee: 700, doctorCount: 4, utilizationRate: 95.0 },
        { specialty: 'Orthopedics', consultationsCount: 290, totalRevenue: 290000, averageFee: 1000, doctorCount: 2, utilizationRate: 75.0 },
        { specialty: 'Psychiatry', consultationsCount: 330, totalRevenue: 462000, averageFee: 1400, doctorCount: 2, utilizationRate: 91.0 },
    ];

    // Doctor utilization rate
    const overallUtilRate = 86.8;
    const topUtilizedDoctors = [
        { name: 'Dr. Harish Kulkarni', specialty: 'General Medicine', rate: 95.0 },
        { name: 'Dr. Priya Nambiar', specialty: 'Pediatrics', rate: 92.5 },
        { name: 'Dr. Farhana Sheikh', specialty: 'Psychiatry', rate: 91.0 },
        { name: 'Dr. Ananya Sharma', specialty: 'Cardiology', rate: 90.0 },
        { name: 'Dr. Vikramaditya Rao', specialty: 'Neurology', rate: 84.0 },
    ];

    // Cancellation analysis
    const totalCancelled = timeSeries.reduce((acc, t) => acc + t.cancellations, 0);
    const overallCancellationRate = totalConsultations > 0 ? (totalCancelled / (totalConsultations + totalCancelled)) * 100 : 4.2;

    const cancellationReasons = [
        { reason: 'Patient Scheduling Conflict', count: Math.round(totalCancelled * 0.44), percentage: 44 },
        { reason: 'Doctor Emergency / Rescheduled', count: Math.round(totalCancelled * 0.28), percentage: 28 },
        { reason: 'Technical / Video Connectivity', count: Math.round(totalCancelled * 0.16), percentage: 16 },
        { reason: 'Payment / Insurance Issue', count: Math.round(totalCancelled * 0.12), percentage: 12 },
    ];

    return {
        range,
        timeSeries,
        channelBreakdown: {
            onlineConsultationsCount: totalVideo,
            onlineRevenue,
            clinicVisitsCount: totalClinic,
            clinicRevenue,
            onlinePercentage: Number(onlinePct.toFixed(1)),
            clinicPercentage: Number(clinicPct.toFixed(1)),
        },
        specialtyPerformance,
        doctorUtilization: {
            overallRate: overallUtilRate,
            topUtilizedDoctors,
        },
        patientRetention: {
            newPatients: 1420,
            returningPatients: 3890,
            retentionRate: 73.2,
            repeatConsultationRate: 64.8,
        },
        cancellationAnalysis: {
            totalCancelled,
            cancellationRate: Number(overallCancellationRate.toFixed(1)),
            reasonsBreakdown: cancellationReasons,
        },
    };
}
