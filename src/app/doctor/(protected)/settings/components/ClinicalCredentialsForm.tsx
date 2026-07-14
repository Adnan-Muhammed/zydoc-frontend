// src/app/doctor/(protected)/settings/components/ClinicalCredentialsForm.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { updateDoctorProfile } from '@/redux/features/doctor/doctorThunk';
import { setCredentials } from '@/redux/auth/authSlice';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';

interface Qualification {
  id: string;
  degree: string;
  institution: string;
  year: string;
  certificateStatus?: string;
  rejectionReason?: string;
}

export default function ClinicalCredentialsForm() {
  const dispatch = useAppDispatch();
  const { user, isLoading } = useAppSelector((state) => state.auth);

  const [specialty, setSpecialty] = useState('');
  const [yearsOfExperience, setYearsOfExperience] = useState('');
  const [licenseNumber, setLicenseNumber] = useState('');
  const [expertiseTags, setExpertiseTags] = useState<string[]>([]);
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>([]);
  const [qualifications, setQualifications] = useState<Qualification[]>([]);

  // Local helper states for additions
  const [currentTag, setCurrentTag] = useState('');
  const [newDegree, setNewDegree] = useState('');
  const [newInstitution, setNewInstitution] = useState('');
  const [newYear, setNewYear] = useState('');

  const availableLanguages = ['English', 'Malayalam', 'Hindi', 'Tamil', 'Spanish', 'French'];

  useEffect(() => {
    if (user) {
      setSpecialty(user.specialty || '');
      setYearsOfExperience(String(user.yearsOfExperience || ''));
      setLicenseNumber(user.licenseNumber || '');
      setExpertiseTags(user.expertiseTags || []);
      setSelectedLanguages(user.languages || []);
      setQualifications(user.qualifications || []);
    }
  }, [user]);

  const handleAddTag = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && currentTag.trim()) {
      e.preventDefault();
      const tag = currentTag.trim();
      if (!expertiseTags.includes(tag)) setExpertiseTags([...expertiseTags, tag]);
      setCurrentTag('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => setExpertiseTags(expertiseTags.filter((t) => t !== tagToRemove));

  const handleLanguageToggle = (lang: string) => {
    setSelectedLanguages(prev => prev.includes(lang) ? prev.filter((l) => l !== lang) : [...prev, lang]);
  };

  const addQualification = () => {
    if (!newDegree || !newInstitution || !newYear) return;
    setQualifications([...qualifications, { id: Date.now().toString(), degree: newDegree, institution: newInstitution, year: newYear }]);
    setNewDegree(''); setNewInstitution(''); setNewYear('');
  };

  const removeQualification = (id: string) => setQualifications(qualifications.filter((q) => q.id !== id));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData();

    const profileData = {
      specialty,
      licenseNumber,
      yearsOfExperience: Number(yearsOfExperience),
      expertiseTags,
      languages: selectedLanguages,
      qualifications,
    };

    formData.append('data', JSON.stringify(profileData));
    const resultAction = await dispatch(updateDoctorProfile(formData));
    if (updateDoctorProfile.fulfilled.match(resultAction)) {
      dispatch(setCredentials(resultAction.payload.user));
      alert('Medical credentials updated successfully!');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 animate-fade-in">
      <div>
        <h3 className="text-lg font-bold text-slate-800 dark:text-white">Clinical &amp; Credentials Matrix</h3>
        <p className="text-xs text-slate-400">Modify your medical licensing data, field experience, and expert specialties.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="space-y-1 sm:col-span-2">
          <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase">Primary Specialty Area *</label>
          <select value={specialty} onChange={(e) => setSpecialty(e.target.value)} required className="w-full rounded-xl border border-slate-300 dark:border-[#24274d] bg-white dark:bg-[#151732] px-4 py-2.5 text-sm text-slate-800 dark:text-slate-100 outline-none focus:ring-2 focus:ring-blue-500/20 transition h-[44px]">
            <option value="">Choose Department</option>
            <option value="Cardiology">Cardiology</option>
            <option value="Neurology">Neurology</option>
            <option value="Pediatrics">Pediatrics</option>
            <option value="Dermatology">Dermatology</option>
            <option value="General Medicine">General Medicine</option>
          </select>
        </div>
        <Input label="Practice Years *" type="number" value={yearsOfExperience} onChange={(e) => setYearsOfExperience(e.target.value)} required />
      </div>

      <Input label="Medical Registration Number *" value={licenseNumber} onChange={(e) => setLicenseNumber(e.target.value)} required />

      {/* Expertise Tags Section */}
      <div className="space-y-2">
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">Areas of Clinical Expertise (Press Enter)</label>
        <input type="text" value={currentTag} onChange={(e) => setCurrentTag(e.target.value)} onKeyDown={handleAddTag} placeholder="e.g. Hypertension Management, Echocardiography" className="w-full rounded-xl border border-slate-300 dark:border-[#24274d] bg-white dark:bg-[#151732] px-4 py-2.5 text-sm text-slate-800 dark:text-slate-100 outline-none focus:ring-2 focus:ring-blue-500/20 transition shadow-sm" />
        {expertiseTags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {expertiseTags.map((tag) => (
              <span key={tag} className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-blue-500/10 text-xs font-bold text-blue-600 dark:text-blue-400 border border-blue-500/20">
                {tag}
                <button type="button" onClick={() => handleRemoveTag(tag)} className="text-blue-500 hover:text-blue-700 transition">
                  <i className="fas fa-times-circle text-xs"></i>
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Academic Grid Segment */}
      <div className="space-y-3">
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">Education &amp; Academic Degrees Matrix</label>
        {qualifications.length > 0 && (
          <div className="overflow-x-auto border border-slate-200 dark:border-[#24274d] rounded-xl max-h-[160px] bg-white dark:bg-[#151732]">
            <table className="min-w-full text-sm divide-y divide-slate-200 dark:divide-[#24274d]">
              <thead className="bg-slate-50 dark:bg-[#1a1c3d]/60 text-slate-500 dark:text-slate-400 text-left sticky top-0 text-xs uppercase tracking-wider">
                <tr>
                  <th className="px-4 py-2">Degree</th>
                  <th className="px-4 py-2">Institution</th>
                  <th className="px-4 py-2">Status</th>
                  <th className="px-4 py-2 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-[#24274d] text-slate-800 dark:text-slate-200 font-medium">
                {qualifications.map((q) => (
                  <tr key={q.id} className="text-xs">
                    <td className="px-4 py-2 font-bold text-blue-600 dark:text-blue-400">{q.degree}</td>
                    <td className="px-4 py-2 text-slate-600 dark:text-slate-300">{q.institution} ({q.year})</td>
                    <td className="px-4 py-2">
                      {q.certificateStatus ? (
                        <div>
                          <span className={`text-[10px] uppercase font-bold px-1.5 py-0.5 rounded ${q.certificateStatus === 'approved' ? 'bg-green-100 text-green-700' : q.certificateStatus === 'rejected' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>
                            {q.certificateStatus}
                          </span>
                          {q.certificateStatus === 'rejected' && q.rejectionReason && (
                            <div className="text-[10px] text-red-600 mt-1 max-w-[150px] truncate" title={q.rejectionReason}>
                              {q.rejectionReason}
                            </div>
                          )}
                        </div>
                      ) : (
                        <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-500">None</span>
                      )}
                    </td>
                    <td className="px-4 py-2 text-center">
                      <button type="button" onClick={() => removeQualification(q.id)} className="font-bold text-red-500 hover:text-red-700 transition">Remove</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Qualification Inputs */}
        <div className="p-4 bg-slate-50 dark:bg-[#1a1c3d]/30 border border-slate-200 dark:border-[#24274d] rounded-xl grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
          <Input label="Degree / Fellowship" value={newDegree} onChange={(e) => setNewDegree(e.target.value)} placeholder="e.g. MD Cardiology" />
          <Input label="Institution Name" value={newInstitution} onChange={(e) => setNewInstitution(e.target.value)} placeholder="e.g. GMC Trivandrum" />
          <div className="flex gap-2 items-end w-full">
            <div className="flex-1"><Input label="Graduation Year" type="number" value={newYear} onChange={(e) => setNewYear(e.target.value)} placeholder="2016" /></div>
            <button type="button" onClick={addQualification} className="h-[38px] px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition shadow-sm">Add</button>
          </div>
        </div>
      </div>

      {/* Languages Selection */}
      <div className="space-y-2">
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">Languages Spoken *</label>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
          {availableLanguages.map((lang) => {
            const isChecked = selectedLanguages.includes(lang);
            return (
              <label key={lang} className={`flex items-center gap-2 p-2.5 border rounded-xl cursor-pointer text-xs transition ${isChecked ? 'border-blue-500 bg-blue-500/10 text-blue-600 dark:text-blue-400 font-bold' : 'border-slate-200 dark:border-[#24274d] bg-white dark:bg-[#151732]'}`}>
                <input type="checkbox" checked={isChecked} onChange={() => handleLanguageToggle(lang)} className="rounded border-slate-300 text-blue-600 w-3.5 h-3.5" />
                <span className="truncate">{lang}</span>
              </label>
            );
          })}
        </div>
      </div>

      <div className="flex justify-end border-t border-slate-100 dark:border-[#24274d]/50 pt-4">
        <Button type="submit" isLoading={isLoading} className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl px-6 py-2.5 shadow-md">
          Save Medical Credentials
        </Button>
      </div>
    </form>
  );
}