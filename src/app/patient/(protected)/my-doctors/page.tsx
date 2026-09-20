'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import axiosInstance from '@/api/axiosInstance';
import { generatePrescriptionPdf } from '@/utils/generatePrescriptionPdf';
import { useAppSelector } from '@/redux/hooks';
import toast from 'react-hot-toast';

interface DoctorItem {
  _id: string;
  doctorId: string;
  firstName: string;
  lastName: string;
  name: string;
  specialty: string;
  avatarUrl: string;
  yearsOfExperience: number;
  rating: number;
  reviewCount: number;
  consultationSettings?: {
    online?: { fee?: number; enabled?: boolean };
    offline?: { fee?: number; enabled?: boolean; clinicName?: string; clinicAddress?: string };
    physical?: { fee?: number; enabled?: boolean; clinicName?: string; clinicAddress?: string };
  };
  slotDuration?: number;
  timezone?: string;
  totalConsultations: number;
  lastConsultationDate: string;
  lastConsultationTime: string;
  lastConsultationType: string;
}

interface ConsultationRecord {
  id: string;
  appointmentId: string;
  appointmentDate: string;
  appointmentTime: string;
  consultationType: string;
  status: string;
  fee: number;
  prescriptions: Array<{
    id?: string;
    medicine: string;
    dosage: string;
    frequency: string;
    duration: string;
    instructions: string;
    prescribedBy?: string;
    date?: string;
  }>;
  consultationFiles: Array<{
    id?: string;
    name: string;
    url?: string;
    fileUrl?: string;
    category?: string;
    size?: string;
  }>;
  clinicalAdvice: string;
  createdAt: string;
}

interface DoctorHistoryData {
  doctor: {
    id: string;
    doctorId: string;
    name: string;
    firstName: string;
    lastName: string;
    specialty: string;
    avatarUrl: string;
    yearsOfExperience: number;
    rating: number;
    reviewCount: number;
    consultationSettings?: any;
    qualifications?: string[];
    bio?: string;
    phone?: string;
  };
  totalConsultations: number;
  consultations: ConsultationRecord[];
}

