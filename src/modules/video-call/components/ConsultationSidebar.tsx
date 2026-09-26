'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import axiosInstance from '@/api/axiosInstance';
import {
  ConsultationSidebarProps,
  ChatMessage,
  PrescriptionItem,
  UploadedFile,
  TabType,
  PatientInfoData,
  PastConsultationNote,
} from './sidebar/types';
import ChatTab from './sidebar/ChatTab';
import NotesTab from './sidebar/NotesTab';
import PrescriptionTab from './sidebar/PrescriptionTab';
import FilesTab from './sidebar/FilesTab';
import PatientInfoTab from './sidebar/PatientInfoTab';
import {
  initConsultation,
  cleanupConsultationState,
  addConsultationMessage,
  setConsultationPrescriptions,
  addConsultationPrescription,
  removeConsultationPrescription,
  addConsultationFile,
  setConsultationNotes,
  setPatientClinicalContext,
} from '@/redux/features/consultation/consultationSlice';

export default function ConsultationSidebar({
  appointmentId,
  userId,
  role,
  socket,
  isOpen = true,
  onToggle,
  onFinalizePrescription,
}: ConsultationSidebarProps) {
  const dispatch = useAppDispatch();
  const normalizedRole = role?.toLowerCase() || 'patient';
  const isDoctor = normalizedRole === 'doctor';

  // ── Redux isolated session slice for this specific appointmentId ──────────
  const consultationData = useAppSelector(
    (state) => state.consultation?.consultations[appointmentId]
  );

  // Default active tab: Doctors land on 'patient-info' for instant clinical assessment; patients land on 'chat'
  const [activeTab, setActiveTab] = useState<TabType>(isDoctor ? 'patient-info' : 'chat');
  const [inputText, setInputText] = useState('');
  const prescriptionsRef = useRef<PrescriptionItem[]>([]);

  // ── Rigorous Appointment Data Isolation & Lifecycle Cleanups ──────────────
  useEffect(() => {
    // 1. Initialize Redux container keyed by active appointmentId
    dispatch(initConsultation({ appointmentId, role: normalizedRole }));

    // Reset default active tab for new appointment
    setActiveTab(isDoctor ? 'patient-info' : 'chat');
    setInputText('');

    // Fetch clinical context if doctor
    if (isDoctor) {
      axiosInstance
        .get(`/appointments/${appointmentId}/clinical-context`)
        .then((res) => {
          if (res.data?.success) {
            dispatch(
              setPatientClinicalContext({
                appointmentId,
                patientInfo: res.data.patientInfo,
                pastNotes: res.data.pastConsultations || [],
                currentNotes: res.data.currentNotes,
                prescriptions: res.data.prescriptions,
                files: res.data.files,
              })
            );
          }
        })
        .catch((err) => {
          console.warn('Initial clinical context load failed:', err);
        });
    }

    // 2. UNMOUNT CLEANUP: Completely wipe local session states when leaving or switching appointments
    return () => {
      console.log(`[ConsultationSidebar] Running strict unmount cleanup for appointment: ${appointmentId}`);
      // Auto-flush draft prescriptions if doctor before wiping
      if (isDoctor && prescriptionsRef.current.length > 0) {
        axiosInstance
          .post(`/appointments/${appointmentId}/prescriptions`, {
            prescriptions: prescriptionsRef.current,
          })
          .catch(() => {});
      }

      // Purge Redux consultation state for this appointmentId to prevent cross-contamination
      dispatch(cleanupConsultationState(appointmentId));
    };
  }, [appointmentId, dispatch, isDoctor, normalizedRole]);

  // Fallback active tab if non-doctor attempts to open doctor-only tabs
  useEffect(() => {
    if (!isDoctor && (activeTab === 'patient-info' || activeTab === 'notes')) {
      setActiveTab('chat');
    }
  }, [isDoctor, activeTab]);

  // Messages, prescriptions, and files safely derived from isolated state
  const messages: ChatMessage[] = consultationData?.messages || [];
  const prescriptions: PrescriptionItem[] = consultationData?.prescriptions || [];
  const files: UploadedFile[] = consultationData?.files || [];
  const patientInfo: PatientInfoData | null = consultationData?.patientInfo || null;
  const pastNotes: PastConsultationNote[] = consultationData?.pastNotes || [];
  const notes: string = consultationData?.notes || '';

  // Keep ref up to date for unmount flush
  useEffect(() => {
    prescriptionsRef.current = prescriptions;
  }, [prescriptions]);

  // ── Real-time Socket Synchronization ──────────────────────────────────────
  useEffect(() => {
    if (!socket) return;

    // 1. Chat messages
    const handleIncomingChatMessage = (msg: ChatMessage) => {
      if (!msg) return;
      dispatch(addConsultationMessage({ appointmentId, message: msg }));
    };

    // 2. Prescriptions real-time sync
    const handleIncomingRxUpdate = (payload: { appointmentId: string; prescriptions: PrescriptionItem[] }) => {
      if (payload && payload.appointmentId === appointmentId && Array.isArray(payload.prescriptions)) {
        dispatch(setConsultationPrescriptions({ appointmentId, prescriptions: payload.prescriptions }));
      }
    };

    // 3. File uploaded real-time sync
    const handleIncomingFileUpload = (payload: { appointmentId: string; file: UploadedFile }) => {
      if (payload && payload.appointmentId === appointmentId && payload.file) {
        dispatch(addConsultationFile({ appointmentId, file: payload.file }));
      }
    };

    socket.on('consultation-chat-message', handleIncomingChatMessage);
    socket.on('consultation-rx-updated', handleIncomingRxUpdate);
    socket.on('consultation-file-uploaded', handleIncomingFileUpload);

    return () => {
      socket.off('consultation-chat-message', handleIncomingChatMessage);
      socket.off('consultation-rx-updated', handleIncomingRxUpdate);
      socket.off('consultation-file-uploaded', handleIncomingFileUpload);
    };
  }, [socket, appointmentId, dispatch]);

  // ── Chat Actions ──────────────────────────────────────────────────────────
  const handleSendMessage = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim()) return;

    const newMsg: ChatMessage = {
      id: `msg-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      senderId: userId,
      senderRole: normalizedRole,
      senderName: isDoctor ? 'Dr. Consultant' : patientInfo?.name || 'Patient',
      text: inputText.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    dispatch(addConsultationMessage({ appointmentId, message: newMsg }));
    setInputText('');

    if (socket) {
      socket.emit('consultation-chat-message', {
        appointmentId,
        ...newMsg,
      });
    }
  };

  // ── Prescription Actions ──────────────────────────────────────────────────
  const handleAddPrescription = (item: Omit<PrescriptionItem, 'id' | 'date'>) => {
    const newRx: PrescriptionItem = {
      ...item,
      id: `rx-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    };

    const updatedRxList = [newRx, ...prescriptions];
    dispatch(addConsultationPrescription({ appointmentId, prescription: newRx }));

    // Real-time broadcast to peer
    if (socket) {
      socket.emit('consultation-rx-updated', {
        appointmentId,
        prescriptions: updatedRxList,
      });
    }

    // Debounced persist to database
    axiosInstance
      .post(`/appointments/${appointmentId}/prescriptions`, {
        prescriptions: updatedRxList,
      })
      .catch((err) => console.warn('Autosave prescription failed:', err));
  };

  const handleRemovePrescription = (id: string) => {
    const updatedRxList = prescriptions.filter((item) => item.id !== id);
    dispatch(removeConsultationPrescription({ appointmentId, id }));

    if (socket) {
      socket.emit('consultation-rx-updated', {
        appointmentId,
        prescriptions: updatedRxList,
      });
    }

    axiosInstance
      .post(`/appointments/${appointmentId}/prescriptions`, {
        prescriptions: updatedRxList,
      })
      .catch((err) => console.warn('Autosave prescription update failed:', err));
  };

  const handleFinalizePrescription = (items: PrescriptionItem[]) => {
    axiosInstance
      .post(`/appointments/${appointmentId}/prescriptions`, {
        prescriptions: items,
      })
      .then(() => {
        if (onFinalizePrescription) {
          onFinalizePrescription(items);
        }
      })
      .catch((err) => console.error('Error finalizing prescriptions:', err));
  };

  // ── File Upload Actions ───────────────────────────────────────────────────
  const handleUploadSuccess = (uploadedFile: UploadedFile) => {
    dispatch(addConsultationFile({ appointmentId, file: uploadedFile }));

    if (socket) {
      socket.emit('consultation-file-uploaded', {
        appointmentId,
        file: uploadedFile,
      });
    }
  };

  const handleNotesChange = (newNotes: string) => {
    dispatch(setConsultationNotes({ appointmentId, notes: newNotes }));
  };

  const userMessageCount = messages.filter((m) => m.senderRole !== 'system').length;

  return (
    <>
      {/* Mobile backdrop overlay to prevent layout breaking */}
      {isOpen && onToggle && (
        <div
          onClick={onToggle}
          className="fixed inset-0 bg-black/70 backdrop-blur-xs z-40 lg:hidden"
        />
      )}

      <aside
        className={`fixed lg:relative top-0 right-0 w-[330px] sm:w-[380px] shrink-0 h-full bg-[#080c18] border-l border-slate-800/90 flex flex-col z-50 text-slate-100 shadow-2xl transition-transform duration-300 ${
          isOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'
        }`}
      >
        {/* ── Top Header ──────────────────────────────────────────────────────── */}
        <div className="p-3 px-4 border-b border-slate-800/90 bg-slate-900/90 backdrop-blur-md flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="relative flex h-2.5 w-2.5 shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            <div className="min-w-0">
              <h3 className="font-bold text-xs sm:text-sm text-slate-100 tracking-wide flex items-center gap-1.5 truncate">
                <span>Consultation Hub</span>
              </h3>
              <p className="text-[10px] text-slate-400 truncate">
                {isDoctor ? 'Doctor Clinical Console' : 'Patient Care Session'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <span
              className={`text-[9px] uppercase font-extrabold px-2.5 py-0.5 rounded-full border tracking-wider ${
                isDoctor
                  ? 'bg-indigo-950/90 text-indigo-300 border-indigo-700/60 shadow-xs'
                  : 'bg-emerald-950/90 text-emerald-300 border-emerald-700/60 shadow-xs'
              }`}
            >
              {isDoctor ? 'Doctor' : 'Patient'}
            </span>

            {onToggle && (
              <button
                type="button"
                onClick={onToggle}
                className="lg:hidden text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
                title="Close panel"
              >
                <i className="fas fa-times text-xs"></i>
              </button>
            )}
          </div>
        </div>

        {/* ── Role-Specific Navigation Tabs ───────────────────────────────────── */}
        {/* Doctor: 5 Tabs [Patient Info, Notes, Rx, Chat, Files] */}
        {/* Patient: 3 Tabs [Chat, Rx, Files] */}
        <div
          className={`grid bg-[#050811] p-1.5 gap-1 border-b border-slate-800/90 text-xs font-semibold shrink-0 ${
            isDoctor ? 'grid-cols-5' : 'grid-cols-3'
          }`}
        >
          {/* TAB: PATIENT INFO (DOCTOR EXCLUSIVE) */}
          {isDoctor && (
            <button
              type="button"
              onClick={() => setActiveTab('patient-info')}
              className={`py-2 px-1 rounded-xl flex flex-col items-center justify-center gap-1 transition-all text-[10px] cursor-pointer ${
                activeTab === 'patient-info'
                  ? 'bg-gradient-to-b from-indigo-600 to-indigo-700 text-white font-bold shadow-md shadow-indigo-600/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/80'
              }`}
            >
              <i className="fas fa-id-card text-[12px]"></i>
              <span className="truncate">Patient</span>
            </button>
          )}

          {/* TAB: NOTES (DOCTOR EXCLUSIVE) */}
          {isDoctor && (
            <button
              type="button"
              onClick={() => setActiveTab('notes')}
              className={`py-2 px-1 rounded-xl flex flex-col items-center justify-center gap-1 transition-all text-[10px] cursor-pointer ${
                activeTab === 'notes'
                  ? 'bg-gradient-to-b from-indigo-600 to-indigo-700 text-white font-bold shadow-md shadow-indigo-600/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/80'
              }`}
            >
              <i className="fas fa-file-pen text-[12px]"></i>
              <span className="truncate">Notes</span>
            </button>
          )}

          {/* TAB: RX / PRESCRIPTION */}
          <button
            type="button"
            onClick={() => setActiveTab('prescriptions')}
            className={`py-2 px-1 rounded-xl flex ${isDoctor ? 'flex-col' : 'flex-row'} items-center justify-center gap-1 transition-all text-[10px] cursor-pointer relative ${
              activeTab === 'prescriptions'
                ? 'bg-gradient-to-b from-indigo-600 to-indigo-700 text-white font-bold shadow-md shadow-indigo-600/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/80'
            }`}
          >
            <i className="fas fa-prescription text-[12px]"></i>
            <span className="truncate">Rx</span>
            {prescriptions.length > 0 && (
              <span
                className={`text-[9px] px-1.5 py-0.2 rounded-full font-bold leading-tight ${
                  activeTab === 'prescriptions'
                    ? 'bg-white/25 text-white'
                    : 'bg-indigo-950 text-indigo-300 border border-indigo-700/50'
                }`}
              >
                {prescriptions.length}
              </span>
            )}
          </button>

          {/* TAB: CHAT */}
          <button
            type="button"
            onClick={() => setActiveTab('chat')}
            className={`py-2 px-1 rounded-xl flex ${isDoctor ? 'flex-col' : 'flex-row'} items-center justify-center gap-1 transition-all text-[10px] cursor-pointer relative ${
              activeTab === 'chat'
                ? 'bg-gradient-to-b from-indigo-600 to-indigo-700 text-white font-bold shadow-md shadow-indigo-600/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/80'
            }`}
          >
            <i className="fas fa-comments text-[12px]"></i>
            <span className="truncate">Chat</span>
            {userMessageCount > 0 && (
              <span
                className={`text-[9px] px-1.5 py-0.2 rounded-full font-bold leading-tight ${
                  activeTab === 'chat'
                    ? 'bg-white/25 text-white'
                    : 'bg-indigo-950 text-indigo-300 border border-indigo-700/50'
                }`}
              >
                {userMessageCount}
              </span>
            )}
          </button>

          {/* TAB: FILES */}
          <button
            type="button"
            onClick={() => setActiveTab('files')}
            className={`py-2 px-1 rounded-xl flex ${isDoctor ? 'flex-col' : 'flex-row'} items-center justify-center gap-1 transition-all text-[10px] cursor-pointer relative ${
              activeTab === 'files'
                ? 'bg-gradient-to-b from-indigo-600 to-indigo-700 text-white font-bold shadow-md shadow-indigo-600/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/80'
            }`}
          >
            <i className="fas fa-folder-open text-[12px]"></i>
            <span className="truncate">Files</span>
            {files.length > 0 && (
              <span
                className={`text-[9px] px-1.5 py-0.2 rounded-full font-bold leading-tight ${
                  activeTab === 'files'
                    ? 'bg-white/25 text-white'
                    : 'bg-indigo-950 text-indigo-300 border border-indigo-700/50'
                }`}
              >
                {files.length}
              </span>
            )}
          </button>
        </div>

        {/* ── Tab Content Area ────────────────────────────────────────────────── */}
        <div className="flex-1 overflow-hidden flex flex-col relative">
          {activeTab === 'patient-info' && isDoctor && (
            <PatientInfoTab
              appointmentId={appointmentId}
              initialPatientInfo={patientInfo}
            />
          )}

          {activeTab === 'notes' && isDoctor && (
            <NotesTab
              appointmentId={appointmentId}
              initialNotes={notes}
              initialPastNotes={pastNotes}
              onNotesChange={handleNotesChange}
            />
          )}

          {activeTab === 'prescriptions' && (
            <PrescriptionTab
              appointmentId={appointmentId}
              isDoctor={isDoctor}
              prescriptions={prescriptions}
              patientName={patientInfo?.name || 'Patient'}
              onAddPrescription={handleAddPrescription}
              onRemovePrescription={handleRemovePrescription}
              onFinalizePrescription={handleFinalizePrescription}
            />
          )}

          {activeTab === 'chat' && (
            <ChatTab
              messages={messages}
              userId={userId}
              inputText={inputText}
              setInputText={setInputText}
              onSendMessage={handleSendMessage}
              peerRoleName={isDoctor ? 'Patient' : 'Dr. Consultant'}
            />
          )}

          {activeTab === 'files' && (
            <FilesTab
              appointmentId={appointmentId}
              isDoctor={isDoctor}
              files={files}
              onUploadSuccess={handleUploadSuccess}
            />
          )}
        </div>
      </aside>
    </>
  );
}
