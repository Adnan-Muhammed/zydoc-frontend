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
        let initialPrescriptions: PrescriptionItem[] = [];
        let initialFiles: UploadedFile[] = [];
        let initialNotes = '';

        if (typeof window !== 'undefined') {
          try {
            const savedChat = sessionStorage.getItem(`consultation_chat_${appointmentId}`);
            if (savedChat) {
              const parsed = JSON.parse(savedChat);
              if (Array.isArray(parsed) && parsed.length > 0) {
                initialMessages = parsed;
              }
            }
            const savedRx = sessionStorage.getItem(`consultation_rx_${appointmentId}`);
            if (savedRx) {
              const parsedRx = JSON.parse(savedRx);
              if (Array.isArray(parsedRx) && parsedRx.length > 0) {
                initialPrescriptions = parsedRx;
              }
            }
            const savedFiles = sessionStorage.getItem(`consultation_files_${appointmentId}`);
            if (savedFiles) {
              const parsedFiles = JSON.parse(savedFiles);
              if (Array.isArray(parsedFiles) && parsedFiles.length > 0) {
                initialFiles = parsedFiles;
              }
            }
            const savedNotes = sessionStorage.getItem(`consultation_notes_${appointmentId}`);
            if (savedNotes) {
              initialNotes = savedNotes;
            }
          } catch (e) {
            console.warn('[consultationSlice] Error reading session storage:', e);
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
          prescriptions: initialPrescriptions,
          files: initialFiles,
          notes: initialNotes,
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

    syncConsultationMessages: (
      state,
      action: PayloadAction<{ appointmentId: string; messages: ChatMessage[] }>
    ) => {
      const { appointmentId, messages } = action.payload;
      if (!Array.isArray(messages) || messages.length === 0) return;

      if (!state.consultations[appointmentId]) {
        state.consultations[appointmentId] = { ...initialSingleState, messages };
      } else {
        const currentMessages = state.consultations[appointmentId].messages;
        const msgMap = new Map<string, ChatMessage>();

        for (const m of currentMessages) {
          if (m?.id) msgMap.set(m.id, m);
        }
        for (const m of messages) {
          if (m?.id && !msgMap.has(m.id)) {
            msgMap.set(m.id, m);
          }
        }
        state.consultations[appointmentId].messages = Array.from(msgMap.values());
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
        // Prevent accidental overwrite with empty array if existing data exists
        if (Array.isArray(prescriptions) && prescriptions.length === 0 && state.consultations[appointmentId].prescriptions.length > 0) {
          return;
        }
        state.consultations[appointmentId].prescriptions = prescriptions;
      }
      if (typeof window !== 'undefined') {
        try {
          sessionStorage.setItem(
            `consultation_rx_${appointmentId}`,
            JSON.stringify(state.consultations[appointmentId].prescriptions)
          );
        } catch (e) {}
      }
    },

    syncConsultationPrescriptions: (
      state,
      action: PayloadAction<{ appointmentId: string; prescriptions: PrescriptionItem[] }>
    ) => {
      const { appointmentId, prescriptions } = action.payload;
      if (!Array.isArray(prescriptions) || prescriptions.length === 0) return;

      if (!state.consultations[appointmentId]) {
        state.consultations[appointmentId] = { ...initialSingleState, prescriptions };
      } else {
        const currentRx = state.consultations[appointmentId].prescriptions;
        if (currentRx.length === 0) {
          state.consultations[appointmentId].prescriptions = prescriptions;
        } else {
          const rxMap = new Map<string, PrescriptionItem>();
          for (const rx of currentRx) {
            const key = rx.id || `${rx.medicine}_${rx.dosage}_${rx.frequency}`;
            rxMap.set(key, rx);
          }
          for (const rx of prescriptions) {
            const key = rx.id || `${rx.medicine}_${rx.dosage}_${rx.frequency}`;
            if (!rxMap.has(key)) {
              rxMap.set(key, rx);
            } else {
              rxMap.set(key, { ...rxMap.get(key)!, ...rx });
            }
          }
          state.consultations[appointmentId].prescriptions = Array.from(rxMap.values());
        }
      }
      if (typeof window !== 'undefined') {
        try {
          sessionStorage.setItem(
            `consultation_rx_${appointmentId}`,
            JSON.stringify(state.consultations[appointmentId].prescriptions)
          );
        } catch (e) {}
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
        const exists = state.consultations[appointmentId].prescriptions.some(
          (p) => (p.id && p.id === prescription.id) || (p.medicine === prescription.medicine && p.dosage === prescription.dosage && p.frequency === prescription.frequency)
        );
        if (!exists) {
          state.consultations[appointmentId].prescriptions.unshift(prescription);
        }
      }
      if (typeof window !== 'undefined') {
        try {
          sessionStorage.setItem(
            `consultation_rx_${appointmentId}`,
            JSON.stringify(state.consultations[appointmentId].prescriptions)
          );
        } catch (e) {}
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
        if (typeof window !== 'undefined') {
          try {
            sessionStorage.setItem(
              `consultation_rx_${appointmentId}`,
              JSON.stringify(state.consultations[appointmentId].prescriptions)
            );
          } catch (e) {}
        }
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
      if (typeof window !== 'undefined') {
        try {
          sessionStorage.setItem(`consultation_notes_${appointmentId}`, notes);
        } catch (e) {}
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
        if (Array.isArray(files) && files.length === 0 && state.consultations[appointmentId].files.length > 0) {
          return;
        }
        state.consultations[appointmentId].files = files;
      }
      if (typeof window !== 'undefined') {
        try {
          sessionStorage.setItem(
            `consultation_files_${appointmentId}`,
            JSON.stringify(state.consultations[appointmentId].files)
          );
        } catch (e) {}
      }
    },

    syncConsultationFiles: (
      state,
      action: PayloadAction<{ appointmentId: string; files: UploadedFile[] }>
    ) => {
      const { appointmentId, files } = action.payload;
      if (!Array.isArray(files) || files.length === 0) return;

      if (!state.consultations[appointmentId]) {
        state.consultations[appointmentId] = { ...initialSingleState, files };
      } else {
        const currentFiles = state.consultations[appointmentId].files;
        if (currentFiles.length === 0) {
          state.consultations[appointmentId].files = files;
        } else {
          const fileMap = new Map<string, UploadedFile>();
          for (const f of currentFiles) {
            const key = f.id || f.url || f.name;
            fileMap.set(key, f);
          }
          for (const f of files) {
            const key = f.id || f.url || f.name;
            if (!fileMap.has(key)) {
              fileMap.set(key, f);
            }
          }
          state.consultations[appointmentId].files = Array.from(fileMap.values());
        }
      }
      if (typeof window !== 'undefined') {
        try {
          sessionStorage.setItem(
            `consultation_files_${appointmentId}`,
            JSON.stringify(state.consultations[appointmentId].files)
          );
        } catch (e) {}
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
        const exists = state.consultations[appointmentId].files.some(
          (f) => (f.id && f.id === file.id) || (f.url && f.url === file.url)
        );
        if (!exists) {
          state.consultations[appointmentId].files.unshift(file);
        }
      }
      if (typeof window !== 'undefined') {
        try {
          sessionStorage.setItem(
            `consultation_files_${appointmentId}`,
            JSON.stringify(state.consultations[appointmentId].files)
          );
        } catch (e) {}
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
        if (prescriptions && prescriptions.length > 0) {
          if (state.consultations[appointmentId].prescriptions.length === 0) {
            state.consultations[appointmentId].prescriptions = prescriptions;
          } else {
            const rxMap = new Map<string, PrescriptionItem>();
            for (const rx of state.consultations[appointmentId].prescriptions) {
              const key = rx.id || `${rx.medicine}_${rx.dosage}_${rx.frequency}`;
              rxMap.set(key, rx);
            }
            for (const rx of prescriptions) {
              const key = rx.id || `${rx.medicine}_${rx.dosage}_${rx.frequency}`;
              if (!rxMap.has(key)) {
                rxMap.set(key, rx);
              }
            }
            state.consultations[appointmentId].prescriptions = Array.from(rxMap.values());
          }
        }
        if (files && files.length > 0) {
          if (state.consultations[appointmentId].files.length === 0) {
            state.consultations[appointmentId].files = files;
          } else {
            const fileMap = new Map<string, UploadedFile>();
            for (const f of state.consultations[appointmentId].files) {
              const key = f.id || f.url || f.name;
              fileMap.set(key, f);
            }
            for (const f of files) {
              const key = f.id || f.url || f.name;
              if (!fileMap.has(key)) {
                fileMap.set(key, f);
              }
            }
            state.consultations[appointmentId].files = Array.from(fileMap.values());
          }
        }
        state.consultations[appointmentId].isLoaded = true;
      }
      if (typeof window !== 'undefined') {
        try {
          if (state.consultations[appointmentId].prescriptions.length > 0) {
            sessionStorage.setItem(
              `consultation_rx_${appointmentId}`,
              JSON.stringify(state.consultations[appointmentId].prescriptions)
            );
          }
          if (state.consultations[appointmentId].files.length > 0) {
            sessionStorage.setItem(
              `consultation_files_${appointmentId}`,
              JSON.stringify(state.consultations[appointmentId].files)
            );
          }
        } catch (e) {}
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
  syncConsultationMessages,
  setConsultationPrescriptions,
  syncConsultationPrescriptions,
  addConsultationPrescription,
  removeConsultationPrescription,
  setConsultationNotes,
  setConsultationFiles,
  syncConsultationFiles,
  addConsultationFile,
  setPatientClinicalContext,
} = consultationSlice.actions;

export default consultationSlice.reducer;