export default function MyDoctorsPage() {
  const { user } = useAppSelector((state) => state.auth);
  const patientName = user?.name || user?.googleName || user?.email || 'Patient';

  const [doctors, setDoctors] = useState<DoctorItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedSpecialty, setSelectedSpecialty] = useState<string>('all');

  // History modal state
  const [selectedDoctorId, setSelectedDoctorId] = useState<string | null>(null);
  const [historyLoading, setHistoryLoading] = useState<boolean>(false);
  const [historyData, setHistoryData] = useState<DoctorHistoryData | null>(null);

  const fetchMyDoctors = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await axiosInstance.get('/patient/my-doctors');
      if (res.data?.success) {
        setDoctors(res.data.doctors || []);
      } else {
        setDoctors([]);
      }
    } catch (err: any) {
      console.error('Failed to fetch consulted doctors:', err);
      setError(err?.response?.data?.message || 'Failed to load your doctors directory.');
      toast.error('Unable to fetch your doctors');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMyDoctors();
  }, []);

  const openHistoryModal = async (doctorId: string) => {
    setSelectedDoctorId(doctorId);
    setHistoryLoading(true);
    setHistoryData(null);
    try {
      const res = await axiosInstance.get(`/patient/my-doctors/${doctorId}/history`);
      if (res.data?.success) {
        setHistoryData(res.data);
      } else {
        toast.error('Could not load consultation history');
      }
    } catch (err: any) {
      console.error('Error fetching doctor history:', err);
      toast.error(err?.response?.data?.message || 'Failed to load consultation history');
    } finally {
      setHistoryLoading(false);
    }
  };

  const closeHistoryModal = () => {
    setSelectedDoctorId(null);
    setHistoryData(null);
  };

  const handleDownloadPdf = (consultation: ConsultationRecord, doctorInfo: any) => {
    try {
      const doctorDisplayName = doctorInfo?.name || `Dr. ${doctorInfo?.firstName || ''} ${doctorInfo?.lastName || ''}`.trim() || 'Dr. Consultant';
      const clinicName =
        doctorInfo?.consultationSettings?.offline?.clinicName ||
        doctorInfo?.consultationSettings?.physical?.clinicName;

      const formattedPrescriptions = (consultation.prescriptions || []).map((rx, idx) => ({
        id: rx.id || `rx-${idx}`,
        medicine: rx.medicine || 'Medicine',
        dosage: rx.dosage || '-',
        frequency: rx.frequency || '-',
        duration: rx.duration || '-',
        instructions: rx.instructions || '-',
        prescribedBy: doctorDisplayName,
        date: new Date(consultation.appointmentDate).toDateString(),
      }));

      generatePrescriptionPdf({
        appointmentId: consultation.appointmentId || consultation.id,
        date: new Date(consultation.appointmentDate).toDateString(),
        time: consultation.appointmentTime,
        consultationType:
          consultation.consultationType === 'offline' || consultation.consultationType === 'physical'
            ? 'In-Person Consultation'
            : 'Online Video Consultation',
        patient: {
          name: patientName,
        },
        doctor: {
          name: doctorDisplayName,
          specialty: doctorInfo?.specialty || 'General Practice',
          qualifications: Array.isArray(doctorInfo?.qualifications)
            ? doctorInfo.qualifications.join(', ')
            : doctorInfo?.qualifications,
          clinicName,
        },
        prescriptions: formattedPrescriptions,
        clinicalAdvice:
          consultation.clinicalAdvice ||
          'Take medications strictly as directed. Contact doctor if any adverse reactions occur.',
      });
      toast.success('Prescription downloaded successfully');
    } catch (err) {
      console.error('Failed to generate prescription PDF:', err);
      toast.error('Failed to generate prescription document.');
    }
  };

  // Specialties list for filter
  const specialties = useMemo(() => {
    const list = new Set<string>();
    doctors.forEach((doc) => {
      if (doc.specialty) list.add(doc.specialty);
    });
    return Array.from(list);
  }, [doctors]);

  // Filtered doctors
  const filteredDoctors = useMemo(() => {
    return doctors.filter((doc) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        (doc.name && doc.name.toLowerCase().includes(q)) ||
        (doc.specialty && doc.specialty.toLowerCase().includes(q));

      const matchesSpecialty =
        selectedSpecialty === 'all' || doc.specialty === selectedSpecialty;

      return matchesSearch && matchesSpecialty;
    });
  }, [doctors, searchQuery, selectedSpecialty]);

  const totalConsultationsSum = useMemo(() => {
    return doctors.reduce((sum, d) => sum + (d.totalConsultations || 0), 0);
  }, [doctors]);

  return (
    <div className="min-h-screen bg-slate-50/50 p-4 md:p-8 space-y-8">
      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-100">
              <i className="fas fa-user-doctor text-lg"></i>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">My Consulted Doctors</h1>
              <p className="text-sm text-slate-500 mt-0.5">
                Your trusted care providers, consultation records, and 1-click rebooking
              </p>
            </div>
          </div>
        </div>

        <Link
          href="/patient/find-doctor"
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold shadow-sm transition-all hover:shadow-indigo-200"
        >
          <i className="fas fa-plus text-xs"></i>
          <span>Find New Doctors</span>
        </Link>
      </div>

      {/* Stats Counter Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center text-xl">
            <i className="fas fa-user-md"></i>
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Doctors</p>
            <p className="text-2xl font-bold text-slate-800">{doctors.length}</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-xl">
            <i className="fas fa-calendar-check"></i>
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Consultations</p>
            <p className="text-2xl font-bold text-slate-800">{totalConsultationsSum}</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center text-xl">
            <i className="fas fa-clock-rotate-left"></i>
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Last Consultation</p>
            <p className="text-sm font-bold text-slate-800 truncate">
              {doctors.length > 0 && doctors[0].lastConsultationDate
                ? new Date(doctors[0].lastConsultationDate).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })
                : 'None yet'}
            </p>
          </div>
        </div>
      </div>

      {/* Search & Filter Controls */}
      <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-96">
          <i className="fas fa-search absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm"></i>
          <input
            type="text"
            placeholder="Search by doctor name or specialty..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <i className="fas fa-times text-xs"></i>
            </button>
          )}
        </div>

        {specialties.length > 0 && (
          <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
            <button
              onClick={() => setSelectedSpecialty('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
                selectedSpecialty === 'all'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              All Specialties
            </button>
            {specialties.map((spec) => (
              <button
                key={spec}
                onClick={() => setSelectedSpecialty(spec)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
                  selectedSpecialty === spec
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {spec}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Main Content Area */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm animate-pulse space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-slate-200"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-5 bg-slate-200 rounded w-3/4"></div>
                  <div className="h-4 bg-slate-100 rounded w-1/2"></div>
                </div>
              </div>
              <div className="h-10 bg-slate-50 rounded-xl"></div>
              <div className="h-10 bg-slate-100 rounded-xl"></div>
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="bg-rose-50 border border-rose-200 rounded-2xl p-8 text-center max-w-lg mx-auto">
          <div className="w-12 h-12 bg-rose-100 text-rose-600 rounded-xl flex items-center justify-center mx-auto mb-3">
            <i className="fas fa-circle-exclamation text-xl"></i>
          </div>
          <h3 className="text-base font-bold text-rose-900">Failed to Load Directory</h3>
          <p className="text-sm text-rose-700 mt-1 mb-4">{error}</p>
          <button
            onClick={fetchMyDoctors}
            className="px-4 py-2 bg-rose-600 text-white text-xs font-semibold rounded-lg hover:bg-rose-700 transition"
          >
            Try Again
          </button>
        </div>
      ) : filteredDoctors.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 border border-slate-200/80 shadow-sm text-center max-w-xl mx-auto space-y-4">
          <div className="w-20 h-20 bg-indigo-50 text-indigo-600 rounded-3xl flex items-center justify-center mx-auto text-3xl shadow-inner">
            <i className="fas fa-stethoscope"></i>
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-800">
              {searchQuery || selectedSpecialty !== 'all' ? 'No Doctors Match Your Search' : 'No Consultations Yet'}
            </h3>
            <p className="text-sm text-slate-500 mt-2 max-w-md mx-auto">
              {searchQuery || selectedSpecialty !== 'all'
                ? 'Try resetting your search query or specialty filter to view your full care team.'
                : 'When you complete consultations with our certified medical specialists, they will automatically appear in this directory for effortless follow-ups and record tracking.'}
            </p>
          </div>
          {searchQuery || selectedSpecialty !== 'all' ? (
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedSpecialty('all');
              }}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-semibold rounded-xl transition"
            >
              <i className="fas fa-rotate-left text-xs"></i>
              Reset Search
            </button>
          ) : (
            <Link
              href="/patient/find-doctor"
              className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl shadow-md shadow-indigo-100 transition"
            >
              <i className="fas fa-magnifying-glass text-xs"></i>
              Find & Book Doctors
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDoctors.map((doc) => {
            const initials = `${doc.firstName?.[0] || ''}${doc.lastName?.[0] || ''}`.toUpperCase() || 'DR';
            return (
              <div
                key={doc.doctorId || doc._id}
                className="bg-white rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col overflow-hidden group"
              >
                {/* Doctor Top Card Header */}
                <div className="p-6 flex-1 space-y-4">
                  <div className="flex items-start gap-4">
                    <div className="relative">
                      {doc.avatarUrl ? (
                        <img
                          src={doc.avatarUrl}
                          alt={doc.name}
                          className="w-16 h-16 rounded-2xl object-cover border border-slate-100 shadow-sm"
                        />
                      ) : (
                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-600 to-indigo-400 text-white flex items-center justify-center font-bold text-lg shadow-sm">
                          {initials}
                        </div>
                      )}
                      <span className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 border-2 border-white rounded-full flex items-center justify-center text-[10px] text-white">
                        <i className="fas fa-check"></i>
                      </span>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-bold text-slate-900 truncate group-hover:text-indigo-600 transition-colors">
                          {doc.name}
                        </h3>
                      </div>
                      <span className="inline-block mt-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700">
                        {doc.specialty || 'General Practice'}
                      </span>
                      <div className="flex items-center gap-3 mt-2 text-xs text-slate-500">
                        {doc.yearsOfExperience > 0 && (
                          <span>
                            <i className="fas fa-briefcase mr-1 text-slate-400"></i>
                            {doc.yearsOfExperience} yrs exp
                          </span>
                        )}
                        <span className="flex items-center text-amber-500 font-semibold">
                          <i className="fas fa-star mr-1 text-xs"></i>
                          {doc.rating ? doc.rating.toFixed(1) : '5.0'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Consultation Stats Box */}
                  <div className="bg-slate-50 rounded-xl p-3 grid grid-cols-2 gap-2 text-xs border border-slate-100">
                    <div>
                      <p className="text-slate-400 font-medium">Total Visits</p>
                      <p className="text-slate-800 font-bold mt-0.5">
                        {doc.totalConsultations} {doc.totalConsultations === 1 ? 'consultation' : 'consultations'}
                      </p>
                    </div>
                    <div>
                      <p className="text-slate-400 font-medium">Last Visit</p>
                      <p className="text-slate-800 font-bold mt-0.5">
                        {doc.lastConsultationDate
                          ? new Date(doc.lastConsultationDate).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                            })
                          : 'Recent'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Card Actions */}
                <div className="p-4 bg-slate-50/70 border-t border-slate-100 flex flex-col sm:flex-row gap-2.5">
                  <button
                    onClick={() => openHistoryModal(doc.doctorId || doc._id)}
                    className="flex-1 inline-flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-white hover:bg-slate-100 text-slate-700 text-xs font-semibold border border-slate-200 shadow-sm transition"
                  >
                    <i className="fas fa-file-medical text-indigo-600"></i>
                    <span>View History</span>
                  </button>

                  <Link
                    href={`/patient/find-doctor/book/${doc.doctorId || doc._id}`}
                    className="flex-1 inline-flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-sm transition hover:shadow-indigo-100"
                  >
                    <i className="fas fa-calendar-plus text-xs"></i>
                    <span>Book Again</span>
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* History Slide-Over / Modal */}
      {selectedDoctorId && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex justify-end transition-opacity">
          <div className="w-full max-w-3xl bg-white min-h-screen shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
            {/* Modal Header */}
            <div className="sticky top-0 bg-white z-10 border-b border-slate-200 px-6 py-5 flex items-center justify-between shadow-xs">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center text-lg">
                  <i className="fas fa-stethoscope"></i>
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900">Consultation History & Prescriptions</h2>
                  <p className="text-xs text-slate-500">
                    Medical interactions strictly with this specialist
                  </p>
                </div>
              </div>
              <button
                onClick={closeHistoryModal}
                className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition"
              >
                <i className="fas fa-times text-sm"></i>
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 flex-1 overflow-y-auto space-y-6">
              {historyLoading ? (
                <div className="flex flex-col items-center justify-center py-20 space-y-4">
                  <div className="w-10 h-10 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                  <p className="text-sm font-medium text-slate-500">Loading consultation records...</p>
                </div>
              ) : !historyData ? (
                <div className="text-center py-16">
                  <p className="text-sm text-slate-500">Failed to load consultation records.</p>
                </div>
              ) : (
                <>
                  {/* Doctor Profile Banner */}
                  <div className="bg-gradient-to-r from-indigo-50 via-slate-50 to-white rounded-2xl p-5 border border-indigo-100/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      {historyData.doctor?.avatarUrl ? (
                        <img
                          src={historyData.doctor.avatarUrl}
                          alt={historyData.doctor.name}
                          className="w-14 h-14 rounded-2xl object-cover border border-indigo-200"
                        />
                      ) : (
                        <div className="w-14 h-14 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-bold text-base">
                          {historyData.doctor?.firstName?.[0] || 'D'}
                        </div>
                      )}
                      <div>
                        <h3 className="text-base font-bold text-slate-900">{historyData.doctor?.name}</h3>
                        <p className="text-xs font-semibold text-indigo-600">{historyData.doctor?.specialty}</p>
                        {Array.isArray(historyData.doctor?.qualifications) && historyData.doctor.qualifications.length > 0 && (
                          <p className="text-xs text-slate-400 mt-0.5">
                            {historyData.doctor.qualifications.join(', ')}
                          </p>
                        )}
                      </div>
                    </div>

                    <Link
                      href={`/patient/find-doctor/book/${historyData.doctor?.doctorId || historyData.doctor?.id}`}
                      className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-sm transition"
                    >
                      <i className="fas fa-calendar-check"></i>
                      <span>Book New Appointment</span>
                    </Link>
                  </div>

                  {/* Consultation Timeline */}
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-bold uppercase tracking-wider text-slate-400">
                        Past Consultations ({historyData.consultations?.length || 0})
                      </h4>
                    </div>

                    {(!historyData.consultations || historyData.consultations.length === 0) ? (
                      <div className="p-8 text-center bg-slate-50 rounded-2xl border border-slate-200">
                        <p className="text-sm text-slate-500">No completed consultations found with this doctor.</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {historyData.consultations.map((c, index) => {
                          const hasPrescriptions = Array.isArray(c.prescriptions) && c.prescriptions.length > 0;
                          const hasFiles = Array.isArray(c.consultationFiles) && c.consultationFiles.length > 0;

                          return (
                            <div
                              key={c.id || c.appointmentId || index}
                              className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4"
                            >
                              {/* Consultation Item Header */}
                              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
                                <div className="flex items-center gap-2.5">
                                  <span className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center text-xs font-bold">
                                    #{index + 1}
                                  </span>
                                  <div>
                                    <p className="text-sm font-bold text-slate-900">
                                      {new Date(c.appointmentDate).toLocaleDateString('en-US', {
                                        weekday: 'short',
                                        month: 'short',
                                        day: 'numeric',
                                        year: 'numeric',
                                      })}
                                    </p>
                                    <p className="text-xs text-slate-400 font-medium">{c.appointmentTime}</p>
                                  </div>
                                </div>

                                <div className="flex items-center gap-2">
                                  <span
                                    className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                                      c.consultationType === 'offline' || c.consultationType === 'physical'
                                        ? 'bg-amber-50 text-amber-700'
                                        : 'bg-indigo-50 text-indigo-700'
                                    }`}
                                  >
                                    <i
                                      className={`fas ${
                                        c.consultationType === 'offline' || c.consultationType === 'physical'
                                          ? 'fa-hospital-user'
                                          : 'fa-video'
                                      } mr-1.5`}
                                    ></i>
                                    {c.consultationType === 'offline' || c.consultationType === 'physical'
                                      ? 'In-Person'
                                      : 'Video Call'}
                                  </span>

                                  <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700">
                                    <i className="fas fa-check-circle mr-1"></i>
                                    Completed
                                  </span>
                                </div>
                              </div>

                              {/* Clinical Advice Note */}
                              {c.clinicalAdvice && (
                                <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-100">
                                  <p className="text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                                    <i className="fas fa-notes-medical text-indigo-500"></i>
                                    Doctor's Clinical Advice
                                  </p>
                                  <p className="text-xs text-slate-600 whitespace-pre-wrap leading-relaxed">
                                    {c.clinicalAdvice}
                                  </p>
                                </div>
                              )}

                              {/* Prescriptions */}
                              {hasPrescriptions && (
                                <div className="space-y-3">
                                  <div className="flex items-center justify-between">
                                    <h5 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                                      <i className="fas fa-pills text-emerald-600"></i>
                                      Prescribed Medications ({c.prescriptions.length})
                                    </h5>
                                    <button
                                      onClick={() => handleDownloadPdf(c, historyData.doctor)}
                                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-semibold transition"
                                    >
                                      <i className="fas fa-file-pdf"></i>
                                      <span>Download Official PDF</span>
                                    </button>
                                  </div>

                                  <div className="overflow-x-auto rounded-xl border border-slate-200">
                                    <table className="w-full text-left text-xs">
                                      <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                                        <tr>
                                          <th className="py-2.5 px-3">Medicine</th>
                                          <th className="py-2.5 px-3">Dosage</th>
                                          <th className="py-2.5 px-3">Frequency</th>
                                          <th className="py-2.5 px-3">Duration</th>
                                          <th className="py-2.5 px-3">Instructions</th>
                                        </tr>
                                      </thead>
                                      <tbody className="divide-y divide-slate-100 text-slate-700">
                                        {c.prescriptions.map((rx, rxIdx) => (
                                          <tr key={rxIdx} className="hover:bg-slate-50/50">
                                            <td className="py-2.5 px-3 font-semibold text-slate-900">{rx.medicine}</td>
                                            <td className="py-2.5 px-3">{rx.dosage || '-'}</td>
                                            <td className="py-2.5 px-3">{rx.frequency || '-'}</td>
                                            <td className="py-2.5 px-3">{rx.duration || '-'}</td>
                                            <td className="py-2.5 px-3 text-slate-500">{rx.instructions || '-'}</td>
                                          </tr>
                                        ))}
                                      </tbody>
                                    </table>
                                  </div>
                                </div>
                              )}

                              {/* Consultation Files */}
                              {hasFiles && (
                                <div className="space-y-2 pt-2 border-t border-slate-100">
                                  <p className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                                    <i className="fas fa-paperclip text-slate-400"></i>
                                    Attached Documents ({c.consultationFiles.length})
                                  </p>
                                  <div className="flex flex-wrap gap-2">
                                    {c.consultationFiles.map((file, fIdx) => (
                                      <a
                                        key={fIdx}
                                        href={file.url || file.fileUrl || '#'}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium transition"
                                      >
                                        <i className="fas fa-file text-slate-500"></i>
                                        <span className="truncate max-w-[180px]">{file.name || 'Attachment'}</span>
                                        <i className="fas fa-arrow-up-right-from-square text-[10px] text-slate-400"></i>
                                      </a>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {/* If no prescription and no notes */}
                              {!hasPrescriptions && !c.clinicalAdvice && !hasFiles && (
                                <p className="text-xs text-slate-400 italic">
                                  No prescription or notes attached to this consultation record.
                                </p>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>

            {/* Modal Sticky Footer */}
            <div className="sticky bottom-0 bg-slate-50 border-t border-slate-200 p-4 flex justify-end">
              <button
                onClick={closeHistoryModal}
                className="px-5 py-2.5 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-semibold transition"
              >
                Close Record
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
