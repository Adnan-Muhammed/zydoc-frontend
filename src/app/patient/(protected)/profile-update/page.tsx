'use client';

// src/app/patient/(protected)/profile-update/page.tsx
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAppSelector } from '@/redux/hooks';
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
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/patient/profile`, {
          credentials: 'include'
        });
        const data = await res.json();
        if (res.ok && data.data) {
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
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/patient/profile-update`, {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          firstName: formData.firstName,
          lastName: formData.lastName,
          dateOfBirth: formData.dateOfBirth ? new Date(formData.dateOfBirth) : undefined,
          gender: formData.gender,
          phone: formData.phone,
          bloodGroup: formData.bloodGroup,
          emergencyContact: {
            name: formData.emergencyContactName,
            relationship: formData.emergencyContactRelationship,
            phone: formData.emergencyContactPhone
          },
          medicalHistory: {
            allergies: formData.allergies ? formData.allergies.split(',').map((s) => s.trim()).filter(Boolean) : [],
            chronicConditions: formData.chronicConditions ? formData.chronicConditions.split(',').map((s) => s.trim()).filter(Boolean) : [],
            currentMedications: formData.currentMedications ? formData.currentMedications.split(',').map((s) => s.trim()).filter(Boolean) : []
          },
          address: {
            street: formData.street,
            city: formData.city,
            state: formData.state,
            zipCode: formData.zipCode,
            country: formData.country
          }
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to update profile');

      setSuccess(true);
      setTimeout(() => {
        router.push('/patient/profile');
      }, 1500);
    } catch (err: any) {
      setError(err.message);
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
