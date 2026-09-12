import { Socket } from 'socket.io-client';

export interface ConsultationSidebarProps {
  appointmentId: string;
  userId: string;
  role: string;
  socket?: Socket | null;
  isOpen?: boolean;
  onToggle?: () => void;
  onFinalizePrescription?: (prescriptions: PrescriptionItem[]) => void;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  senderRole: string;
  senderName: string;
  text: string;
  timestamp: string;
}

export interface PrescriptionItem {
  id: string;
  medicine: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions: string;
  prescribedBy: string;
  date: string;
}

export interface UploadedFile {
  id: string;
  name: string;
  size: string;
  type: string;
  category?: string;
  uploadedBy: 'Doctor' | 'Patient' | string;
  timestamp: string;
  url?: string;
}

export interface PatientInfoData {
  name: string;
  bloodGroup?: string;
  gender?: string;
  dateOfBirth?: string | Date | null;
  phone?: string;
  allergies: string[];
  chronicConditions: string[];
  currentMedications: string[];
  emergencyContact?: {
    name?: string;
    relationship?: string;
    phone?: string;
  } | null;
}

export interface PastConsultationNote {
  appointmentId: string;
  date: string | Date;
  time?: string;
  doctorName: string;
  specialty?: string;
  clinicalNotes: string;
  prescriptions?: PrescriptionItem[];
}

export type TabType = 'patient-info' | 'notes' | 'prescriptions' | 'chat' | 'files';
