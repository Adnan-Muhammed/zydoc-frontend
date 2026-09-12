'use client';

import React, { useState, useEffect } from 'react';
import axiosInstance from '@/api/axiosInstance';
import { PatientInfoData } from './types';

interface PatientInfoTabProps {
  appointmentId: string;
  initialPatientInfo?: PatientInfoData | null;
  onPatientInfoLoaded?: (info: PatientInfoData) => void;
}

export default function PatientInfoTab({
  appointmentId,
  initialPatientInfo,
  onPatientInfoLoaded,
}: PatientInfoTabProps) {
  const [patientInfo, setPatientInfo] = useState<PatientInfoData | null>(
    initialPatientInfo || null
  );
  const [isLoading, setIsLoading] = useState(!initialPatientInfo);
  const [error, setError] = useState<string | null>(null);

  const fetchClinicalContext = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await axiosInstance.get(`/appointments/${appointmentId}/clinical-context`);
      if (res.data?.success && res.data.patientInfo) {
        setPatientInfo(res.data.patientInfo);
        if (onPatientInfoLoaded) {
          onPatientInfoLoaded(res.data.patientInfo);
        }
      }
    } catch (err: any) {
      console.error('Failed to load patient clinical info:', err);
      setError(
        err.response?.data?.message || 'Unable to retrieve patient clinical profile for this session.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!patientInfo) {
      fetchClinicalContext();
    }
  }, [appointmentId]);

  // Helper to calculate approximate age from dateOfBirth
  const calculateAge = (dobString?: string | Date | null): string | null => {
    if (!dobString) return null;
    const dob = new Date(dobString);
    if (isNaN(dob.getTime())) return null;
    const diffMs = Date.now() - dob.getTime();
    const ageDt = new Date(diffMs);
    return Math.abs(ageDt.getUTCFullYear() - 1970).toString();
  };

  const patientAge = calculateAge(patientInfo?.dateOfBirth);

  if (isLoading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 space-y-3 text-slate-400">
        <div className="w-8 h-8 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" />
        <p className="text-xs font-medium">Fetching encrypted patient clinical profile…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center space-y-3">
        <div className="w-10 h-10 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center text-base">
          <i className="fas fa-triangle-exclamation"></i>
        </div>
        <p className="text-xs text-rose-300 max-w-xs">{error}</p>
        <button
          onClick={fetchClinicalContext}
          className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1.5 rounded-lg border border-slate-700 transition-colors"
        >
          <i className="fas fa-rotate-right mr-1"></i> Retry
        </button>
      </div>
    );
  }

  const allergies = patientInfo?.allergies || [];
  const chronicConditions = patientInfo?.chronicConditions || [];
  const currentMedications = patientInfo?.currentMedications || [];

  return (
    <div className="flex-1 flex flex-col h-full overflow-y-auto bg-[#0a0f1d] p-3.5 space-y-3.5 scrollbar-thin scrollbar-thumb-slate-800 text-slate-100">
      {/* ── Top Patient Identity Header ── */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3 shadow-xs">
        <div className="flex items-start justify-between gap-2">
          <div>
            <span className="text-[9px] uppercase font-bold text-indigo-400 tracking-wider">
              Patient Profile
            </span>
            <h4 className="text-sm font-bold text-white mt-0.5">
              {patientInfo?.name || 'Registered Patient'}
            </h4>
            <div className="flex flex-wrap items-center gap-2 mt-1.5 text-[11px] text-slate-400">
              {patientInfo?.gender && (
                <span className="capitalize">{patientInfo.gender}</span>
              )}
              {patientAge && (
                <>
                  <span className="text-slate-600">•</span>
                  <span>{patientAge} yrs old</span>
                </>
              )}
              {patientInfo?.phone && (
                <>
                  <span className="text-slate-600">•</span>
                  <span>{patientInfo.phone}</span>
                </>
              )}
            </div>
          </div>

          {/* Blood Group Badge */}
          <div className="flex flex-col items-end shrink-0">
            <span className="text-[9px] uppercase font-semibold text-slate-500 mb-0.5">
              Blood Type
            </span>
            <span className="inline-flex items-center gap-1 bg-rose-950/80 border border-rose-600/50 text-rose-300 font-extrabold text-xs px-2.5 py-1 rounded-lg shadow-sm">
              <i className="fas fa-droplet text-rose-400 text-[10px]"></i>
              <span>{patientInfo?.bloodGroup || 'N/A'}</span>
            </span>
          </div>
        </div>
      </div>

      {/* ── Critical Section 1: Allergies ── */}
      <div className="bg-slate-900/60 border border-slate-800/90 rounded-xl p-3 space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="w-5 h-5 rounded-md bg-rose-500/20 text-rose-400 flex items-center justify-center text-[10px]">
              <i className="fas fa-shield-virus"></i>
            </span>
            <span className="text-xs font-semibold text-slate-200 uppercase tracking-wide">
              Known Allergies
            </span>
          </div>
          <span className="text-[10px] text-rose-400 font-bold bg-rose-950/50 px-2 py-0.5 rounded-full border border-rose-800/40">
            {allergies.length}
          </span>
        </div>

        {allergies.length > 0 ? (
          <div className="flex flex-wrap gap-1.5 pt-1">
            {allergies.map((allergy, i) => (
              <span
                key={i}
                className="text-[11px] bg-rose-950/40 border border-rose-500/40 text-rose-200 px-2.5 py-1 rounded-lg font-medium flex items-center gap-1 shadow-xs"
              >
                <i className="fas fa-triangle-exclamation text-[9px] text-rose-400"></i>
                <span>{allergy}</span>
              </span>
            ))}
          </div>
        ) : (
          <div className="bg-slate-950/40 border border-slate-800/60 rounded-lg p-2 text-center">
            <p className="text-[11px] text-slate-400">No known drug or food allergies recorded.</p>
          </div>
        )}
      </div>

      {/* ── Critical Section 2: Chronic Conditions ── */}
      <div className="bg-slate-900/60 border border-slate-800/90 rounded-xl p-3 space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="w-5 h-5 rounded-md bg-amber-500/20 text-amber-400 flex items-center justify-center text-[10px]">
              <i className="fas fa-heart-pulse"></i>
            </span>
            <span className="text-xs font-semibold text-slate-200 uppercase tracking-wide">
              Chronic Conditions
            </span>
          </div>
          <span className="text-[10px] text-amber-400 font-bold bg-amber-950/50 px-2 py-0.5 rounded-full border border-amber-800/40">
            {chronicConditions.length}
          </span>
        </div>

        {chronicConditions.length > 0 ? (
          <div className="flex flex-wrap gap-1.5 pt-1">
            {chronicConditions.map((condition, i) => (
              <span
                key={i}
                className="text-[11px] bg-amber-950/40 border border-amber-500/40 text-amber-200 px-2.5 py-1 rounded-lg font-medium flex items-center gap-1 shadow-xs"
              >
                <i className="fas fa-notes-medical text-[9px] text-amber-400"></i>
                <span>{condition}</span>
              </span>
            ))}
          </div>
        ) : (
          <div className="bg-slate-950/40 border border-slate-800/60 rounded-lg p-2 text-center">
            <p className="text-[11px] text-slate-400">No chronic medical conditions reported.</p>
          </div>
        )}
      </div>

      {/* ── Critical Section 3: Current Medications ── */}
      <div className="bg-slate-900/60 border border-slate-800/90 rounded-xl p-3 space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="w-5 h-5 rounded-md bg-indigo-500/20 text-indigo-400 flex items-center justify-center text-[10px]">
              <i className="fas fa-pills"></i>
            </span>
            <span className="text-xs font-semibold text-slate-200 uppercase tracking-wide">
              Current Medications
            </span>
          </div>
          <span className="text-[10px] text-indigo-400 font-bold bg-indigo-950/50 px-2 py-0.5 rounded-full border border-indigo-800/40">
            {currentMedications.length}
          </span>
        </div>

        {currentMedications.length > 0 ? (
          <div className="space-y-1.5 pt-1">
            {currentMedications.map((med, i) => (
              <div
                key={i}
                className="text-[11px] bg-slate-950/60 border border-slate-800 text-slate-300 px-2.5 py-1.5 rounded-lg flex items-center justify-between"
              >
                <span className="font-medium text-slate-200 flex items-center gap-1.5">
                  <i className="fas fa-circle-dot text-[8px] text-indigo-400"></i>
                  {med}
                </span>
                <span className="text-[10px] text-slate-500">Active</span>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-slate-950/40 border border-slate-800/60 rounded-lg p-2 text-center">
            <p className="text-[11px] text-slate-400">No baseline medications reported.</p>
          </div>
        )}
      </div>

      {/* ── Emergency Contact (If available) ── */}
      {patientInfo?.emergencyContact && (
        <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-2.5 text-[11px] space-y-1">
          <div className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1">
            <i className="fas fa-phone-volume text-indigo-400"></i> Emergency Contact
          </div>
          <div className="flex items-center justify-between text-slate-300 pt-0.5">
            <span className="font-semibold">{patientInfo.emergencyContact.name || 'Not provided'}</span>
            {patientInfo.emergencyContact.relationship && (
              <span className="text-slate-500">({patientInfo.emergencyContact.relationship})</span>
            )}
          </div>
          {patientInfo.emergencyContact.phone && (
            <div className="text-indigo-300 text-[10px] font-mono">
              {patientInfo.emergencyContact.phone}
            </div>
          )}
        </div>
      )}

      {/* Secure Clinical Session Footnote */}
      <div className="pt-2 text-center">
        <p className="text-[10px] text-slate-500 flex items-center justify-center gap-1">
          <i className="fas fa-lock text-[9px] text-emerald-400"></i>
          Encrypted patient clinical data strictly isolated to doctor console.
        </p>
      </div>
    </div>
  );
}
