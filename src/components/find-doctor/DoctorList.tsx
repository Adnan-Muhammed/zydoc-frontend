// src/components/find-doctor/DoctorList.tsx
'use client';

import React, { useState, useMemo } from 'react';
import Image from 'next/image';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import DoctorFilters from './DoctorFilters';
import { getSystemConfigById } from '@/constants/systemsOfMedicine';

type Doctor = {
    id: string;
    name: string;
    specialty: string;
    systemOfMedicine?: string;
    experience: string;
    location: string;
    type: string;
    rating: number;
    reviews: number;
    fee: number;
    videoFee: number | null;
    physicalFee: number | null;
    clinicName: string;
    clinicAddress: string;
    image: string;
};

type Props = {
    doctors: Doctor[];
    pagination: {
        total: number;
        page: number;
        limit: number;
        pages: number;
    } | null;
    basePath: string;
};

export const SYSTEM_TABS = [
    { id: 'all', label: 'All Systems', icon: 'fa-globe' },
    { id: 'Modern Medicine', label: 'Modern Medicine', icon: 'fa-user-md' },
    { id: 'Ayurveda', label: 'Ayurveda', icon: 'fa-leaf' },
    { id: 'Homeopathy', label: 'Homeopathy', icon: 'fa-tint' },
    { id: 'Dentistry', label: 'Dentistry', icon: 'fa-tooth' },
    { id: 'Psychology', label: 'Psychology', icon: 'fa-brain' },
];

export const POPULAR_SPECIALTIES = [
    "General Medicine",
    "Cardiology",
    "Dermatology",
    "Pediatrics",
    "Orthopedics",
    "Gynecology",
    "Panchakarma",
    "Classical Homeopathy",
    "General Dentistry",
    "Clinical Psychology"
];

