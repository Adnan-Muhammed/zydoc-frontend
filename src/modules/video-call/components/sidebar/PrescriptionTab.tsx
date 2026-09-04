'use client';

import React, { useState } from 'react';
import { PrescriptionItem } from './types';

interface PrescriptionTabProps {
  isDoctor: boolean;
  prescriptions: PrescriptionItem[];
  onAddPrescription: (item: Omit<PrescriptionItem, 'id' | 'date'>) => void;
  onRemovePrescription?: (id: string) => void;
  onFinalizePrescription?: (items: PrescriptionItem[]) => void;
}

export default function PrescriptionTab({
  isDoctor,
  prescriptions,
  onAddPrescription,
  onRemovePrescription,
  onFinalizePrescription,
}: PrescriptionTabProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newMedName, setNewMedName] = useState('');
  const [newDosage, setNewDosage] = useState('');
  const [newFrequency, setNewFrequency] = useState('Twice daily');
  const [newDuration, setNewDuration] = useState('5 Days');
  const [newInstructions, setNewInstructions] = useState('');
  const [isFinalizing, setIsFinalizing] = useState(false);
  const [finalizeSuccess, setFinalizeSuccess] = useState(false);

  const durationQuickOptions = ['3 Days', '5 Days', '7 Days', '10 Days', '2 Weeks', '1 Month'];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMedName.trim()) return;

    onAddPrescription({
      medicine: newMedName.trim(),
      dosage: newDosage.trim() || '1 Tablet',
      frequency: newFrequency,
      duration: newDuration.trim() || '5 Days',
      instructions: newInstructions.trim() || 'Take as directed with water.',
      prescribedBy: isDoctor ? 'Dr. Consultant' : 'Doctor',
    });

    // Reset form
    setNewMedName('');
    setNewDosage('');
    setNewInstructions('');
    setShowAddForm(false);
  };

  const handleFinalize = () => {
    setIsFinalizing(true);
    setTimeout(() => {
      setIsFinalizing(false);
      setFinalizeSuccess(true);
      if (onFinalizePrescription) {
        onFinalizePrescription(prescriptions);
      }
      setTimeout(() => setFinalizeSuccess(false), 4000);
    }, 900);
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-[#0a0f1d] p-3.5 text-slate-100">
      {/* ── Header ── */}
      <div className="flex items-center justify-between mb-3 shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-indigo-500/20 text-indigo-400 flex items-center justify-center text-xs">
            <i className="fas fa-prescription"></i>
          </div>
          <h4 className="text-xs font-semibold text-slate-200 uppercase tracking-wider">
            {isDoctor ? 'Prescriptions & e-Rx' : 'Prescribed Medications'}
          </h4>
          <span className="bg-indigo-950 text-indigo-300 text-[10px] font-bold px-2 py-0.5 rounded-full border border-indigo-800/60">
            {prescriptions.length}
          </span>
        </div>

        {/* Doctor: Toggle Add Form Button */}
        {isDoctor && (
          <button
            type="button"
            onClick={() => setShowAddForm(!showAddForm)}
            className={`text-xs font-medium px-2.5 py-1 rounded-lg flex items-center gap-1.5 transition-all shadow-sm ${
              showAddForm
                ? 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                : 'bg-indigo-600 hover:bg-indigo-500 text-white active:scale-95'
            }`}
          >
            <i className={`fas ${showAddForm ? 'fa-xmark' : 'fa-plus'} text-[11px]`}></i>
            <span>{showAddForm ? 'Close' : 'Add Rx'}</span>
          </button>
        )}
      </div>

      {/* ── DOCTOR ONLY: Add Prescription Form ── */}
      {isDoctor && showAddForm && (
        <form
          onSubmit={handleSubmit}
          className="bg-slate-900 border border-indigo-500/30 rounded-xl p-3 mb-3 space-y-2.5 shadow-lg animate-fadeIn shrink-0"
        >
          <div className="flex items-center justify-between border-b border-slate-800 pb-1.5 mb-1">
            <span className="text-[11px] font-semibold text-indigo-300 flex items-center gap-1">
              <i className="fas fa-plus-circle text-xs"></i> New Prescription Item
            </span>
            <span className="text-[10px] text-slate-500">* Required</span>
          </div>

          {/* Medicine Name */}
          <div>
            <label className="block text-[10px] text-slate-400 font-semibold mb-1">
              MEDICINE NAME & STRENGTH *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Amoxicillin 500mg or Paracetamol 650"
              value={newMedName}
              onChange={(e) => setNewMedName(e.target.value)}
              className="w-full bg-slate-950 border border-slate-750 rounded-lg px-2.5 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>

          {/* Dosage & Frequency */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-[10px] text-slate-400 font-semibold mb-1">
                DOSAGE
              </label>
              <input
                type="text"
                placeholder="e.g. 1 Tablet / 5ml"
                value={newDosage}
                onChange={(e) => setNewDosage(e.target.value)}
                className="w-full bg-slate-950 border border-slate-750 rounded-lg px-2.5 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-[10px] text-slate-400 font-semibold mb-1">
                FREQUENCY
              </label>
              <select
                value={newFrequency}
                onChange={(e) => setNewFrequency(e.target.value)}
                className="w-full bg-slate-950 border border-slate-750 rounded-lg px-2 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500"
              >
                <option value="Once daily">Once daily (OD)</option>
                <option value="Twice daily">Twice daily (BD)</option>
                <option value="3 times daily">3 times daily (TDS)</option>
                <option value="4 times daily">4 times daily (QDS)</option>
                <option value="Every 8 hours">Every 8 hours</option>
                <option value="As needed">As needed (SOS / PRN)</option>
                <option value="At bedtime">At bedtime (HS)</option>
              </select>
            </div>
          </div>

          {/* DURATION (New Input Field) */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-[10px] text-slate-400 font-semibold">
                DURATION *
              </label>
              <span className="text-[10px] text-slate-500">How long to take</span>
            </div>
            <input
              type="text"
              required
              placeholder="e.g. 5 Days, 2 Weeks, 1 Month"
              value={newDuration}
              onChange={(e) => setNewDuration(e.target.value)}
              className="w-full bg-slate-950 border border-slate-750 rounded-lg px-2.5 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
            {/* Quick Duration Chips */}
            <div className="flex flex-wrap gap-1 mt-1.5">
              {durationQuickOptions.map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => setNewDuration(opt)}
                  className={`text-[9px] px-1.5 py-0.5 rounded border transition-colors ${
                    newDuration === opt
                      ? 'bg-indigo-600 border-indigo-500 text-white font-medium'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>

          {/* Special Instructions */}
          <div>
            <label className="block text-[10px] text-slate-400 font-semibold mb-1">
              INSTRUCTIONS / NOTES
            </label>
            <input
              type="text"
              placeholder="e.g. After food with warm water, avoid dairy"
              value={newInstructions}
              onChange={(e) => setNewInstructions(e.target.value)}
              className="w-full bg-slate-950 border border-slate-750 rounded-lg px-2.5 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-medium py-2 rounded-lg text-xs flex items-center justify-center gap-1.5 transition-all shadow-md shadow-indigo-600/20 active:scale-98"
          >
            <i className="fas fa-check text-xs"></i>
            <span>Add to Prescription</span>
          </button>
        </form>
      )}

      {/* ── Prescription List (Shared for Doctor & Patient, with distinct card styling) ── */}
      <div className="flex-1 overflow-y-auto space-y-2.5 pr-0.5 scrollbar-thin scrollbar-thumb-slate-800">
        {prescriptions.length === 0 ? (
          <div className="text-center py-10 px-4 bg-slate-900/40 border border-dashed border-slate-800 rounded-xl">
            <div className="w-11 h-11 rounded-full bg-slate-800/80 text-slate-500 mx-auto flex items-center justify-center mb-2.5">
              <i className="fas fa-prescription text-lg text-slate-500"></i>
            </div>
            <p className="text-xs font-semibold text-slate-300">
              {isDoctor ? 'No prescriptions added yet' : 'No medications prescribed yet'}
            </p>
            <p className="text-[11px] text-slate-500 mt-1 max-w-[220px] mx-auto leading-normal">
              {isDoctor
                ? 'Click "Add Rx" above to prescribe medications and dosage for this consultation.'
                : 'Medicines added by your doctor during this consultation will appear here in real time.'}
            </p>
          </div>
        ) : (
          prescriptions.map((rx, idx) => (
            <div
              key={rx.id}
              className="group bg-gradient-to-b from-slate-900/90 to-slate-900/70 border border-slate-800/90 hover:border-slate-700 rounded-xl p-3 shadow-sm hover:shadow-md transition-all relative"
            >
              {/* Top row: Medicine Name & Duration Badge */}
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="w-5 h-5 rounded-full bg-indigo-950 text-indigo-400 border border-indigo-800/50 flex items-center justify-center text-[10px] font-bold shrink-0">
                    {idx + 1}
                  </span>
                  <h5 className="font-semibold text-xs text-white truncate flex items-center gap-1.5">
                    <i className="fas fa-pills text-indigo-400 text-[11px]"></i>
                    <span className="truncate">{rx.medicine}</span>
                  </h5>
                </div>

                {/* Duration Badge */}
                <div className="flex items-center gap-1 shrink-0">
                  <span className="text-[10px] font-medium text-emerald-300 bg-emerald-950/60 border border-emerald-500/30 px-2 py-0.5 rounded-md flex items-center gap-1">
                    <i className="fas fa-calendar-day text-[9px]"></i>
                    <span>{rx.duration || '5 Days'}</span>
                  </span>
                  {/* Doctor Delete Option */}
                  {isDoctor && onRemovePrescription && (
                    <button
                      type="button"
                      onClick={() => onRemovePrescription(rx.id)}
                      title="Remove medicine"
                      className="opacity-60 hover:opacity-100 text-slate-500 hover:text-rose-400 text-xs p-1 rounded transition-colors"
                    >
                      <i className="fas fa-trash-can"></i>
                    </button>
                  )}
                </div>
              </div>

              {/* Medicine Details: Dosage & Frequency */}
              <div className="bg-slate-950/50 rounded-lg p-2 border border-slate-850 space-y-1 text-[11px]">
                <div className="flex items-center justify-between text-slate-300">
                  <span className="flex items-center gap-1 text-slate-400">
                    <i className="fas fa-syringe text-[10px] text-slate-500"></i> Dosage:
                  </span>
                  <span className="font-medium text-slate-200">{rx.dosage}</span>
                </div>
                <div className="flex items-center justify-between text-slate-300">
                  <span className="flex items-center gap-1 text-slate-400">
                    <i className="fas fa-clock text-[10px] text-slate-500"></i> Frequency:
                  </span>
                  <span className="font-medium text-indigo-300">{rx.frequency}</span>
                </div>
                {rx.instructions && (
                  <div className="pt-1 mt-1 border-t border-slate-800/80 text-[10px] text-slate-400 italic">
                    <span className="text-slate-500 not-italic font-medium">Instructions: </span>
                    {rx.instructions}
                  </div>
                )}
              </div>

              {/* Card Footer: Attribution */}
              <div className="mt-2 pt-1.5 border-t border-slate-850 flex items-center justify-between text-[10px] text-slate-500">
                <span className="flex items-center gap-1">
                  <i className="fas fa-user-doctor text-[9px] text-indigo-400"></i>
                  <span>{rx.prescribedBy}</span>
                </span>
                <span>{rx.date}</span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* ── DOCTOR ONLY: Prominent "Finalize Prescription" / "Generate PDF" Button ── */}
      {isDoctor && (
        <div className="pt-3 mt-2 border-t border-slate-800 shrink-0">
          {finalizeSuccess ? (
            <div className="bg-emerald-950/60 border border-emerald-500/50 text-emerald-300 rounded-xl p-2.5 text-center text-xs flex items-center justify-center gap-2 animate-fadeIn">
              <i className="fas fa-circle-check text-emerald-400"></i>
              <span className="font-medium">Prescription Finalized & Ready for PDF!</span>
            </div>
          ) : (
            <button
              type="button"
              disabled={prescriptions.length === 0 || isFinalizing}
              onClick={handleFinalize}
              className="w-full bg-gradient-to-r from-emerald-600 via-teal-600 to-indigo-600 hover:from-emerald-500 hover:to-indigo-500 text-white font-semibold py-2.5 px-4 rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-900/30 hover:shadow-emerald-600/20 active:scale-[0.99] transition-all disabled:opacity-40 disabled:pointer-events-none disabled:shadow-none"
            >
              {isFinalizing ? (
                <>
                  <i className="fas fa-spinner fa-spin text-xs"></i>
                  <span>Processing Prescription...</span>
                </>
              ) : (
                <>
                  <i className="fas fa-file-pdf text-sm text-emerald-200"></i>
                  <span className="tracking-wide">Finalize Prescription / Generate PDF</span>
                </>
              )}
            </button>
          )}
          <p className="text-[10px] text-slate-500 text-center mt-1.5">
            Generates official e-prescription document for this consultation session.
          </p>
        </div>
      )}
    </div>
  );
}
