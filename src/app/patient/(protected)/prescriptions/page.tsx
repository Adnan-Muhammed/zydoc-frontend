'use client';

// src/app/patient/(protected)/prescriptions/page.tsx
import React, { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { fetchPatientAppointments } from '@/redux/features/appointment/appointmentThunk';
import { generatePrescriptionPdf } from '@/utils/generatePrescriptionPdf';
import {
  Pill,
  FileText,
  Calendar,
  Clock,
  Download,
  Search,
  X,
  Stethoscope,
  Paperclip,
  CheckCircle2,
  FileCheck,
  AlertCircle,
  FileQuestion,
  ChevronRight,
  ExternalLink
} from 'lucide-react';

export default function PatientPrescriptionsPage() {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const { appointments, isLoading } = useAppSelector((state) => state.appointment);

  const [activeTab, setActiveTab] = useState<'all' | 'prescriptions' | 'files'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    dispatch(fetchPatientAppointments());
  }, [dispatch]);

  const patientName = user?.name || (user as any)?.googleName || user?.email || 'Patient';

  const handleDownloadPrescription = (app: any) => {
    if (!app) return;
    const doctor = app.doctorId || {};
    const doctorName = `Dr. ${doctor.firstName || ''} ${doctor.lastName || ''}`.trim() || 'Dr. Consultant';

    generatePrescriptionPdf({
      appointmentId: app._id,
      date: new Date(app.appointmentDate).toDateString(),
      time: app.appointmentTime,
      consultationType:
        app.consultationType === 'offline' || app.consultationType === 'physical'
          ? 'In-Person Consultation'
          : 'Online Video Consultation',
      patient: {
        name: patientName,
      },
      doctor: {
        name: doctorName,
        specialty: doctor.specialty || 'General Practice',
        qualifications: doctor.qualifications,
        clinicName:
          doctor.consultationSettings?.offline?.clinicName ||
          doctor.consultationSettings?.physical?.clinicName,
      },
      prescriptions: app.prescriptions || [],
      clinicalAdvice:
        'Take medications strictly as directed. If symptoms persist or adverse reactions occur, contact your doctor immediately.',
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
      const doctor = app.doctorId || {};
      const doctorName = `${doctor.firstName || ''} ${doctor.lastName || ''}`.toLowerCase();
      const q = searchQuery.toLowerCase().trim();

      let matchesSearch = !q || doctorName.includes(q);

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
    <div className="pat-page" style={{ maxWidth: 1100, margin: '0 auto' }}>
      {/* ── Page Header ── */}
      <div className="pat-page-header">
        <div>
          <h1>Prescriptions & Clinical Documents</h1>
          <p>Access and download your digital e-prescriptions, lab tests, and files issued during consultations.</p>
        </div>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '8px 14px',
              borderRadius: 12,
              background: '#ede9fe',
              color: 'var(--pat-primary)',
              fontSize: '0.82rem',
              fontWeight: 700
            }}
          >
            <Pill size={16} />
            <span>{totalPrescriptions} Medications</span>
          </div>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '8px 14px',
              borderRadius: 12,
              background: '#d1fae5',
              color: '#065f46',
              fontSize: '0.82rem',
              fontWeight: 700
            }}
          >
            <FileText size={16} />
            <span>{totalFiles} Documents</span>
          </div>
        </div>
      </div>

      {/* ── Search & Filter Controls ── */}
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
        {/* Search */}
        <div style={{ position: 'relative', flex: '1 1 280px', maxWidth: 400 }}>
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
            placeholder="Search by doctor, medication, or file..."
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

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 6, background: '#f1f5f9', padding: 4, borderRadius: 12 }}>
          <button
            onClick={() => setActiveTab('all')}
            style={{
              padding: '7px 16px',
              borderRadius: 9,
              border: 'none',
              fontSize: '0.8rem',
              fontWeight: 700,
              cursor: 'pointer',
              background: activeTab === 'all' ? '#fff' : 'transparent',
              color: activeTab === 'all' ? 'var(--pat-primary)' : 'var(--pat-text-soft)',
              boxShadow: activeTab === 'all' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
              transition: 'all 0.15s ease'
            }}
          >
            All Records
          </button>
          <button
            onClick={() => setActiveTab('prescriptions')}
            style={{
              padding: '7px 16px',
              borderRadius: 9,
              border: 'none',
              fontSize: '0.8rem',
              fontWeight: 700,
              cursor: 'pointer',
              background: activeTab === 'prescriptions' ? '#fff' : 'transparent',
              color: activeTab === 'prescriptions' ? 'var(--pat-primary)' : 'var(--pat-text-soft)',
              boxShadow: activeTab === 'prescriptions' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
              transition: 'all 0.15s ease'
            }}
          >
            Prescriptions ({totalPrescriptions})
          </button>
          <button
            onClick={() => setActiveTab('files')}
            style={{
              padding: '7px 16px',
              borderRadius: 9,
              border: 'none',
              fontSize: '0.8rem',
              fontWeight: 700,
              cursor: 'pointer',
              background: activeTab === 'files' ? '#fff' : 'transparent',
              color: activeTab === 'files' ? 'var(--pat-primary)' : 'var(--pat-text-soft)',
              boxShadow: activeTab === 'files' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
              transition: 'all 0.15s ease'
            }}
          >
            Files ({totalFiles})
          </button>
        </div>
      </div>

      {/* ── Content List ── */}
      {isLoading ? (
        <div className="pat-card" style={{ padding: 48, textAlign: 'center' }}>
          <div className="animate-spin" style={{ width: 36, height: 36, border: '3px solid #ede9fe', borderTopColor: 'var(--pat-primary)', borderRadius: '50%', margin: '0 auto 12px' }} />
          <p style={{ color: 'var(--pat-text-soft)', fontSize: '0.9rem' }}>Loading prescriptions & consultation records...</p>
        </div>
      ) : filteredAppointments.length === 0 ? (
        <div className="pat-card pat-empty">
          <div className="pat-empty-icon">
            <FileQuestion size={32} />
          </div>
          <h3>No Prescriptions or Files Found</h3>
          <p>
            {searchQuery
              ? `No consultation records match "${searchQuery}".`
              : 'Prescriptions prescribed by your doctors and documents shared during video consultations will appear here automatically.'}
          </p>
          <Link href="/patient/appointments" className="pat-btn pat-btn-primary" style={{ marginTop: 12 }}>
            <Calendar size={15} />
            <span>View My Appointments</span>
          </Link>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {filteredAppointments.map((app: any) => {
            const doctor = app.doctorId || {};
            const doctorName = `Dr. ${doctor.firstName || ''} ${doctor.lastName || ''}`.trim() || 'Dr. Consultant';
            const appDate = new Date(app.appointmentDate).toLocaleDateString('en-US', {
              weekday: 'short',
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            });
            const hasRx = Array.isArray(app.prescriptions) && app.prescriptions.length > 0;
            const hasFiles = Array.isArray(app.consultationFiles) && app.consultationFiles.length > 0;

            return (
              <div key={app._id} className="pat-card">
                {/* Card Header with Doctor Info and PDF CTA */}
                <div
                  style={{
                    padding: '18px 24px',
                    borderBottom: '1px solid var(--pat-border)',
                    background: 'linear-gradient(to right, #fafbff, #fff)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 16,
                    flexWrap: 'wrap'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                    <div
                      style={{
                        width: 48,
                        height: 48,
                        borderRadius: 14,
                        background: 'linear-gradient(135deg, #4f46e5, #0ea5e9)',
                        color: '#fff',
                        fontWeight: 800,
                        fontSize: '1rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0
                      }}
                    >
                      {doctor.firstName ? doctor.firstName.charAt(0).toUpperCase() : 'DR'}
                    </div>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                        <span style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--pat-text)' }}>
                          {doctorName}
                        </span>
                        <span
                          style={{
                            fontSize: '0.72rem',
                            fontWeight: 700,
                            padding: '3px 8px',
                            borderRadius: 999,
                            background: '#ede9fe',
                            color: 'var(--pat-primary)',
                            border: '1px solid rgba(79,70,229,0.2)'
                          }}
                        >
                          {doctor.specialty || 'Consultant'}
                        </span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: '0.78rem', color: 'var(--pat-text-soft)', marginTop: 4 }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                          <Calendar size={13} style={{ color: 'var(--pat-muted)' }} /> {appDate}
                        </span>
                        <span>•</span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                          <Clock size={13} style={{ color: 'var(--pat-muted)' }} /> {app.appointmentTime}
                        </span>
                      </div>
                    </div>
                  </div>

                  {hasRx && (
                    <button
                      onClick={() => handleDownloadPrescription(app)}
                      className="pat-btn pat-btn-primary pat-btn-sm"
                      style={{ cursor: 'pointer' }}
                    >
                      <Download size={14} />
                      <span>Download e-Prescription PDF</span>
                    </button>
                  )}
                </div>

                {/* Card Body */}
                <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 20 }}>
                  {/* Prescribed Medications */}
                  {hasRx && (activeTab === 'all' || activeTab === 'prescriptions') && (
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                        <Pill size={16} style={{ color: 'var(--pat-primary)' }} />
                        <h4 style={{ fontSize: '0.82rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--pat-text)', margin: 0 }}>
                          Prescribed Medications ({app.prescriptions.length})
                        </h4>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 12 }}>
                        {app.prescriptions.map((rx: any, idx: number) => (
                          <div
                            key={idx}
                            style={{
                              padding: 14,
                              borderRadius: 14,
                              background: '#f8fafc',
                              border: '1px solid var(--pat-border)',
                              display: 'flex',
                              flexDirection: 'column',
                              gap: 8
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <span
                                  style={{
                                    width: 22,
                                    height: 22,
                                    borderRadius: 6,
                                    background: '#ede9fe',
                                    color: 'var(--pat-primary)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '0.72rem',
                                    fontWeight: 800,
                                    flexShrink: 0
                                  }}
                                >
                                  {idx + 1}
                                </span>
                                <span style={{ fontWeight: 800, fontSize: '0.88rem', color: 'var(--pat-text)' }}>
                                  {rx.medicine}
                                </span>
                              </div>
                              <span
                                style={{
                                  fontSize: '0.7rem',
                                  fontWeight: 700,
                                  color: '#065f46',
                                  background: '#d1fae5',
                                  border: '1px solid #a7f3d0',
                                  padding: '2px 8px',
                                  borderRadius: 6,
                                  whiteSpace: 'nowrap'
                                }}
                              >
                                {rx.duration || 'As directed'}
                              </span>
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.78rem', color: 'var(--pat-text-soft)', paddingLeft: 30 }}>
                              <span>Dosage: <strong style={{ color: 'var(--pat-text)' }}>{rx.dosage}</strong></span>
                              <span>•</span>
                              <span style={{ color: 'var(--pat-primary)', fontWeight: 600 }}>{rx.frequency}</span>
                            </div>

                            {rx.instructions && (
                              <p style={{ margin: 0, paddingLeft: 30, fontSize: '0.74rem', color: 'var(--pat-muted)', fontStyle: 'italic' }}>
                                Note: {rx.instructions}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Consultation Documents & Files */}
                  {hasFiles && (activeTab === 'all' || activeTab === 'files') && (
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                        <Paperclip size={16} style={{ color: 'var(--pat-teal)' }} />
                        <h4 style={{ fontSize: '0.82rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--pat-text)', margin: 0 }}>
                          Consultation Documents & Files ({app.consultationFiles.length})
                        </h4>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 12 }}>
                        {app.consultationFiles.map((file: any, fIdx: number) => {
                          const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:5001';
                          const fileUrl = file.url?.startsWith('http')
                            ? file.url
                            : `${baseUrl}${file.url?.startsWith('/') ? '' : '/'}${file.url}`;

                          return (
                            <div
                              key={file.id || fIdx}
                              style={{
                                padding: 14,
                                borderRadius: 14,
                                background: '#f8fafc',
                                border: '1px solid var(--pat-border)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                gap: 12
                              }}
                            >
                              <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
                                <div
                                  style={{
                                    width: 38,
                                    height: 38,
                                    borderRadius: 10,
                                    background: '#e0f2fe',
                                    color: '#0369a1',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    flexShrink: 0
                                  }}
                                >
                                  <FileText size={18} />
                                </div>
                                <div style={{ minWidth: 0 }}>
                                  <span style={{ fontWeight: 700, fontSize: '0.84rem', color: 'var(--pat-text)', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                    {file.name}
                                  </span>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.72rem', color: 'var(--pat-text-soft)', marginTop: 2 }}>
                                    <span>{file.size || 'Attachment'}</span>
                                    <span>•</span>
                                    <span style={{ color: 'var(--pat-emerald)', fontWeight: 600 }}>{file.category || 'Clinical Record'}</span>
                                  </div>
                                </div>
                              </div>

                              {file.url && (
                                <a
                                  href={fileUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="pat-btn pat-btn-emerald pat-btn-sm"
                                  style={{ flexShrink: 0 }}
                                  title="Download"
                                >
                                  <Download size={13} />
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