export default function DoctorList({ doctors, pagination, basePath }: Props) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const pathname = usePathname();
    const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);

    // Read current state from URL
    const selectedSystem = searchParams.get('systemOfMedicine') || 'all';
    const sortBy = searchParams.get('sortBy') || 'popular';
    const selectedSpecialty = searchParams.get('specialty') || '';
    const minRating = Number(searchParams.get('minRating')) || 0;
    const consultationType = searchParams.get('consultationType') || 'all';

    // Pagination from server
    const currentPage = pagination?.page || 1;
    const totalPages = pagination?.pages || 1;
    const totalFiltered = pagination?.total || 0;
    const itemsPerPage = pagination?.limit || 6;

    // Count active filters for badge
    const activeFilterCount = useMemo(() => {
        let count = 0;
        if (selectedSystem && selectedSystem !== 'all') count++;
        if (selectedSpecialty) count++;
        if (consultationType && consultationType !== 'all') count++;
        if (minRating > 0) count++;
        return count;
    }, [selectedSystem, selectedSpecialty, consultationType, minRating]);

    // Prevent background scrolling when mobile/tablet drawer is open
    React.useEffect(() => {
        if (isMobileFiltersOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [isMobileFiltersOpen]);

    // Dynamically compute displayed specialties based on selected system of medicine
    const displayedSpecialties = useMemo(() => {
        if (!selectedSystem || selectedSystem === 'all') {
            return POPULAR_SPECIALTIES;
        }
        const config = getSystemConfigById(selectedSystem);
        return config?.specialties && config.specialties.length > 0
            ? config.specialties
            : POPULAR_SPECIALTIES;
    }, [selectedSystem]);

    // Helper to update URL params
    const updateFilter = (key: string, value: string) => {
        const params = new URLSearchParams(searchParams.toString());
        if (value && value !== 'all' && value !== '0' && value !== 'popular') {
            params.set(key, value);
        } else {
            params.delete(key);
        }
        // Reset to page 1 on filter change
        if (key !== 'page') {
            params.set('page', '1');
        }
        router.push(`${pathname}?${params.toString()}`);
    };

    // System change with State Mismatch & Deadlock Prevention
    const handleSystemChange = (systemId: string) => {
        const params = new URLSearchParams(searchParams.toString());
        
        if (systemId && systemId !== 'all') {
            params.set('systemOfMedicine', systemId);
        } else {
            params.delete('systemOfMedicine');
        }

        // Deadlock Prevention:
        // If a specialty is active, verify if it belongs to the target system.
        // If incompatible, remove it to prevent a 0-result deadlock.
        const activeSpecialty = searchParams.get('specialty');
        if (activeSpecialty) {
            const targetSpecialties = (systemId === 'all' || !systemId)
                ? POPULAR_SPECIALTIES
                : (getSystemConfigById(systemId)?.specialties || []);

            if (!targetSpecialties.includes(activeSpecialty)) {
                params.delete('specialty');
            }
        }

        // Always reset pagination to page 1
        params.set('page', '1');
        router.push(`${pathname}?${params.toString()}`);
    };

    const clearFilters = () => {
        const params = new URLSearchParams(searchParams.toString());
        params.delete('specialty');
        params.delete('minRating');
        params.delete('consultationType');
        params.delete('sortBy');
        params.delete('systemOfMedicine');
        params.set('page', '1');
        router.push(`${pathname}?${params.toString()}`);
    };

    return (
        <>
            {/* Mobile & Tablet Quick Filter Toolbar */}
            <div className="mobile-tablet-filter-bar mobile-tablet-only">
                <button 
                    type="button" 
                    className="mobile-filter-trigger-btn"
                    onClick={() => setIsMobileFiltersOpen(true)}
                    aria-label="Open filter options"
                >
                    <i className="fas fa-sliders-h" aria-hidden="true"></i>
                    <span>Filters</span>
                    {activeFilterCount > 0 && (
                        <span className="filter-count-badge">{activeFilterCount}</span>
                    )}
                </button>

                {activeFilterCount > 0 && (
                    <div className="active-filter-chips-scroll">
                        {selectedSystem !== 'all' && (
                            <button
                                type="button"
                                className="active-filter-chip"
                                onClick={() => handleSystemChange('all')}
                                title="Remove System filter"
                            >
                                <span>{selectedSystem}</span>
                                <i className="fas fa-times" aria-hidden="true"></i>
                            </button>
                        )}
                        {selectedSpecialty && (
                            <button
                                type="button"
                                className="active-filter-chip"
                                onClick={() => updateFilter('specialty', 'all')}
                                title="Remove Specialty filter"
                            >
                                <span>{selectedSpecialty}</span>
                                <i className="fas fa-times" aria-hidden="true"></i>
                            </button>
                        )}
                        {consultationType !== 'all' && (
                            <button
                                type="button"
                                className="active-filter-chip"
                                onClick={() => updateFilter('consultationType', 'all')}
                                title="Remove Consultation Type filter"
                            >
                                <span>{consultationType === 'online' ? 'Online' : 'In-person'}</span>
                                <i className="fas fa-times" aria-hidden="true"></i>
                            </button>
                        )}
                        {minRating > 0 && (
                            <button
                                type="button"
                                className="active-filter-chip"
                                onClick={() => updateFilter('minRating', '0')}
                                title="Remove Rating filter"
                            >
                                <span>{minRating}+ ★</span>
                                <i className="fas fa-times" aria-hidden="true"></i>
                            </button>
                        )}
                        <button
                            type="button"
                            className="clear-all-chip-btn"
                            onClick={clearFilters}
                        >
                            Clear all
                        </button>
                    </div>
                )}
            </div>

            {/* Mobile & Tablet Drawer Overlay */}
            {isMobileFiltersOpen && (
                <div 
                    className="filters-drawer-overlay mobile-tablet-only" 
                    onClick={() => setIsMobileFiltersOpen(false)}
                    aria-hidden="true"
                />
            )}

            {/* Sidebar Filters / Mobile Drawer */}
            <aside className={`filters-sidebar filters-drawer ${isMobileFiltersOpen ? 'open' : ''}`}>
                <div className="drawer-header mobile-tablet-only">
                    <button type="button" className="reset-btn" onClick={clearFilters}>Reset All</button>
                    <h3>Filters {activeFilterCount > 0 ? `(${activeFilterCount})` : ''}</h3>
                    <button type="button" className="close-btn" onClick={() => setIsMobileFiltersOpen(false)} aria-label="Close filters">✕</button>
                </div>

                <div className="drawer-search-wrapper mobile-tablet-only" style={{ marginBottom: '1.25rem' }}>
                    <DoctorFilters />
                </div>

                <h3 className="desktop-search-only" style={{ marginBottom: '1.5rem', fontWeight: 700, color: 'var(--text-dark)' }}>Filters</h3>

                {/* System of Medicine */}
                <div className="filter-group">
                    <div className="filter-title">System of Medicine</div>
                    <div className="filter-options">
                        {SYSTEM_TABS.map(sys => {
                            const sysInputId = `sidebar-sys-${sys.id.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase()}`;
                            return (
                                <div className="filter-option" key={sys.id}>
                                    <input
                                        type="radio"
                                        id={sysInputId}
                                        name="systemOfMedicineFilter"
                                        checked={selectedSystem === sys.id}
                                        onChange={() => handleSystemChange(sys.id)}
                                    />
                                    <label htmlFor={sysInputId}>{sys.label}</label>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Consultation Type */}
                <div className="filter-group">
                    <div className="filter-title">Consultation Type</div>
                    <div className="filter-options">
                        {[
                            { id: 'all', label: 'All Types' },
                            { id: 'online', label: 'Online (Video)' },
                            { id: 'offline', label: 'In-person (Physical)' },
                        ].map(t => (
                            <div className="filter-option" key={t.id}>
                                <input
                                    type="radio"
                                    id={`type-${t.id}`}
                                    name="consultationType"
                                    checked={consultationType === t.id || (t.id === 'online' && consultationType === 'video') || (t.id === 'offline' && consultationType === 'physical')}
                                    onChange={() => updateFilter('consultationType', t.id)}
                                />
                                <label htmlFor={`type-${t.id}`}>{t.label}</label>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Specialization */}
                <div className="filter-group">
                    <div className="filter-title">
                        Specialization {selectedSystem !== 'all' && (
                            <span style={{ fontSize: '0.8rem', fontWeight: 500, color: 'var(--text-medium)' }}>({selectedSystem})</span>
                        )}
                    </div>
                    <div className="filter-options">
                        <div className="filter-option">
                            <input
                                type="radio"
                                name="specialty"
                                id="specialty-all"
                                checked={!selectedSpecialty}
                                onChange={() => updateFilter('specialty', 'all')}
                            />
                            <label htmlFor="specialty-all">All Specializations</label>
                        </div>
                        {displayedSpecialties.map(specialty => {
                            const specInputId = `spec-${specialty.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase()}`;
                            return (
                                <div className="filter-option" key={specialty}>
                                    <input
                                        type="radio"
                                        name="specialty"
                                        id={specInputId}
                                        checked={selectedSpecialty === specialty}
                                        onChange={() => updateFilter('specialty', specialty)}
                                    />
                                    <label htmlFor={specInputId}>{specialty}</label>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Rating */}
                <div className="filter-group">
                    <div className="filter-title">Minimum Rating</div>
                    <div className="filter-options">
                        {[
                            { value: 5, label: '★★★★★ (5.0)' },
                            { value: 4, label: '★★★★☆ (4.0+)' },
                            { value: 3, label: '★★★☆☆ (3.0+)' },
                        ].map(r => (
                            <div className="filter-option" key={r.value}>
                                <input
                                    type="radio"
                                    id={`rating${r.value}`}
                                    name="rating"
                                    checked={minRating === r.value}
                                    onChange={() => updateFilter('minRating', String(r.value))}
                                />
                                <label htmlFor={`rating${r.value}`}>{r.label}</label>
                            </div>
                        ))}
                    </div>
                </div>

                <button className="clear-filters desktop-search-only" onClick={clearFilters}>
                    Clear Filters
                </button>

                <div className="drawer-footer mobile-tablet-only">
                    <button 
                        type="button" 
                        className="apply-filters-btn" 
                        onClick={() => setIsMobileFiltersOpen(false)}
                    >
                        Show {totalFiltered} {totalFiltered === 1 ? 'Doctor' : 'Doctors'}
                    </button>
                </div>
            </aside>

            {/* Doctors Grid */}
            <section className="doctors-section" id="doctors" aria-label="Doctor listings">
                {/* Systems of Medicine Pill Bar */}
                <div className="system-pills-container" role="tablist" aria-label="Systems of Medicine">
                    <div className="system-pills-scroll">
                        {SYSTEM_TABS.map((tab) => {
                            const isActive = selectedSystem === tab.id;
                            return (
                                <button
                                    key={tab.id}
                                    type="button"
                                    role="tab"
                                    aria-selected={isActive}
                                    className={`system-pill-btn ${isActive ? 'active' : ''}`}
                                    onClick={() => handleSystemChange(tab.id)}
                                >
                                    <i className={`fas ${tab.icon} pill-icon`} aria-hidden="true" />
                                    <span>{tab.label}</span>
                                </button>
                            );
                        })}
                    </div>
                </div>

                <div className="results-header">
                    <div className="results-info">
                        Showing <strong>{totalFiltered > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0}–{Math.min(currentPage * itemsPerPage, totalFiltered)}</strong> of <strong>{totalFiltered}</strong> doctors
                    </div>
                    <select
                        className="sort-dropdown"
                        value={sortBy}
                        onChange={(e) => updateFilter('sortBy', e.target.value)}
                        aria-label="Sort doctors"
                    >
                        <option value="popular">Most Popular</option>
                        <option value="rating">Highest Rated</option>
                        <option value="fee">Lowest Fee</option>
                    </select>
                </div>

                {doctors.length === 0 ? (
                    <div className="no-results">
                        <div className="no-results-icon">🔍</div>
                        <h3>No Doctors Found</h3>
                        <p>Try adjusting your search filters or clear filters to see all available doctors.</p>
                        <button
                            className="clear-filters"
                            style={{ maxWidth: '200px', margin: '1rem auto 0' }}
                            onClick={clearFilters}
                        >
                            Reset All Filters
                        </button>
                    </div>
                ) : (
                    <div className="doctors-grid">
                        {doctors.map(doc => (
                            <article className="doctor-card" key={doc.id}>
                                <div className="doctor-image">
                                    <Image src={doc.image} alt={`${doc.name} - ${doc.specialty}`} fill style={{ objectFit: 'cover' }} sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" />
                                    <div className="doctor-badge">
                                        <i className="fas fa-check-circle"></i> Verified
                                    </div>
                                </div>
                                <div className="doctor-info">
                                    <h2 className="doctor-name">{doc.name}</h2>
                                    <div className="doctor-specialty">
                                        {doc.specialty}
                                        {doc.systemOfMedicine && (
                                            <span className="system-badge-tag">{doc.systemOfMedicine}</span>
                                        )}
                                    </div>
                                    <div className="doctor-details">
                                        <div className="detail-item">
                                            <i className="fas fa-briefcase"></i>
                                            <span>{doc.experience}</span>
                                        </div>
                                        <div className="detail-item">
                                            <i className="fas fa-map-marker-alt"></i>
                                            <span>{doc.location}</span>
                                        </div>
                                        <div className="detail-item">
                                            <i className="fas fa-video"></i>
                                            <span>{doc.type}</span>
                                        </div>
                                    </div>
                                    <div className="doctor-rating flex items-center gap-1.5">
                                        <div className="stars flex items-center gap-0.5" aria-label={`Rating: ${doc.rating || 0} out of 5`}>
                                            {[1, 2, 3, 4, 5].map((star) => {
                                                const isFilled = doc.rating && doc.rating > 0 && star <= Math.round(doc.rating);
                                                return (
                                                    <svg
                                                        key={star}
                                                        className={`w-3.5 h-3.5 transition-colors ${
                                                            isFilled
                                                                ? "fill-amber-400 stroke-amber-400 text-amber-400"
                                                                : "fill-transparent stroke-amber-400 text-amber-400"
                                                        }`}
                                                        strokeWidth="1.8"
                                                        viewBox="0 0 24 24"
                                                    >
                                                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                                                    </svg>
                                                );
                                            })}
                                        </div>
                                        <span className="font-bold text-xs text-slate-700 ml-0.5">
                                            {doc.rating && doc.rating > 0 ? Number(doc.rating).toFixed(1) : "0.0"}
                                        </span>
                                        <span className="rating-count text-xs text-slate-400">({doc.reviews || 0} reviews)</span>
                                    </div>

                                    <div className="doctor-fee">
                                        {doc.videoFee !== null && doc.physicalFee !== null ? (
                                            <div className="fee-split">
                                                <div className="fee-item">
                                                    <i className="fas fa-video fee-icon"></i>
                                                    <span>Online: <strong>₹{doc.videoFee}</strong></span>
                                                </div>
                                                <div className="fee-item">
                                                    <i className="fas fa-building-medical fee-icon"></i>
                                                    <span>In-person: <strong>₹{doc.physicalFee}</strong></span>
                                                </div>
                                            </div>
                                        ) : doc.videoFee !== null ? (
                                            <div className="fee-single">
                                                <i className="fas fa-video fee-icon"></i>
                                                <span>Online: <strong>₹{doc.videoFee}</strong></span>
                                                <span className="fee-label"> / session</span>
                                            </div>
                                        ) : doc.physicalFee !== null ? (
                                            <div className="fee-single">
                                                <i className="fas fa-building-medical fee-icon"></i>
                                                <span>In-person: <strong>₹{doc.physicalFee}</strong></span>
                                                <span className="fee-label"> / session</span>
                                            </div>
                                        ) : (
                                            <div className="fee-single">
                                                <span>Free Consultation</span>
                                            </div>
                                        )}
                                    </div>

                                    <div className="doctor-actions">
                                        <button className="btn-view" onClick={() => router.push(`${basePath}/${doc.id}`)}>View Profile</button>
                                        <button className="btn-book" onClick={() => router.push(`${basePath}/book/${doc.id}`)}>Book Now</button>
                                    </div>
                                </div>
                            </article>
                        ))}
                    </div>
                )}
 
                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="pagination" role="navigation" aria-label="Pagination">
                        <button
                            disabled={currentPage === 1}
                            aria-label="Previous page"
                            onClick={() => {
                                updateFilter('page', String(currentPage - 1));
                                window.scrollTo({ top: 0, behavior: 'smooth' });
                            }}
                        >
                            <i className="fas fa-chevron-left"></i>
                        </button>

                        {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                            <button
                                key={page}
                                className={page === currentPage ? "active" : ""}
                                aria-current={page === currentPage ? "page" : undefined}
                                onClick={() => {
                                    updateFilter('page', String(page));
                                    window.scrollTo({ top: 0, behavior: 'smooth' });
                                }}
                            >
                                {page}
                            </button>
                        ))}

                        <button
                            disabled={currentPage === totalPages}
                            aria-label="Next page"
                            onClick={() => {
                                updateFilter('page', String(currentPage + 1));
                                window.scrollTo({ top: 0, behavior: 'smooth' });
                            }}
                        >
                            <i className="fas fa-chevron-right"></i>
                        </button>
                    </div>
                )}
            </section>
        </>
    );
}