'use client';

import React, { useState, useEffect, useMemo } from 'react';
import axiosInstance from '@/api/axiosInstance';
import { generatePrescriptionPdf } from '@/utils/generatePrescriptionPdf';
import { useAppSelector } from '@/redux/hooks';
import toast from 'react-hot-toast';
import {
  Users,
  Search,
  LayoutGrid,
  List,
  ShieldCheck,
  Stethoscope,
  Clock,
  X,
  RotateCcw,
  FileText,
  Mail,
  Phone,
  Calendar,
  ChevronRight,
  AlertTriangle,
  AlertCircle,
  HeartPulse,
  Pill,
  Download,
  Paperclip,
  ExternalLink,
  Building2,
  Video,
  Activity,
  CheckCircle2,
  Sparkles,
  UserCheck,
  ArrowRight,
  Loader2
} from 'lucide-react';

interface PatientItem {
  _id: string;
  patientId: string;
  name: string;
  firstName?: string;
  lastName?: string;
  email: string;
  phone: string;
  gender: string;
  bloodGroup: string;
  dateOfBirth?: string | null;
  avatarUrl?: string;
  totalCompletedAppointments: number;
  lastAppointmentDate: string;
  lastAppointmentTime: string;
  lastConsultationType: string;
  lastAppointmentId: string;
}

interface ClinicalConsultation {
  id: string;
  appointmentId: string;
  appointmentDate: string;
  appointmentTime: string;
  consultationType: string;
  status: string;
  fee: number;
  clinicalNotes: string;
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
  sessionStartedAt?: string;
  sessionEndedAt?: string;
  createdAt: string;
}

interface PatientHistoryData {
  patient: {
    id: string;
    patientId: string;
    name: string;
    email: string;
    phone: string;
    gender: string;
    bloodGroup: string;
    dateOfBirth: string | null;
    avatarUrl: string;
    allergies: string[];
    chronicConditions: string[];
    currentMedications: string[];
    emergencyContact?: {
      name?: string;
      relationship?: string;
      phone?: string;
    } | null;
  };
  totalVisits: number;
  consultations: ClinicalConsultation[];
}

