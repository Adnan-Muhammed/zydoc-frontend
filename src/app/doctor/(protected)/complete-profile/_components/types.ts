// ─── Shared Types for Complete-Profile Flow ───────────────────────────────────

export interface Qualification {
    id: string;
    degree: string;
    institution: string;
    year: string;
    certificateName?: string;
}

export interface WorkingHourSlot {
    start: string;
    end: string;
    active: boolean;
}

export interface DailySchedule {
    fullWeek?: WorkingHourSlot;
    mondayToFriday: WorkingHourSlot;
    monday: WorkingHourSlot;
    tuesday: WorkingHourSlot;
    wednesday: WorkingHourSlot;
    thursday: WorkingHourSlot;
    friday: WorkingHourSlot;
    saturday: WorkingHourSlot;
    sunday: WorkingHourSlot;
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
}

export const DEFAULT_DRAFT: DraftState = {
    currentStep: 1,
    firstName: '',
    lastName: '',
    phone: '',
    specialty: '',
    licenseNumber: '',
    yearsOfExperience: '',
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
            fullWeek: { start: '09:00', end: '17:00', active: false },
            mondayToFriday: { start: '09:00', end: '17:00', active: false },
            monday: { start: '09:00', end: '17:00', active: false },
            tuesday: { start: '09:00', end: '17:00', active: false },
            wednesday: { start: '09:00', end: '17:00', active: false },
            thursday: { start: '09:00', end: '17:00', active: false },
            friday: { start: '09:00', end: '17:00', active: false },
            saturday: { start: '10:00', end: '14:00', active: false },
            sunday: { start: '00:00', end: '00:00', active: false },
        },
        offline: {
            fullWeek: { start: '09:00', end: '17:00', active: false },
            mondayToFriday: { start: '09:00', end: '17:00', active: false },
            monday: { start: '09:00', end: '17:00', active: false },
            tuesday: { start: '09:00', end: '17:00', active: false },
            wednesday: { start: '09:00', end: '17:00', active: false },
            thursday: { start: '09:00', end: '17:00', active: false },
            friday: { start: '09:00', end: '17:00', active: false },
            saturday: { start: '10:00', end: '14:00', active: false },
            sunday: { start: '00:00', end: '00:00', active: false },
        },
    },
};
