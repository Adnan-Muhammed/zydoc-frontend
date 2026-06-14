// src/app/doctor/(protected)/settings/components/OperationalHoursForm.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { updateDoctorProfile } from '@/redux/features/doctor/doctorThunk';
import { setCredentials } from '@/redux/auth/authSlice';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';

interface WorkingHourSlot {
  start: string;
  end: string;
  active: boolean;
}

interface WorkingHours {
  mondayToFriday: WorkingHourSlot;
  saturday: WorkingHourSlot;
  sunday: WorkingHourSlot;
}

export default function OperationalHoursForm() {
  const dispatch = useAppDispatch();
  const { user, isLoading } = useAppSelector((state) => state.auth);

  const [enableVideo, setEnableVideo] = useState(true);
  const [videoFee, setVideoFee] = useState('100');
  const [enablePhysical, setEnablePhysical] = useState(false);
  const [physicalFee, setPhysicalFee] = useState('150');
  const [clinicName, setClinicName] = useState('');
  const [clinicAddress, setClinicAddress] = useState('');
  const [workingHours, setWorkingHours] = useState<WorkingHours | null>(null);

  useEffect(() => {
    if (user) {
      setEnableVideo(user.consultationSettings?.video?.enabled ?? true);
      setVideoFee(String(user.consultationSettings?.video?.fee || '100'));
      setEnablePhysical(user.consultationSettings?.physical?.enabled ?? false);
      setPhysicalFee(String(user.consultationSettings?.physical?.fee || '150'));
      setClinicName(user.consultationSettings?.physical?.clinicName || '');
      setClinicAddress(user.consultationSettings?.physical?.clinicAddress || '');
      setWorkingHours(user.workingHours || {
        mondayToFriday: { start: '09:00', end: '17:00', active: true },
        saturday: { start: '10:00', end: '14:00', active: true },
        sunday: { start: '00:00', end: '00:00', active: false },
      });
    }
  }, [user]);

  const handleHourChange = (dayKey: keyof WorkingHours, field: keyof WorkingHourSlot, value: any) => {
    if (!workingHours) return;
    setWorkingHours({
      ...workingHours,
      [dayKey]: { ...workingHours[dayKey], [field]: value }
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!workingHours) return;

    const formData = new FormData();
    const profileData = {
      consultationSettings: {
        video: { enabled: enableVideo, fee: Number(videoFee) },
        physical: { enabled: enablePhysical, fee: Number(physicalFee), clinicName, clinicAddress },
      },
      workingHours,
    };

    formData.append('data', JSON.stringify(profileData));
    const resultAction = await dispatch(updateDoctorProfile(formData));
    if (updateDoctorProfile.fulfilled.match(resultAction)) {
      dispatch(setCredentials(resultAction.payload.user));
      alert('Operational setups and session configurations saved successfully!');
    }
  };

  if (!workingHours) return null;

  return (
    <form onSubmit={handleSubmit} className="space-y-6 animate-fade-in">
      <div>
        <h3 className="text-lg font-bold text-slate-800 dark:text-white">Fees &amp; Calendar Schedule Setup</h3>
        <p className="text-xs text-slate-400">Configure appointment pricing limits and day-wise practice slots.</p>
      </div>

      {/* Pricing setup cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Telehealth setup card */}
        <div className={`p-4 rounded-xl border transition-all flex flex-col justify-between ${enableVideo ? 'border-blue-500/30 bg-blue-500/[0.01]' : 'border-slate-200 dark:border-[#24274d]'}`}>
          <div className="flex justify-between items-center mb-2">
            <span className="font-bold text-xs text-slate-700 dark:text-slate-300 uppercase">Telehealth Session Channel</span>
            <input type="checkbox" checked={enableVideo} onChange={(e) => setEnableVideo(e.target.checked)} className="rounded text-blue-600 w-4 h-4" />
          </div>
          {enableVideo && <Input label="Video Fee (INR) *" type="number" value={videoFee} onChange={(e) => setVideoFee(e.target.value)} required />}
        </div>

        {/* Physical Clinic Setup card */}
        <div className={`p-4 rounded-xl border transition-all flex flex-col justify-between ${enablePhysical ? 'border-green-500/30 bg-green-500/[0.01]' : 'border-slate-200 dark:border-[#24274d]'}`}>
          <div className="flex justify-between items-center mb-2">
            <span className="font-bold text-xs text-slate-700 dark:text-slate-300 uppercase">Physical In-Clinic Channel</span>
            <input type="checkbox" checked={enablePhysical} onChange={(e) => setEnablePhysical(e.target.checked)} className="rounded text-green-600 w-4 h-4" />
          </div>
          {enablePhysical && (
            <div className="space-y-2 mt-1">
              <div className="grid grid-cols-2 gap-2">
                <Input label="Physical Fee *" type="number" value={physicalFee} onChange={(e) => setPhysicalFee(e.target.value)} required />
                <Input label="Clinic Title *" value={clinicName} onChange={(e) => setClinicName(e.target.value)} placeholder="Clinic name" required />
              </div>
              <Input label="Clinic Address *" value={clinicAddress} onChange={(e) => setClinicAddress(e.target.value)} placeholder="Full clinic location specs" required />
            </div>
          )}
        </div>
      </div>

      {/* Hours Listing Setup */}
      <div className="space-y-3">
        <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 uppercase">Standard Availability Hours</label>
        <div className="border border-slate-200 dark:border-[#24274d] rounded-xl divide-y divide-slate-200 dark:divide-[#24274d] bg-white dark:bg-[#151732] overflow-hidden shadow-inner">
          {(Object.entries(workingHours) as [keyof WorkingHours, WorkingHourSlot][]).map(([key, dayData]) => (
            <div key={key} className="p-3.5 flex items-center justify-between gap-4 hover:bg-slate-50/40 dark:hover:bg-[#1a1c3d]/10 transition">
              <div className="flex items-center gap-3 w-44 shrink-0">
                <input type="checkbox" checked={dayData.active} onChange={(e) => handleHourChange(key, 'active', e.target.checked)} className="rounded text-blue-600 w-4 h-4" />
                <span className="font-bold text-xs uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  {key.replace(/([A-Z])/g, ' $1').trim()}
                </span>
              </div>

              {dayData.active ? (
                <div className="flex items-center gap-2 animate-fade-in">
                  <input type="time" value={dayData.start} onChange={(e) => handleHourChange(key, 'start', e.target.value)} className="p-1.5 border border-slate-200 dark:border-[#24274d] dark:bg-[#151732] rounded-xl text-xs font-bold text-slate-800 dark:text-slate-200" />
                  <span className="text-[10px] text-slate-400 font-bold uppercase">to</span>
                  <input type="time" value={dayData.end} onChange={(e) => handleHourChange(key, 'end', e.target.value)} className="p-1.5 border border-slate-200 dark:border-[#24274d] dark:bg-[#151732] rounded-xl text-xs font-bold text-slate-800 dark:text-slate-200" />
                </div>
              ) : (
                <span className="text-slate-400 dark:text-slate-500 italic text-xs bg-slate-100 dark:bg-[#1a1c3d]/60 px-3 py-1 rounded-md font-bold">Closed</span>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-end border-t border-slate-100 dark:border-[#24274d]/50 pt-4">
        <Button type="submit" isLoading={isLoading} className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl px-6 py-2.5 shadow-md">
          Save Operational Hours
        </Button>
      </div>
    </form>
  );
}