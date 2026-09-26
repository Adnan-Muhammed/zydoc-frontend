'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
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
  const [notes, setNotes] = useState<string>('');
  const [pastNotes, setPastNotes] = useState<PastConsultationNote[]>(initialPastNotes);
  const [expandedPastId, setExpandedPastId] = useState<string | null>(null);
  const [lastSavedTime, setLastSavedTime] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [isLoadingPast, setIsLoadingPast] = useState(false);
  const [isHistoryCollapsed, setIsHistoryCollapsed] = useState(false);

  // Ref to track initialization per appointmentId
  const initializedAppointmentRef = useRef<string | null>(null);
  const onNotesChangeRef = useRef(onNotesChange);
  useEffect(() => {
    onNotesChangeRef.current = onNotesChange;
  }, [onNotesChange]);

  // ── 1. One-time Initialization per appointmentId (fixes typing lockout bug) ──
  useEffect(() => {
    if (initializedAppointmentRef.current === appointmentId) return;
    initializedAppointmentRef.current = appointmentId;

    let initialVal = '';
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved !== null && saved !== '') {
        initialVal = saved;
      } else if (initialNotes) {
        initialVal = initialNotes;
      }
    } catch {
      initialVal = initialNotes || '';
    }

    setNotes(initialVal);
    if (initialVal) {
      setLastSavedTime(
        new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
      );
    }
  }, [appointmentId, storageKey, initialNotes]);

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
          // If local notes are still empty, backfill from backend currentNotes
          if (res.data.currentNotes) {
            setNotes((currentLocal) => {
              if (!currentLocal.trim()) {
                try {
                  localStorage.setItem(storageKey, res.data.currentNotes);
                } catch {
                  // Ignore
                }
                return res.data.currentNotes;
              }
              return currentLocal;
            });
          }
        }
      } catch (err) {
        console.warn('Could not fetch longitudinal past notes:', err);
      } finally {
        setIsLoadingPast(false);
      }
    };

    fetchPastHistory();
  }, [appointmentId, initialPastNotes, storageKey]);

  // ── 3. Debounced Auto-Save to localStorage, backend, and parent callback ─
  useEffect(() => {
    // Only auto-save once initialized
    if (initializedAppointmentRef.current !== appointmentId) return;

    const timer = setTimeout(async () => {
      try {
        localStorage.setItem(storageKey, notes);
      } catch {
        // Ignore localStorage quota errors
      }

      // Sync with parent Redux non-blockingly
      if (onNotesChangeRef.current) {
        onNotesChangeRef.current(notes);
      }

      if (notes.trim()) {
        setIsSaving(true);
        try {
          await axiosInstance.post(`/appointments/${appointmentId}/clinical-notes`, {
            notes,
          });
        } catch {
          // Ignore network blips — localStorage guarantees local persistence
        } finally {
          setIsSaving(false);
        }

        setLastSavedTime(
          new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
        );
      }
    }, 600);

    return () => clearTimeout(timer);
  }, [notes, storageKey, appointmentId]);

  // ── Quick Templates ───────────────────────────────────────────────────────
  const insertSnippet = useCallback((title: string, defaultText: string) => {
    setNotes((prev) => {
      const prefix = prev.trim() ? `${prev.trim()}\n\n` : '';
      return `${prefix}### ${title}\n- ${defaultText}`;
    });
  }, []);

  const handleCopy = useCallback(() => {
    if (!notes) return;
    navigator.clipboard.writeText(notes);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  }, [notes]);

  const handleClear = useCallback(() => {
    if (window.confirm('Are you sure you want to clear these clinical notes?')) {
      setNotes('');
      try {
        localStorage.removeItem(storageKey);
      } catch {
        // Ignore
      }
      setLastSavedTime(null);
      if (onNotesChangeRef.current) {
        onNotesChangeRef.current('');
      }
    }
  }, [storageKey]);

  const wordCount = notes.trim() ? notes.trim().split(/\s+/).length : 0;
  const charCount = notes.length;

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-[#0a0f1d] p-3 text-slate-100 space-y-2.5">
      {/* ── Privacy Security Notice Banner ── */}
      <div className="bg-gradient-to-r from-amber-950/40 via-amber-900/20 to-slate-900/60 border border-amber-500/30 rounded-xl p-2.5 flex items-start gap-2.5 text-amber-300 shrink-0 shadow-xs">
        <div className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 mt-0.5 border border-amber-500/30">
          <i className="fas fa-user-doctor text-xs"></i>
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 font-semibold text-xs text-amber-200">
            <span>Doctor Clinical Console</span>
            <span className="bg-amber-500/20 text-amber-300 text-[9px] px-1.5 py-0.5 rounded font-medium border border-amber-500/40 tracking-wider uppercase">
              Private
            </span>
          </div>
          <p className="text-[10px] text-amber-300/80 leading-relaxed mt-0.5">
            Record confidential impressions, symptoms, vitals & treatment plan for this consultation.
          </p>
        </div>
      </div>

      {/* ── Section 1: Current Session Notes Editor ── */}
      <div className="flex-1 flex flex-col min-h-0 bg-slate-900/90 border border-slate-800/90 rounded-xl overflow-hidden focus-within:border-indigo-500/80 focus-within:ring-1 focus-within:ring-indigo-500/30 transition-all shadow-md">
        {/* Editor Toolbar */}
        <div className="px-3 py-2 bg-slate-900 border-b border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400 shrink-0">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
            <span className="font-semibold text-slate-200 text-xs">Current Session Notes</span>
          </div>
          <div className="flex items-center gap-2.5 text-[11px]">
            <button
              type="button"
              onClick={handleCopy}
              disabled={!notes.trim()}
              title="Copy notes to clipboard"
              className="hover:text-white transition-colors disabled:opacity-35 flex items-center gap-1.5 px-2 py-0.5 rounded bg-slate-800/60 hover:bg-slate-800 border border-slate-750 active:scale-95 cursor-pointer disabled:cursor-not-allowed"
            >
              <i className={`fas ${isCopied ? 'fa-check text-emerald-400' : 'fa-copy text-indigo-400'}`}></i>
              <span>{isCopied ? 'Copied' : 'Copy'}</span>
            </button>
            <button
              type="button"
              onClick={handleClear}
              disabled={!notes.trim()}
              title="Clear notes"
              className="hover:text-rose-400 transition-colors disabled:opacity-35 flex items-center gap-1.5 px-2 py-0.5 rounded bg-slate-800/60 hover:bg-slate-800 border border-slate-755 active:scale-95 cursor-pointer disabled:cursor-not-allowed"
            >
              <i className="fas fa-trash-can text-rose-400/80"></i>
              <span>Clear</span>
            </button>
          </div>
        </div>

        {/* Quick Templates Bar */}
        <div className="px-2.5 py-1.5 bg-slate-950/60 border-b border-slate-800/60 flex items-center gap-1.5 overflow-x-auto scrollbar-none shrink-0">
          <span className="text-[10px] text-indigo-400/90 font-bold uppercase tracking-wider shrink-0 flex items-center gap-1 mr-0.5">
            <i className="fas fa-bolt text-[9px]"></i> Quick:
          </span>
          <button
            type="button"
            onClick={() => insertSnippet('Symptoms & Vitals', 'BP: ___ / ___, HR: ___ bpm, Temp: ___ °F, SpO2: ___%')}
            className="text-[10px] bg-slate-800/80 hover:bg-indigo-600/30 text-slate-300 hover:text-indigo-200 px-2.5 py-1 rounded-md border border-slate-700/80 hover:border-indigo-500/50 transition-all shrink-0 cursor-pointer font-medium"
          >
            Vitals
          </button>
          <button
            type="button"
            onClick={() => insertSnippet('Clinical Observations', 'General condition, physical exam findings, auscultation')}
            className="text-[10px] bg-slate-800/80 hover:bg-indigo-600/30 text-slate-300 hover:text-indigo-200 px-2.5 py-1 rounded-md border border-slate-700/80 hover:border-indigo-500/50 transition-all shrink-0 cursor-pointer font-medium"
          >
            Observations
          </button>
          <button
            type="button"
            onClick={() => insertSnippet('Diagnosis', 'Primary diagnosis: ___\n- Secondary findings: ___')}
            className="text-[10px] bg-slate-800/80 hover:bg-indigo-600/30 text-slate-300 hover:text-indigo-200 px-2.5 py-1 rounded-md border border-slate-700/80 hover:border-indigo-500/50 transition-all shrink-0 cursor-pointer font-medium"
          >
            Diagnosis
          </button>
          <button
            type="button"
            onClick={() => insertSnippet('Advice & Follow-Up', 'Medication regimen review, follow-up scheduled in ___ days')}
            className="text-[10px] bg-slate-800/80 hover:bg-indigo-600/30 text-slate-300 hover:text-indigo-200 px-2.5 py-1 rounded-md border border-slate-700/80 hover:border-indigo-500/50 transition-all shrink-0 cursor-pointer font-medium"
          >
            Follow-up
          </button>
        </div>

        {/* Textarea — Unlocked, completely editable, with full continuous typing */}
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Type patient symptoms, clinical observations, vitals, or impressions here... Everything auto-saves continuously."
          className="flex-1 w-full p-3 bg-transparent text-slate-100 placeholder-slate-500 text-xs sm:text-[13px] leading-relaxed resize-none focus:outline-none scrollbar-thin scrollbar-thumb-slate-800 focus:placeholder-slate-600 transition-colors"
        />

        {/* Editor Footer / Auto-save Status & Stats */}
        <div className="px-3 py-1.5 bg-slate-950/80 border-t border-slate-800/70 flex items-center justify-between text-[10px] text-slate-400 shrink-0">
          <div className="flex items-center gap-2">
            <span
              className={`w-2 h-2 rounded-full ${
                isSaving ? 'bg-amber-400 animate-ping' : 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]'
              }`}
            ></span>
            <span className="font-medium text-slate-300">
              {isSaving
                ? 'Syncing to cloud...'
                : lastSavedTime
                ? `Autosaved at ${lastSavedTime}`
                : 'Ready • Local cache active'}
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-400 font-mono text-[10px]">
            <span>{wordCount} words</span>
            <span className="text-slate-600">•</span>
            <span>{charCount} chars</span>
          </div>
        </div>
      </div>

      {/* ── Section 2: Past Patient Consultations (Redesigned Accordion & Smooth Scroll) ── */}
      <div className="bg-slate-900/90 border border-slate-800/90 rounded-xl overflow-hidden shrink-0 flex flex-col transition-all shadow-md">
        {/* Accordion Header Bar */}
        <button
          type="button"
          onClick={() => setIsHistoryCollapsed(!isHistoryCollapsed)}
          className="w-full px-3 py-2 bg-slate-900 hover:bg-slate-850 border-b border-slate-800/80 flex items-center justify-between transition-colors cursor-pointer text-left"
        >
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-md bg-amber-500/20 text-amber-400 flex items-center justify-center text-[10px] border border-amber-500/30">
              <i className="fas fa-clock-rotate-left"></i>
            </div>
            <span className="font-semibold text-xs text-slate-200">Past Patient Consultations</span>
            <span className="text-[10px] font-bold bg-indigo-950 text-indigo-300 border border-indigo-700/50 px-1.5 py-0.2 rounded-full">
              {pastNotes.length}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[9px] text-slate-500 hidden sm:inline">Patient History</span>
            <i
              className={`fas fa-chevron-down text-slate-400 text-xs transition-transform duration-200 ${
                isHistoryCollapsed ? '-rotate-90' : 'rotate-0'
              }`}
            ></i>
          </div>
        </button>

        {/* Accordion Body */}
        {!isHistoryCollapsed && (
          <div className="max-h-52 overflow-y-auto p-2.5 space-y-2 scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent">
            {isLoadingPast ? (
              <div className="text-center py-6 text-xs text-slate-400 flex flex-col items-center gap-2">
                <i className="fas fa-spinner fa-spin text-indigo-400 text-sm"></i>
                <span>Loading patient consultation archive…</span>
              </div>
            ) : pastNotes.length === 0 ? (
              <div className="text-center py-6 text-slate-500 text-xs flex flex-col items-center gap-1.5">
                <div className="w-9 h-9 rounded-full bg-slate-800/60 flex items-center justify-center text-slate-500 mb-1">
                  <i className="fas fa-folder-open text-sm"></i>
                </div>
                <span className="font-medium text-slate-400">No prior consultation records</span>
                <span className="text-[10px] text-slate-500">First time consulting with this patient</span>
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
                    className="bg-slate-950/70 border border-slate-800/90 rounded-lg overflow-hidden transition-all hover:border-slate-700"
                  >
                    <button
                      type="button"
                      onClick={() => setExpandedPastId(isExpanded ? null : item.appointmentId)}
                      className="w-full px-3 py-2 text-left flex items-center justify-between hover:bg-slate-900/60 transition-colors text-xs cursor-pointer"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 shrink-0"></span>
                        <span className="font-semibold text-slate-200 truncate">{formattedDate}</span>
                        <span className="text-[10px] text-slate-400 truncate">
                          • {item.doctorName}
                        </span>
                        {item.specialty && (
                          <span className="text-[9px] bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded border border-slate-700 hidden sm:inline truncate">
                            {item.specialty}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        {item.prescriptions && item.prescriptions.length > 0 && (
                          <span className="text-[9px] bg-indigo-950/80 text-indigo-300 px-1.5 py-0.5 rounded border border-indigo-800/50 flex items-center gap-1">
                            <i className="fas fa-pills text-[8px]"></i>
                            <span>{item.prescriptions.length} Rx</span>
                          </span>
                        )}
                        <i
                          className={`fas fa-chevron-down text-[10px] text-slate-400 transition-transform duration-200 ml-1 ${
                            isExpanded ? 'rotate-180 text-indigo-400' : ''
                          }`}
                        ></i>
                      </div>
                    </button>

                    {isExpanded && (
                      <div className="px-3 py-2.5 border-t border-slate-800/80 bg-slate-900/40 space-y-2.5 text-[11px] animate-in fade-in duration-150">
                        {/* Clinical Notes */}
                        <div>
                          <div className="text-[10px] uppercase font-bold text-slate-400 mb-1 flex items-center gap-1.5">
                            <i className="fas fa-file-lines text-indigo-400 text-[9px]"></i>
                            <span>Clinical Notes & Diagnosis:</span>
                          </div>
                          {item.clinicalNotes ? (
                            <p className="text-slate-300 whitespace-pre-wrap leading-relaxed bg-slate-950/70 p-2.5 rounded-lg border border-slate-800 text-[11px] font-sans">
                              {item.clinicalNotes}
                            </p>
                          ) : (
                            <p className="text-[11px] text-slate-500 italic bg-slate-950/40 p-2 rounded border border-slate-800/60">
                              No clinical notes recorded for this session.
                            </p>
                          )}
                        </div>

                        {/* Prescriptions */}
                        {item.prescriptions && item.prescriptions.length > 0 && (
                          <div>
                            <div className="text-[10px] uppercase font-bold text-indigo-400 mb-1 flex items-center gap-1">
                              <i className="fas fa-pills text-[9px]"></i>
                              <span>Prescribed Medications ({item.prescriptions.length}):</span>
                            </div>
                            <div className="space-y-1">
                              {item.prescriptions.map((rx, idx) => (
                                <div
                                  key={idx}
                                  className="bg-slate-950/60 p-2 rounded-lg border border-slate-800/80 flex items-center justify-between text-[11px]"
                                >
                                  <div className="flex items-center gap-1.5 font-medium text-slate-200">
                                    <span className="text-indigo-400">•</span>
                                    <span>{rx.medicine}</span>
                                  </div>
                                  <div className="text-[10px] text-slate-400 flex items-center gap-2">
                                    {rx.dosage && <span className="bg-slate-800 px-1.5 py-0.5 rounded">{rx.dosage}</span>}
                                    {rx.duration && <span>{rx.duration}</span>}
                                  </div>
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
        )}
      </div>
    </div>
  );
}
