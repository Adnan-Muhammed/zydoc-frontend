import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import {
  ChatMessage,
  PrescriptionItem,
  UploadedFile,
  PatientInfoData,
  PastConsultationNote,
} from '@/modules/video-call/components/sidebar/types';

export interface SingleConsultationState {
  messages: ChatMessage[];
  prescriptions: PrescriptionItem[];
  files: UploadedFile[];
  notes: string;
  patientInfo: PatientInfoData | null;
  pastNotes: PastConsultationNote[];
  isLoaded: boolean;
}

export interface ActiveSessionMetadata {
  appointmentId: string;
  role: string;
  sessionStartedAt?: string;
  isReconnecting?: boolean;
  lastConnectedAt?: number;
}

export interface ConsultationHubState {
  consultations: Record<string, SingleConsultationState>;
  activeSession: ActiveSessionMetadata | null;
}

const initialSingleState: SingleConsultationState = {
  messages: [],
  prescriptions: [],
  files: [],
  notes: '',
  patientInfo: null,
  pastNotes: [],
  isLoaded: false,
};

const initialState: ConsultationHubState = {
  consultations: {},
  activeSession: null,
};

export const consultationSlice = createSlice({
  name: 'consultation',
  initialState,
  reducers: {
    setActiveSession: (state, action: PayloadAction<ActiveSessionMetadata>) => {
      state.activeSession = action.payload;
    },
    updateActiveSessionReconnecting: (state, action: PayloadAction<boolean>) => {
      if (state.activeSession) {
        state.activeSession.isReconnecting = action.payload;
        state.activeSession.lastConnectedAt = Date.now();
      }
    },
    clearActiveSession: (state) => {
      state.activeSession = null;
    },
    initConsultation: (
      state,
      action: PayloadAction<{
        appointmentId: string;
        role?: string;
      }>
    ) => {
      const { appointmentId } = action.payload;
      if (!state.consultations[appointmentId]) {
        let initialMessages: ChatMessage[] = [];
        if (typeof window !== 'undefined') {
          try {
            const savedChat = sessionStorage.getItem(`consultation_chat_${appointmentId}`);
            if (savedChat) {
              const parsed = JSON.parse(savedChat);
              if (Array.isArray(parsed) && parsed.length > 0) {
                initialMessages = parsed;
              }
            }
          } catch (e) {
            console.warn('[consultationSlice] Error reading session chat:', e);
          }
        }

        if (initialMessages.length === 0) {
          initialMessages = [
            {
              id: `system-start-${appointmentId}`,
              senderId: 'system',
              senderRole: 'system',
              senderName: 'System',
              text: 'Consultation session started. Real-time messages & records are encrypted.',
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            },
          ];
        }

        state.consultations[appointmentId] = {
          ...initialSingleState,
          messages: initialMessages,
        };
      }
    },

    cleanupConsultationState: (state, action: PayloadAction<string>) => {
      const appointmentId = action.payload;
      if (state.consultations[appointmentId]) {
        delete state.consultations[appointmentId];
      }
    },

    resetAllConsultations: (state) => {
      state.consultations = {};
    },

    setConsultationMessages: (
      state,
      action: PayloadAction<{ appointmentId: string; messages: ChatMessage[] }>
    ) => {
      const { appointmentId, messages } = action.payload;
      if (!state.consultations[appointmentId]) {
        state.consultations[appointmentId] = { ...initialSingleState, messages };
      } else {
        state.consultations[appointmentId].messages = messages;
      }
      if (typeof window !== 'undefined') {
        try {
          sessionStorage.setItem(
            `consultation_chat_${appointmentId}`,
            JSON.stringify(state.consultations[appointmentId].messages)
          );
        } catch (e) {}
      }
    },

    addConsultationMessage: (
      state,
      action: PayloadAction<{ appointmentId: string; message: ChatMessage }>
    ) => {
      const { appointmentId, message } = action.payload;
      if (!state.consultations[appointmentId]) {
        state.consultations[appointmentId] = {
          ...initialSingleState,
          messages: [message],
        };
      } else {
        // Prevent duplicate messages by id
        const exists = state.consultations[appointmentId].messages.some((m) => m.id === message.id);
        if (!exists) {
          state.consultations[appointmentId].messages.push(message);
        }
      }
      if (typeof window !== 'undefined') {
        try {
          sessionStorage.setItem(
            `consultation_chat_${appointmentId}`,
            JSON.stringify(state.consultations[appointmentId].messages)
          );
        } catch (e) {}
      }
    },

    setConsultationPrescriptions: (
      state,
      action: PayloadAction<{ appointmentId: string; prescriptions: PrescriptionItem[] }>
    ) => {
      const { appointmentId, prescriptions } = action.payload;
      if (!state.consultations[appointmentId]) {
        state.consultations[appointmentId] = { ...initialSingleState, prescriptions };
      } else {
        state.consultations[appointmentId].prescriptions = prescriptions;
      }
    },

    addConsultationPrescription: (
      state,
      action: PayloadAction<{ appointmentId: string; prescription: PrescriptionItem }>
    ) => {
      const { appointmentId, prescription } = action.payload;
      if (!state.consultations[appointmentId]) {
        state.consultations[appointmentId] = {
          ...initialSingleState,
          prescriptions: [prescription],
        };
      } else {
        state.consultations[appointmentId].prescriptions.unshift(prescription);
      }
    },

    removeConsultationPrescription: (
      state,
      action: PayloadAction<{ appointmentId: string; id: string }>
    ) => {
      const { appointmentId, id } = action.payload;
      if (state.consultations[appointmentId]) {
        state.consultations[appointmentId].prescriptions = state.consultations[
          appointmentId
        ].prescriptions.filter((item) => item.id !== id);
      }
    },

    setConsultationNotes: (
      state,
      action: PayloadAction<{ appointmentId: string; notes: string }>
    ) => {
      const { appointmentId, notes } = action.payload;
      if (!state.consultations[appointmentId]) {
        state.consultations[appointmentId] = { ...initialSingleState, notes };
      } else {
        state.consultations[appointmentId].notes = notes;
      }
    },

    setConsultationFiles: (
      state,
      action: PayloadAction<{ appointmentId: string; files: UploadedFile[] }>
    ) => {
      const { appointmentId, files } = action.payload;
      if (!state.consultations[appointmentId]) {
        state.consultations[appointmentId] = { ...initialSingleState, files };
      } else {
        state.consultations[appointmentId].files = files;
      }
    },

    addConsultationFile: (
      state,
      action: PayloadAction<{ appointmentId: string; file: UploadedFile }>
    ) => {
      const { appointmentId, file } = action.payload;
      if (!state.consultations[appointmentId]) {
        state.consultations[appointmentId] = { ...initialSingleState, files: [file] };
      } else {
        const exists = state.consultations[appointmentId].files.some((f) => f.id === file.id);
        if (!exists) {
          state.consultations[appointmentId].files.unshift(file);
        }
      }
    },

    setPatientClinicalContext: (
      state,
      action: PayloadAction<{
        appointmentId: string;
        patientInfo: PatientInfoData;
        pastNotes: PastConsultationNote[];
        currentNotes?: string;
        prescriptions?: PrescriptionItem[];
        files?: UploadedFile[];
      }>
    ) => {
      const { appointmentId, patientInfo, pastNotes, currentNotes, prescriptions, files } =
        action.payload;
      if (!state.consultations[appointmentId]) {
        state.consultations[appointmentId] = {
          ...initialSingleState,
          patientInfo,
          pastNotes,
          notes: currentNotes || '',
          prescriptions: prescriptions || [],
          files: files || [],
          isLoaded: true,
        };
      } else {
        state.consultations[appointmentId].patientInfo = patientInfo;
        state.consultations[appointmentId].pastNotes = pastNotes;
        if (currentNotes !== undefined && !state.consultations[appointmentId].notes) {
          state.consultations[appointmentId].notes = currentNotes;
        }
        if (prescriptions && prescriptions.length > 0 && state.consultations[appointmentId].prescriptions.length === 0) {
          state.consultations[appointmentId].prescriptions = prescriptions;
        }
        if (files && files.length > 0 && state.consultations[appointmentId].files.length === 0) {
          state.consultations[appointmentId].files = files;
        }
        state.consultations[appointmentId].isLoaded = true;
      }
    },
  },
});

export const {
  setActiveSession,
  updateActiveSessionReconnecting,
  clearActiveSession,
  initConsultation,
  cleanupConsultationState,
  resetAllConsultations,
  setConsultationMessages,
  addConsultationMessage,
  setConsultationPrescriptions,
  addConsultationPrescription,
  removeConsultationPrescription,
  setConsultationNotes,
  setConsultationFiles,
  addConsultationFile,
  setPatientClinicalContext,
} = consultationSlice.actions;

export default consultationSlice.reducer;
