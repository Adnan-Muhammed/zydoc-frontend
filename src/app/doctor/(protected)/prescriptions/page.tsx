'use client';

import React, { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { fetchDoctorAppointments } from '@/redux/features/appointment/appointmentThunk';
import { generatePrescriptionPdf } from '@/utils/generatePrescriptionPdf';
import {
  Pill,
  FileText,
  Search,
  Download,
  Calendar,
  Clock,
  User,
  Paperclip,
  ExternalLink,
  X,
  CheckCircle2,
  Building2,
  Video,
  Loader2,
  Sparkles,
  FileImage,
  ArrowRight,
  ChevronRight,
  Activity
} from 'lucide-react';

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
        const doctor: any = user || {};

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
        <div className="doc-page" style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            {/* Page Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 sm:p-7 rounded-3xl border border-slate-100 shadow-xs">
                <div>
                    <div className="flex items-center gap-2.5">
                        <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 border border-indigo-100/70 flex items-center justify-center shadow-2xs">
                            <Pill className="w-5 h-5" />
                        </div>
                        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#101044] tracking-tight">
                            Prescriptions & Medical Records
                        </h1>
                    </div>
                    <p className="text-xs sm:text-sm text-slate-500 mt-1 ml-12">
                        Archive of digital e-prescriptions and clinical documents issued across your patient consultations.
                    </p>
                </div>

                <div className="flex items-center gap-3 self-start md:self-auto ml-12 md:ml-0">
                    <div className="flex items-center gap-2 px-3.5 py-2 bg-indigo-50/80 text-indigo-700 rounded-xl text-xs font-bold border border-indigo-100 shadow-2xs">
                        <Pill className="w-4 h-4 text-indigo-600" />
                        <span>{totalPrescriptions} Rx Medications</span>
                    </div>
                    <div className="flex items-center gap-2 px-3.5 py-2 bg-emerald-50/80 text-emerald-700 rounded-xl text-xs font-bold border border-emerald-100 shadow-2xs">
                        <FileText className="w-4 h-4 text-emerald-600" />
                        <span>{totalFiles} Clinical Files</span>
                    </div>
                </div>
            </div>

            {/* Controls Bar */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-white p-3 rounded-2xl border border-slate-100 shadow-xs">
                {/* Search Input */}
                <div className="relative w-full md:w-96">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                    <input
                        type="text"
                        placeholder="Search patient, medicine, or document name..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-9 py-2.5 text-xs sm:text-sm rounded-xl bg-slate-50/80 border border-slate-200/80 text-[#101044] placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium"
                    />
                    {searchQuery && (
                        <button
                            onClick={() => setSearchQuery('')}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    )}
                </div>

                {/* Filter Tabs */}
                <div className="flex items-center gap-1.5 w-full md:w-auto bg-slate-100/90 p-1 rounded-xl border border-slate-200/50">
                    <button
                        onClick={() => setActiveTab('all')}
                        className={`flex-1 md:flex-none px-4 py-2 text-xs font-bold rounded-lg transition-all ${
                            activeTab === 'all'
                                ? 'bg-white text-[#101044] shadow-2xs'
                                : 'text-slate-600 hover:text-slate-900'
                        }`}
                    >
                        All Records
                    </button>
                    <button
                        onClick={() => setActiveTab('prescriptions')}
                        className={`flex-1 md:flex-none px-4 py-2 text-xs font-bold rounded-lg transition-all ${
                            activeTab === 'prescriptions'
                                ? 'bg-white text-indigo-700 shadow-2xs'
                                : 'text-slate-600 hover:text-slate-900'
                        }`}
                    >
                        Prescriptions ({totalPrescriptions})
                    </button>
                    <button
                        onClick={() => setActiveTab('files')}
                        className={`flex-1 md:flex-none px-4 py-2 text-xs font-bold rounded-lg transition-all ${
                            activeTab === 'files'
                                ? 'bg-white text-emerald-700 shadow-2xs'
                                : 'text-slate-600 hover:text-slate-900'
                        }`}
                    >
                        Files ({totalFiles})
                    </button>
                </div>
            </div>

            {/* Content List */}
            {isLoading ? (
                <div className="p-16 text-center text-slate-500 flex flex-col justify-center items-center min-h-[300px] space-y-3">
                    <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
                    <span className="text-xs font-medium text-slate-400">Loading prescription archives...</span>
                </div>
            ) : filteredAppointments.length === 0 ? (
                <div className="bg-white rounded-3xl border border-slate-200/80 border-dashed p-12 sm:p-16 text-center max-w-lg mx-auto shadow-2xs">
                    <div className="w-16 h-16 rounded-3xl bg-indigo-50 text-indigo-600 border border-indigo-100 flex items-center justify-center mx-auto mb-4 shadow-2xs">
                        <Pill className="w-8 h-8" />
                    </div>
                    <h3 className="text-base sm:text-lg font-bold text-[#101044] mb-1">No Medical Records Found</h3>
                    <p className="text-xs sm:text-sm text-slate-500 leading-relaxed mb-6">
                        {searchQuery
                            ? `No clinical records matching "${searchQuery}". Try searching with a different term.`
                            : 'Prescriptions issued during consultations and attached clinical test reports will be archived here.'}
                    </p>
                    <Link
                        href="/doctor/appointments"
                        className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#101044] hover:bg-indigo-950 text-white text-xs font-bold rounded-xl shadow-xs transition-all"
                    >
                        <Calendar className="w-4 h-4" />
                        <span>View Appointments</span>
                        <ArrowRight className="w-3.5 h-3.5 ml-1" />
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
                                className="bg-white rounded-3xl border border-slate-100 shadow-xs overflow-hidden transition-all duration-300 hover:shadow-md hover:border-indigo-100"
                            >
                                {/* Card Header */}
                                <div className="p-5 sm:p-6 bg-gradient-to-r from-slate-50/90 via-indigo-50/20 to-white border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-2xl bg-[#101044]/5 text-[#101044] border border-[#101044]/10 font-bold flex items-center justify-center text-sm shadow-2xs uppercase">
                                            {patientName ? patientName.slice(0, 2).toUpperCase() : 'PT'}
                                        </div>
                                        <div>
                                            <div className="text-base font-bold text-[#101044] flex flex-wrap items-center gap-2">
                                                <span>{patientName}</span>
                                                {isManual && (
                                                    <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
                                                        Manual Booking
                                                    </span>
                                                )}
                                                <span className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                                                    app.consultationType === 'offline'
                                                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/60'
                                                        : 'bg-blue-50 text-blue-700 border border-blue-200/60'
                                                }`}>
                                                    {app.consultationType === 'offline' ? <Building2 className="w-3 h-3" /> : <Video className="w-3 h-3" />}
                                                    <span>{app.consultationType === 'offline' ? 'In-Person' : 'Online Video'}</span>
                                                </span>
                                            </div>
                                            <div className="text-xs text-slate-500 flex items-center gap-2.5 mt-1 font-medium">
                                                <span className="flex items-center gap-1">
                                                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                                                    {appDate}
                                                </span>
                                                <span>•</span>
                                                <span className="flex items-center gap-1">
                                                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                                                    {app.appointmentTime}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {hasRx && (
                                        <button
                                            onClick={() => handleDownloadPrescription(app)}
                                            className="self-start sm:self-auto px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center gap-2 shadow-2xs transition-all active:scale-98"
                                        >
                                            <Download className="w-4 h-4" />
                                            <span>Download e-Prescription PDF</span>
                                        </button>
                                    )}
                                </div>

                                <div className="p-5 sm:p-6 space-y-6">
                                    {/* Prescriptions Section */}
                                    {hasRx && (activeTab === 'all' || activeTab === 'prescriptions') && (
                                        <div>
                                            <div className="flex items-center gap-2 mb-3.5">
                                                <Pill className="w-4 h-4 text-indigo-600" />
                                                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                                                    Prescribed Medications ({app.prescriptions.length})
                                                </h4>
                                            </div>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                {app.prescriptions.map((rx: any, idx: number) => (
                                                    <div
                                                        key={idx}
                                                        className="p-4 bg-slate-50/70 border border-slate-100 rounded-2xl text-xs flex flex-col justify-between hover:bg-white hover:border-indigo-100 hover:shadow-2xs transition-all"
                                                    >
                                                        <div className="flex items-start justify-between gap-2">
                                                            <div className="font-bold text-[#101044] text-sm flex items-center gap-2.5">
                                                                <span className="w-6 h-6 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center text-xs font-bold shrink-0">
                                                                    {idx + 1}
                                                                </span>
                                                                <span className="truncate">{rx.medicine}</span>
                                                            </div>
                                                            <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-lg shrink-0">
                                                                {rx.duration || 'As directed'}
                                                            </span>
                                                        </div>
                                                        <div className="text-slate-600 text-xs mt-2.5 ml-8.5 flex flex-wrap items-center gap-2">
                                                            <span>Dosage: <strong className="text-slate-800">{rx.dosage}</strong></span>
                                                            <span>•</span>
                                                            <span className="text-indigo-600 font-semibold">{rx.frequency}</span>
                                                        </div>
                                                        {rx.instructions && (
                                                            <div className="text-slate-500 italic text-[11px] mt-1.5 ml-8.5 bg-white p-2 rounded-lg border border-slate-100">
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
                                            <div className="flex items-center gap-2 mb-3.5">
                                                <Paperclip className="w-4 h-4 text-emerald-600" />
                                                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                                                    Consultation Documents & Attachments ({app.consultationFiles.length})
                                                </h4>
                                            </div>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                {app.consultationFiles.map((file: any, fIdx: number) => {
                                                    const fileType = (file.type || '').toLowerCase();
                                                    const isPdf = fileType === 'pdf';
                                                    const isImg = ['png', 'jpg', 'jpeg', 'webp', 'svg'].includes(fileType);
                                                    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:5001';
                                                    const fileUrl = file.url?.startsWith('http')
                                                        ? file.url
                                                        : `${baseUrl}${file.url?.startsWith('/') ? '' : '/'}${file.url}`;

                                                    return (
                                                        <div
                                                            key={file.id || fIdx}
                                                            className="p-3.5 bg-slate-50/70 border border-slate-100 rounded-2xl text-xs flex items-center justify-between gap-3 hover:bg-white hover:border-emerald-100 hover:shadow-2xs transition-all"
                                                        >
                                                            <div className="flex items-center gap-3 min-w-0">
                                                                <div className="w-10 h-10 rounded-xl bg-white border border-slate-200/80 flex items-center justify-center shrink-0 text-slate-600 shadow-2xs">
                                                                    {isPdf ? (
                                                                        <FileText className="w-5 h-5 text-rose-500" />
                                                                    ) : isImg ? (
                                                                        <FileImage className="w-5 h-5 text-emerald-500" />
                                                                    ) : (
                                                                        <Paperclip className="w-5 h-5 text-indigo-500" />
                                                                    )}
                                                                </div>
                                                                <div className="min-w-0">
                                                                    <div className="font-bold text-[#101044] text-xs sm:text-sm truncate" title={file.name}>
                                                                        {file.name}
                                                                    </div>
                                                                    <div className="text-slate-500 text-[11px] flex flex-wrap items-center gap-2 mt-0.5">
                                                                        <span>{file.size || 'Attachment'}</span>
                                                                        <span>•</span>
                                                                        <span className="text-emerald-700 font-semibold">
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
                                                                    className="px-3 py-1.5 text-xs font-bold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-1.5 shadow-2xs shrink-0 transition-all active:scale-98"
                                                                >
                                                                    <Download className="w-3.5 h-3.5" />
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
