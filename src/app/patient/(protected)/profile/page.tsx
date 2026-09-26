'use client';

// src/app/patient/(protected)/profile/page.tsx
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  User,
  Mail,
  Phone,
  Droplets,
  MapPin,
  AlertTriangle,
  Pill,
  Phone as PhoneIcon,
  Heart,
  Edit3,
  ClipboardList,
  Home,
  ChevronRight,
} from 'lucide-react';

export default function PatientProfilePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/patient/profile`, {
          credentials: 'include',
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Failed to fetch profile');
        setProfile(data.data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  if (loading) {
    return (
      <div className="pat-page space-y-5">
        {/* Skeleton Header */}
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <div className="pat-skeleton h-8 w-44 rounded-xl" />
            <div className="pat-skeleton h-4 w-64 rounded-lg" />
          </div>
          <div className="pat-skeleton h-10 w-28 rounded-xl" />
        </div>
        {[1,2,3,4].map(i => (
          <div key={i} className="pat-card">
            <div className="pat-card-header"><div className="pat-skeleton h-5 w-48 rounded-lg" /></div>
            <div className="pat-card-body grid grid-cols-2 gap-5">
              {[1,2,3,4].map(j => (
                <div key={j} className="space-y-2">
                  <div className="pat-skeleton h-3 w-20 rounded" />
                  <div className="pat-skeleton h-5 w-36 rounded" />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="pat-page">
        <div className="pat-info-box error">
          <AlertTriangle size={18} className="flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-bold">Failed to load profile</p>
            <p className="text-xs mt-0.5">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  const { user, profile: pData } = profile || {};
  const medicalHistory  = pData?.medicalHistory  || {};
  const emergencyContact = pData?.emergencyContact || {};
  const address          = pData?.address          || {};

  const hasMedicalHistory =
    (medicalHistory.allergies?.length > 0) ||
    (medicalHistory.chronicConditions?.length > 0) ||
    (medicalHistory.currentMedications?.length > 0);

  const hasEmergencyContact = emergencyContact.name || emergencyContact.phone;
  const hasAddress = address.street || address.city;

  return (
    <div className="pat-page space-y-6">

      {/* Header */}
      <div className="pat-page-header">
        <div>
          <h1>My Profile</h1>
          <p>View and manage your personal, medical, and contact details.</p>
        </div>
        <Link
          href="/patient/profile/edit-profile"
          className="pat-btn pat-btn-primary"
        >
          <Edit3 size={15} /> Edit Profile
        </Link>
      </div>

      {/* Profile Hero Card */}
      <div className="pat-card overflow-visible">
        <div className="h-24 bg-gradient-to-r from-indigo-500 via-indigo-600 to-sky-500 relative">
          <div className="absolute -bottom-8 left-6">
            <div className="w-16 h-16 rounded-2xl bg-white border-4 border-white shadow-lg flex items-center justify-center text-2xl font-extrabold text-indigo-600 overflow-hidden">
              {pData?.firstName?.[0] || user?.name?.[0] || 'P'}
            </div>
          </div>
        </div>
        <div className="pt-12 pb-5 px-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-lg font-extrabold text-slate-900">
              {pData?.firstName || user?.name} {pData?.lastName || ''}
            </h2>
            <p className="text-sm text-slate-500 flex items-center gap-1.5 mt-1">
              <Mail size={13} /> {user?.email}
            </p>
            {pData?.phone && (
              <p className="text-sm text-slate-500 flex items-center gap-1.5 mt-0.5">
                <Phone size={13} /> {pData.phone}
              </p>
            )}
          </div>
          <div className="flex gap-2 flex-wrap">
            {pData?.bloodGroup && (
              <span className="pat-badge" style={{ background: '#fee2e2', color: '#991b1b', fontSize: '0.8rem', padding: '6px 14px' }}>
                <Droplets size={12} /> {pData.bloodGroup}
              </span>
            )}
            <span className="pat-badge" style={{ background: '#dbeafe', color: '#1e40af', fontSize: '0.8rem', padding: '6px 14px' }}>
              Patient
            </span>
          </div>
        </div>
      </div>

      {/* Personal Information */}
      <div className="pat-card">
        <div className="pat-card-header">
          <h2>
            <span className="w-7 h-7 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center flex-shrink-0">
              <User size={14} />
            </span>
            Personal Information
          </h2>
        </div>
        <div className="pat-card-body">
          <div className="pat-info-grid">
            <div className="pat-info-field">
              <label>Full Name</label>
              <p>{pData?.firstName || user?.name} {pData?.lastName || ''}</p>
            </div>
            <div className="pat-info-field">
              <label>Email Address</label>
              <p>{user?.email || '—'}</p>
            </div>
            <div className="pat-info-field">
              <label>Phone Number</label>
              <p>{pData?.phone || <span className="text-slate-400 font-normal italic text-sm">Not provided</span>}</p>
            </div>
            <div className="pat-info-field">
              <label>Blood Group</label>
              <p>{pData?.bloodGroup || <span className="text-slate-400 font-normal italic text-sm">Not provided</span>}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Medical History */}
      <div className="pat-card">
        <div className="pat-card-header">
          <h2>
            <span className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center flex-shrink-0">
              <ClipboardList size={14} />
            </span>
            Medical History
          </h2>
        </div>
        <div className="pat-card-body">
          {!hasMedicalHistory ? (
            <div className="pat-empty py-8">
              <div className="pat-empty-icon" style={{ width: 52, height: 52, fontSize: '1.4rem' }}>
                <ClipboardList size={24} />
              </div>
              <h3>No Medical History</h3>
              <p>No allergies or chronic conditions have been recorded.</p>
              <Link href="/patient/profile-update" className="pat-btn pat-btn-outline pat-btn-sm mt-2">
                Add Medical History
              </Link>
            </div>
          ) : (
            <div className="space-y-5">
              {medicalHistory.allergies?.length > 0 && (
                <div>
                  <p className="pat-section-title"><AlertTriangle size={12} /> Allergies</p>
                  <div className="flex flex-wrap gap-2">
                    {medicalHistory.allergies.map((a: string, i: number) => (
                      <span key={i} className="pat-tag" style={{ background: '#ffe4e6', color: '#9f1239', borderColor: 'rgba(244,63,94,0.2)' }}>
                        {a}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {medicalHistory.chronicConditions?.length > 0 && (
                <div>
                  <p className="pat-section-title"><Heart size={12} /> Chronic Conditions</p>
                  <div className="flex flex-wrap gap-2">
                    {medicalHistory.chronicConditions.map((c: string, i: number) => (
                      <span key={i} className="pat-tag">{c}</span>
                    ))}
                  </div>
                </div>
              )}
              {medicalHistory.currentMedications?.length > 0 && (
                <div>
                  <p className="pat-section-title"><Pill size={12} /> Current Medications</p>
                  <div className="flex flex-wrap gap-2">
                    {medicalHistory.currentMedications.map((m: string, i: number) => (
                      <span key={i} className="pat-tag" style={{ background: '#f0fdf4', color: '#166534', borderColor: 'rgba(16,185,129,0.2)' }}>
                        {m}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Residential Details */}
      <div className="pat-card">
        <div className="pat-card-header">
          <h2>
            <span className="w-7 h-7 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center flex-shrink-0">
              <Home size={14} />
            </span>
            Residential Details
          </h2>
        </div>
        <div className="pat-card-body">
          {!hasAddress ? (
            <div className="pat-empty py-8">
              <div className="pat-empty-icon" style={{ width: 52, height: 52, fontSize: '1.4rem' }}>
                <MapPin size={24} />
              </div>
              <h3>No Address Added</h3>
              <p>Please add your current address for emergency and delivery purposes.</p>
              <Link href="/patient/profile-update" className="pat-btn pat-btn-outline pat-btn-sm mt-2">
                Add Address
              </Link>
            </div>
          ) : (
            <div className="pat-info-grid">
              <div className="pat-info-field md:col-span-2">
                <label>Street Address</label>
                <p>{address.street || '—'}</p>
              </div>
              <div className="pat-info-field">
                <label>City</label>
                <p>{address.city || '—'}</p>
              </div>
              <div className="pat-info-field">
                <label>State</label>
                <p>{address.state || '—'}</p>
              </div>
              <div className="pat-info-field">
                <label>ZIP Code</label>
                <p>{address.zipCode || '—'}</p>
              </div>
              <div className="pat-info-field">
                <label>Country</label>
                <p>{address.country || '—'}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Emergency Contact */}
      <div className="pat-card">
        <div className="pat-card-header">
          <h2>
            <span className="w-7 h-7 rounded-lg bg-rose-100 text-rose-600 flex items-center justify-center flex-shrink-0">
              <Heart size={14} />
            </span>
            Emergency Contact
          </h2>
        </div>
        <div className="pat-card-body">
          {!hasEmergencyContact ? (
            <div className="pat-empty py-8">
              <div className="pat-empty-icon" style={{ width: 52, height: 52, fontSize: '1.4rem' }}>
                <PhoneIcon size={24} />
              </div>
              <h3>No Emergency Contact</h3>
              <p>Add someone we can reach in case of a medical emergency.</p>
              <Link href="/patient/profile-update" className="pat-btn pat-btn-outline pat-btn-sm mt-2">
                Add Contact
              </Link>
            </div>
          ) : (
            <div className="pat-info-grid">
              <div className="pat-info-field">
                <label>Name</label>
                <p>{emergencyContact.name || '—'}</p>
              </div>
              <div className="pat-info-field">
                <label>Relationship</label>
                <p>{emergencyContact.relationship || '—'}</p>
              </div>
              <div className="pat-info-field">
                <label>Phone Number</label>
                <p>{emergencyContact.phone || '—'}</p>
              </div>
            </div>
          )}
        </div>
      </div>

    </div>
  );
}
