'use client';

// src/app/patient/(protected)/my-doctors/page.tsx
import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import axiosInstance from '@/api/axiosInstance';
import { generatePrescriptionPdf } from '@/utils/generatePrescriptionPdf';
import { useAppSelector } from '@/redux/hooks';
import toast from 'react-hot-toast';
import { deduceSystemOfMedicine, extractPrimaryQualifications } from '@/constants/systemsOfMedicine';
import {
  Stethoscope,
  Calendar,
  Clock,
  Search,
  X,
  Star,
  Award,
  FileText,
  Pill,
  Download,
  ExternalLink,
  ChevronRight,
  UserCheck,
  MapPin,
  Video,
  Building,
  CheckCircle2,
  CalendarPlus,
  Loader2,
  Paperclip,
  User,
  Users
} from 'lucide-react';

interface DoctorItem {
  _id: string;
  doctorId: string;
  firstName: string;
  lastName: string;
  name: string;
  specialty: string;
  systemOfMedicine?: string;
  qualifications?: any[];
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
    systemOfMedicine?: string;
    qualifications?: any[];
    bio?: string;
    phone?: string;
  };
  totalConsultations: number;
  consultations: ConsultationRecord[];
}

function formatDoctorQualifications(qualifications: any): string {
  if (!qualifications) return '';
  if (typeof qualifications === 'string') return qualifications.trim();
  if (Array.isArray(qualifications)) {
    return qualifications
      .map((q: any) => {
        if (!q) return '';
        if (typeof q === 'string') return q.trim();
        if (typeof q === 'object') {
          return (q.degree || q.name || q.qualification || q.institution || '').trim();
        }
        return String(q).trim();
      })
      .filter(Boolean)
      .join(', ');
  }
  return '';
}

