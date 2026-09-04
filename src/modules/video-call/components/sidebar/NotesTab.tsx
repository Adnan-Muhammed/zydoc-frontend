'use client';

import React, { useState, useEffect } from 'react';

interface NotesTabProps {
  appointmentId: string;
}

export default function NotesTab({ appointmentId }: NotesTabProps) {
  const storageKey = `consultation_doctor_notes_${appointmentId}`;
  const [notes, setNotes] = useState<string>('');
  const [lastSavedTime, setLastSavedTime] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState(false);

  // Load saved notes from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved !== null) {
        setNotes(saved);
      }
    } catch {
      // Ignore localStorage errors
    }
  }, [storageKey]);

  // Auto-save debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        localStorage.setItem(storageKey, notes);
        if (notes.trim()) {
          setLastSavedTime(
            new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
          );
        }
      } catch {
        // Ignore localStorage errors
      }
    }, 600);

    return () => clearTimeout(timer);
  }, [notes, storageKey]);

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
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-[#0a0f1d] p-3.5 text-slate-100">
      {/* ── Privacy Security Notice Banner ── */}
      <div className="bg-amber-950/30 border border-amber-500/30 rounded-xl p-2.5 mb-3 flex items-start gap-2.5 text-amber-300">
        <div className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 mt-0.5">
          <i className="fas fa-lock text-xs"></i>
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-1.5 font-semibold text-xs text-amber-200">
            <span>Doctor Clinical Notes</span>
            <span className="bg-amber-500/20 text-amber-300 text-[9px] px-1.5 py-0.5 rounded font-medium border border-amber-500/30">
              Private
            </span>
          </div>
          <p className="text-[11px] text-amber-300/80 leading-snug mt-0.5">
            Private note - not visible to patient. Record observations, symptoms, and medical impressions safely.
          </p>
        </div>
      </div>

      {/* ── Quick clinical templates / tags ── */}
      <div className="mb-2">
        <p className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider mb-1.5 flex items-center justify-between">
          <span>Quick Note Templates</span>
          <span className="text-[10px] text-slate-500 normal-case">Click to insert</span>
        </p>
        <div className="flex flex-wrap gap-1.5">
          <button
            type="button"
            onClick={() => insertSnippet('Symptoms & Vitals', 'Chief complaints, BP, Pulse, SpO2, Temp')}
            className="text-[10px] bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white px-2 py-1 rounded-md border border-slate-750 transition-colors"
          >
            + Symptoms & Vitals
          </button>
          <button
            type="button"
            onClick={() => insertSnippet('Clinical Observations', 'Physical inspection, auscultation, remarks')}
            className="text-[10px] bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white px-2 py-1 rounded-md border border-slate-750 transition-colors"
          >
            + Observations
          </button>
          <button
            type="button"
            onClick={() => insertSnippet('Differential Diagnosis', 'Primary suspicion, secondary conditions')}
            className="text-[10px] bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white px-2 py-1 rounded-md border border-slate-750 transition-colors"
          >
            + Diagnosis
          </button>
          <button
            type="button"
            onClick={() => insertSnippet('Follow-up Advice', 'Review in 5 days if fever persists or symptoms worsen')}
            className="text-[10px] bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white px-2 py-1 rounded-md border border-slate-750 transition-colors"
          >
            + Follow-up
          </button>
        </div>
      </div>

      {/* ── Notes Editor Area ── */}
      <div className="flex-1 flex flex-col min-h-0 bg-slate-900/70 border border-slate-800 rounded-xl overflow-hidden focus-within:border-indigo-500/80 transition-colors">
        {/* Editor Toolbar */}
        <div className="px-3 py-1.5 bg-slate-900 border-b border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
          <div className="flex items-center gap-1.5">
            <i className="fas fa-file-lines text-indigo-400 text-xs"></i>
            <span className="font-medium text-slate-300">Observation Pad</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopy}
              disabled={!notes}
              title="Copy notes to clipboard"
              className="hover:text-white transition-colors disabled:opacity-40"
            >
              <i className={`fas ${isCopied ? 'fa-check text-emerald-400' : 'fa-copy'}`}></i>{' '}
              {isCopied ? 'Copied' : 'Copy'}
            </button>
            <span className="text-slate-700">•</span>
            <button
              type="button"
              onClick={handleClear}
              disabled={!notes}
              title="Clear notes"
              className="hover:text-rose-400 transition-colors disabled:opacity-40"
            >
              <i className="fas fa-trash-can"></i>
            </button>
          </div>
        </div>

        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Record patient symptoms, clinical observations, vitals, allergies, or private impressions here..."
          className="flex-1 w-full p-3 bg-transparent text-slate-100 placeholder-slate-500 text-xs leading-relaxed resize-none focus:outline-none scrollbar-thin scrollbar-thumb-slate-800"
        />

        {/* Editor Footer / Auto-save Status */}
        <div className="px-3 py-1.5 bg-slate-950/60 border-t border-slate-800/60 flex items-center justify-between text-[10px] text-slate-500">
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
            <span>
              {lastSavedTime ? `Autosaved at ${lastSavedTime}` : 'Autosaved locally'}
            </span>
          </div>
          <div className="text-slate-400">
            <span>{wordCount} words</span>
            <span className="mx-1">•</span>
            <span>{charCount} chars</span>
          </div>
        </div>
      </div>
    </div>
  );
}
