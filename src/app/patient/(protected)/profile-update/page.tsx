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
  const [errors, setErrors] = useState<Record<string, string>>({});

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

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    // Personal Information validations
    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }
    if (!formData.dateOfBirth) {
      newErrors.dateOfBirth = 'Date of birth is required';
    } else {
      const selectedDate = new Date(formData.dateOfBirth);
      if (selectedDate > new Date()) {
        newErrors.dateOfBirth = 'Date of birth cannot be in the future';
      }
    }
    if (!formData.gender) {
      newErrors.gender = 'Gender is required';
    }
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else {
      const cleanPhone = formData.phone.replace(/[\s\-\(\)\+]/g, '');
      if (cleanPhone.length < 10) {
        newErrors.phone = 'Please enter a valid phone number (at least 10 digits)';
      }
    }
    if (!formData.bloodGroup) {
      newErrors.bloodGroup = 'Blood group is required';
    }

    // Residential Address validations
    if (!formData.street.trim()) {
      newErrors.street = 'Street address is required';
    }
    if (!formData.city.trim()) {
      newErrors.city = 'City is required';
    }
    if (!formData.state.trim()) {
      newErrors.state = 'State is required';
    }
    if (!formData.zipCode.trim()) {
      newErrors.zipCode = 'Postal / ZIP code is required';
    }
    if (!formData.country.trim()) {
      newErrors.country = 'Country is required';
    }

    return newErrors;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      setError('Please fill in all required fields in Personal Information and Residential Address.');

      const firstKey = Object.keys(validationErrors)[0];
      const targetElement = document.querySelector(`[name="${firstKey}"]`);
      if (targetElement) {
        targetElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        (targetElement as HTMLElement).focus();
      }
      return;
    }

    setLoading(true);

    try {
      // Use axiosInstance so the Redux-injected Bearer token interceptor fires.
      // Send flat fields that UpdatePatientProfile.js expects directly.
      const payload: Record<string, unknown> = {
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        phone: formData.phone.trim(),
        emergencyContactName: formData.emergencyContactName.trim(),
        emergencyContactRelationship: formData.emergencyContactRelationship.trim(),
        emergencyContactPhone: formData.emergencyContactPhone.trim(),
        allergies: formData.allergies,
        chronicConditions: formData.chronicConditions,
        currentMedications: formData.currentMedications,
        street: formData.street.trim(),
        city: formData.city.trim(),
        state: formData.state.trim(),
        zipCode: formData.zipCode.trim(),
        country: formData.country.trim(),
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
    transition: 'border-color 0.15s ease, box-shadow 0.15s ease'
  };

  const getInputStyle = (fieldName: string): React.CSSProperties => ({
    ...inputStyle,
    borderColor: errors[fieldName] ? 'var(--pat-rose)' : 'var(--pat-border)',
    boxShadow: errors[fieldName] ? '0 0 0 1.5px rgba(244, 63, 94, 0.25)' : 'none',
    backgroundColor: errors[fieldName] ? '#fff5f5' : '#fff'
  });

  const errorSpanStyle: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 4,
    color: 'var(--pat-rose)',
    fontSize: '0.75rem',
    fontWeight: 600,
    marginTop: 5
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
              : 'Welcome to Zydocare Health! Complete your profile so doctors have essential context during consultations.'}
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

      <form onSubmit={handleSave} noValidate style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
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
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                type="text"
                placeholder="First Name"
                style={getInputStyle('firstName')}
              />
              {errors.firstName && (
                <span style={errorSpanStyle}>
                  <AlertCircle size={12} style={{ flexShrink: 0 }} />
                  {errors.firstName}
                </span>
              )}
            </div>

            <div>
              <label style={labelStyle}>
                Last Name <span style={{ fontSize: '0.72rem', color: 'var(--pat-text-soft)', textTransform: 'none', fontWeight: 500 }}>(Optional)</span>
              </label>
              <input
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                type="text"
                placeholder="Last Name (optional)"
                style={getInputStyle('lastName')}
              />
            </div>

            <div>
              <label style={labelStyle}>
                Date of Birth <span style={{ color: 'var(--pat-rose)' }}>*</span>
              </label>
              <input
                name="dateOfBirth"
                value={formData.dateOfBirth}
                onChange={handleChange}
                type="date"
                style={getInputStyle('dateOfBirth')}
              />
              {errors.dateOfBirth && (
                <span style={errorSpanStyle}>
                  <AlertCircle size={12} style={{ flexShrink: 0 }} />
                  {errors.dateOfBirth}
                </span>
              )}
            </div>

            <div>
              <label style={labelStyle}>
                Gender <span style={{ color: 'var(--pat-rose)' }}>*</span>
              </label>
              <select name="gender" value={formData.gender} onChange={handleChange} style={getInputStyle('gender')}>
                <option value="">Select Gender...</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
              {errors.gender && (
                <span style={errorSpanStyle}>
                  <AlertCircle size={12} style={{ flexShrink: 0 }} />
                  {errors.gender}
                </span>
              )}
            </div>

            <div>
              <label style={labelStyle}>
                Phone Number <span style={{ color: 'var(--pat-rose)' }}>*</span>
              </label>
              <input
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                type="tel"
                placeholder="+91 98765 43210"
                style={getInputStyle('phone')}
              />
              {errors.phone && (
                <span style={errorSpanStyle}>
                  <AlertCircle size={12} style={{ flexShrink: 0 }} />
                  {errors.phone}
                </span>
              )}
            </div>

            <div>
              <label style={labelStyle}>
                Blood Group <span style={{ color: 'var(--pat-rose)' }}>*</span>
              </label>
              <select name="bloodGroup" value={formData.bloodGroup} onChange={handleChange} style={getInputStyle('bloodGroup')}>
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
              {errors.bloodGroup && (
                <span style={errorSpanStyle}>
                  <AlertCircle size={12} style={{ flexShrink: 0 }} />
                  {errors.bloodGroup}
                </span>
              )}
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
              <label style={labelStyle}>
                Street Address <span style={{ color: 'var(--pat-rose)' }}>*</span>
              </label>
              <input
                name="street"
                value={formData.street}
                onChange={handleChange}
                type="text"
                placeholder="House No, Apartment, Street"
                style={getInputStyle('street')}
              />
              {errors.street && (
                <span style={errorSpanStyle}>
                  <AlertCircle size={12} style={{ flexShrink: 0 }} />
                  {errors.street}
                </span>
              )}
            </div>

            <div>
              <label style={labelStyle}>
                City <span style={{ color: 'var(--pat-rose)' }}>*</span>
              </label>
              <input
                name="city"
                value={formData.city}
                onChange={handleChange}
                type="text"
                placeholder="City"
                style={getInputStyle('city')}
              />
              {errors.city && (
                <span style={errorSpanStyle}>
                  <AlertCircle size={12} style={{ flexShrink: 0 }} />
                  {errors.city}
                </span>
              )}
            </div>

            <div>
              <label style={labelStyle}>
                State / Province <span style={{ color: 'var(--pat-rose)' }}>*</span>
              </label>
              <input
                name="state"
                value={formData.state}
                onChange={handleChange}
                type="text"
                placeholder="State"
                style={getInputStyle('state')}
              />
              {errors.state && (
                <span style={errorSpanStyle}>
                  <AlertCircle size={12} style={{ flexShrink: 0 }} />
                  {errors.state}
                </span>
              )}
            </div>

            <div>
              <label style={labelStyle}>
                Postal / ZIP Code <span style={{ color: 'var(--pat-rose)' }}>*</span>
              </label>
              <input
                name="zipCode"
                value={formData.zipCode}
                onChange={handleChange}
                type="text"
                placeholder="673001"
                style={getInputStyle('zipCode')}
              />
              {errors.zipCode && (
                <span style={errorSpanStyle}>
                  <AlertCircle size={12} style={{ flexShrink: 0 }} />
                  {errors.zipCode}
                </span>
              )}
            </div>

            <div>
              <label style={labelStyle}>
                Country <span style={{ color: 'var(--pat-rose)' }}>*</span>
              </label>
              <input
                name="country"
                value={formData.country}
                onChange={handleChange}
                type="text"
                placeholder="India"
                style={getInputStyle('country')}
              />
              {errors.country && (
                <span style={errorSpanStyle}>
                  <AlertCircle size={12} style={{ flexShrink: 0 }} />
                  {errors.country}
                </span>
              )}
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