export default function MyDoctorsPage() {
  const { user } = useAppSelector((state) => state.auth);
  const [doctors, setDoctors] = useState<DoctorItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('all');

  // History slide-over state
  const [selectedDoctorId, setSelectedDoctorId] = useState<string | null>(null);
  const [historyData, setHistoryData] = useState<DoctorHistoryData | null>(null);
  const [historyLoading, setHistoryLoading] = useState(false);

  useEffect(() => {
    fetchMyDoctors();
  }, []);

  const fetchMyDoctors = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get('/api/patient/my-doctors');
      if (res.data && res.data.success) {
        setDoctors(res.data.data.doctors || []);
      }
    } catch (err: any) {
      console.error('Failed to fetch consulted doctors:', err);
      toast.error(err.response?.data?.message || 'Failed to load consulted doctors');
    } finally {
      setLoading(false);
    }
  };

  const openHistoryModal = async (doctorId: string) => {
    setSelectedDoctorId(doctorId);
    setHistoryLoading(true);
    try {
      const res = await axiosInstance.get(`/api/patient/my-doctors/${doctorId}/history`);
      if (res.data && res.data.success) {
        setHistoryData(res.data.data);
      }
    } catch (err: any) {
      console.error('Failed to load consultation history:', err);
      toast.error(err.response?.data?.message || 'Failed to load consultation history');
      setSelectedDoctorId(null);
    } finally {
      setHistoryLoading(false);
    }
  };

  const closeHistoryModal = () => {
    setSelectedDoctorId(null);
    setHistoryData(null);
  };

  const handleDownloadPdf = (consultation: ConsultationRecord, doctor: any) => {
    const patientName = user?.name || (user as any)?.googleName || user?.email || 'Patient';
    generatePrescriptionPdf({
      appointmentId: consultation.appointmentId,
      date: new Date(consultation.appointmentDate).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      }),
      time: consultation.appointmentTime,
      consultationType:
        consultation.consultationType === 'offline' || consultation.consultationType === 'physical'
          ? 'In-Person Consultation'
          : 'Online Video Consultation',
      patient: {
        name: patientName,
      },
      doctor: {
        name: doctor.name || `Dr. ${doctor.firstName || ''} ${doctor.lastName || ''}`.trim(),
        specialty: doctor.specialty || 'General Practice',
        qualifications: doctor.qualifications,
        clinicName:
          doctor.consultationSettings?.offline?.clinicName ||
          doctor.consultationSettings?.physical?.clinicName,
      },
      prescriptions: (consultation.prescriptions || []).map((rx, idx) => ({
        id: rx.id || String(idx),
        medicine: rx.medicine || '',
        dosage: rx.dosage || '',
        frequency: rx.frequency || '',
        duration: rx.duration || '',
        instructions: rx.instructions || '',
        prescribedBy: rx.prescribedBy || doctor.name || 'Doctor',
        date: rx.date || consultation.appointmentDate || new Date().toISOString(),
      })),
      clinicalAdvice:
        consultation.clinicalAdvice ||
        'Take medications strictly as directed. Contact your doctor if symptoms persist.',
    });
  };

  const specialties = useMemo(() => {
    const set = new Set<string>();
    doctors.forEach((d) => {
      if (d.specialty) set.add(d.specialty);
    });
    return Array.from(set);
  }, [doctors]);

  const filteredDoctors = useMemo(() => {
    return doctors.filter((doc) => {
      const fullName = (doc.name || `${doc.firstName || ''} ${doc.lastName || ''}`).toLowerCase();
      const spec = (doc.specialty || '').toLowerCase();
      const q = searchQuery.toLowerCase().trim();

      const matchesSearch = !q || fullName.includes(q) || spec.includes(q);
      const matchesSpecialty = selectedSpecialty === 'all' || doc.specialty === selectedSpecialty;

      return matchesSearch && matchesSpecialty;
    });
  }, [doctors, searchQuery, selectedSpecialty]);

  const totalConsultationsSum = useMemo(() => {
    return doctors.reduce((sum, d) => sum + (d.totalConsultations || 0), 0);
  }, [doctors]);

  return (
    <div className="pat-page" style={{ maxWidth: 1100, margin: '0 auto' }}>
      {/* ── Page Header ── */}
      <div className="pat-page-header">
        <div>
          <h1>My Consulted Doctors</h1>
          <p>Your trusted care specialists, previous consultations, and 1-click rebooking.</p>
        </div>
        <Link href="/patient/find-doctor" className="pat-btn pat-btn-primary pat-btn-lg">
          <Stethoscope size={16} />
          <span>Find New Doctors</span>
        </Link>
      </div>

      {/* ── Stats Counter Bar ── */}
      <div className="pat-stats-grid" style={{ marginBottom: 24 }}>
        <div className="pat-stat-card indigo">
          <div className="pat-stat-icon-wrap">
            <Users size={20} />
          </div>
          <div className="pat-stat-value">{doctors.length}</div>
          <div className="pat-stat-label">Total Doctors</div>
        </div>

        <div className="pat-stat-card emerald">
          <div className="pat-stat-icon-wrap">
            <Calendar size={20} />
          </div>
          <div className="pat-stat-value">{totalConsultationsSum}</div>
          <div className="pat-stat-label">Consultations Completed</div>
        </div>

        <div className="pat-stat-card sky">
          <div className="pat-stat-icon-wrap">
            <Clock size={20} />
          </div>
          <div className="pat-stat-value" style={{ fontSize: '1.25rem', paddingTop: 6 }}>
            {doctors.length > 0 && doctors[0].lastConsultationDate
              ? new Date(doctors[0].lastConsultationDate).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })
              : 'None yet'}
          </div>
          <div className="pat-stat-label">Last Consultation</div>
        </div>
      </div>

      {/* ── Search & Specialty Filters ── */}
      <div
        className="pat-card"
        style={{
          padding: 14,
          marginBottom: 24,
          display: 'flex',
          flexDirection: 'row',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 12
        }}
      >
        <div style={{ position: 'relative', flex: '1 1 280px', maxWidth: 380 }}>
          <Search
            size={16}
            style={{
              position: 'absolute',
              left: 12,
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'var(--pat-muted)'
            }}
          />
          <input
            type="text"
            placeholder="Search by doctor name or specialty..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '9px 36px 9px 36px',
              borderRadius: 12,
              border: '1.5px solid var(--pat-border)',
              background: '#f8fafc',
              fontSize: '0.84rem',
              outline: 'none',
              boxSizing: 'border-box',
              color: 'var(--pat-text)',
              fontFamily: 'inherit'
            }}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              style={{
                position: 'absolute',
                right: 10,
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'none',
                border: 'none',
                color: 'var(--pat-muted)',
                cursor: 'pointer',
                padding: 4
              }}
            >
              <X size={14} />
            </button>
          )}
        </div>

        {specialties.length > 0 && (
          <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 2 }}>
            <button
              onClick={() => setSelectedSpecialty('all')}
              style={{
                padding: '6px 14px',
                borderRadius: 999,
                fontSize: '0.78rem',
                fontWeight: 700,
                border: selectedSpecialty === 'all' ? '1px solid var(--pat-primary)' : '1px solid var(--pat-border)',
                background: selectedSpecialty === 'all' ? 'var(--pat-primary)' : 'var(--pat-surface)',
                color: selectedSpecialty === 'all' ? '#fff' : 'var(--pat-text-soft)',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'all 0.15s ease'
              }}
            >
              All Specialties
            </button>
            {specialties.map((spec) => (
              <button
                key={spec}
                onClick={() => setSelectedSpecialty(spec)}
                style={{
                  padding: '6px 14px',
                  borderRadius: 999,
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  border: selectedSpecialty === spec ? '1px solid var(--pat-primary)' : '1px solid var(--pat-border)',
                  background: selectedSpecialty === spec ? 'var(--pat-primary)' : 'var(--pat-surface)',
                  color: selectedSpecialty === spec ? '#fff' : 'var(--pat-text-soft)',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.15s ease'
                }}
              >
                {spec}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ── Doctor Cards Grid ── */}
      {loading ? (
        <div className="pat-card" style={{ padding: 48, textAlign: 'center' }}>
          <Loader2 size={36} className="animate-spin" style={{ margin: '0 auto 12px', color: 'var(--pat-primary)' }} />
          <p style={{ color: 'var(--pat-text-soft)', fontSize: '0.9rem' }}>Loading your consulted doctors...</p>
        </div>
      ) : filteredDoctors.length === 0 ? (
        <div className="pat-card pat-empty">
          <div className="pat-empty-icon">
            <Stethoscope size={30} />
          </div>
          <h3>{searchQuery ? 'No matching doctors found' : 'No Consulted Doctors Yet'}</h3>
          <p>
            {searchQuery
              ? `No doctors found matching "${searchQuery}".`
              : 'Doctors you consult with through video calls or clinic visits will be saved here for instant rebooking and record access.'}
          </p>
          <Link href="/patient/find-doctor" className="pat-btn pat-btn-primary" style={{ marginTop: 12 }}>
            <Search size={15} />
            <span>Find a Specialist Now</span>
          </Link>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 20 }}>
          {filteredDoctors.map((doc) => {
            const rawName = doc.name || `${doc.firstName || ''} ${doc.lastName || ''}`.trim();
            const doctorName = rawName.toLowerCase().startsWith('dr.') ? rawName : `Dr. ${rawName}`;
            const primaryDeg = extractPrimaryQualifications(doc.qualifications);
            const system = doc.systemOfMedicine || deduceSystemOfMedicine(doc.qualifications);

            return (
              <div
                key={doc._id || doc.doctorId}
                className="pat-card"
                style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}
              >
                <div style={{ padding: 20 }}>
                  {/* Doctor Info Row */}
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
                    <div
                      style={{
                        width: 56,
                        height: 56,
                        borderRadius: 16,
                        background: 'linear-gradient(135deg, #ede9fe, #dbeafe)',
                        color: 'var(--pat-primary)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '1.2rem',
                        fontWeight: 800,
                        overflow: 'hidden',
                        flexShrink: 0,
                        border: '1px solid rgba(79,70,229,0.15)'
                      }}
                    >
                      {doc.avatarUrl ? (
                        <img src={doc.avatarUrl} alt={doctorName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        <span>{doc.firstName?.[0] || 'DR'}</span>
                      )}
                    </div>

                    <div style={{ minWidth: 0, flex: 1 }}>
                      <h3 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--pat-text)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {doctorName}
                      </h3>
                      {primaryDeg && (
                        <p style={{ fontSize: '0.74rem', color: 'var(--pat-text-soft)', margin: '2px 0 0' }}>
                          {primaryDeg}
                        </p>
                      )}
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap', marginTop: 6 }}>
                        <span
                          style={{
                            fontSize: '0.7rem',
                            fontWeight: 700,
                            padding: '2px 8px',
                            borderRadius: 999,
                            background: '#ede9fe',
                            color: 'var(--pat-primary)'
                          }}
                        >
                          {doc.specialty || 'General Physician'}
                        </span>
                        {system && (
                          <span
                            style={{
                              fontSize: '0.7rem',
                              fontWeight: 600,
                              padding: '2px 7px',
                              borderRadius: 999,
                              background: '#f1f5f9',
                              color: 'var(--pat-text-soft)'
                            }}
                          >
                            {system}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Rating & Consultations Count */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginTop: 16,
                      padding: '10px 14px',
                      borderRadius: 12,
                      background: '#f8fafc',
                      border: '1px solid var(--pat-border)',
                      fontSize: '0.78rem'
                    }}
                  >
                    <div>
                      <span style={{ color: 'var(--pat-muted)', fontSize: '0.7rem', display: 'block', textTransform: 'uppercase', fontWeight: 700 }}>
                        Visits
                      </span>
                      <strong style={{ color: 'var(--pat-text)', fontSize: '0.86rem' }}>
                        {doc.totalConsultations} {doc.totalConsultations === 1 ? 'visit' : 'visits'}
                      </strong>
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      <span style={{ color: 'var(--pat-muted)', fontSize: '0.7rem', display: 'block', textTransform: 'uppercase', fontWeight: 700 }}>
                        Last Consulted
                      </span>
                      <strong style={{ color: 'var(--pat-text)', fontSize: '0.86rem' }}>
                        {doc.lastConsultationDate
                          ? new Date(doc.lastConsultationDate).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric'
                            })
                          : 'Recent'}
                      </strong>
                    </div>
                  </div>
                </div>

                {/* Card Action Buttons */}
                <div
                  style={{
                    padding: '14px 20px',
                    borderTop: '1px solid var(--pat-border)',
                    background: '#fafbff',
                    display: 'flex',
                    gap: 10
                  }}
                >
                  <button
                    onClick={() => openHistoryModal(doc.doctorId || doc._id)}
                    className="pat-btn pat-btn-outline pat-btn-sm"
                    style={{ flex: 1, justifyContent: 'center' }}
                  >
                    <FileText size={14} />
                    <span>Records</span>
                  </button>
                  <Link
                    href={`/patient/find-doctor/book/${doc.doctorId || doc._id}`}
                    className="pat-btn pat-btn-primary pat-btn-sm"
                    style={{ flex: 1, justifyContent: 'center' }}
                  >
                    <CalendarPlus size={14} />
                    <span>Book Again</span>
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Consultation History Slide-Over / Modal ── */}
      {selectedDoctorId && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 1000,
            backgroundColor: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(6px)',
            display: 'flex',
            justifyContent: 'flex-end',
            animation: 'patFadeUp 0.2s ease'
          }}
          onClick={closeHistoryModal}
        >
          <div
            style={{
              width: '100%',
              maxWidth: 720,
              background: '#fff',
              height: '100%',
              boxShadow: '-8px 0 32px rgba(0,0,0,0.2)',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div
              style={{
                padding: '20px 24px',
                borderBottom: '1px solid var(--pat-border)',
                background: 'linear-gradient(to right, #fafbff, #fff)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexShrink: 0
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div
                  style={{
                    width: 38,
                    height: 38,
                    borderRadius: 10,
                    background: '#ede9fe',
                    color: 'var(--pat-primary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <Stethoscope size={18} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--pat-text)', margin: 0 }}>
                    Consultation History & Prescriptions
                  </h3>
                  <p style={{ fontSize: '0.74rem', color: 'var(--pat-text-soft)', margin: '2px 0 0' }}>
                    Visits and documents with this doctor
                  </p>
                </div>
              </div>

              <button
                onClick={closeHistoryModal}
                style={{
                  background: '#f1f5f9',
                  border: 'none',
                  borderRadius: 10,
                  width: 32,
                  height: 32,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  color: 'var(--pat-text-soft)'
                }}
              >
                <X size={16} />
              </button>
            </div>

            {/* Scrollable Body */}
            <div style={{ flex: 1, overflowY: 'auto', padding: 24 }}>
              {historyLoading ? (
                <div style={{ textAlign: 'center', padding: 48 }}>
                  <Loader2 size={36} className="animate-spin" style={{ margin: '0 auto 12px', color: 'var(--pat-primary)' }} />
                  <p style={{ color: 'var(--pat-text-soft)', fontSize: '0.88rem' }}>Loading consultation records...</p>
                </div>
              ) : !historyData ? (
                <div style={{ textAlign: 'center', padding: 48 }}>
                  <p style={{ color: 'var(--pat-text-soft)' }}>Failed to load records.</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                  {/* Doctor Profile Banner */}
                  <div
                    style={{
                      padding: 18,
                      borderRadius: 16,
                      background: 'linear-gradient(135deg, #ede9fe, #dbeafe)',
                      border: '1px solid rgba(79,70,229,0.2)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      flexWrap: 'wrap',
                      gap: 14
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div
                        style={{
                          width: 52,
                          height: 52,
                          borderRadius: 14,
                          background: 'var(--pat-primary)',
                          color: '#fff',
                          fontWeight: 800,
                          fontSize: '1.2rem',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          overflow: 'hidden'
                        }}
                      >
                        {historyData.doctor?.avatarUrl ? (
                          <img src={historyData.doctor.avatarUrl} alt={historyData.doctor.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                          <span>{historyData.doctor?.firstName?.[0] || 'D'}</span>
                        )}
                      </div>
                      <div>
                        <h4 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--pat-text)', margin: 0 }}>
                          {historyData.doctor?.name}
                        </h4>
                        <p style={{ fontSize: '0.78rem', color: 'var(--pat-primary)', fontWeight: 600, margin: '2px 0 0' }}>
                          {historyData.doctor?.specialty}
                        </p>
                      </div>
                    </div>

                    <Link
                      href={`/patient/find-doctor/book/${historyData.doctor?.doctorId || historyData.doctor?.id}`}
                      className="pat-btn pat-btn-primary pat-btn-sm"
                    >
                      <CalendarPlus size={14} />
                      <span>Book New Appointment</span>
                    </Link>
                  </div>

                  {/* Consultation Timeline */}
                  <div>
                    <h5 style={{ fontSize: '0.78rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--pat-muted)', marginBottom: 14 }}>
                      Past Consultations ({historyData.consultations?.length || 0})
                    </h5>

                    {(!historyData.consultations || historyData.consultations.length === 0) ? (
                      <div className="pat-card pat-empty" style={{ padding: 36 }}>
                        <p style={{ color: 'var(--pat-text-soft)', fontSize: '0.86rem', margin: 0 }}>
                          No completed consultations found with this doctor.
                        </p>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                        {historyData.consultations.map((c, index) => {
                          const hasPrescriptions = Array.isArray(c.prescriptions) && c.prescriptions.length > 0;
                          const hasFiles = Array.isArray(c.consultationFiles) && c.consultationFiles.length > 0;

                          return (
                            <div key={c.id || c.appointmentId || index} className="pat-card" style={{ padding: 18 }}>
                              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--pat-border)', paddingBottom: 12, marginBottom: 12, flexWrap: 'wrap', gap: 8 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                  <span style={{ fontSize: '0.72rem', fontWeight: 800, background: '#ede9fe', color: 'var(--pat-primary)', padding: '2px 8px', borderRadius: 6 }}>
                                    Visit #{index + 1}
                                  </span>
                                  <strong style={{ fontSize: '0.88rem', color: 'var(--pat-text)' }}>
                                    {new Date(c.appointmentDate).toLocaleDateString('en-US', {
                                      weekday: 'short',
                                      month: 'short',
                                      day: 'numeric',
                                      year: 'numeric'
                                    })}
                                  </strong>
                                  <span style={{ color: 'var(--pat-muted)', fontSize: '0.8rem' }}>• {c.appointmentTime}</span>
                                </div>

                                <div style={{ display: 'flex', gap: 6 }}>
                                  <span className="pat-badge pat-badge-scheduled" style={{ fontSize: '0.68rem' }}>
                                    {c.consultationType === 'offline' || c.consultationType === 'physical' ? 'In-Person' : 'Video Call'}
                                  </span>
                                  <span className="pat-badge pat-badge-completed" style={{ fontSize: '0.68rem' }}>
                                    Completed
                                  </span>
                                </div>
                              </div>

                              {/* Prescriptions */}
                              {hasPrescriptions && (
                                <div style={{ marginBottom: 14 }}>
                                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                                    <span style={{ fontSize: '0.74rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--pat-text)', display: 'flex', alignItems: 'center', gap: 6 }}>
                                      <Pill size={14} style={{ color: 'var(--pat-primary)' }} /> Medications ({c.prescriptions.length})
                                    </span>
                                    <button
                                      onClick={() => handleDownloadPdf(c, historyData.doctor)}
                                      className="pat-btn pat-btn-outline pat-btn-sm"
                                      style={{ padding: '4px 10px', fontSize: '0.72rem' }}
                                    >
                                      <Download size={12} />
                                      <span>Download PDF</span>
                                    </button>
                                  </div>

                                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                                    {c.prescriptions.map((rx, rxIdx) => (
                                      <div
                                        key={rxIdx}
                                        style={{
                                          padding: '8px 12px',
                                          borderRadius: 8,
                                          background: '#f8fafc',
                                          border: '1px solid var(--pat-border)',
                                          display: 'flex',
                                          alignItems: 'center',
                                          justifyContent: 'space-between',
                                          fontSize: '0.78rem'
                                        }}
                                      >
                                        <strong style={{ color: 'var(--pat-text)' }}>{rx.medicine}</strong>
                                        <span style={{ color: 'var(--pat-text-soft)' }}>
                                          {rx.dosage} • {rx.frequency} ({rx.duration})
                                        </span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {/* Consultation Files */}
                              {hasFiles && (
                                <div>
                                  <span style={{ fontSize: '0.74rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--pat-text)', display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                                    <Paperclip size={14} style={{ color: 'var(--pat-teal)' }} /> Attached Documents ({c.consultationFiles.length})
                                  </span>
                                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                                    {c.consultationFiles.map((file, fIdx) => (
                                      <a
                                        key={fIdx}
                                        href={file.url || file.fileUrl || '#'}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        style={{
                                          padding: '6px 12px',
                                          borderRadius: 8,
                                          background: '#f1f5f9',
                                          color: 'var(--pat-text)',
                                          fontSize: '0.74rem',
                                          fontWeight: 600,
                                          textDecoration: 'none',
                                          display: 'inline-flex',
                                          alignItems: 'center',
                                          gap: 6
                                        }}
                                      >
                                        <FileText size={13} style={{ color: 'var(--pat-primary)' }} />
                                        <span>{file.name || 'Document'}</span>
                                        <ExternalLink size={11} style={{ color: 'var(--pat-muted)' }} />
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
                </div>
              )}
            </div>

            {/* Footer */}
            <div
              style={{
                padding: '16px 24px',
                borderTop: '1px solid var(--pat-border)',
                background: '#fafbff',
                display: 'flex',
                justifyContent: 'flex-end',
                flexShrink: 0
              }}
            >
              <button onClick={closeHistoryModal} className="pat-btn pat-btn-outline">
                Close Record
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
