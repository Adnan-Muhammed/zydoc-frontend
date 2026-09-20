'use client';

import React, { useState, useEffect, useMemo } from 'react';
import axiosInstance from '@/api/axiosInstance';
import { generatePrescriptionPdf } from '@/utils/generatePrescriptionPdf';
import { useAppSelector } from '@/redux/hooks';
import toast from 'react-hot-toast';

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
    <div className="min-h-screen bg-slate-50/50 p-4 md:p-8 space-y-8">
      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-100">
              <i className="fas fa-users text-lg"></i>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">My Patients</h1>
              <p className="text-sm text-slate-500 mt-0.5">
                Directory of patients who have completed consultations with you
              </p>
            </div>
          </div>
        </div>

        {/* View Toggle */}
        <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl self-start md:self-auto border border-slate-200">
          <button
            onClick={() => setViewMode('grid')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
              viewMode === 'grid'
                ? 'bg-white text-indigo-600 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <i className="fas fa-grid-2"></i>
            <span>Cards</span>
          </button>
          <button
            onClick={() => setViewMode('table')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
              viewMode === 'table'
                ? 'bg-white text-indigo-600 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <i className="fas fa-list"></i>
            <span>Table</span>
          </button>
        </div>
      </div>

      {/* Privacy Guarantee Alert Banner */}
      <div className="bg-gradient-to-r from-indigo-50/80 via-sky-50/60 to-white rounded-2xl p-4 border border-indigo-100 flex items-start gap-3.5 shadow-xs">
        <div className="w-8 h-8 rounded-lg bg-indigo-600/10 text-indigo-600 flex items-center justify-center shrink-0 mt-0.5">
          <i className="fas fa-shield-halved text-sm"></i>
        </div>
        <div>
          <h4 className="text-xs font-bold text-indigo-950 uppercase tracking-wider">
            Strict Medical Data Isolation Guarantee
          </h4>
          <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
            Patient privacy is legally protected. You have access exclusively to consultations, private clinical notes,
            and prescriptions generated within your own practice for these patients. Records from external providers remain strictly quarantined.
          </p>
        </div>
      </div>

      {/* Stats Counter Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center text-xl">
            <i className="fas fa-user-group"></i>
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Patients</p>
            <p className="text-2xl font-bold text-slate-800">{patients.length}</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-xl">
            <i className="fas fa-stethoscope"></i>
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Completed Sessions</p>
            <p className="text-2xl font-bold text-slate-800">{totalConsultationsSum}</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center text-xl">
            <i className="fas fa-clock-rotate-left"></i>
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Latest Consultation</p>
            <p className="text-sm font-bold text-slate-800 truncate">
              {patients.length > 0 && patients[0].lastAppointmentDate
                ? new Date(patients[0].lastAppointmentDate).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })
                : 'No consultations'}
            </p>
          </div>
        </div>
      </div>

      {/* Search & Filter Controls */}
      <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
        <form onSubmit={handleSearchSubmit} className="relative w-full md:w-96 flex gap-2">
          <div className="relative flex-1">
            <i className="fas fa-search absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm"></i>
            <input
              type="text"
              placeholder="Search by name, email, or phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-8 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors"
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
                <i className="fas fa-times text-xs"></i>
              </button>
            )}
          </div>
          <button
            type="submit"
            className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-xs transition"
          >
            Search
          </button>
        </form>

        <div className="flex items-center gap-3 w-full md:w-auto">
          {/* Gender Filter */}
          <select
            value={genderFilter}
            onChange={(e) => setGenderFilter(e.target.value)}
            className="px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
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
            className="px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
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
            <div key={i} className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm animate-pulse space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-slate-200"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-5 bg-slate-200 rounded w-3/4"></div>
                  <div className="h-3 bg-slate-100 rounded w-1/2"></div>
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
          <h3 className="text-base font-bold text-rose-900">Failed to Load Patients</h3>
          <p className="text-sm text-rose-700 mt-1 mb-4">{error}</p>
          <button
            onClick={() => fetchPatients(searchQuery)}
            className="px-4 py-2 bg-rose-600 text-white text-xs font-semibold rounded-lg hover:bg-rose-700 transition"
          >
            Try Again
          </button>
        </div>
      ) : filteredPatients.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 border border-slate-200/80 shadow-sm text-center max-w-xl mx-auto space-y-4">
          <div className="w-20 h-20 bg-indigo-50 text-indigo-600 rounded-3xl flex items-center justify-center mx-auto text-3xl shadow-inner">
            <i className="fas fa-users-slash"></i>
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-800">
              {searchQuery || genderFilter !== 'all' || bloodGroupFilter !== 'all'
                ? 'No Patients Match Your Filters'
                : 'No Completed Patients Yet'}
            </h3>
            <p className="text-sm text-slate-500 mt-2 max-w-md mx-auto">
              {searchQuery || genderFilter !== 'all' || bloodGroupFilter !== 'all'
                ? 'Try adjusting your search keywords or clearing your gender and blood group filters.'
                : 'Patients who complete appointments with you will automatically be added to your clinical directory with full longitudinal history.'}
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
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-semibold rounded-xl transition"
            >
              <i className="fas fa-rotate-left text-xs"></i>
              Reset Filters
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
                className="bg-white rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col overflow-hidden group"
              >
                <div className="p-6 flex-1 space-y-4">
                  {/* Top Demographics */}
                  <div className="flex items-start gap-4">
                    <div className="relative">
                      {p.avatarUrl ? (
                        <img
                          src={p.avatarUrl}
                          alt={p.name}
                          className="w-14 h-14 rounded-2xl object-cover border border-slate-100 shadow-sm"
                        />
                      ) : (
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-500 to-sky-400 text-white flex items-center justify-center font-bold text-base shadow-sm">
                          {initials}
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <h3 className="text-base font-bold text-slate-900 truncate group-hover:text-indigo-600 transition-colors">
                        {p.name}
                      </h3>
                      <div className="flex items-center gap-2 mt-1">
                        {p.bloodGroup && p.bloodGroup !== 'Not Specified' && (
                          <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-rose-50 text-rose-600 border border-rose-100">
                            {p.bloodGroup}
                          </span>
                        )}
                        {p.gender && p.gender !== 'Not Specified' && (
                          <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-600 capitalize">
                            {p.gender}
                          </span>
                        )}
                        {age !== null && (
                          <span className="text-xs text-slate-400 font-medium">{age} yrs</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Contact Info */}
                  <div className="space-y-1.5 text-xs text-slate-500 pt-2 border-t border-slate-100">
                    {p.email && (
                      <div className="flex items-center gap-2 truncate">
                        <i className="fas fa-envelope text-slate-400 w-4"></i>
                        <span className="truncate">{p.email}</span>
                      </div>
                    )}
                    {p.phone && p.phone !== 'Not Provided' && (
                      <div className="flex items-center gap-2">
                        <i className="fas fa-phone text-slate-400 w-4"></i>
                        <span>{p.phone}</span>
                      </div>
                    )}
                  </div>

                  {/* Consultation Stats Box */}
                  <div className="bg-slate-50 rounded-xl p-3 grid grid-cols-2 gap-2 text-xs border border-slate-100">
                    <div>
                      <p className="text-slate-400 font-medium">Completed Visits</p>
                      <p className="text-slate-800 font-bold mt-0.5">
                        {p.totalCompletedAppointments} {p.totalCompletedAppointments === 1 ? 'visit' : 'visits'}
                      </p>
                    </div>
                    <div>
                      <p className="text-slate-400 font-medium">Last Visit</p>
                      <p className="text-slate-800 font-bold mt-0.5">
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
                <div className="p-4 bg-slate-50/70 border-t border-slate-100">
                  <button
                    onClick={() => openPatientHistory(p.patientId || p._id)}
                    className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs transition hover:shadow-indigo-100"
                  >
                    <i className="fas fa-file-waveform"></i>
                    <span>View Clinical Dossier</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Detailed Table View */
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Patient</th>
                  <th className="py-3 px-4">Contact</th>
                  <th className="py-3 px-4">Demographics</th>
                  <th className="py-3 px-4">Visits</th>
                  <th className="py-3 px-4">Last Visit</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredPatients.map((p) => {
                  const initials = `${p.firstName?.[0] || ''}${p.lastName?.[0] || ''}`.toUpperCase() || p.name?.[0]?.toUpperCase() || 'PT';
                  const age = calculateAge(p.dateOfBirth);

                  return (
                    <tr key={p.patientId || p._id} className="hover:bg-slate-50/50 transition">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          {p.avatarUrl ? (
                            <img
                              src={p.avatarUrl}
                              alt={p.name}
                              className="w-9 h-9 rounded-xl object-cover border border-slate-100"
                            />
                          ) : (
                            <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold text-xs">
                              {initials}
                            </div>
                          )}
                          <div>
                            <p className="font-bold text-slate-900">{p.name}</p>
                            <p className="text-[11px] text-slate-400">ID: {p.patientId?.slice(-6)}</p>
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <p className="text-slate-800">{p.email}</p>
                        <p className="text-slate-400 text-[11px]">{p.phone}</p>
                      </td>

                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1.5">
                          {p.bloodGroup && (
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-rose-50 text-rose-600 border border-rose-100">
                              {p.bloodGroup}
                            </span>
                          )}
                          <span className="capitalize">{p.gender}</span>
                          {age !== null && <span className="text-slate-400">({age}y)</span>}
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <span className="font-bold text-slate-800">{p.totalCompletedAppointments}</span>
                        <span className="text-slate-400 ml-1">visits</span>
                      </td>

                      <td className="py-3 px-4">
                        <p className="font-medium text-slate-800">
                          {p.lastAppointmentDate
                            ? new Date(p.lastAppointmentDate).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric',
                              })
                            : '-'}
                        </p>
                        <p className="text-[10px] text-slate-400">{p.lastAppointmentTime}</p>
                      </td>

                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => openPatientHistory(p.patientId || p._id)}
                          className="px-3 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold transition"
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
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex justify-end transition-opacity">
          <div className="w-full max-w-3xl bg-white min-h-screen shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
            {/* Drawer Header */}
            <div className="sticky top-0 bg-white z-10 border-b border-slate-200 px-6 py-5 flex items-center justify-between shadow-xs">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center text-lg">
                  <i className="fas fa-id-card-clip"></i>
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900">Patient Clinical Dossier</h2>
                  <p className="text-xs text-slate-500">
                    Confidential medical record isolated to your consultations
                  </p>
                </div>
              </div>
              <button
                onClick={closePatientHistory}
                className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition"
              >
                <i className="fas fa-times text-sm"></i>
              </button>
            </div>

            {/* Drawer Body */}
            <div className="p-6 flex-1 overflow-y-auto space-y-6">
              {historyLoading ? (
                <div className="flex flex-col items-center justify-center py-20 space-y-4">
                  <div className="w-10 h-10 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                  <p className="text-sm font-medium text-slate-500">Loading confidential records...</p>
                </div>
              ) : !historyData ? (
                <div className="text-center py-16">
                  <p className="text-sm text-slate-500">Failed to load patient history.</p>
                </div>
              ) : (
                <>
                  {/* Patient Profile Card */}
                  <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200/80 space-y-4">
                    <div className="flex items-center gap-4">
                      {historyData.patient.avatarUrl ? (
                        <img
                          src={historyData.patient.avatarUrl}
                          alt={historyData.patient.name}
                          className="w-14 h-14 rounded-2xl object-cover border border-slate-200"
                        />
                      ) : (
                        <div className="w-14 h-14 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-bold text-base">
                          {historyData.patient.name?.[0] || 'P'}
                        </div>
                      )}
                      <div>
                        <h3 className="text-base font-bold text-slate-900">{historyData.patient.name}</h3>
                        <p className="text-xs text-slate-500">
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
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-3 border-t border-slate-200 text-xs">
                      {/* Allergies */}
                      <div className="bg-white p-3 rounded-xl border border-slate-200">
                        <p className="font-bold text-rose-700 flex items-center gap-1 mb-1">
                          <i className="fas fa-triangle-exclamation text-[10px]"></i>
                          Known Allergies
                        </p>
                        {historyData.patient.allergies && historyData.patient.allergies.length > 0 ? (
                          <div className="flex flex-wrap gap-1 mt-1">
                            {historyData.patient.allergies.map((a, i) => (
                              <span
                                key={i}
                                className="px-2 py-0.5 bg-rose-50 text-rose-700 border border-rose-100 rounded text-[10px] font-semibold"
                              >
                                {a}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <p className="text-slate-400 italic">None recorded</p>
                        )}
                      </div>

                      {/* Chronic Conditions */}
                      <div className="bg-white p-3 rounded-xl border border-slate-200">
                        <p className="font-bold text-amber-700 flex items-center gap-1 mb-1">
                          <i className="fas fa-heart-pulse text-[10px]"></i>
                          Chronic Conditions
                        </p>
                        {historyData.patient.chronicConditions && historyData.patient.chronicConditions.length > 0 ? (
                          <div className="flex flex-wrap gap-1 mt-1">
                            {historyData.patient.chronicConditions.map((c, i) => (
                              <span
                                key={i}
                                className="px-2 py-0.5 bg-amber-50 text-amber-700 border border-amber-100 rounded text-[10px] font-semibold"
                              >
                                {c}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <p className="text-slate-400 italic">None recorded</p>
                        )}
                      </div>

                      {/* Emergency Contact */}
                      <div className="bg-white p-3 rounded-xl border border-slate-200">
                        <p className="font-bold text-slate-700 flex items-center gap-1 mb-1">
                          <i className="fas fa-phone-volume text-[10px] text-slate-400"></i>
                          Emergency Contact
                        </p>
                        {historyData.patient.emergencyContact?.name ? (
                          <div>
                            <p className="text-slate-800 font-semibold">
                              {historyData.patient.emergencyContact.name}{' '}
                              <span className="text-[10px] text-slate-400 font-normal">
                                ({historyData.patient.emergencyContact.relationship || 'Contact'})
                              </span>
                            </p>
                            <p className="text-slate-500">{historyData.patient.emergencyContact.phone}</p>
                          </div>
                        ) : (
                          <p className="text-slate-400 italic">Not provided</p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Consultations Timeline */}
                  <div className="space-y-4">
                    <h4 className="text-sm font-bold uppercase tracking-wider text-slate-400">
                      Your Consultations with this Patient ({historyData.consultations?.length || 0})
                    </h4>

                    {(!historyData.consultations || historyData.consultations.length === 0) ? (
                      <div className="p-8 text-center bg-slate-50 rounded-2xl border border-slate-200">
                        <p className="text-sm text-slate-500">No consultations on file.</p>
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

                              {/* Doctor's Clinical Notes */}
                              {c.clinicalNotes ? (
                                <div className="bg-indigo-50/50 rounded-xl p-3.5 border border-indigo-100">
                                  <p className="text-xs font-bold text-indigo-900 mb-1 flex items-center gap-1.5">
                                    <i className="fas fa-stethoscope text-indigo-600"></i>
                                    Your Clinical Notes & Observations
                                  </p>
                                  <p className="text-xs text-slate-700 whitespace-pre-wrap leading-relaxed">
                                    {c.clinicalNotes}
                                  </p>
                                </div>
                              ) : (
                                <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 text-slate-400 text-xs italic">
                                  No clinical notes recorded for this visit.
                                </div>
                              )}

                              {/* Prescriptions Issued */}
                              {hasPrescriptions && (
                                <div className="space-y-3">
                                  <div className="flex items-center justify-between">
                                    <h5 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                                      <i className="fas fa-pills text-emerald-600"></i>
                                      Prescriptions Issued ({c.prescriptions.length})
                                    </h5>
                                    <button
                                      onClick={() => handleDownloadPrescriptionPdf(c, historyData.patient)}
                                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-semibold transition"
                                    >
                                      <i className="fas fa-file-pdf"></i>
                                      <span>Download PDF</span>
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
            <div className="sticky bottom-0 bg-slate-50 border-t border-slate-200 p-4 flex justify-end">
              <button
                onClick={closePatientHistory}
                className="px-5 py-2.5 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-semibold transition"
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
