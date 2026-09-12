// ─── Shared Types for Complete-Profile Flow ───────────────────────────────────

export interface Qualification {
    id: string;
    degree: string;
    institution: string;
    year: string;
    certificateName?: string;
}

export interface TimeBlock {
    id: string;
    start: string;
    end: string;
}

export interface DailySchedule {
    fullWeek?: TimeBlock[];
    mondayToFriday?: TimeBlock[];
    monday: TimeBlock[];
    tuesday: TimeBlock[];
    wednesday: TimeBlock[];
    thursday: TimeBlock[];
    friday: TimeBlock[];
    saturday: TimeBlock[];
    sunday: TimeBlock[];
}

export interface WorkingHours {
    online: DailySchedule;
    offline: DailySchedule;
}

export interface DraftState {
    currentStep: number;
    firstName: string;
    lastName: string;
    phone: string;
    specialty: string;
    licenseNumber: string;
    yearsOfExperience: string;
    slotDuration: number;
    bio: string;
    expertiseTags: string[];
    selectedLanguages: string[];
    qualifications: Qualification[];
    enableVideo: boolean;
    videoFee: string;
    enablePhysical: boolean;
    physicalFee: string;
    clinicName: string;
    clinicAddress: string;
    workingHours: WorkingHours;
    timezone?: string;
}

export const DEFAULT_DRAFT: DraftState = {
    currentStep: 1,
    firstName: '',
    lastName: '',
    phone: '',
    specialty: '',
    licenseNumber: '',
    yearsOfExperience: '',
    slotDuration: 15,
    bio: '',
    expertiseTags: [],
    selectedLanguages: ['English'],
    qualifications: [],
    enableVideo: false,
    videoFee: '100',
    enablePhysical: false,
    physicalFee: '150',
    clinicName: '',
    clinicAddress: '',
    workingHours: {
        online: {
            fullWeek: [],
            mondayToFriday: [],
            monday: [{ id: 'mon-1', start: '09:00', end: '17:00' }],
            tuesday: [{ id: 'tue-1', start: '09:00', end: '17:00' }],
            wednesday: [{ id: 'wed-1', start: '09:00', end: '17:00' }],
            thursday: [{ id: 'thu-1', start: '09:00', end: '17:00' }],
            friday: [{ id: 'fri-1', start: '09:00', end: '17:00' }],
            saturday: [{ id: 'sat-1', start: '10:00', end: '14:00' }],
            sunday: [],
        },
        offline: {
            fullWeek: [],
            mondayToFriday: [],
            monday: [{ id: 'mon-1', start: '09:00', end: '17:00' }],
            tuesday: [{ id: 'tue-1', start: '09:00', end: '17:00' }],
            wednesday: [{ id: 'wed-1', start: '09:00', end: '17:00' }],
            thursday: [{ id: 'thu-1', start: '09:00', end: '17:00' }],
            friday: [{ id: 'fri-1', start: '09:00', end: '17:00' }],
            saturday: [{ id: 'sat-1', start: '10:00', end: '14:00' }],
            sunday: [],
        },
    },
};