export default function DoctorPatientsPage() {
  const { user } = useAppSelector((state) => state.auth);
  const doctorName = user?.name || `Dr. ${user?.googleName || 'Consultant'}`;

  const [patients, setPatients] = useState<PatientItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [genderFilter, setGenderFilter] = useState<string>('all');
  const [bloodGroupFilter, setBloodGroupFilter] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  // Drawer / History state
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);
  const [historyLoading, setHistoryLoading] = useState<boolean>(false);
  const [historyData, setHistoryData] = useState<PatientHistoryData | null>(null);

  const fetchPatients = async (search = '') => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await axiosInstance.get('/doctor/my-patients', {
        params: search ? { search } : {},
      });
      if (res.data?.success) {
        setPatients(res.data.patients || []);
      } else {
        setPatients([]);
      }
    } catch (err: any) {
      console.error('Failed to fetch doctor patients:', err);
      setError(err?.response?.data?.message || 'Failed to load your patients list.');
      toast.error('Unable to fetch patients directory');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPatients();
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchPatients(searchQuery);
  };

  const openPatientHistory = async (patientId: string) => {
    setSelectedPatientId(patientId);
    setHistoryLoading(true);
    setHistoryData(null);
    try {
      const res = await axiosInstance.get(`/doctor/my-patients/${patientId}/history`);
      if (res.data?.success) {
        setHistoryData(res.data);
      } else {
        toast.error('Could not load patient clinical history');
      }
    } catch (err: any) {
      console.error('Error fetching patient clinical history:', err);
      toast.error(err?.response?.data?.message || 'Failed to load patient history');
    } finally {
      setHistoryLoading(false);
    }
  };

  const closePatientHistory = () => {
    setSelectedPatientId(null);
    setHistoryData(null);
  };

  const handleDownloadPrescriptionPdf = (consultation: ClinicalConsultation, patientInfo: any) => {
    try {
      const formattedPrescriptions = (consultation.prescriptions || []).map((rx, idx) => ({
        id: rx.id || `rx-${idx}`,
        medicine: rx.medicine || 'Medicine',
        dosage: rx.dosage || '-',
        frequency: rx.frequency || '-',
        duration: rx.duration || '-',
        instructions: rx.instructions || '-',
        prescribedBy: doctorName,
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
          name: patientInfo?.name || 'Patient',
          gender: patientInfo?.gender,
          bloodGroup: patientInfo?.bloodGroup,
          phone: patientInfo?.phone,
        },
        doctor: {
          name: doctorName,
          specialty: (user as any)?.specialty || 'Medical Specialist',
        },
        prescriptions: formattedPrescriptions,
        clinicalAdvice:
          consultation.clinicalNotes ||
          'Take medications strictly as directed. Contact clinic if adverse symptoms occur.',
      });
      toast.success('Prescription PDF generated');
    } catch (err) {
      console.error('Failed to generate prescription PDF:', err);
      toast.error('Failed to generate prescription PDF');
    }
  };

  const calculateAge = (dobString?: string | null) => {
    if (!dobString) return null;
    const dob = new Date(dobString);
    if (isNaN(dob.getTime())) return null;
    const diffMs = Date.now() - dob.getTime();
    const ageDate = new Date(diffMs);
    return Math.abs(ageDate.getUTCFullYear() - 1970);
  };

  // Client-side filtering by gender / blood group
  const filteredPatients = useMemo(() => {
    return patients.filter((p) => {
      const matchesGender =
        genderFilter === 'all' ||
        (p.gender && p.gender.toLowerCase() === genderFilter.toLowerCase());

      const matchesBloodGroup =
        bloodGroupFilter === 'all' ||
        (p.bloodGroup && p.bloodGroup.toLowerCase() === bloodGroupFilter.toLowerCase());

      return matchesGender && matchesBloodGroup;
    });
  }, [patients, genderFilter, bloodGroupFilter]);

  const totalConsultationsSum = useMemo(() => {
    return patients.reduce((acc, p) => acc + (p.totalCompletedAppointments || 0), 0);
  }, [patients]);

  return (
    <div className="doc-page" style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 sm:p-7 rounded-3xl border border-slate-100 shadow-xs">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 border border-indigo-100/70 flex items-center justify-center shadow-2xs">
              <Users className="w-5 h-5" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#101044] tracking-tight">My Patients</h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 ml-12">
            Clinical directory of patients who have completed consultations under your medical care.
          </p>
        </div>

        {/* View Toggle */}
        <div className="flex items-center gap-1.5 bg-slate-100/90 p-1 rounded-xl self-start md:self-auto border border-slate-200/60 ml-12 md:ml-0">
          <button
            onClick={() => setViewMode('grid')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
              viewMode === 'grid'
                ? 'bg-white text-[#101044] shadow-2xs'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            <span>Cards</span>
          </button>
          <button
            onClick={() => setViewMode('table')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
              viewMode === 'table'
                ? 'bg-white text-[#101044] shadow-2xs'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <List className="w-3.5 h-3.5" />
            <span>Table</span>
          </button>
        </div>
      </div>

      {/* Privacy Guarantee Alert Banner */}
      <div className="bg-gradient-to-r from-indigo-50/90 via-sky-50/50 to-white rounded-3xl p-5 border border-indigo-100/80 flex items-start gap-4 shadow-2xs">
        <div className="w-9 h-9 rounded-2xl bg-indigo-100/80 text-indigo-700 flex items-center justify-center shrink-0 mt-0.5 border border-indigo-200/50">
          <ShieldCheck className="w-5 h-5" />
        </div>
        <div>
          <h4 className="text-xs font-extrabold text-[#101044] uppercase tracking-wider">
            Confidential Medical Data Isolation Guarantee
          </h4>
          <p className="text-xs text-slate-600 mt-1 leading-relaxed">
            Patient health confidentiality is strictly enforced. You have access exclusively to consultations, private clinical notes,
            and prescriptions generated within your own practice for these patients. External records remain completely isolated.
          </p>
        </div>
      </div>

      {/* Stats Counter Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-2xs hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex items-center gap-4 group">
          <div className="w-13 h-13 rounded-2xl bg-indigo-50 text-indigo-600 border border-indigo-100 flex items-center justify-center text-xl group-hover:scale-105 transition-transform">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Patients</p>
            <p className="text-2xl sm:text-3xl font-extrabold text-[#101044] tracking-tight">{patients.length}</p>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-2xs hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex items-center gap-4 group">
          <div className="w-13 h-13 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center text-xl group-hover:scale-105 transition-transform">
            <Stethoscope className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Completed Sessions</p>
            <p className="text-2xl sm:text-3xl font-extrabold text-[#101044] tracking-tight">{totalConsultationsSum}</p>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-2xs hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex items-center gap-4 group">
          <div className="w-13 h-13 rounded-2xl bg-amber-50 text-amber-600 border border-amber-100 flex items-center justify-center text-xl group-hover:scale-105 transition-transform">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Latest Consultation</p>
            <p className="text-sm sm:text-base font-bold text-[#101044] truncate mt-1">
              {patients.length > 0 && patients[0].lastAppointmentDate
                ? new Date(patients[0].lastAppointmentDate).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })
                : 'No consultations yet'}
            </p>
          </div>
        </div>
      </div>

      {/* Search & Filter Controls */}
      <div className="bg-white rounded-3xl p-4 border border-slate-100 shadow-xs flex flex-col md:flex-row gap-4 items-center justify-between">
        <form onSubmit={handleSearchSubmit} className="relative w-full md:w-96 flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search by name, email, or phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-9 py-2.5 text-xs sm:text-sm bg-slate-50/80 border border-slate-200/80 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium text-[#101044]"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  fetchPatients('');
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          <button
            type="submit"
            className="px-4 py-2.5 bg-[#101044] hover:bg-indigo-950 text-white rounded-xl text-xs font-bold shadow-xs transition-all active:scale-98"
          >
            Search
          </button>
        </form>

        <div className="flex items-center gap-3 w-full md:w-auto">
          {/* Gender Filter */}
          <select
            value={genderFilter}
            onChange={(e) => setGenderFilter(e.target.value)}
            className="px-3.5 py-2.5 text-xs font-semibold bg-slate-50 border border-slate-200/80 rounded-xl text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          >
            <option value="all">All Genders</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>

          {/* Blood Group Filter */}
          <select
            value={bloodGroupFilter}
            onChange={(e) => setBloodGroupFilter(e.target.value)}
            className="px-3.5 py-2.5 text-xs font-semibold bg-slate-50 border border-slate-200/80 rounded-xl text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          >
            <option value="all">All Blood Types</option>
            <option value="a+">A+</option>
            <option value="a-">A-</option>
            <option value="b+">B+</option>
            <option value="b-">B-</option>
            <option value="ab+">AB+</option>
            <option value="ab-">AB-</option>
            <option value="o+">O+</option>
            <option value="o-">O-</option>
          </select>
        </div>
      </div>

      {/* Main Content Area */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xs animate-pulse space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-slate-100"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-5 bg-slate-100 rounded w-3/4"></div>
                  <div className="h-3 bg-slate-50 rounded w-1/2"></div>
                </div>
              </div>
              <div className="h-10 bg-slate-50 rounded-xl"></div>
              <div className="h-10 bg-slate-100 rounded-xl"></div>
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="bg-rose-50 border border-rose-200 rounded-3xl p-8 sm:p-12 text-center max-w-lg mx-auto shadow-xs">
          <div className="w-14 h-14 bg-rose-100 text-rose-600 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-2xs">
            <AlertCircle className="w-7 h-7" />
          </div>
          <h3 className="text-base font-bold text-rose-950">Failed to Load Patients Directory</h3>
          <p className="text-xs text-rose-800/80 mt-1 mb-5 leading-relaxed">{error}</p>
          <button
            onClick={() => fetchPatients(searchQuery)}
            className="px-5 py-2.5 bg-rose-600 text-white text-xs font-bold rounded-xl hover:bg-rose-700 transition shadow-xs active:scale-98"
          >
            Try Again
          </button>
        </div>
      ) : filteredPatients.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 sm:p-16 border border-slate-200/80 border-dashed shadow-xs text-center max-w-xl mx-auto space-y-4">
          <div className="w-16 h-16 bg-indigo-50 text-indigo-600 border border-indigo-100 rounded-3xl flex items-center justify-center mx-auto text-3xl shadow-2xs">
            <Users className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-[#101044]">
              {searchQuery || genderFilter !== 'all' || bloodGroupFilter !== 'all'
                ? 'No Patients Match Your Filters'
                : 'No Completed Consultations Yet'}
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 mt-2 max-w-md mx-auto leading-relaxed">
              {searchQuery || genderFilter !== 'all' || bloodGroupFilter !== 'all'
                ? 'Try adjusting your search query or clearing your demographic filters.'
                : 'Patients who complete consultations with you will be archived here automatically with their complete health dossiers.'}
            </p>
          </div>
          {(searchQuery || genderFilter !== 'all' || bloodGroupFilter !== 'all') && (
            <button
              onClick={() => {
                setSearchQuery('');
                setGenderFilter('all');
                setBloodGroupFilter('all');
                fetchPatients('');
              }}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition shadow-2xs"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Filters</span>
            </button>
          )}
        </div>
      ) : viewMode === 'grid' ? (
        /* Cards Grid View */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPatients.map((p) => {
            const initials = `${p.firstName?.[0] || ''}${p.lastName?.[0] || ''}`.toUpperCase() || p.name?.[0]?.toUpperCase() || 'PT';
            const age = calculateAge(p.dateOfBirth);

            return (
              <div
                key={p.patientId || p._id}
                className="bg-white rounded-3xl border border-slate-100 shadow-2xs hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex flex-col overflow-hidden group"
              >
                <div className="p-6 flex-1 space-y-4">
                  {/* Top Demographics */}
                  <div className="flex items-start gap-4">
                    <div className="relative">
                      {p.avatarUrl ? (
                        <img
                          src={p.avatarUrl}
                          alt={p.name}
                          className="w-14 h-14 rounded-2xl object-cover border border-slate-100 shadow-2xs"
                        />
                      ) : (
                        <div className="w-14 h-14 rounded-2xl bg-[#101044]/5 text-[#101044] border border-[#101044]/10 flex items-center justify-center font-bold text-base shadow-2xs uppercase">
                          {initials}
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <h3 className="text-base font-bold text-[#101044] truncate group-hover:text-indigo-600 transition-colors">
                        {p.name}
                      </h3>
                      <div className="flex flex-wrap items-center gap-1.5 mt-1">
                        {p.bloodGroup && p.bloodGroup !== 'Not Specified' && (
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200/60">
                            {p.bloodGroup}
                          </span>
                        )}
                        {p.gender && p.gender !== 'Not Specified' && (
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-slate-100 text-slate-600 capitalize">
                            {p.gender}
                          </span>
                        )}
                        {age !== null && (
                          <span className="text-[11px] text-slate-400 font-medium">{age} yrs</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Contact Info */}
                  <div className="space-y-1.5 text-xs text-slate-500 pt-3 border-t border-slate-100">
                    {p.email && (
                      <div className="flex items-center gap-2 truncate">
                        <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">{p.email}</span>
                      </div>
                    )}
                    {p.phone && p.phone !== 'Not Provided' && (
                      <div className="flex items-center gap-2">
                        <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>{p.phone}</span>
                      </div>
                    )}
                  </div>

                  {/* Consultation Stats Box */}
                  <div className="bg-slate-50/80 rounded-2xl p-3.5 grid grid-cols-2 gap-2 text-xs border border-slate-100">
                    <div>
                      <p className="text-slate-400 font-medium text-[11px]">Completed Visits</p>
                      <p className="text-[#101044] font-extrabold mt-0.5">
                        {p.totalCompletedAppointments} {p.totalCompletedAppointments === 1 ? 'visit' : 'visits'}
                      </p>
                    </div>
                    <div>
                      <p className="text-slate-400 font-medium text-[11px]">Last Visit</p>
                      <p className="text-[#101044] font-extrabold mt-0.5 truncate">
                        {p.lastAppointmentDate
                          ? new Date(p.lastAppointmentDate).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                            })
                          : 'Recent'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Card Action */}
                <div className="p-4 bg-slate-50/50 border-t border-slate-100">
                  <button
                    onClick={() => openPatientHistory(p.patientId || p._id)}
                    className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-[#101044] hover:bg-indigo-950 text-white text-xs font-bold shadow-xs transition-all active:scale-98"
                  >
                    <FileText className="w-3.5 h-3.5 text-emerald-400" />
                    <span>View Clinical Dossier</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Detailed Table View */
        <div className="bg-white rounded-3xl border border-slate-100 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/60 text-slate-400 font-bold uppercase tracking-wider text-[11px] border-b border-slate-100">
                <tr>
                  <th className="py-4 px-5">Patient</th>
                  <th className="py-4 px-5">Contact Details</th>
                  <th className="py-4 px-5">Demographics</th>
                  <th className="py-4 px-5">Consultations</th>
                  <th className="py-4 px-5">Latest Visit</th>
                  <th className="py-4 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredPatients.map((p) => {
                  const initials = `${p.firstName?.[0] || ''}${p.lastName?.[0] || ''}`.toUpperCase() || p.name?.[0]?.toUpperCase() || 'PT';
                  const age = calculateAge(p.dateOfBirth);

                  return (
                    <tr key={p.patientId || p._id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-4 px-5">
                        <div className="flex items-center gap-3">
                          {p.avatarUrl ? (
                            <img
                              src={p.avatarUrl}
                              alt={p.name}
                              className="w-10 h-10 rounded-xl object-cover border border-slate-100"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs uppercase">
                              {initials}
                            </div>
                          )}
                          <div>
                            <p className="font-bold text-[#101044] text-xs sm:text-sm">{p.name}</p>
                            <p className="text-[11px] text-slate-400">ID: {p.patientId?.slice(-6)}</p>
                          </div>
                        </div>
                      </td>

                      <td className="py-4 px-5">
                        <p className="text-slate-800 font-medium">{p.email}</p>
                        <p className="text-slate-400 text-[11px] mt-0.5">{p.phone}</p>
                      </td>

                      <td className="py-4 px-5">
                        <div className="flex items-center gap-1.5">
                          {p.bloodGroup && (
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-100">
                              {p.bloodGroup}
                            </span>
                          )}
                          <span className="capitalize text-slate-600 font-medium">{p.gender}</span>
                          {age !== null && <span className="text-slate-400">({age}y)</span>}
                        </div>
                      </td>

                      <td className="py-4 px-5">
                        <span className="font-extrabold text-[#101044]">{p.totalCompletedAppointments}</span>
                        <span className="text-slate-400 ml-1">visits</span>
                      </td>

                      <td className="py-4 px-5">
                        <p className="font-bold text-slate-800">
                          {p.lastAppointmentDate
                            ? new Date(p.lastAppointmentDate).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric',
                              })
                            : '-'}
                        </p>
                        <p className="text-[11px] text-slate-400">{p.lastAppointmentTime}</p>
                      </td>

                      <td className="py-4 px-5 text-right">
                        <button
                          onClick={() => openPatientHistory(p.patientId || p._id)}
                          className="px-3.5 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold transition shadow-2xs"
                        >
                          Clinical Dossier
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Patient Clinical Dossier Drawer */}
      {selectedPatientId && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-[#101044]/40 backdrop-blur-sm flex justify-end transition-opacity">
          <div className="w-full max-w-3xl bg-white min-h-screen shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
            {/* Drawer Header */}
            <div className="sticky top-0 bg-white z-10 border-b border-slate-100 px-6 py-5 flex items-center justify-between shadow-2xs">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 border border-indigo-100/60 flex items-center justify-center text-lg">
                  <Activity className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-[#101044]">Patient Clinical Dossier</h2>
                  <p className="text-xs text-slate-500">
                    Confidential medical record isolated to your consultations
                  </p>
                </div>
              </div>
              <button
                onClick={closePatientHistory}
                className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Drawer Body */}
            <div className="p-6 flex-1 overflow-y-auto space-y-6">
              {historyLoading ? (
                <div className="flex flex-col items-center justify-center py-24 space-y-3">
                  <Loader2 className="w-9 h-9 border-indigo-600 animate-spin text-indigo-600" />
                  <p className="text-xs font-medium text-slate-400">Loading confidential medical records...</p>
                </div>
              ) : !historyData ? (
                <div className="text-center py-16">
                  <p className="text-xs text-slate-500">Failed to load patient history.</p>
                </div>
              ) : (
                <>
                  {/* Patient Profile Card */}
                  <div className="bg-slate-50/80 rounded-3xl p-5 border border-slate-100 space-y-4">
                    <div className="flex items-center gap-4">
                      {historyData.patient.avatarUrl ? (
                        <img
                          src={historyData.patient.avatarUrl}
                          alt={historyData.patient.name}
                          className="w-14 h-14 rounded-2xl object-cover border border-slate-200 shadow-2xs"
                        />
                      ) : (
                        <div className="w-14 h-14 rounded-2xl bg-[#101044]/5 text-[#101044] border border-[#101044]/10 flex items-center justify-center font-bold text-base uppercase">
                          {historyData.patient.name?.[0] || 'P'}
                        </div>
                      )}
                      <div>
                        <h3 className="text-base font-bold text-[#101044]">{historyData.patient.name}</h3>
                        <p className="text-xs text-slate-500 mt-0.5">
                          {historyData.patient.gender} •{' '}
                          {calculateAge(historyData.patient.dateOfBirth)
                            ? `${calculateAge(historyData.patient.dateOfBirth)} years old`
                            : 'Age unspecified'}{' '}
                          • Blood Group:{' '}
                          <span className="font-bold text-rose-600">{historyData.patient.bloodGroup}</span>
                        </p>
                        <p className="text-xs text-slate-400 mt-0.5">
                          {historyData.patient.email} | {historyData.patient.phone}
                        </p>
                      </div>
                    </div>

                    {/* Medical Tags (Allergies, Chronic, Meds) */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-3 border-t border-slate-200/60 text-xs">
                      {/* Allergies */}
                      <div className="bg-white p-3.5 rounded-2xl border border-slate-200/70 shadow-2xs">
                        <p className="font-bold text-rose-700 flex items-center gap-1.5 mb-1 text-[11px]">
                          <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />
                          Known Allergies
                        </p>
                        {historyData.patient.allergies && historyData.patient.allergies.length > 0 ? (
                          <div className="flex flex-wrap gap-1 mt-1">
                            {historyData.patient.allergies.map((a, i) => (
                              <span
                                key={i}
                                className="px-2 py-0.5 bg-rose-50 text-rose-700 border border-rose-100 rounded text-[10px] font-bold"
                              >
                                {a}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <p className="text-slate-400 italic text-[11px]">None recorded</p>
                        )}
                      </div>

                      {/* Chronic Conditions */}
                      <div className="bg-white p-3.5 rounded-2xl border border-slate-200/70 shadow-2xs">
                        <p className="font-bold text-amber-700 flex items-center gap-1.5 mb-1 text-[11px]">
                          <HeartPulse className="w-3.5 h-3.5 text-amber-500" />
                          Chronic Conditions
                        </p>
                        {historyData.patient.chronicConditions && historyData.patient.chronicConditions.length > 0 ? (
                          <div className="flex flex-wrap gap-1 mt-1">
                            {historyData.patient.chronicConditions.map((c, i) => (
                              <span
                                key={i}
                                className="px-2 py-0.5 bg-amber-50 text-amber-700 border border-amber-100 rounded text-[10px] font-bold"
                              >
                                {c}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <p className="text-slate-400 italic text-[11px]">None recorded</p>
                        )}
                      </div>

                      {/* Emergency Contact */}
                      <div className="bg-white p-3.5 rounded-2xl border border-slate-200/70 shadow-2xs">
                        <p className="font-bold text-slate-700 flex items-center gap-1.5 mb-1 text-[11px]">
                          <Phone className="w-3.5 h-3.5 text-slate-400" />
                          Emergency Contact
                        </p>
                        {historyData.patient.emergencyContact?.name ? (
                          <div>
                            <p className="text-slate-800 font-bold text-xs">
                              {historyData.patient.emergencyContact.name}{' '}
                              <span className="text-[10px] text-slate-400 font-normal">
                                ({historyData.patient.emergencyContact.relationship || 'Contact'})
                              </span>
                            </p>
                            <p className="text-slate-500 text-[11px] mt-0.5">{historyData.patient.emergencyContact.phone}</p>
                          </div>
                        ) : (
                          <p className="text-slate-400 italic text-[11px]">Not provided</p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Consultations Timeline */}
                  <div className="space-y-4">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      Your Consultations with this Patient ({historyData.consultations?.length || 0})
                    </h4>

                    {(!historyData.consultations || historyData.consultations.length === 0) ? (
                      <div className="p-8 text-center bg-slate-50 rounded-2xl border border-slate-200">
                        <p className="text-xs text-slate-500">No consultations on file.</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {historyData.consultations.map((c, index) => {
                          const hasPrescriptions = Array.isArray(c.prescriptions) && c.prescriptions.length > 0;
                          const hasFiles = Array.isArray(c.consultationFiles) && c.consultationFiles.length > 0;

                          return (
                            <div
                              key={c.id || c.appointmentId || index}
                              className="bg-white rounded-3xl border border-slate-100 p-5 sm:p-6 shadow-2xs space-y-4"
                            >
                              {/* Consultation Item Header */}
                              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
                                <div className="flex items-center gap-2.5">
                                  <span className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center text-xs font-bold">
                                    #{index + 1}
                                  </span>
                                  <div>
                                    <p className="text-sm font-bold text-[#101044]">
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
                                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold ${
                                      c.consultationType === 'offline' || c.consultationType === 'physical'
                                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/60'
                                        : 'bg-blue-50 text-blue-700 border border-blue-200/60'
                                    }`}
                                  >
                                    {c.consultationType === 'offline' || c.consultationType === 'physical' ? <Building2 className="w-3 h-3" /> : <Video className="w-3 h-3" />}
                                    <span>{c.consultationType === 'offline' || c.consultationType === 'physical' ? 'In-Person' : 'Video Call'}</span>
                                  </span>

                                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                    <span>Completed</span>
                                  </span>
                                </div>
                              </div>

                              {/* Doctor's Clinical Notes */}
                              {c.clinicalNotes ? (
                                <div className="bg-indigo-50/40 rounded-2xl p-4 border border-indigo-100/60">
                                  <p className="text-xs font-bold text-indigo-950 mb-1 flex items-center gap-1.5">
                                    <Stethoscope className="w-4 h-4 text-indigo-600" />
                                    <span>Clinical Notes & Observations</span>
                                  </p>
                                  <p className="text-xs text-slate-700 whitespace-pre-wrap leading-relaxed">
                                    {c.clinicalNotes}
                                  </p>
                                </div>
                              ) : (
                                <div className="bg-slate-50 rounded-2xl p-3.5 border border-slate-100 text-slate-400 text-xs italic">
                                  No clinical notes recorded for this visit.
                                </div>
                              )}

                              {/* Prescriptions Issued */}
                              {hasPrescriptions && (
                                <div className="space-y-3">
                                  <div className="flex items-center justify-between">
                                    <h5 className="text-xs font-bold text-[#101044] uppercase tracking-wider flex items-center gap-1.5">
                                      <Pill className="w-4 h-4 text-indigo-600" />
                                      <span>Prescriptions Issued ({c.prescriptions.length})</span>
                                    </h5>
                                    <button
                                      onClick={() => handleDownloadPrescriptionPdf(c, historyData.patient)}
                                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold transition shadow-2xs"
                                    >
                                      <Download className="w-3.5 h-3.5" />
                                      <span>Download PDF</span>
                                    </button>
                                  </div>

                                  <div className="overflow-x-auto rounded-2xl border border-slate-100">
                                    <table className="w-full text-left text-xs">
                                      <thead className="bg-slate-50 text-slate-400 font-bold uppercase tracking-wider text-[10px] border-b border-slate-100">
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
                                            <td className="py-2.5 px-3 font-bold text-[#101044]">{rx.medicine}</td>
                                            <td className="py-2.5 px-3 font-medium">{rx.dosage || '-'}</td>
                                            <td className="py-2.5 px-3 font-semibold text-indigo-600">{rx.frequency || '-'}</td>
                                            <td className="py-2.5 px-3">{rx.duration || '-'}</td>
                                            <td className="py-2.5 px-3 text-slate-500 italic">{rx.instructions || '-'}</td>
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
                                    <Paperclip className="w-4 h-4 text-slate-400" />
                                    <span>Attached Documents ({c.consultationFiles.length})</span>
                                  </p>
                                  <div className="flex flex-wrap gap-2">
                                    {c.consultationFiles.map((file, fIdx) => (
                                      <a
                                        key={fIdx}
                                        href={file.url || file.fileUrl || '#'}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium transition shadow-2xs"
                                      >
                                        <FileText className="w-3.5 h-3.5 text-slate-500" />
                                        <span className="truncate max-w-[180px]">{file.name || 'Attachment'}</span>
                                        <ExternalLink className="w-3 h-3 text-slate-400" />
                                      </a>
                                    ))}
                                  </div>
                                </div>
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

            {/* Drawer Sticky Footer */}
            <div className="sticky bottom-0 bg-slate-50/80 backdrop-blur-md border-t border-slate-100 p-4 sm:p-5 flex justify-end">
              <button
                onClick={closePatientHistory}
                className="px-6 py-2.5 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-bold transition shadow-2xs"
              >
                Close Dossier
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
