'use client';

// src/app/patient/(protected)/profile-update/page.tsx
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAppSelector, useAppDispatch } from '@/redux/hooks';
import { setCredentials } from '@/redux/auth/authSlice';
import axiosInstance from '@/api/axiosInstance';
import {
  User,
  MapPin,
  Phone,
  ShieldAlert,
  HeartPulse,
  Save,
  ArrowLeft,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Calendar,
  Droplets,
  Building,
  Globe
} from 'lucide-react';

export default function PatientProfileUpdatePage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const reduxUser = useAppSelector((state) => state.auth.user);
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    gender: '',
    phone: '',
    bloodGroup: '',
    emergencyContactName: '',
    emergencyContactRelationship: '',
    emergencyContactPhone: '',
    allergies: '',
    chronicConditions: '',
    currentMedications: '',
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: ''
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await axiosInstance.get('/patient/profile', {
          withCredentials: true
        });
        const data = res.data; 
        if (data && data.data) {
          const pData = data.data.profile || {};
          const user = data.data.user || {};

          if (user.isProfileCompleted) {
            setIsEditing(true);
          }

          setFormData({
            firstName: pData.firstName || user.name?.split(' ')[0] || reduxUser?.name?.split(' ')[0] || '',
            lastName: pData.lastName || user.name?.split(' ').slice(1).join(' ') || reduxUser?.name?.split(' ').slice(1).join(' ') || '',
            dateOfBirth: pData.dateOfBirth ? new Date(pData.dateOfBirth).toISOString().split('T')[0] : '',
            gender: pData.gender || '',
            phone: pData.phone || '',
            bloodGroup: pData.bloodGroup || '',
            emergencyContactName: pData.emergencyContact?.name || '',
            emergencyContactRelationship: pData.emergencyContact?.relationship || '',
            emergencyContactPhone: pData.emergencyContact?.phone || '',
            allergies: pData.medicalHistory?.allergies?.join(', ') || '',
            chronicConditions: pData.medicalHistory?.chronicConditions?.join(', ') || '',
            currentMedications: pData.medicalHistory?.currentMedications?.join(', ') || '',
            street: pData.address?.street || '',
            city: pData.address?.city || '',
            state: pData.address?.state || '',
            zipCode: pData.address?.zipCode || '',
            country: pData.address?.country || ''
          });
        }
      } catch (err) {
        console.error('Failed to fetch profile', err);
      } finally {
        setPageLoading(false);
      }
    };

    fetchProfile();
  }, [reduxUser]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Use axiosInstance so the Redux-injected Bearer token interceptor fires.
      // Send flat fields that UpdatePatientProfile.js expects directly.
      const payload: Record<string, unknown> = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone,
        emergencyContactName: formData.emergencyContactName,
        emergencyContactRelationship: formData.emergencyContactRelationship,
        emergencyContactPhone: formData.emergencyContactPhone,
        allergies: formData.allergies,
        chronicConditions: formData.chronicConditions,
        currentMedications: formData.currentMedications,
        street: formData.street,
        city: formData.city,
        state: formData.state,
        zipCode: formData.zipCode,
        country: formData.country,
      };

      // Only include date when provided
      if (formData.dateOfBirth) {
        payload.dateOfBirth = new Date(formData.dateOfBirth).toISOString();
      }

      // Only include enum fields when a value is selected to prevent Mongoose
      // validation errors on empty strings for optional dropdown fields.
      if (formData.gender) payload.gender = formData.gender;
      if (formData.bloodGroup) payload.bloodGroup = formData.bloodGroup;

      const { data } = await axiosInstance.put('/patient/profile-update', payload, {
        withCredentials: true,
      });

      // 1. Sync the new access token into the Redux store
      if (data.accessToken && reduxUser) {
        dispatch(setCredentials({ user: { ...reduxUser, isProfileCompleted: true }, accessToken: data.accessToken }));
      }

      // 2. Sync the updated access token cookie to the frontend domain so Next.js middleware reflects isProfileCompleted: true immediately
      if (data.accessToken) {
        await fetch('/api/auth/sync-token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ accessToken: data.accessToken }),
        }).catch((syncErr) => {
          console.error('[PatientProfileUpdate] Failed to sync cookie token:', syncErr);
        });
      }

      setSuccess(true);
      setTimeout(() => {
        window.location.href = '/patient/profile';
      }, 1500);
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Failed to update profile';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '11px 14px',
    borderRadius: 12,
    border: '1.5px solid var(--pat-border)',
    fontSize: '0.88rem',
    outline: 'none',
    boxSizing: 'border-box',
    color: 'var(--pat-text)',
    background: '#fff',
    fontFamily: 'inherit',
    transition: 'border-color 0.15s ease'
  };

  const labelStyle: React.CSSProperties = {
    display: 'block',
    fontSize: '0.78rem',
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    color: 'var(--pat-text)',
    marginBottom: 6
  };

  if (pageLoading) {
    return (
      <div className="pat-page" style={{ maxWidth: 880, margin: '0 auto', textAlign: 'center', padding: 60 }}>
        <Loader2 size={38} className="animate-spin" style={{ margin: '0 auto 12px', color: 'var(--pat-primary)' }} />
        <p style={{ color: 'var(--pat-text-soft)', fontSize: '0.9rem' }}>Loading your profile data...</p>
      </div>
    );
  }

  return (
    <div className="pat-page" style={{ maxWidth: 880, margin: '0 auto' }}>
      {/* ── Page Header ── */}
      <div className="pat-page-header">
        <div>
          <Link
            href="/patient/profile"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              fontSize: '0.82rem',
              fontWeight: 700,
              color: 'var(--pat-primary)',
              textDecoration: 'none',
              marginBottom: 10
            }}
          >
            <ArrowLeft size={14} /> Back to Profile
          </Link>
          <h1>{isEditing ? 'Edit Profile Details' : 'Complete Your Profile'}</h1>
          <p>
            {isEditing
              ? 'Update your personal details, emergency contacts, and residential information.'
              : 'Welcome to Zydoc! Complete your profile so doctors have essential context during consultations.'}
          </p>
        </div>
      </div>

      {/* ── Alerts ── */}
      {error && (
        <div className="pat-info-box error" style={{ marginBottom: 20 }}>
          <AlertCircle size={18} style={{ flexShrink: 0, marginTop: 1 }} />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="pat-info-box success" style={{ marginBottom: 20 }}>
          <CheckCircle2 size={18} style={{ flexShrink: 0, marginTop: 1 }} />
          <span>Profile saved successfully! Redirecting to your profile...</span>
        </div>
      )}

      <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        {/* Section 1: Personal Information */}
        <div className="pat-card">
          <div className="pat-card-header">
            <h2>
              <User size={18} style={{ color: 'var(--pat-primary)' }} />
              <span>Personal Information</span>
            </h2>
          </div>
          <div className="pat-card-body" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 18 }}>
            <div>
              <label style={labelStyle}>
                First Name <span style={{ color: 'var(--pat-rose)' }}>*</span>
              </label>
              <input
                required
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                type="text"
                placeholder="First Name"
                style={inputStyle}
              />
            </div>

            <div>
              <label style={labelStyle}>
                Last Name <span style={{ color: 'var(--pat-rose)' }}>*</span>
              </label>
              <input
                required
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                type="text"
                placeholder="Last Name"
                style={inputStyle}
              />
            </div>

            <div>
              <label style={labelStyle}>Date of Birth</label>
              <input
                name="dateOfBirth"
                value={formData.dateOfBirth}
                onChange={handleChange}
                type="date"
                style={inputStyle}
              />
            </div>

            <div>
              <label style={labelStyle}>Gender</label>
              <select name="gender" value={formData.gender} onChange={handleChange} style={inputStyle}>
                <option value="">Select Gender...</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label style={labelStyle}>Phone Number</label>
              <input
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                type="tel"
                placeholder="+91 98765 43210"
                style={inputStyle}
              />
            </div>

            <div>
              <label style={labelStyle}>Blood Group</label>
              <select name="bloodGroup" value={formData.bloodGroup} onChange={handleChange} style={inputStyle}>
                <option value="">Select Blood Group...</option>
                <option value="A+">A+</option>
                <option value="A-">A-</option>
                <option value="B+">B+</option>
                <option value="B-">B-</option>
                <option value="AB+">AB+</option>
                <option value="AB-">AB-</option>
                <option value="O+">O+</option>
                <option value="O-">O-</option>
              </select>
            </div>
          </div>
        </div>

        {/* Section 2: Residential Address */}
        <div className="pat-card">
          <div className="pat-card-header">
            <h2>
              <MapPin size={18} style={{ color: 'var(--pat-teal)' }} />
              <span>Residential Address</span>
            </h2>
          </div>
          <div className="pat-card-body" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 18 }}>
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={labelStyle}>Street Address</label>
              <input
                name="street"
                value={formData.street}
                onChange={handleChange}
                type="text"
                placeholder="House No, Apartment, Street"
                style={inputStyle}
              />
            </div>

            <div>
              <label style={labelStyle}>City</label>
              <input
                name="city"
                value={formData.city}
                onChange={handleChange}
                type="text"
                placeholder="City"
                style={inputStyle}
              />
            </div>

            <div>
              <label style={labelStyle}>State / Province</label>
              <input
                name="state"
                value={formData.state}
                onChange={handleChange}
                type="text"
                placeholder="State"
                style={inputStyle}
              />
            </div>

            <div>
              <label style={labelStyle}>Postal / ZIP Code</label>
              <input
                name="zipCode"
                value={formData.zipCode}
                onChange={handleChange}
                type="text"
                placeholder="673001"
                style={inputStyle}
              />
            </div>

            <div>
              <label style={labelStyle}>Country</label>
              <input
                name="country"
                value={formData.country}
                onChange={handleChange}
                type="text"
                placeholder="India"
                style={inputStyle}
              />
            </div>
          </div>
        </div>

        {/* Section 3: Emergency Contact */}
        <div className="pat-card">
          <div className="pat-card-header">
            <h2>
              <ShieldAlert size={18} style={{ color: 'var(--pat-rose)' }} />
              <span>Emergency Contact</span>
            </h2>
          </div>
          <div className="pat-card-body" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 18 }}>
            <div>
              <label style={labelStyle}>Contact Name</label>
              <input
                name="emergencyContactName"
                value={formData.emergencyContactName}
                onChange={handleChange}
                type="text"
                placeholder="e.g. Sarah Doe"
                style={inputStyle}
              />
            </div>

            <div>
              <label style={labelStyle}>Relationship</label>
              <input
                name="emergencyContactRelationship"
                value={formData.emergencyContactRelationship}
                onChange={handleChange}
                type="text"
                placeholder="e.g. Spouse, Parent, Sibling"
                style={inputStyle}
              />
            </div>

            <div>
              <label style={labelStyle}>Contact Phone</label>
              <input
                name="emergencyContactPhone"
                value={formData.emergencyContactPhone}
                onChange={handleChange}
                type="tel"
                placeholder="+91 98765 43210"
                style={inputStyle}
              />
            </div>
          </div>
        </div>

        {/* Section 4: Medical History */}
        <div className="pat-card">
          <div className="pat-card-header">
            <h2>
              <HeartPulse size={18} style={{ color: 'var(--pat-emerald)' }} />
              <span>Medical History</span>
            </h2>
          </div>
          <div className="pat-card-body" style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            <div>
              <label style={labelStyle}>Allergies (comma-separated)</label>
              <input
                name="allergies"
                value={formData.allergies}
                onChange={handleChange}
                type="text"
                placeholder="e.g. Penicillin, Peanuts, Pollen"
                style={inputStyle}
              />
            </div>

            <div>
              <label style={labelStyle}>Chronic Conditions (comma-separated)</label>
              <input
                name="chronicConditions"
                value={formData.chronicConditions}
                onChange={handleChange}
                type="text"
                placeholder="e.g. Asthma, Hypertension, Diabetes Type 2"
                style={inputStyle}
              />
            </div>

            <div>
              <label style={labelStyle}>Current Medications (comma-separated)</label>
              <input
                name="currentMedications"
                value={formData.currentMedications}
                onChange={handleChange}
                type="text"
                placeholder="e.g. Metformin 500mg, Albuterol Inhaler"
                style={inputStyle}
              />
            </div>
          </div>
        </div>

        {/* Actions bar */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, paddingBottom: 24 }}>
          <Link href="/patient/profile" className="pat-btn pat-btn-outline pat-btn-lg">
            Cancel
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="pat-btn pat-btn-primary pat-btn-lg"
            style={{ minWidth: 160, justifyContent: 'center' }}
          >
            {loading ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Save size={18} />
                <span>Save Profile</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
