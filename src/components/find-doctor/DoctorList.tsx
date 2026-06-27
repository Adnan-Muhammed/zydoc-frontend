// src/components/find-doctor/DoctorList.tsx
'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import DoctorFilters from './DoctorFilters';

type Doctor = {
    id: string;
    name: string;
    specialty: string;
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
};

const STATIC_SPECIALTIES = [
    "General Practice",
    "Cardiology",
    "Dermatology",
    "Pediatrics",
    "Psychiatry",
    "Dentistry",
    "Neurology",
    "Orthopedics",
    "Gynecology"
].sort();

export default function DoctorList({ doctors, pagination }: Props) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);

    // Read current state from URL
    const sortBy = searchParams.get('sortBy') || 'popular';
    const selectedSpecialty = searchParams.get('specialty') || '';
    const minRating = Number(searchParams.get('minRating')) || 0;
    const consultationType = searchParams.get('consultationType') || 'all';

    // Pagination from server
    const currentPage = pagination?.page || 1;
    const totalPages = pagination?.pages || 1;
    const totalFiltered = pagination?.total || 0;
    const itemsPerPage = pagination?.limit || 6;

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
        router.push(`/find-doctor?${params.toString()}`);
    };

    const clearFilters = () => {
        const params = new URLSearchParams(searchParams.toString());
        params.delete('specialty');
        params.delete('minRating');
        params.delete('consultationType');
        params.delete('sortBy');
        params.set('page', '1');
        router.push(`/find-doctor?${params.toString()}`);
    };

    return (
        <>
            {/* Horizontal Filter Pills (Mobile Only) */}
            <div className="mobile-filter-pills mobile-search-only">
                <div className="filter-pill-icon" onClick={() => setIsMobileFiltersOpen(true)}>
                    <i className="fas fa-cog"></i>
                </div>
                <div className="filter-pill" onClick={() => setIsMobileFiltersOpen(true)}>Type</div>
                <div className="filter-pill" onClick={() => setIsMobileFiltersOpen(true)}>Specialty</div>
                <div className="filter-pill" onClick={() => setIsMobileFiltersOpen(true)}>Rating</div>
                <div className="filter-pill" onClick={() => setIsMobileFiltersOpen(true)}>Fees</div>
            </div>

            {/* Mobile Drawer Overlay */}
            {isMobileFiltersOpen && (
                <div 
                    className="filters-drawer-overlay mobile-search-only" 
                    onClick={() => setIsMobileFiltersOpen(false)}
                />
            )}

            {/* Sidebar Filters / Mobile Drawer */}
            <aside className={`filters-sidebar filters-drawer ${isMobileFiltersOpen ? 'open' : ''}`}>
                <div className="drawer-header mobile-search-only">
                    <button className="reset-btn" onClick={clearFilters}>Reset</button>
                    <h3>Filters</h3>
                    <button className="close-btn" onClick={() => setIsMobileFiltersOpen(false)}>✕</button>
                </div>

                <div className="mobile-search-only" style={{ marginBottom: '1.5rem' }}>
                    <DoctorFilters />
                </div>

                <h3 className="desktop-search-only" style={{ marginBottom: '1.5rem', fontWeight: 700, color: 'var(--text-dark)' }}>Filters</h3>

                {/* Consultation Type */}
                <div className="filter-group">
                    <div className="filter-title">Consultation Type</div>
                    <div className="filter-options">
                        {[
                            { id: 'all', label: 'All Types' },
                            { id: 'video', label: 'Online (Video)' },
                            { id: 'physical', label: 'In-person (Physical)' },
                        ].map(t => (
                            <div className="filter-option" key={t.id}>
                                <input
                                    type="radio"
                                    id={`type-${t.id}`}
                                    name="consultationType"
                                    checked={consultationType === t.id}
                                    onChange={() => updateFilter('consultationType', t.id)}
                                />
                                <label htmlFor={`type-${t.id}`}>{t.label}</label>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Specialization */}
                <div className="filter-group">
                    <div className="filter-title">Specialization</div>
                    <div className="filter-options">
                        {STATIC_SPECIALTIES.map(specialty => (
                            <div className="filter-option" key={specialty}>
                                <input
                                    type="radio"
                                    name="specialty"
                                    id={specialty}
                                    checked={selectedSpecialty === specialty}
                                    onChange={() => updateFilter('specialty', specialty)}
                                />
                                <label htmlFor={specialty}>{specialty}</label>
                            </div>
                        ))}
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

                <button className="clear-filters" onClick={clearFilters}>
                    Clear Filters
                </button>
            </aside>

            {/* Doctors Grid */}
            <section className="doctors-section" id="doctors" aria-label="Doctor listings">
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
                                    <div className="doctor-specialty">{doc.specialty}</div>
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
                                    <div className="doctor-rating">
                                        <div className="stars" aria-label={`Rating: ${doc.rating} out of 5`}>
                                            {Array.from({ length: Math.floor(doc.rating) }).map((_, i) => (
                                                <i key={i} className="fas fa-star"></i>
                                            ))}
                                            {doc.rating % 1 !== 0 && <i className="fas fa-star-half-alt"></i>}
                                        </div>
                                        <span className="rating-count">({doc.reviews} reviews)</span>
                                    </div>

                                    <div className="doctor-fee">
                                        {doc.videoFee !== null && doc.physicalFee !== null ? (
                                            <div className="fee-split">
                                                <div className="fee-item">
                                                    <i className="fas fa-video fee-icon"></i>
                                                    <span>Online: <strong>${doc.videoFee}</strong></span>
                                                </div>
                                                <div className="fee-item">
                                                    <i className="fas fa-building fee-icon"></i>
                                                    <span>In-person: <strong>${doc.physicalFee}</strong></span>
                                                </div>
                                            </div>
                                        ) : doc.videoFee !== null ? (
                                            <div className="fee-single">
                                                <i className="fas fa-video fee-icon"></i>
                                                <span>Online: <strong>${doc.videoFee}</strong></span>
                                                <span className="fee-label"> / session</span>
                                            </div>
                                        ) : doc.physicalFee !== null ? (
                                            <div className="fee-single">
                                                <i className="fas fa-building fee-icon"></i>
                                                <span>In-person: <strong>${doc.physicalFee}</strong></span>
                                                <span className="fee-label"> / session</span>
                                            </div>
                                        ) : (
                                            <div className="fee-single">
                                                <span>Free Consultation</span>
                                            </div>
                                        )}
                                    </div>

                                    <div className="doctor-actions">
                                        <button className="btn-view">View Profile</button>
                                        <button className="btn-book">Book Now</button>
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