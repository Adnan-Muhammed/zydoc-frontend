'use client'

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
 
import BasicInfoSection from './BasicInfoSection';
import ConsultationSection from './ConsultationSection';
import QualificationsSection from './QualificationsSection';
import PreferencesSection from './PreferencesSection';
import ScheduleSection from './ScheduleSection';
import CertificatesSection from './CertificatesSection';
import BankDetailsSection from './BankDetailsSection';

export default function SettingsMatrixClient({ initialData }: { initialData: any }) {
    const router = useRouter();
    const searchParams = useSearchParams();
    
    // 1. Establish state to track the active section (defaults to 'basic')
    const [activeSection, setActiveSection] = useState('basic');
    const [profileData, setProfileData] = useState(initialData);

    useEffect(() => {
        setProfileData(initialData);
    }, [initialData]);

    const handleProfileUpdate = (updates: any) => {
        setProfileData((prev: any) => ({
            ...prev,
            ...updates,
            consultationSettings: updates.consultationSettings || prev?.consultationSettings,
            workingHours: updates.workingHours || prev?.workingHours,
        }));
    };

    useEffect(() => {
        const sectionParam = searchParams.get('section');
        if (sectionParam && ['basic', 'consultation', 'qualifications', 'preferences', 'schedule', 'certificates', 'bank'].includes(sectionParam)) {
            setActiveSection(sectionParam);
        }
    }, [searchParams]);

    // Section definitions for the radio buttons
    const sections = [
        { id: 'basic', label: 'Basic Info' },
        { id: 'consultation', label: 'Consultation' },
        { id: 'qualifications', label: 'Qualifications' },
        { id: 'preferences', label: 'Preferences' },
        { id: 'schedule', label: 'Schedule' },
        { id: 'certificates', label: 'Certificates' },
        { id: 'bank', label: 'Bank Details' },
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
                        <BasicInfoSection initialData={profileData} />
                    )}
                    
                    {activeSection === 'consultation' && (
                        <ConsultationSection 
                            initialData={profileData?.consultationSettings || profileData} 
                            onUpdate={handleProfileUpdate}
                        />
                    )}
                    
                    {activeSection === 'qualifications' && (
                        <QualificationsSection initialData={profileData?.qualifications || []} />
                    )}
                    
                    {activeSection === 'preferences' && (
                        <PreferencesSection 
                            initialLanguages={profileData?.languages || profileData?.selectedLanguages || []} 
                            initialTags={profileData?.expertiseTags || []} 
                        />
                    )}
                    
                    {activeSection === 'schedule' && (
                        <ScheduleSection 
                            initialData={profileData?.workingHours} 
                            consultationSettings={profileData?.consultationSettings || profileData} 
                            slotDuration={profileData?.slotDuration || 15}
                            timezone={profileData?.timezone}
                            onNavigateToConsultation={() => setActiveSection('consultation')}
                            onUpdate={handleProfileUpdate}
                        />
                    )}
                    
                    {activeSection === 'certificates' && (
                        <CertificatesSection initialData={[profileData?.medicalCertificateUrl, profileData?.governmentIdUrl].filter(Boolean)} />
                    )}

                    {activeSection === 'bank' && (
                        <BankDetailsSection initialData={profileData} />
                    )}
                </div>
 
            </div>
        </div>
    );
}