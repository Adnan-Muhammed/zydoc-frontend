'use client';

import React, { useState, useEffect, useRef } from 'react';
import axiosInstance from '@/api/axiosInstance';
import { PastConsultationNote } from './types';

interface NotesTabProps {
  appointmentId: string;
  initialNotes?: string;
  initialPastNotes?: PastConsultationNote[];
  onNotesChange?: (notes: string) => void;
}

export default function NotesTab({
  appointmentId,
  initialNotes = '',
  initialPastNotes = [],
  onNotesChange,
}: NotesTabProps) {
  const storageKey = `consultation_doctor_notes_${appointmentId}`;
  const [notes, setNotes] = useState<string>(initialNotes);
  const [pastNotes, setPastNotes] = useState<PastConsultationNote[]>(initialPastNotes);
  const [expandedPastId, setExpandedPastId] = useState<string | null>(null);
  const [lastSavedTime, setLastSavedTime] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [isLoadingPast, setIsLoadingPast] = useState(false);

  const initialLoadedRef = useRef(false);

  // ── 1. Load saved notes from localStorage on mount & sync with initialNotes ──
  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved !== null && saved !== '') {
        setNotes(saved);
        if (onNotesChange) onNotesChange(saved);
      } else if (initialNotes) {
        setNotes(initialNotes);
      }
    } catch {
      // Ignore storage errors
    }
  }, [storageKey, initialNotes]);

  // ── 2. Fetch past consultation notes if not provided ──────────────────────
  useEffect(() => {
    if (initialPastNotes && initialPastNotes.length > 0) {
      setPastNotes(initialPastNotes);
      return;
    }

    const fetchPastHistory = async () => {
      setIsLoadingPast(true);
      try {
        const res = await axiosInstance.get(`/appointments/${appointmentId}/clinical-context`);
        if (res.data?.success) {
          if (res.data.pastConsultations) {
            setPastNotes(res.data.pastConsultations);
          }
          if (res.data.currentNotes && !notes) {
            setNotes(res.data.currentNotes);
            localStorage.setItem(storageKey, res.data.currentNotes);
          }
        }
      } catch (err) {
        console.warn('Could not fetch longitudinal past notes:', err);
      } finally {
        setIsLoadingPast(false);
      }
    };

    fetchPastHistory();
  }, [appointmentId, initialPastNotes]);

  // ── 3. Auto-save debounce to localStorage and backend ─────────────────────
  useEffect(() => {
    if (!initialLoadedRef.current) {
      initialLoadedRef.current = true;
      return;
    }

    if (onNotesChange) {
      onNotesChange(notes);
    }

    const timer = setTimeout(async () => {
      try {
        localStorage.setItem(storageKey, notes);
        if (notes.trim()) {
          setIsSaving(true);
          try {
            await axiosInstance.post(`/appointments/${appointmentId}/clinical-notes`, {
              notes,
            });
          } catch (e) {
            // Ignore offline network blips; local storage preserves note
          } finally {
            setIsSaving(false);
          }

          setLastSavedTime(
            new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
          );
        }
      } catch {
        // Ignore localStorage errors
      }
    }, 700);

    return () => clearTimeout(timer);
  }, [notes, storageKey, appointmentId]);

  const insertSnippet = (title: string, defaultText: string) => {
    setNotes((prev) => {
      const prefix = prev.trim() ? `${prev.trim()}\n\n` : '';
      return `${prefix}### ${title}\n- ${defaultText}`;
    });
  };

  const handleCopy = () => {
    if (!notes) return;
    navigator.clipboard.writeText(notes);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleClear = () => {
    if (window.confirm('Are you sure you want to clear these private clinical notes?')) {
      setNotes('');
      try {
        localStorage.removeItem(storageKey);
      } catch {
        // Ignore
      }
      setLastSavedTime(null);
    }
  };

  const wordCount = notes.trim() ? notes.trim().split(/\s+/).length : 0;
  const charCount = notes.length;

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-[#0a0f1d] p-3 text-slate-100 space-y-2.5">
      {/* ── Privacy Security Notice Banner ── */}
      <div className="bg-amber-950/30 border border-amber-500/30 rounded-xl p-2 flex items-start gap-2 text-amber-300 shrink-0">
        <div className="w-6 h-6 rounded-md bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 mt-0.5">
          <i className="fas fa-user-doctor text-xs"></i>
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-1.5 font-semibold text-xs text-amber-200">
            <span>Doctor Clinical Console</span>
            <span className="bg-amber-500/20 text-amber-300 text-[8px] px-1.5 py-0.5 rounded font-medium border border-amber-500/30">
              Private
            </span>
          </div>
          <p className="text-[10px] text-amber-300/80 leading-snug">
            Split view: Record current impressions and cross-reference longitudinal patient history.
          </p>
        </div>
      </div>

      {/* ── Split Section 1: Current Session Notes Editor ── */}
      <div className="flex-1 flex flex-col min-h-0 bg-slate-900/80 border border-slate-800 rounded-xl overflow-hidden focus-within:border-indigo-500/80 transition-colors">
        {/* Editor Toolbar */}
        <div className="px-3 py-1.5 bg-slate-900 border-b border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400 shrink-0">
          <div className="flex items-center gap-1.5">
            <i className="fas fa-file-pen text-indigo-400 text-xs"></i>
            <span className="font-semibold text-slate-200 text-xs">Current Session Notes</span>
          </div>
          <div className="flex items-center gap-2 text-[10px]">
            <button
              type="button"
              onClick={handleCopy}
              disabled={!notes}
              title="Copy notes to clipboard"
              className="hover:text-white transition-colors disabled:opacity-40 flex items-center gap-1"
            >
              <i className={`fas ${isCopied ? 'fa-check text-emerald-400' : 'fa-copy'}`}></i>
              <span>{isCopied ? 'Copied' : 'Copy'}</span>
            </button>
            <span className="text-slate-700">•</span>
            <button
              type="button"
              onClick={handleClear}
              disabled={!notes}
              title="Clear notes"
              className="hover:text-rose-400 transition-colors disabled:opacity-40 flex items-center gap-1"
            >
              <i className="fas fa-trash-can"></i>
              <span>Clear</span>
            </button>
          </div>
        </div>

        {/* Quick Templates Bar */}
        <div className="px-2.5 py-1 bg-slate-950/40 border-b border-slate-800/60 flex items-center gap-1 overflow-x-auto scrollbar-none shrink-0">
          <span className="text-[9px] text-slate-500 uppercase font-semibold shrink-0 mr-1">
            + Quick:
          </span>
          <button
            type="button"
            onClick={() => insertSnippet('Symptoms & Vitals', 'BP, Pulse, SpO2, Temp, Duration')}
            className="text-[9px] bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white px-2 py-0.5 rounded border border-slate-750 transition-colors shrink-0"
          >
            Vitals
          </button>
          <button
            type="button"
            onClick={() => insertSnippet('Clinical Observations', 'Physical inspection, auscultation, remarks')}
            className="text-[9px] bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white px-2 py-0.5 rounded border border-slate-750 transition-colors shrink-0"
          >
            Observations
          </button>
          <button
            type="button"
            onClick={() => insertSnippet('Differential Diagnosis', 'Primary diagnosis, secondary conditions')}
            className="text-[9px] bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white px-2 py-0.5 rounded border border-slate-750 transition-colors shrink-0"
          >
            Diagnosis
          </button>
          <button
            type="button"
            onClick={() => insertSnippet('Advice & Follow-up', 'Review in 5 days or if symptoms worsen')}
            className="text-[9px] bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white px-2 py-0.5 rounded border border-slate-750 transition-colors shrink-0"
          >
            Follow-up
          </button>
        </div>

        {/* Text Area */}
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Record patient symptoms, clinical observations, vitals, or impressions for this session..."
          className="flex-1 w-full p-2.5 bg-transparent text-slate-100 placeholder-slate-500 text-xs leading-relaxed resize-none focus:outline-none scrollbar-thin scrollbar-thumb-slate-800"
        />

        {/* Editor Footer / Auto-save Status */}
        <div className="px-3 py-1 bg-slate-950/70 border-t border-slate-800/60 flex items-center justify-between text-[10px] text-slate-500 shrink-0">
          <div className="flex items-center gap-1.5">
            <span
              className={`w-1.5 h-1.5 rounded-full ${isSaving ? 'bg-amber-400 animate-ping' : 'bg-emerald-400'}`}
            ></span>
            <span>
              {isSaving
                ? 'Syncing to cloud...'
                : lastSavedTime
                ? `Autosaved at ${lastSavedTime}`
                : 'Autosaved locally'}
            </span>
          </div>
          <div className="text-slate-400">
            <span>{wordCount} w</span>
            <span className="mx-1">•</span>
            <span>{charCount} c</span>
          </div>
        </div>
      </div>

      {/* ── Split Section 2: Past Consultation History Accordion ── */}
      <div className="h-44 flex flex-col bg-slate-900/80 border border-slate-800 rounded-xl overflow-hidden shrink-0">
        <div className="px-3 py-2 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <i className="fas fa-clock-rotate-left text-amber-400 text-xs"></i>
            <span className="font-semibold text-xs text-slate-200">Past Patient Consultations</span>
            <span className="text-[10px] font-bold bg-slate-800 text-slate-300 px-1.5 py-0.2 rounded-full">
              {pastNotes.length}
            </span>
          </div>
          <span className="text-[9px] text-slate-500">Filtered by Patient ID</span>
        </div>

        <div className="flex-1 overflow-y-auto p-2 space-y-1.5 scrollbar-thin scrollbar-thumb-slate-800">
          {isLoadingPast ? (
            <div className="text-center py-4 text-xs text-slate-500">
              <i className="fas fa-spinner fa-spin mr-1.5"></i> Loading patient consultation archive…
            </div>
          ) : pastNotes.length === 0 ? (
            <div className="text-center py-6 text-slate-500 text-xs">
              <i className="fas fa-folder-open text-slate-600 block text-lg mb-1"></i>
              <span>No prior consultation records found for this patient.</span>
            </div>
          ) : (
            pastNotes.map((item) => {
              const isExpanded = expandedPastId === item.appointmentId;
              const formattedDate = new Date(item.date).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              });

              return (
                <div
                  key={item.appointmentId}
                  className="bg-slate-950/70 border border-slate-800 rounded-lg overflow-hidden transition-all"
                >
                  <button
                    type="button"
                    onClick={() => setExpandedPastId(isExpanded ? null : item.appointmentId)}
                    className="w-full px-2.5 py-1.5 text-left flex items-center justify-between hover:bg-slate-900 transition-colors text-xs"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 shrink-0"></span>
                      <span className="font-medium text-slate-200 truncate">{formattedDate}</span>
                      <span className="text-[10px] text-slate-500 truncate">
                        • {item.doctorName} ({item.specialty || 'General'})
                      </span>
                    </div>
                    <i
                      className={`fas fa-chevron-down text-[10px] text-slate-400 transition-transform duration-200 ${
                        isExpanded ? 'rotate-180 text-indigo-400' : ''
                      }`}
                    ></i>
                  </button>

                  {isExpanded && (
                    <div className="px-2.5 py-2 border-t border-slate-800/80 bg-slate-900/40 space-y-2 text-[11px] animate-fadeIn">
                      {/* Clinical Notes */}
                      {item.clinicalNotes ? (
                        <div>
                          <div className="text-[10px] uppercase font-bold text-slate-400 mb-0.5">
                            Doctor Notes & Diagnosis:
                          </div>
                          <p className="text-slate-300 whitespace-pre-wrap leading-relaxed bg-slate-950/50 p-2 rounded border border-slate-850">
                            {item.clinicalNotes}
                          </p>
                        </div>
                      ) : (
                        <p className="text-[10px] text-slate-500 italic">No notes recorded.</p>
                      )}

                      {/* Prescriptions */}
                      {item.prescriptions && item.prescriptions.length > 0 && (
                        <div>
                          <div className="text-[10px] uppercase font-bold text-indigo-400 mb-1 flex items-center gap-1">
                            <i className="fas fa-pills text-[9px]"></i> Prescribed ({item.prescriptions.length}):
                          </div>
                          <div className="space-y-1">
                            {item.prescriptions.map((rx, idx) => (
                              <div
                                key={idx}
                                className="bg-slate-950/40 p-1.5 rounded border border-slate-850 flex items-center justify-between text-[10px]"
                              >
                                <span className="font-medium text-slate-200">{rx.medicine}</span>
                                <span className="text-slate-400">{rx.dosage} • {rx.duration}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
