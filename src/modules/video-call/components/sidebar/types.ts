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

export type TabType = 'chat' | 'notes' | 'prescriptions' | 'files';
