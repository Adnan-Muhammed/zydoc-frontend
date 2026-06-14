'use client';

import React, { useState } from 'react';
import PersonalInfoForm from './components/PersonalInfoForm';
import ClinicalCredentialsForm from './components/ClinicalCredentialsForm';
import VerificationDocsForm from './components/VerificationDocsForm';
import OperationalHoursForm from './components/OperationalHoursForm';

type SettingsTab = 'personal' | 'clinical' | 'documents' | 'hours';

export default function DoctorSettingsPage() {
  const [activeTab, setActiveTab] = useState<SettingsTab>('personal');

  const tabs = [
    { id: 'personal' as SettingsTab, label: 'Personal Info', icon: 'fa-user' },
    { id: 'clinical' as SettingsTab, label: 'Clinical & Credentials', icon: 'fa-user-md' },
    { id: 'documents' as SettingsTab, label: 'Verification Docs', icon: 'fa-file-shield' },
    { id: 'hours' as SettingsTab, label: 'Fees & Availability', icon: 'fa-clock' },
  ];

  return (
    <div className="flex-1 bg-slate-50 p-6 overflow-y-auto">
      <div className="max-w-5xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-800">Account Settings</h1>
          <p className="text-sm text-slate-500">Update specific sections of your medical practice and profile records.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-start">
          {/* Settings Navigation Sidebar */}
          <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-sm space-y-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                  activeTab === tab.id
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <i className={`fas ${tab.icon} w-5`}></i>
                {tab.label}
              </button>
            ))}
          </div>

          {/* Active Component Container */}
          <div className="md:col-span-3 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            {activeTab === 'personal' && <PersonalInfoForm />}
            {activeTab === 'clinical' && <ClinicalCredentialsForm />}
            {activeTab === 'documents' && <VerificationDocsForm />}
            {activeTab === 'hours' && <OperationalHoursForm />}
          </div>
        </div>
      </div>
    </div>
  );
}