'use client';

import React, { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { fetchDoctorAppointments } from '@/redux/features/appointment/appointmentThunk';
import { generatePrescriptionPdf } from '@/utils/generatePrescriptionPdf';

export default function DoctorPrescriptionsPage() {
    const dispatch = useAppDispatch();
    const { user } = useAppSelector((state) => state.auth);
    const { doctorAppointments: appointments, isLoading } = useAppSelector((state) => state.appointment);

    const [activeTab, setActiveTab] = useState<'all' | 'prescriptions' | 'files'>('all');
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        dispatch(fetchDoctorAppointments());
    }, [dispatch]);

    const getPatientName = (patientData: any, manualPatientDetails?: any, isManual?: boolean) => {
        if (isManual && manualPatientDetails?.name) {
            return manualPatientDetails.name;
        }
        if (!patientData) return manualPatientDetails?.name || 'Patient';
        if (patientData.profileId?.firstName) {
            return `${patientData.profileId.firstName} ${patientData.profileId.lastName || ''}`.trim();
        }
        if (patientData.googleName) return patientData.googleName;
        if (patientData.email) {
            const emailName = patientData.email.split('@')[0];
            return emailName.charAt(0).toUpperCase() + emailName.slice(1).toLowerCase();
        }
        return 'Patient';
    };

    const handleDownloadPrescription = (app: any) => {
        if (!app) return;
        const patientName = getPatientName(app.patientId, app.manualPatientDetails, app.isManualBooking);
        const doctor = user || {};

        generatePrescriptionPdf({
            appointmentId: app._id,
            date: new Date(app.appointmentDate).toDateString(),
            time: app.appointmentTime,
            consultationType:
                app.consultationType === 'offline' ? 'In-Person Consultation' : 'Online Video Consultation',
            patient: {
                name: patientName,
                gender: app.patientId?.profileId?.gender,
                phone: app.patientId?.profileId?.phone,
                bloodGroup: app.patientId?.profileId?.bloodGroup,
            },
            doctor: {
                name: `Dr. ${doctor.firstName || ''} ${doctor.lastName || ''}`.trim() || 'Dr. Consultant',
                specialty: doctor.specialty || 'General Practice',
                qualifications: doctor.qualifications,
                regNumber: doctor.registrationNumber,
                clinicName: doctor.consultationSettings?.offline?.clinicName,
            },
            prescriptions: app.prescriptions || [],
            clinicalAdvice: app.clinicalNotes || 'Take medications strictly as directed by your physician.',
        });
    };

    // Filter appointments with prescriptions or consultation files
    const relevantAppointments = useMemo(() => {
        return (appointments || []).filter((app: any) => {
            const hasPrescriptions = Array.isArray(app.prescriptions) && app.prescriptions.length > 0;
            const hasFiles = Array.isArray(app.consultationFiles) && app.consultationFiles.length > 0;
            return hasPrescriptions || hasFiles;
        });
    }, [appointments]);

    // Apply search and tab filter
    const filteredAppointments = useMemo(() => {
        return relevantAppointments.filter((app: any) => {
            const patientName = getPatientName(app.patientId, app.manualPatientDetails, app.isManualBooking).toLowerCase();
            const q = searchQuery.toLowerCase().trim();

            let matchesSearch = !q || patientName.includes(q);

            if (q && !matchesSearch) {
                // Check medicines
                const matchesMedicine = (app.prescriptions || []).some((rx: any) =>
                    (rx.medicine || '').toLowerCase().includes(q)
                );
                // Check files
                const matchesFile = (app.consultationFiles || []).some((f: any) =>
                    (f.name || '').toLowerCase().includes(q) || (f.category || '').toLowerCase().includes(q)
                );
                matchesSearch = matchesMedicine || matchesFile;
            }

            if (!matchesSearch) return false;

            if (activeTab === 'prescriptions') {
                return Array.isArray(app.prescriptions) && app.prescriptions.length > 0;
            }
            if (activeTab === 'files') {
                return Array.isArray(app.consultationFiles) && app.consultationFiles.length > 0;
            }
            return true;
        });
    }, [relevantAppointments, searchQuery, activeTab]);

    const totalPrescriptions = relevantAppointments.reduce(
        (acc: number, app: any) => acc + (app.prescriptions?.length || 0),
        0
    );
    const totalFiles = relevantAppointments.reduce(
        (acc: number, app: any) => acc + (app.consultationFiles?.length || 0),
        0
    );

    return (
        <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto space-y-6 animate-in fade-in duration-300">
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 tracking-tight flex items-center gap-2.5">
                        <i className="fas fa-prescription-bottle text-indigo-600"></i>
                        <span>Issued Prescriptions & Clinical Documents</span>
                    </h1>
                    <p className="text-sm text-slate-500 mt-1">
                        Review e-prescriptions and clinical records shared across patient consultations.
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 px-3.5 py-1.5 bg-indigo-50 text-indigo-700 rounded-xl text-xs font-bold border border-indigo-100 shadow-2xs">
                        <i className="fas fa-pills text-indigo-500"></i>
                        <span>{totalPrescriptions} Medications Prescribed</span>
                    </div>
                    <div className="flex items-center gap-2 px-3.5 py-1.5 bg-emerald-50 text-emerald-700 rounded-xl text-xs font-bold border border-emerald-100 shadow-2xs">
                        <i className="fas fa-file-medical text-emerald-500"></i>
                        <span>{totalFiles} Consultation Files</span>
                    </div>
                </div>
            </div>

            {/* Controls Bar */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-white p-3 rounded-2xl border border-slate-200 shadow-xs">
                {/* Search Input */}
                <div className="relative w-full md:w-80">
                    <i className="fas fa-search absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs"></i>
                    <input
                        type="text"
                        placeholder="Search patient, medicine, or file..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-9 pr-8 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                    />
                    {searchQuery && (
                        <button
                            onClick={() => setSearchQuery('')}
                            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
                        >
                            ✕
                        </button>
                    )}
                </div>

                {/* Filter Tabs */}
                <div className="flex items-center gap-1.5 w-full md:w-auto bg-slate-100 p-1 rounded-xl">
                    <button
                        onClick={() => setActiveTab('all')}
                        className={`flex-1 md:flex-none px-4 py-1.5 text-xs font-bold rounded-lg transition-all ${
                            activeTab === 'all'
                                ? 'bg-white text-indigo-700 shadow-xs'
                                : 'text-slate-600 hover:text-slate-900'
                        }`}
                    >
                        All Records
                    </button>
                    <button
                        onClick={() => setActiveTab('prescriptions')}
                        className={`flex-1 md:flex-none px-4 py-1.5 text-xs font-bold rounded-lg transition-all ${
                            activeTab === 'prescriptions'
                                ? 'bg-white text-indigo-700 shadow-xs'
                                : 'text-slate-600 hover:text-slate-900'
                        }`}
                    >
                        Prescriptions ({totalPrescriptions})
                    </button>
                    <button
                        onClick={() => setActiveTab('files')}
                        className={`flex-1 md:flex-none px-4 py-1.5 text-xs font-bold rounded-lg transition-all ${
                            activeTab === 'files'
                                ? 'bg-white text-indigo-700 shadow-xs'
                                : 'text-slate-600 hover:text-slate-900'
                        }`}
                    >
                        Files ({totalFiles})
                    </button>
                </div>
            </div>

            {/* Content List */}
            {isLoading ? (
                <div className="p-12 text-center text-slate-500 flex justify-center items-center min-h-[300px]">
                    <i className="fas fa-spinner fa-spin mr-2 text-indigo-600 text-lg"></i>
                    <span className="text-sm font-medium">Loading records...</span>
                </div>
            ) : filteredAppointments.length === 0 ? (
                <div className="bg-white rounded-2xl border border-slate-200 border-dashed p-12 text-center max-w-lg mx-auto">
                    <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-4 text-2xl shadow-inner">
                        <i className="fas fa-prescription-bottle"></i>
                    </div>
                    <h3 className="text-base font-bold text-slate-800 mb-1">No Records Found</h3>
                    <p className="text-xs text-slate-500 leading-relaxed mb-6">
                        {searchQuery
                            ? `No records matching "${searchQuery}". Try a different keyword.`
                            : 'Prescriptions issued during consultations and uploaded patient documents will be archived here.'}
                    </p>
                    <Link
                        href="/doctor/appointments"
                        className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors"
                    >
                        <i className="fas fa-calendar-alt"></i>
                        <span>View Appointments</span>
                    </Link>
                </div>
            ) : (
                <div className="space-y-6">
                    {filteredAppointments.map((app: any) => {
                        const isManual = app.isManualBooking;
                        const patientName = getPatientName(app.patientId, app.manualPatientDetails, isManual);
                        const appDate = new Date(app.appointmentDate).toLocaleDateString('en-US', {
                            weekday: 'short',
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                        });
                        const hasRx = Array.isArray(app.prescriptions) && app.prescriptions.length > 0;
                        const hasFiles = Array.isArray(app.consultationFiles) && app.consultationFiles.length > 0;

                        return (
                            <div
                                key={app._id}
                                className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden transition-all duration-200 hover:shadow-md"
                            >
                                {/* Card Header */}
                                <div className="p-4 sm:p-5 bg-gradient-to-r from-slate-50 via-indigo-50/20 to-white border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                    <div className="flex items-center gap-3.5">
                                        <div className="w-11 h-11 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center text-sm shadow-sm">
                                            {patientName ? patientName.charAt(0).toUpperCase() : 'PT'}
                                        </div>
                                        <div>
                                            <div className="text-sm font-bold text-slate-800 flex items-center gap-2">
                                                <span>{patientName}</span>
                                                {isManual && (
                                                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                                                        Manual Booking
                                                    </span>
                                                )}
                                                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200/60">
                                                    {app.consultationType === 'offline' ? 'In-Person' : 'Online Video'}
                                                </span>
                                            </div>
                                            <div className="text-xs text-slate-500 flex items-center gap-2 mt-0.5">
                                                <span><i className="far fa-calendar text-slate-400 mr-1"></i>{appDate}</span>
                                                <span>•</span>
                                                <span><i className="far fa-clock text-slate-400 mr-1"></i>{app.appointmentTime}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {hasRx && (
                                        <button
                                            onClick={() => handleDownloadPrescription(app)}
                                            className="self-start sm:self-auto px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center gap-2 shadow-xs transition-colors"
                                        >
                                            <i className="fas fa-file-pdf"></i>
                                            <span>Download Prescription PDF</span>
                                        </button>
                                    )}
                                </div>

                                <div className="p-4 sm:p-5 space-y-5">
                                    {/* Prescriptions Section */}
                                    {hasRx && (activeTab === 'all' || activeTab === 'prescriptions') && (
                                        <div>
                                            <div className="flex items-center gap-2 mb-3">
                                                <i className="fas fa-pills text-indigo-600 text-xs"></i>
                                                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                                                    Prescribed Medications ({app.prescriptions.length})
                                                </h4>
                                            </div>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                                                {app.prescriptions.map((rx: any, idx: number) => (
                                                    <div
                                                        key={idx}
                                                        className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl text-xs flex flex-col justify-between hover:bg-slate-100/60 transition-colors"
                                                    >
                                                        <div className="flex items-start justify-between gap-2">
                                                            <div className="font-bold text-slate-800 flex items-center gap-2">
                                                                <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-[10px] font-bold shrink-0">
                                                                    {idx + 1}
                                                                </span>
                                                                <span className="truncate">{rx.medicine}</span>
                                                            </div>
                                                            <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md shrink-0">
                                                                {rx.duration || 'As directed'}
                                                            </span>
                                                        </div>
                                                        <div className="text-slate-500 text-[11px] mt-2 ml-7 flex flex-wrap items-center gap-2">
                                                            <span>Dosage: <strong className="text-slate-700">{rx.dosage}</strong></span>
                                                            <span>•</span>
                                                            <span className="text-indigo-600 font-medium">{rx.frequency}</span>
                                                        </div>
                                                        {rx.instructions && (
                                                            <div className="text-slate-400 italic text-[10px] mt-1 ml-7">
                                                                Note: {rx.instructions}
                                                            </div>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Uploaded Consultation Files Section */}
                                    {hasFiles && (activeTab === 'all' || activeTab === 'files') && (
                                        <div>
                                            <div className="flex items-center gap-2 mb-3">
                                                <i className="fas fa-paperclip text-emerald-600 text-xs"></i>
                                                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                                                    Consultation Documents & Files ({app.consultationFiles.length})
                                                </h4>
                                            </div>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                                                {app.consultationFiles.map((file: any, fIdx: number) => {
                                                    const fileType = (file.type || '').toLowerCase();
                                                    const isPdf = fileType === 'pdf';
                                                    const isImg = ['png', 'jpg', 'jpeg', 'webp', 'svg'].includes(fileType);
                                                    const iconClass = isPdf
                                                        ? 'fa-file-pdf text-rose-500'
                                                        : isImg
                                                        ? 'fa-file-image text-emerald-500'
                                                        : 'fa-file-medical text-indigo-500';
                                                    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:5001';
                                                    const fileUrl = file.url?.startsWith('http')
                                                        ? file.url
                                                        : `${baseUrl}${file.url?.startsWith('/') ? '' : '/'}${file.url}`;

                                                    return (
                                                        <div
                                                            key={file.id || fIdx}
                                                            className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl text-xs flex items-center justify-between gap-3 hover:bg-slate-100/60 transition-colors"
                                                        >
                                                            <div className="flex items-center gap-3 min-w-0">
                                                                <div className="w-9 h-9 rounded-lg bg-white border border-slate-200 flex items-center justify-center shrink-0">
                                                                    <i className={`fas ${iconClass} text-sm`}></i>
                                                                </div>
                                                                <div className="min-w-0">
                                                                    <div className="font-bold text-slate-800 truncate" title={file.name}>
                                                                        {file.name}
                                                                    </div>
                                                                    <div className="text-slate-500 text-[11px] flex items-center gap-2 mt-0.5">
                                                                        <span>{file.size || 'Attachment'}</span>
                                                                        <span>•</span>
                                                                        <span className="text-emerald-600 font-medium">
                                                                            {file.category || 'Clinical Document'}
                                                                        </span>
                                                                        {file.uploadedBy && (
                                                                            <>
                                                                                <span>•</span>
                                                                                <span>By {file.uploadedBy}</span>
                                                                            </>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            {file.url && (
                                                                <a
                                                                    href={fileUrl}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    className="px-3 py-1.5 text-xs font-bold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-1.5 shadow-2xs shrink-0 transition-colors"
                                                                >
                                                                    <i className="fas fa-download text-[10px]"></i>
                                                                    <span>Download</span>
                                                                </a>
                                                            )}
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
