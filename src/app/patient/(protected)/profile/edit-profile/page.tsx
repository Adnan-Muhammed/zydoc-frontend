'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Button from '@/components/ui/Button';

export default function EditPatientProfilePage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [pageLoading, setPageLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
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
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/patient/profile`, {
                    credentials: 'include'
                }); 
                const data = await res.json();
                if (res.ok && data.data) {
                    const pData = data.data.profile || {};
                    const user = data.data.user || {};

                    setFormData({
                        firstName: pData.firstName || user.name?.split(' ')[0] || '',
                        lastName: pData.lastName || user.name?.split(' ').slice(1).join(' ') || '',
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
                console.error("Failed to fetch profile", err);
            } finally {
                setPageLoading(false);
            }
        };

        fetchProfile();
    }, []);

    const validateForm = () => {
        const newErrors: Record<string, string> = {};

        // Personal Information
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

        // Residential Details
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
            newErrors.zipCode = 'ZIP / Postal code is required';
        }
        if (!formData.country.trim()) {
            newErrors.country = 'Country is required';
        }

        return newErrors;
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors(prev => {
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
            setError('Please fill in all required fields in Personal Information and Residential Details.');

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
            const payload = {
                ...formData,
                firstName: formData.firstName.trim(),
                lastName: formData.lastName.trim(),
                phone: formData.phone.trim(),
                street: formData.street.trim(),
                city: formData.city.trim(),
                state: formData.state.trim(),
                zipCode: formData.zipCode.trim(),
                country: formData.country.trim(),
                emergencyContactName: formData.emergencyContactName.trim(),
                emergencyContactRelationship: formData.emergencyContactRelationship.trim(),
                emergencyContactPhone: formData.emergencyContactPhone.trim(),
            };

            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/patient/profile`, {
                method: 'PUT', 
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.message || 'Failed to update profile');

            setLoading(false);
            setSuccess(true);
            setTimeout(() => {
                router.push('/patient/profile');
            }, 800);
        } catch (err: any) {
            setError(err.message);
            setLoading(false);
        }
    };

    const getInputClasses = (fieldName: string, extraClasses = '') => {
        const base = "w-full rounded-xl border bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 px-4 py-3 outline-none transition-all";
        if (errors[fieldName]) {
            return `${base} border-rose-500 bg-rose-50/30 dark:bg-rose-950/20 focus:ring-2 focus:ring-rose-500/40 focus:border-rose-500 ${extraClasses}`;
        }
        return `${base} border-slate-300 dark:border-slate-600 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 ${extraClasses}`;
    };

    const inputClasses = "w-full rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 px-4 py-3 outline-none transition-all focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500";

    if (pageLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
                <i className="fas fa-spinner fa-spin text-3xl text-blue-500"></i>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
                
                {/* Header Section */}
                <div className="text-center space-y-2">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 mb-4">
                        <i className="fas fa-user-check text-2xl"></i>
                    </div>
                    <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                        Edit Your Profile
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 max-w-2xl mx-auto">
                        Update your personal details, emergency contacts, and residential information below.
                    </p>
                </div>

                {error && (
                    <div className="p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/30 flex items-start gap-3">
                        <i className="fas fa-exclamation-circle text-red-500 mt-0.5"></i>
                        <p className="text-sm text-red-700 dark:text-red-400 font-medium">{error}</p>
                    </div>
                )}

                {success && (
                    <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800/30 flex items-start gap-3 animate-fade-in">
                        <i className="fas fa-check-circle text-emerald-500 mt-0.5"></i>
                        <p className="text-sm text-emerald-700 dark:text-emerald-400 font-medium">Profile successfully updated! Redirecting to profile...</p>
                    </div>
                )}

                <form onSubmit={handleSave} noValidate className="space-y-6">
                    
                    {/* Section 1: Personal Information */}
                    <div className="bg-white dark:bg-slate-800 shadow-sm rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                        <div className="px-6 py-5 border-b border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 flex items-center gap-3">
                            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg text-blue-600 dark:text-blue-400">
                                <i className="fas fa-id-card"></i>
                            </div>
                            <div>
                                <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Personal Information</h2>
                                <p className="text-xs text-slate-500 dark:text-slate-400">Basic details about yourself.</p>
                            </div>
                        </div>
                        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2 relative">
                                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
                                    First Name <span className="text-red-500">*</span>
                                </label>
                                <input
                                    name="firstName"
                                    value={formData.firstName}
                                    onChange={handleChange}
                                    type="text"
                                    placeholder="John"
                                    className={getInputClasses('firstName')}
                                />
                                {errors.firstName && (
                                    <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-rose-500 mt-1">
                                        <i className="fas fa-exclamation-circle text-xs"></i>
                                        {errors.firstName}
                                    </span>
                                )}
                            </div>
                            <div className="space-y-2">
                                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
                                    Last Name <span className="text-xs font-normal text-slate-400 dark:text-slate-500">(Optional)</span>
                                </label>
                                <input
                                    name="lastName"
                                    value={formData.lastName}
                                    onChange={handleChange}
                                    type="text"
                                    placeholder="Doe (optional)"
                                    className={getInputClasses('lastName')}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
                                    Date of Birth <span className="text-red-500">*</span>
                                </label>
                                <input
                                    name="dateOfBirth"
                                    value={formData.dateOfBirth}
                                    onChange={handleChange}
                                    type="date"
                                    className={getInputClasses('dateOfBirth', 'appearance-none')}
                                />
                                {errors.dateOfBirth && (
                                    <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-rose-500 mt-1">
                                        <i className="fas fa-exclamation-circle text-xs"></i>
                                        {errors.dateOfBirth}
                                    </span>
                                )}
                            </div>
                            <div className="space-y-2">
                                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
                                    Gender <span className="text-red-500">*</span>
                                </label>
                                <select
                                    name="gender"
                                    value={formData.gender}
                                    onChange={handleChange}
                                    className={getInputClasses('gender', 'appearance-none')}
                                >
                                    <option value="">Select Gender...</option>
                                    <option value="male">Male</option>
                                    <option value="female">Female</option>
                                    <option value="other">Other</option>
                                </select>
                                {errors.gender && (
                                    <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-rose-500 mt-1">
                                        <i className="fas fa-exclamation-circle text-xs"></i>
                                        {errors.gender}
                                    </span>
                                )}
                            </div>
                            <div className="space-y-2 relative">
                                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
                                    Phone Number <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400">
                                        <i className="fas fa-phone-alt"></i>
                                    </span>
                                    <input
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleChange}
                                        type="tel"
                                        placeholder="+1 (555) 000-0000"
                                        className={getInputClasses('phone', 'pl-11')}
                                    />
                                </div>
                                {errors.phone && (
                                    <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-rose-500 mt-1">
                                        <i className="fas fa-exclamation-circle text-xs"></i>
                                        {errors.phone}
                                    </span>
                                )}
                            </div>
                            <div className="space-y-2">
                                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
                                    Blood Group <span className="text-red-500">*</span>
                                </label>
                                <select
                                    name="bloodGroup"
                                    value={formData.bloodGroup}
                                    onChange={handleChange}
                                    className={getInputClasses('bloodGroup', 'appearance-none')}
                                >
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
                                    <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-rose-500 mt-1">
                                        <i className="fas fa-exclamation-circle text-xs"></i>
                                        {errors.bloodGroup}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Section 2: Emergency Contact */}
                    <div className="bg-white dark:bg-slate-800 shadow-sm rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                        <div className="px-6 py-5 border-b border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 flex items-center gap-3">
                            <div className="p-2 bg-rose-100 dark:bg-rose-900/30 rounded-lg text-rose-600 dark:text-rose-400">
                                <i className="fas fa-heartbeat"></i>
                            </div>
                            <div>
                                <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Emergency Contact</h2>
                                <p className="text-xs text-slate-500 dark:text-slate-400">Who should we contact in case of an emergency?</p>
                            </div>
                        </div>
                        <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="space-y-2">
                                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">Contact Name</label>
                                <input name="emergencyContactName" value={formData.emergencyContactName} onChange={handleChange} type="text" placeholder="Jane Doe" className={inputClasses} />
                            </div>
                            <div className="space-y-2">
                                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">Relationship</label>
                                <input name="emergencyContactRelationship" value={formData.emergencyContactRelationship} onChange={handleChange} type="text" placeholder="Spouse, Parent, etc." className={inputClasses} />
                            </div>
                            <div className="space-y-2">
                                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">Contact Phone</label>
                                <div className="relative">
                                    <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400">
                                        <i className="fas fa-phone-alt"></i>
                                    </span>
                                    <input name="emergencyContactPhone" value={formData.emergencyContactPhone} onChange={handleChange} type="tel" placeholder="+1 (555) 000-0000" className={`${inputClasses} pl-11`} />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Section 3: Residential Details */}
                    <div className="bg-white dark:bg-slate-800 shadow-sm rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                        <div className="px-6 py-5 border-b border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 flex items-center gap-3">
                            <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg text-indigo-600 dark:text-indigo-400">
                                <i className="fas fa-home"></i>
                            </div>
                            <div>
                                <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Residential Details</h2>
                                <p className="text-xs text-slate-500 dark:text-slate-400">Your current living address.</p>
                            </div>
                        </div>
                        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2 md:col-span-2">
                                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
                                    Street Address <span className="text-red-500">*</span>
                                </label>
                                <input
                                    name="street"
                                    value={formData.street}
                                    onChange={handleChange}
                                    type="text"
                                    placeholder="123 Main St, Apt 4B"
                                    className={getInputClasses('street')}
                                />
                                {errors.street && (
                                    <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-rose-500 mt-1">
                                        <i className="fas fa-exclamation-circle text-xs"></i>
                                        {errors.street}
                                    </span>
                                )}
                            </div>
                            <div className="space-y-2">
                                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
                                    City <span className="text-red-500">*</span>
                                </label>
                                <input
                                    name="city"
                                    value={formData.city}
                                    onChange={handleChange}
                                    type="text"
                                    placeholder="New York"
                                    className={getInputClasses('city')}
                                />
                                {errors.city && (
                                    <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-rose-500 mt-1">
                                        <i className="fas fa-exclamation-circle text-xs"></i>
                                        {errors.city}
                                    </span>
                                )}
                            </div>
                            <div className="space-y-2">
                                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
                                    State / Province <span className="text-red-500">*</span>
                                </label>
                                <input
                                    name="state"
                                    value={formData.state}
                                    onChange={handleChange}
                                    type="text"
                                    placeholder="NY"
                                    className={getInputClasses('state')}
                                />
                                {errors.state && (
                                    <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-rose-500 mt-1">
                                        <i className="fas fa-exclamation-circle text-xs"></i>
                                        {errors.state}
                                    </span>
                                )}
                            </div>
                            <div className="space-y-2">
                                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
                                    ZIP / Postal Code <span className="text-red-500">*</span>
                                </label>
                                <input
                                    name="zipCode"
                                    value={formData.zipCode}
                                    onChange={handleChange}
                                    type="text"
                                    placeholder="10001"
                                    className={getInputClasses('zipCode')}
                                />
                                {errors.zipCode && (
                                    <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-rose-500 mt-1">
                                        <i className="fas fa-exclamation-circle text-xs"></i>
                                        {errors.zipCode}
                                    </span>
                                )}
                            </div>
                            <div className="space-y-2">
                                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
                                    Country <span className="text-red-500">*</span>
                                </label>
                                <input
                                    name="country"
                                    value={formData.country}
                                    onChange={handleChange}
                                    type="text"
                                    placeholder="United States"
                                    className={getInputClasses('country')}
                                />
                                {errors.country && (
                                    <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-rose-500 mt-1">
                                        <i className="fas fa-exclamation-circle text-xs"></i>
                                        {errors.country}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Section 4: Medical History */}
                    <div className="bg-white dark:bg-slate-800 shadow-sm rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                        <div className="px-6 py-5 border-b border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 flex items-center gap-3">
                            <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg text-emerald-600 dark:text-emerald-400">
                                <i className="fas fa-notes-medical"></i>
                            </div>
                            <div>
                                <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Medical History</h2>
                                <p className="text-xs text-slate-500 dark:text-slate-400">Provide any relevant past medical history.</p>
                            </div>
                        </div>
                        <div className="p-6 grid grid-cols-1 gap-6">
                            <div className="space-y-2">
                                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">Allergies <span className="text-xs font-normal text-slate-400">(comma separated)</span></label>
                                <textarea name="allergies" value={formData.allergies} onChange={handleChange} placeholder="e.g. Peanuts, Penicillin" className={`${inputClasses} resize-none`} rows={2}></textarea>
                            </div>
                            <div className="space-y-2">
                                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">Chronic Conditions <span className="text-xs font-normal text-slate-400">(comma separated)</span></label>
                                <textarea name="chronicConditions" value={formData.chronicConditions} onChange={handleChange} placeholder="e.g. Asthma, Type 2 Diabetes" className={`${inputClasses} resize-none`} rows={2}></textarea>
                            </div>
                            <div className="space-y-2">
                                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">Current Medications <span className="text-xs font-normal text-slate-400">(comma separated)</span></label>
                                <textarea name="currentMedications" value={formData.currentMedications} onChange={handleChange} placeholder="e.g. Albuterol Inhaler, Insulin" className={`${inputClasses} resize-none`} rows={2}></textarea>
                            </div>
                        </div>
                    </div>

                    <div className="pt-6 flex justify-end">
                        <Button type="submit" disabled={loading || success} className="w-full sm:w-auto px-8 py-3 rounded-xl text-base font-semibold shadow-lg shadow-blue-500/30 transition-all hover:scale-[1.02]" icon={loading ? <i className="fas fa-spinner fa-spin"></i> : success ? <i className="fas fa-check"></i> : <i className="fas fa-save"></i>}>
                            {loading ? 'Saving Profile...' : success ? 'Profile Saved!' : 'Save Changes'}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}
