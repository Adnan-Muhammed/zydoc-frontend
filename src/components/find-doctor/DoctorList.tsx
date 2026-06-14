// src/components/find-doctor/DoctorList.tsx
'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';

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
};

export default function DoctorList({ doctors }: Props) {
    // All filter/sort state lives here — isolated in this Client Component
    const [priceRange, setPriceRange] = useState(1000);
    const [sortBy, setSortBy] = useState('popular');
    const [selectedSpecialties, setSelectedSpecialties] = useState<string[]>([]);
    const [minRating, setMinRating] = useState(0);
    const [consultationType, setConsultationType] = useState<'all' | 'video' | 'physical'>('all');

    // Client-side pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 6;

    // Reset pagination to page 1 whenever any filter changes
    useEffect(() => {
        setCurrentPage(1);
    }, [priceRange, sortBy, selectedSpecialties, minRating, consultationType, doctors]);

    const toggleSpecialty = (specialty: string) => {
        setSelectedSpecialties(prev =>
            prev.includes(specialty)
                ? prev.filter(s => s !== specialty)
                : [...prev, specialty]
        );
    };

    // Client-side filtering & sorting
    const filtered = doctors
        .filter(d => {
            // Filter by selected consultation type availability
            const hasVideo = d.videoFee !== null;
            const hasPhysical = d.physicalFee !== null;
            if (consultationType === 'video') return hasVideo;
            if (consultationType === 'physical') return hasPhysical;
            return true; // Show all doctors when 'all' is selected, even those without explicitly enabled settings
        })
        .filter(d => {
            // Filter by fee range dynamically based on consultationType
            if (consultationType === 'video') {
                return d.videoFee !== null && d.videoFee <= priceRange;
            }
            if (consultationType === 'physical') {
                return d.physicalFee !== null && d.physicalFee <= priceRange;
            }
            const minFee = Math.min(
                d.videoFee !== null ? d.videoFee : Infinity,
                d.physicalFee !== null ? d.physicalFee : Infinity
            );
            return minFee === Infinity || minFee <= priceRange; // If no fee is set, treat as Infinity but allow it to show
        })
        .filter(d => selectedSpecialties.length === 0 || selectedSpecialties.includes(d.specialty))
        .filter(d => d.rating >= minRating)
        .sort((a, b) => {
            if (sortBy === 'rating') return b.rating - a.rating;
            if (sortBy === 'price-low') {
                const getMinFee = (doc: Doctor) => {
                    if (consultationType === 'video') return doc.videoFee ?? Infinity;
                    if (consultationType === 'physical') return doc.physicalFee ?? Infinity;
                    return Math.min(doc.videoFee ?? Infinity, doc.physicalFee ?? Infinity);
                };
                return getMinFee(a) - getMinFee(b);
            }
            if (sortBy === 'price-high') {
                const getMaxFee = (doc: Doctor) => {
                    if (consultationType === 'video') return doc.videoFee ?? -Infinity;
                    if (consultationType === 'physical') return doc.physicalFee ?? -Infinity;
                    return Math.max(doc.videoFee ?? -Infinity, doc.physicalFee ?? -Infinity);
                };
                return getMaxFee(b) - getMaxFee(a);
            }
            return b.reviews - a.reviews; // popular
        });

    const totalFiltered = filtered.length;
    const totalPages = Math.ceil(totalFiltered / itemsPerPage);
    const paginatedDoctors = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    // Extract unique specializations from the doctors dataset dynamically
    const uniqueSpecialties = Array.from(new Set(doctors.map(d => d.specialty).filter(Boolean))).sort();

    return (
        <>
            {/* Sidebar Filters */}
            <aside className="filters-sidebar">
                <h3 style={{ marginBottom: '1.5rem', fontWeight: 700, color: 'var(--text-dark)' }}>Filters</h3>

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
                                    onChange={() => setConsultationType(t.id as any)}
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
                        {uniqueSpecialties.map(specialty => {
                            const count = doctors.filter(d => d.specialty === specialty).length;
                            return (
                                <div className="filter-option" key={specialty}>
                                    <input
                                        type="checkbox"
                                        id={specialty}
                                        checked={selectedSpecialties.includes(specialty)}
                                        onChange={() => toggleSpecialty(specialty)}
                                    />
                                    <label htmlFor={specialty}>{specialty}</label>
                                    <span className="filter-count">{count}</span>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Price Range */}
                <div className="filter-group">
                    <div className="filter-title">Consultation Fee</div>
                    <div className="range-slider">
                        <input
                            type="range"
                            min="20"
                            max="1000"
                            value={priceRange}
                            onChange={(e) => setPriceRange(Number(e.target.value))}
                            aria-label="Maximum consultation fee"
                        />
                        <div className="range-values">
                            <span>$20</span>
                            <span>${priceRange}</span>
                        </div>
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
                        ].map(r => {
                            const count = doctors.filter(d => d.rating >= r.value).length;
                            return (
                                <div className="filter-option" key={r.value}>
                                    <input
                                        type="radio"
                                        id={`rating${r.value}`}
                                        name="rating"
                                        checked={minRating === r.value}
                                        onChange={() => setMinRating(r.value)}
                                    />
                                    <label htmlFor={`rating${r.value}`}>{r.label}</label>
                                    <span className="filter-count">{count}</span>
                                </div>
                            );
                        })}
                    </div>
                </div>

                <button
                    className="clear-filters"
                    onClick={() => {
                        setPriceRange(1000);
                        setSelectedSpecialties([]);
                        setMinRating(0);
                        setConsultationType('all');
                    }}
                >
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
                        onChange={(e) => setSortBy(e.target.value)}
                        aria-label="Sort doctors"
                    >
                        <option value="popular">Most Popular</option>
                        <option value="rating">Highest Rated</option>
                        <option value="price-low">Lowest Fee</option>
                        <option value="price-high">Highest Fee</option>
                    </select>
                </div>

                {filtered.length === 0 ? (
                    <div className="no-results">
                        <div className="no-results-icon">🔍</div>
                        <h3>No Doctors Found</h3>
                        <p>Try adjusting your search filters or clear filters to see all available doctors.</p>
                        <button
                            className="clear-filters"
                            style={{ maxWidth: '200px', margin: '1rem auto 0' }}
                            onClick={() => {
                                setPriceRange(1000);
                                setSelectedSpecialties([]);
                                setMinRating(0);
                                setConsultationType('all');
                            }}
                        >
                            Reset All Filters
                        </button>
                    </div>
                ) : (
                    <div className="doctors-grid">
                        {paginatedDoctors.map(doc => (
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
                                setCurrentPage(prev => prev - 1);
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
                                    setCurrentPage(page);
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
                                setCurrentPage(prev => prev + 1);
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