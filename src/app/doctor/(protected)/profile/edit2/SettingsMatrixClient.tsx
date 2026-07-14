



'use client'

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
 
import BasicInfoSection from './BasicInfoSection';
import ConsultationSection from './ConsultationSection';
import QualificationsSection from './QualificationsSection';
import PreferencesSection from './PreferencesSection';
import ScheduleSection from './ScheduleSection';
import CertificatesSection from './CertificatesSection';

export default function SettingsMatrixClient({ initialData }: { initialData: any }) {
    const router = useRouter();
    // 1. Establish state to track the active section (defaults to 'basic')
    const [activeSection, setActiveSection] = useState('basic');

    // Section definitions for the radio buttons
    const sections = [
        { id: 'basic', label: 'Basic Info' },
        { id: 'consultation', label: 'Consultation' },
        { id: 'qualifications', label: 'Qualifications' },
        { id: 'preferences', label: 'Preferences' },
        { id: 'schedule', label: 'Schedule' },
        { id: 'certificates', label: 'Certificates' }
    ];

    return (
        <div className="min-h-screen bg-[#eef0f8] p-4 sm:p-6 lg:p-8">
            <div className="max-w-4xl mx-auto space-y-6">
                
                {/* Header Action Row */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200 pb-5">
                    <div className="space-y-3">
                        <div>
                            <h1 className="text-xl font-bold text-slate-800">Edit Settings Matrix</h1>
                            <p className="text-xs text-slate-400 mt-0.5">Isolated sections submit individually directly to sub-route target vectors.</p>
                        </div>

                        {/* Section Selector Radio Buttons */}
                        <div className="flex flex-wrap gap-3 items-center pt-1">
                            {sections.map((section) => (
                                <label 
                                    key={section.id} 
                                    className={`flex items-center gap-2 bg-white px-3 py-1.5 border rounded-lg cursor-pointer text-xs font-medium transition-colors shadow-sm
                                        ${activeSection === section.id 
                                            ? 'border-indigo-500 bg-indigo-50/30 text-indigo-700' 
                                            : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                                        }`}
                                >
                                    <input 
                                        type="radio" 
                                        name="matrix-section" 
                                        value={section.id}
                                        checked={activeSection === section.id}
                                        onChange={() => setActiveSection(section.id)} // 2. Update state on click
                                        className="w-3.5 h-3.5 text-indigo-600 border-slate-300 focus:ring-indigo-500/30"
                                    />
                                    <span>{section.label}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                        <Link 
                            href="/doctor/profile" 
                            onClick={(e) => {
                                e.preventDefault();
                                router.refresh();
                                router.push('/doctor/profile');
                            }}
                            className="self-start sm:self-center px-4 py-2 bg-white border border-slate-200 text-slate-700 text-xs font-semibold rounded-xl shadow-sm hover:bg-slate-50 transition-colors"
                        >
                            Back to Profile
                        </Link>
                </div>

                {/* 3. Conditional rendering of Sub-sections based on activeSection state */}
                <div className="transition-all duration-200">
                    {activeSection === 'basic' && (
                        <BasicInfoSection initialData={initialData} />
                    )}
                    
                    {activeSection === 'consultation' && (
                        <ConsultationSection initialData={{
                            enableVideo: initialData?.consultationSettings?.video?.enabled ?? initialData?.enableVideo,
                            videoFee: initialData?.consultationSettings?.video?.fee ?? initialData?.videoFee,
                            enablePhysical: initialData?.consultationSettings?.physical?.enabled ?? initialData?.enablePhysical,
                            physicalFee: initialData?.consultationSettings?.physical?.fee ?? initialData?.physicalFee,
                            clinicName: initialData?.consultationSettings?.physical?.clinicName ?? initialData?.clinicName,
                            clinicAddress: initialData?.consultationSettings?.physical?.clinicAddress ?? initialData?.clinicAddress
                        }} />
                    )}
                    
                    {activeSection === 'qualifications' && (
                        <QualificationsSection initialData={initialData?.qualifications || []} />
                    )}
                    
                    {activeSection === 'preferences' && (
                        <PreferencesSection 
                            initialLanguages={initialData?.languages || initialData?.selectedLanguages || []} 
                            initialTags={initialData?.expertiseTags || []} 
                        />
                    )}
                    
                    {activeSection === 'schedule' && (
                        <ScheduleSection initialData={initialData?.workingHours || {
                            online: {
                                mondayToFriday: { start: "09:00", end: "17:00", active: false },
                                monday:         { start: "09:00", end: "17:00", active: false },
                                tuesday:        { start: "09:00", end: "17:00", active: false },
                                wednesday:      { start: "09:00", end: "17:00", active: false },
                                thursday:       { start: "09:00", end: "17:00", active: false },
                                friday:         { start: "09:00", end: "17:00", active: false },
                                saturday:       { start: "10:00", end: "14:00", active: false },
                                sunday:         { start: "00:00", end: "00:00", active: false },
                            },
                            offline: {
                                mondayToFriday: { start: "09:00", end: "17:00", active: false },
                                monday:         { start: "09:00", end: "17:00", active: false },
                                tuesday:        { start: "09:00", end: "17:00", active: false },
                                wednesday:      { start: "09:00", end: "17:00", active: false },
                                thursday:       { start: "09:00", end: "17:00", active: false },
                                friday:         { start: "09:00", end: "17:00", active: false },
                                saturday:       { start: "10:00", end: "14:00", active: false },
                                sunday:         { start: "00:00", end: "00:00", active: false },
                            }
                        }} consultationSettings={initialData?.consultationSettings || {}} />
                    )}
                    
                    {activeSection === 'certificates' && (
                        <CertificatesSection initialData={[initialData?.medicalCertificateUrl, initialData?.governmentIdUrl].filter(Boolean)} />
                    )}
                </div>
 
            </div>
        </div>
    );
}