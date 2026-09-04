'use client';

import React, { useState, useEffect } from 'react';
import {
  ConsultationSidebarProps,
  ChatMessage,
  PrescriptionItem,
  UploadedFile,
  TabType,
} from './sidebar/types';
import ChatTab from './sidebar/ChatTab';
import NotesTab from './sidebar/NotesTab';
import PrescriptionTab from './sidebar/PrescriptionTab';
import FilesTab from './sidebar/FilesTab';

export default function ConsultationSidebar({
  appointmentId,
  userId,
  role,
  socket,
  isOpen = true,
  onToggle,
  onFinalizePrescription,
}: ConsultationSidebarProps) {
  const normalizedRole = role?.toLowerCase() || 'patient';
  const isDoctor = normalizedRole === 'doctor';

  const [activeTab, setActiveTab] = useState<TabType>('chat');

  // Fallback active tab if role changes or notes tab is somehow active for patient
  useEffect(() => {
    if (!isDoctor && activeTab === 'notes') {
      setActiveTab('chat');
    }
  }, [isDoctor, activeTab]);

  // ─── Chat State ─────────────────────────────────────────────────────────────
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'system-1',
      senderId: 'system',
      senderRole: 'system',
      senderName: 'System',
      text: 'Consultation session started. Real-time messages & records are encrypted.',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [inputText, setInputText] = useState('');

  // Socket listener for real-time chat
  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = (msg: ChatMessage) => {
      setMessages((prev) => [...prev, msg]);
    };

    socket.on('consultation-chat-message', handleNewMessage);
    return () => {
      socket.off('consultation-chat-message', handleNewMessage);
    };
  }, [socket]);

  const handleSendMessage = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim()) return;

    const newMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      senderId: userId,
      senderRole: normalizedRole,
      senderName: isDoctor ? 'Dr. Consultant' : 'Patient',
      text: inputText.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, newMsg]);
    setInputText('');

    if (socket) {
      socket.emit('consultation-chat-message', {
        appointmentId,
        ...newMsg,
      });
    }
  };

  // ─── Prescription State ───────────────────────────────────────────────────
  const [prescriptions, setPrescriptions] = useState<PrescriptionItem[]>([
    {
      id: 'rx-1',
      medicine: 'Amoxicillin 500mg',
      dosage: '1 Capsule',
      frequency: '3 times daily (Every 8h)',
      duration: '5 Days',
      instructions: 'Take after meals with plenty of water.',
      prescribedBy: 'Dr. Consultant',
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    },
    {
      id: 'rx-2',
      medicine: 'Paracetamol 650mg',
      dosage: '1 Tablet',
      frequency: 'As needed (SOS)',
      duration: '3 Days',
      instructions: 'Take in case of temperature exceeding 100°F.',
      prescribedBy: 'Dr. Consultant',
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    },
  ]);

  const handleAddPrescription = (item: Omit<PrescriptionItem, 'id' | 'date'>) => {
    const newRx: PrescriptionItem = {
      ...item,
      id: `rx-${Date.now()}`,
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    };
    setPrescriptions((prev) => [newRx, ...prev]);
  };

  const handleRemovePrescription = (id: string) => {
    setPrescriptions((prev) => prev.filter((item) => item.id !== id));
  };

  // ─── Files State ───────────────────────────────────────────────────────────
  const [files, setFiles] = useState<UploadedFile[]>([
    {
      id: 'file-1',
      name: 'Complete_Blood_Count_Report.pdf',
      size: '1.4 MB',
      type: 'pdf',
      category: 'Blood Report',
      uploadedBy: 'Patient',
      timestamp: 'Today, 10:15 AM',
    },
    {
      id: 'file-2',
      name: 'Dietary_Guidelines_Hypertension.pdf',
      size: '850 KB',
      type: 'pdf',
      category: 'Diet Plan',
      uploadedBy: 'Doctor',
      timestamp: 'Today, 10:20 AM',
    },
  ]);

  const handleUploadFiles = (selectedFiles: FileList | null, category?: string) => {
    if (!selectedFiles || selectedFiles.length === 0) return;

    Array.from(selectedFiles).forEach((file) => {
      const sizeMB = (file.size / (1024 * 1024)).toFixed(1);
      const ext = file.name.split('.').pop()?.toLowerCase() || 'file';

      const newFileItem: UploadedFile = {
        id: `file-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        name: file.name,
        size: `${sizeMB} MB`,
        type: ext,
        category: category || (isDoctor ? 'Clinical Document' : 'Patient Record'),
        uploadedBy: isDoctor ? 'Doctor' : 'Patient',
        timestamp: 'Just now',
      };

      setFiles((prev) => [newFileItem, ...prev]);
    });
  };

  // Count user messages (excluding system)
  const userMessageCount = messages.filter((m) => m.senderRole !== 'system').length;

  return (
    <>
      {/* Mobile backdrop overlay */}
      {isOpen && onToggle && (
        <div
          onClick={onToggle}
          className="fixed inset-0 bg-black/60 backdrop-blur-xs z-40 lg:hidden"
        />
      )}

      <aside
        className={`fixed lg:relative top-0 right-0 w-[320px] sm:w-[360px] shrink-0 h-full bg-[#0f172a] border-l border-slate-800/80 flex flex-col z-50 text-slate-100 shadow-2xl transition-all duration-300 ${
          isOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'
        }`}
      >
        {/* ── Top Header ──────────────────────────────────────────────────────── */}
        <div className="p-3 px-4 border-b border-slate-800 bg-[#1e293b]/70 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            <div>
              <h3 className="font-semibold text-sm text-slate-100 tracking-wide flex items-center gap-1.5">
                <span>Consultation Hub</span>
              </h3>
              <p className="text-[10px] text-slate-400">
                {isDoctor ? 'Doctor Clinical Console' : 'Patient Care Session'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span
              className={`text-[9px] uppercase font-bold px-2 py-0.5 rounded-full border ${
                isDoctor
                  ? 'bg-indigo-950/80 text-indigo-300 border-indigo-700/60'
                  : 'bg-emerald-950/80 text-emerald-300 border-emerald-700/60'
              }`}
            >
              {isDoctor ? 'Doctor' : 'Patient'}
            </span>

            {onToggle && (
              <button
                onClick={onToggle}
                className="lg:hidden text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
                title="Close panel"
              >
                <i className="fas fa-times"></i>
              </button>
            )}
          </div>
        </div>

        {/* ── Navigation Tabs ─────────────────────────────────────────────────── */}
        {/* Doctor View: 4 Columns [Chat, Notes, Rx, Files] */}
        {/* Patient View: 3 Columns [Chat, Rx, Files] */}
        <div
          className={`grid bg-[#090d16] p-1 gap-1 border-b border-slate-800 text-xs font-medium ${
            isDoctor ? 'grid-cols-4' : 'grid-cols-3'
          }`}
        >
          {/* TAB 1: CHAT */}
          <button
            type="button"
            onClick={() => setActiveTab('chat')}
            className={`py-2 px-1 rounded-lg flex items-center justify-center gap-1.5 transition-all duration-200 relative ${
              activeTab === 'chat'
                ? 'bg-indigo-600 text-white font-semibold shadow-md shadow-indigo-600/25'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-850'
            }`}
          >
            <i className="fas fa-comments text-xs"></i>
            <span className="truncate">Chat</span>
            {userMessageCount > 0 && (
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold leading-tight ${
                  activeTab === 'chat' ? 'bg-white/20 text-white' : 'bg-indigo-950 text-indigo-300'
                }`}
              >
                {userMessageCount}
              </span>
            )}
          </button>

          {/* TAB 2: NOTES (DOCTOR ONLY) */}
          {isDoctor && (
            <button
              type="button"
              onClick={() => setActiveTab('notes')}
              className={`py-2 px-1 rounded-lg flex items-center justify-center gap-1.5 transition-all duration-200 relative ${
                activeTab === 'notes'
                  ? 'bg-indigo-600 text-white font-semibold shadow-md shadow-indigo-600/25'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-850'
              }`}
            >
              <i className="fas fa-lock text-[10px] text-amber-400"></i>
              <span className="truncate">Notes</span>
            </button>
          )}

          {/* TAB 3: RX / PRESCRIPTIONS */}
          <button
            type="button"
            onClick={() => setActiveTab('prescriptions')}
            className={`py-2 px-1 rounded-lg flex items-center justify-center gap-1.5 transition-all duration-200 relative ${
              activeTab === 'prescriptions'
                ? 'bg-indigo-600 text-white font-semibold shadow-md shadow-indigo-600/25'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-850'
            }`}
          >
            <i className="fas fa-prescription text-xs"></i>
            <span className="truncate">Rx</span>
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold leading-tight ${
                activeTab === 'prescriptions' ? 'bg-white/20 text-white' : 'bg-slate-800 text-slate-300'
              }`}
            >
              {prescriptions.length}
            </span>
          </button>

          {/* TAB 4: FILES */}
          <button
            type="button"
            onClick={() => setActiveTab('files')}
            className={`py-2 px-1 rounded-lg flex items-center justify-center gap-1.5 transition-all duration-200 relative ${
              activeTab === 'files'
                ? 'bg-indigo-600 text-white font-semibold shadow-md shadow-indigo-600/25'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-850'
            }`}
          >
            <i className="fas fa-folder-open text-xs"></i>
            <span className="truncate">Files</span>
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold leading-tight ${
                activeTab === 'files' ? 'bg-white/20 text-white' : 'bg-slate-800 text-slate-300'
              }`}
            >
              {files.length}
            </span>
          </button>
        </div>

        {/* ── Tab Content Area ────────────────────────────────────────────────── */}
        <div className="flex-1 overflow-hidden flex flex-col relative">
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

          {activeTab === 'notes' && isDoctor && (
            <NotesTab appointmentId={appointmentId} />
          )}

          {activeTab === 'prescriptions' && (
            <PrescriptionTab
              isDoctor={isDoctor}
              prescriptions={prescriptions}
              onAddPrescription={handleAddPrescription}
              onRemovePrescription={handleRemovePrescription}
              onFinalizePrescription={onFinalizePrescription}
            />
          )}

          {activeTab === 'files' && (
            <FilesTab
              isDoctor={isDoctor}
              files={files}
              onUploadFiles={handleUploadFiles}
            />
          )}
        </div>
      </aside>
    </>
  );
}
