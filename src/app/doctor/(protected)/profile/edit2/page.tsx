



'use client'

import { useState } from 'react';
import Link from 'next/link'; // Or your framework's Link component


import BasicInfoSection from './BasicInfoSection';
import ConsultationSection from './ConsultationSection';
import QualificationsSection from './QualificationsSection';
import PreferencesSection from './PreferencesSection';
import ScheduleSection from './ScheduleSection';
import CertificatesSection from './CertificatesSection';

const HARDCODED_DOCTOR_PROPS = {
    firstName: "arif",
    lastName: "ali",
    phone: "+911234567821",
    bio: "Lorem Ipsum has been the industry's standard dummy text ever since the 1500s...",
    clinicAddress: "",
    clinicName: "",
    enablePhysical: false,
    enableVideo: true,
    expertiseTags: ["Stroke Management", "Epilepsy Treatment", "Headache & Migraine Care"],
    physicalFee: "150",
    videoFee: "800",
    selectedLanguages: ["English", "Malayalam", "Hindi"],
    qualifications: [
        { id: "1779444167761", degree: "MD General Medicine", institution: "GMC Thiruvananthapuram", year: "2015" },
        { id: "1779444204504", degree: "DM Neurology", institution: "AIIMS", year: "2018" }
    ],
    workingHours: {
        mondayToFriday: { start: "09:00", end: "17:00", active: true },
        saturday: { start: "10:00", end: "14:00", active: true },
        sunday: { start: "00:00", end: "00:00", active: false }
    },
    yearsOfExperience: "10"
};





export default function SettingsMatrix() {
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

                    <Link href="/doctor/profile" className="self-start sm:self-center px-4 py-2 bg-white border border-slate-200 text-slate-700 text-xs font-semibold rounded-xl shadow-sm hover:bg-slate-50 transition-colors">
                        Back to Profile
                    </Link>
                </div>

                {/* 3. Conditional rendering of Sub-sections based on activeSection state */}
                <div className="transition-all duration-200">
                    {activeSection === 'basic' && (
                        <BasicInfoSection initialData={HARDCODED_DOCTOR_PROPS} />
                    )}
                    
                    {activeSection === 'consultation' && (
                        <ConsultationSection initialData={HARDCODED_DOCTOR_PROPS} />
                    )}
                    
                    {activeSection === 'qualifications' && (
                        <QualificationsSection initialData={HARDCODED_DOCTOR_PROPS.qualifications} />
                    )}
                    
                    {activeSection === 'preferences' && (
                        <PreferencesSection 
                            initialLanguages={HARDCODED_DOCTOR_PROPS.selectedLanguages} 
                            initialTags={HARDCODED_DOCTOR_PROPS.expertiseTags} 
                        />
                    )}
                    
                    {activeSection === 'schedule' && (
                        <ScheduleSection initialData={HARDCODED_DOCTOR_PROPS.workingHours} />
                    )}
                    
                    {activeSection === 'certificates' && (
                        <CertificatesSection />
                    )}
                </div>

            </div>
        </div>
    );
}