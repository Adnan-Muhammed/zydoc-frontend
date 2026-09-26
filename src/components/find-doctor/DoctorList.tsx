// src/components/find-doctor/DoctorList.tsx
'use client';

import React, { useState, useMemo } from 'react';
import Image from 'next/image';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import DoctorFilters from './DoctorFilters';
import { getSystemConfigById, extractPrimaryQualifications } from '@/constants/systemsOfMedicine';
import {
  SlidersHorizontal,
  X,
  Star,
  Video,
  Building2,
  MapPin,
  Briefcase,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Sparkles,
  Globe,
  Stethoscope,
  Leaf,
  Droplets,
  HeartPulse,
  Brain,
  Search,
  BadgeCheck,
  Heart,
  CalendarCheck
} from 'lucide-react';

type Doctor = {
  id: string;
  name: string;
  specialty: string;
  systemOfMedicine?: string;
  primaryDegree?: string;
  qualifications?: any[];
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
  isDashboard?: boolean;
};

export const SYSTEM_TABS = [
  { id: 'all', label: 'All Systems', icon: Globe },
  { id: 'Modern Medicine', label: 'Modern Medicine', icon: Stethoscope },
  { id: 'Ayurveda', label: 'Ayurveda', icon: Leaf },
  { id: 'Homeopathy', label: 'Homeopathy', icon: Droplets },
  { id: 'Dentistry', label: 'Dentistry', icon: HeartPulse },
  { id: 'Psychology', label: 'Psychology', icon: Brain },
];

export const POPULAR_SPECIALTIES = [
  'General Medicine',
  'Cardiology',
  'Dermatology',
  'Pediatrics',
  'Orthopedics',
  'Gynecology',
  'Panchakarma', 
  'Classical Homeopathy',
  'General Dentistry',
  'Clinical Psychology',
];

export default function DoctorList({ doctors, pagination, basePath, isDashboard }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const isDashboardMode = isDashboard ?? basePath.startsWith('/patient');
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);
  const [favorites, setFavorites] = useState<Record<string, boolean>>({});

  const toggleFavorite = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setFavorites((prev) => ({ ...prev, [id]: !prev[id] }));
  };

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

  // Prevent background scrolling when mobile drawer is open
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

  // Close drawer on Escape key
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isMobileFiltersOpen) {
        setIsMobileFiltersOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
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

    const activeSpecialty = searchParams.get('specialty');
    if (activeSpecialty) {
      const targetSpecialties =
        systemId === 'all' || !systemId
          ? POPULAR_SPECIALTIES
          : getSystemConfigById(systemId)?.specialties || [];

      if (!targetSpecialties.includes(activeSpecialty)) {
        params.delete('specialty');
      }
    }

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

  const renderFilterControls = () => (
    <>
      {/* Consultation Type */}
      <div className="filter-group-modern">
        <h4 className="filter-heading-modern">Consultation Mode</h4>
        <div className="filter-pills-grid">
          {[
            { id: 'all', label: 'All Modes' },
            { id: 'online', label: 'Online (Video)', icon: Video },
            { id: 'offline', label: 'In-Person (Clinic)', icon: Building2 },
          ].map((t) => {
            const isSelected =
              consultationType === t.id ||
              (t.id === 'online' && consultationType === 'video') ||
              (t.id === 'offline' && consultationType === 'physical');
            const Icon = t.icon;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => updateFilter('consultationType', t.id)}
                className={`filter-choice-pill ${isSelected ? 'selected' : ''}`}
              >
                {Icon && <Icon className="size-3.5" />}
                <span>{t.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Specialization */}
      <div className="filter-group-modern">
        <div className="flex items-center justify-between mb-2">
          <h4 className="filter-heading-modern">Specialty</h4>
          {selectedSystem !== 'all' && (
            <span className="text-[11px] font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">
              {selectedSystem}
            </span>
          )}
        </div>
        <div className="filter-chips-list max-h-56 overflow-y-auto pr-1">
          <button
            type="button"
            onClick={() => updateFilter('specialty', 'all')}
            className={`specialty-list-item ${!selectedSpecialty ? 'selected' : ''}`}
          >
            <span>All Specializations</span>
            {!selectedSpecialty && <CheckCircle2 className="size-3.5 text-indigo-600 shrink-0" />}
          </button>
          {displayedSpecialties.map((specialty) => {
            const isSelected = selectedSpecialty === specialty;
            return (
              <button
                key={specialty}
                type="button"
                onClick={() => updateFilter('specialty', specialty)}
                className={`specialty-list-item ${isSelected ? 'selected' : ''}`}
              >
                <span className="truncate">{specialty}</span>
                {isSelected && <CheckCircle2 className="size-3.5 text-indigo-600 shrink-0" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Minimum Rating */}
      <div className="filter-group-modern">
        <h4 className="filter-heading-modern">Patient Rating</h4>
        <div className="space-y-1.5">
          {[
            { value: 5, label: '5.0 Only' },
            { value: 4, label: '4.0 & Up' },
            { value: 3, label: '3.0 & Up' },
          ].map((r) => {
            const isSelected = minRating === r.value;
            return (
              <button
                key={r.value}
                type="button"
                onClick={() => updateFilter('minRating', isSelected ? '0' : String(r.value))}
                className={`rating-filter-row ${isSelected ? 'selected' : ''}`}
              >
                <div className="flex items-center gap-1 text-amber-400">
                  {Array.from({ length: 5 }).map((_, idx) => (
                    <Star
                      key={idx}
                      className={`size-3.5 ${
                        idx < r.value ? 'fill-amber-400 text-amber-400' : 'fill-slate-100 text-slate-200'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-xs font-semibold text-slate-600 ml-2">{r.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </>
  );

  return (
    <div className={`doctor-list-root ${isDashboardMode ? 'dashboard-mode w-full' : 'contents'}`}>
      {/* Mobile & Tablet Quick Filter Bar */}
      <div className={`mobile-tablet-filter-bar ${isDashboardMode ? 'dashboard-filter-bar' : 'mobile-tablet-only'}`}>
        <button
          type="button"
          className="mobile-filter-trigger-btn"
          onClick={() => setIsMobileFiltersOpen(true)}
          aria-label="Open filter options"
        >
          <SlidersHorizontal className="size-4" />
          <span>Filters</span>
          {activeFilterCount > 0 && <span className="filter-count-badge">{activeFilterCount}</span>}
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
                <X className="size-3" />
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
                <X className="size-3" />
              </button>
            )}
            {consultationType !== 'all' && (
              <button
                type="button"
                className="active-filter-chip"
                onClick={() => updateFilter('consultationType', 'all')}
                title="Remove Consultation Mode filter"
              >
                <span>{consultationType === 'online' ? 'Online' : 'In-Person'}</span>
                <X className="size-3" />
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
                <X className="size-3" />
              </button>
            )}
            <button type="button" className="clear-all-chip-btn" onClick={clearFilters}>
              Reset all
            </button>
          </div>
        )}
      </div>

      {/* Drawer Overlay Modal */}
      {isMobileFiltersOpen && (
        <div
          className={`filters-drawer-overlay ${isDashboardMode ? 'dashboard-overlay' : 'mobile-tablet-only'}`}
          onClick={() => setIsMobileFiltersOpen(false)}
          aria-hidden="true"
        />
      )}

      <aside className={`filters-sidebar filters-drawer ${isDashboardMode ? 'dashboard-drawer' : ''} ${isMobileFiltersOpen ? 'open' : ''}`}>
        <div className="mobile-drawer-drag-pill md:hidden" />
        <div className={`drawer-header ${!isDashboardMode ? 'mobile-tablet-only' : ''}`}>
          <button type="button" className="reset-btn" onClick={clearFilters}>
            Reset
          </button>
          <h3>Filters {activeFilterCount > 0 ? `(${activeFilterCount})` : ''}</h3>
          <button
            type="button"
            className="close-btn"
            onClick={() => setIsMobileFiltersOpen(false)}
            aria-label="Close filters"
          >
            <X className="size-5" />
          </button>
        </div>

        <div className={`drawer-search-wrapper ${!isDashboardMode ? 'mobile-tablet-only' : ''}`} style={{ marginBottom: '1rem' }}>
          <DoctorFilters />
        </div>

        {!isDashboardMode && (
          <div className="desktop-search-only flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="size-4 text-indigo-600" />
              <h3 className="font-bold text-sm text-[#101044]">Refine Search</h3>
            </div>
            {activeFilterCount > 0 && (
              <button
                onClick={clearFilters}
                className="text-xs font-semibold text-slate-400 hover:text-indigo-600 transition-colors flex items-center gap-1"
              >
                <RotateCcw className="size-3" />
                Reset
              </button>
            )}
          </div>
        )}

        <div className={isDashboardMode ? 'drawer-content-scroll' : ''}>
          {renderFilterControls()}
        </div>

        <div className={`drawer-footer ${!isDashboardMode ? 'mobile-tablet-only' : ''}`}>
          <button
            type="button"
            className="apply-filters-btn"
            onClick={() => setIsMobileFiltersOpen(false)}
          >
            Show {totalFiltered} {totalFiltered === 1 ? 'Doctor' : 'Doctors'}
          </button>
        </div>
      </aside>

      {/* Main Results Section */}
      <section className="doctors-section" id="doctors" aria-label="Doctor listings">
        {/* Systems of Medicine Pill Bar */}
        <div className="system-pills-container" role="tablist" aria-label="Systems of Medicine">
          <div className="system-pills-scroll">
            {SYSTEM_TABS.map((tab) => {
              const isActive = selectedSystem === tab.id;
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  className={`system-pill-btn ${isActive ? 'active' : ''}`}
                  onClick={() => handleSystemChange(tab.id)}
                >
                  <Icon className="pill-icon" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Results Header: Count & Sort */}
        <div className="results-header-modern">
          <div className="results-info-modern">
            Showing{' '}
            <strong>
              {totalFiltered > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0}–
              {Math.min(currentPage * itemsPerPage, totalFiltered)}
            </strong>{' '}
            of <strong>{totalFiltered}</strong> verified doctors
          </div>

          <div className="sort-wrapper-modern">
            <span className="text-xs font-semibold text-slate-400 hidden sm:inline">Sort by:</span>
            <select
              className="sort-dropdown-modern"
              value={sortBy}
              onChange={(e) => updateFilter('sortBy', e.target.value)}
              aria-label="Sort doctors"
            >
              <option value="popular">Most Popular</option>
              <option value="rating">Highest Rated</option>
              <option value="fee">Lowest Fee</option>
            </select>
          </div>
        </div>

        {/* Doctor Listings Grid */}
        {doctors.length === 0 ? (
          <div className="no-results-card">
            <div className="size-16 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 mb-4 mx-auto">
              <Search className="size-8" />
            </div>
            <h3 className="text-lg font-bold text-[#101044]">No doctors found</h3>
            <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto mt-1.5">
              We couldn't find any healthcare professionals matching your active filters. Try clearing some
              filters or searching for a different specialty.
            </p>
            <button type="button" className="reset-search-btn mt-5" onClick={clearFilters}>
              <RotateCcw className="size-3.5 mr-1.5" />
              Reset All Filters
            </button>
          </div>
        ) : (
          <div className="doctors-grid-modern">
            {doctors.map((doc) => {
              const displayName = doc.name.toLowerCase().includes('dr.') ? doc.name : `Dr. ${doc.name}`;
              const primaryDegree = doc.primaryDegree || extractPrimaryQualifications(doc.qualifications);
              return (
                <article className="doctor-card-modern relative" key={doc.id}>
                  <button
                    type="button"
                    onClick={(e) => toggleFavorite(doc.id, e)}
                    aria-label={favorites[doc.id] ? "Remove from saved doctors" : "Save doctor"}
                    className="doctor-favorite-btn"
                  >
                    <Heart
                      className={`size-4 transition-colors ${
                        favorites[doc.id]
                          ? 'fill-rose-500 text-rose-500'
                          : 'text-slate-300 hover:text-rose-500'
                      }`}
                    />
                  </button>
                  <div className="doctor-card-body">
                    {/* Doctor Avatar */}
                    <div className="doctor-avatar-wrapper">
                      <div className="doctor-avatar-frame">
                        <img
                          src={doc.image}
                          alt={doc.name}
                          className="size-full object-cover object-center"
                        />
                      </div>
                      <span className="doctor-verified-badge" title="Verified Specialist">
                        <CheckCircle2 className="size-3 text-white" />
                      </span>
                    </div>

                    {/* Doctor Info */}
                    <div className="doctor-meta-block">
                      <div className="flex flex-wrap items-center gap-1.5 mb-1.5">
                        {doc.systemOfMedicine && (
                          <span className="system-tag-modern font-bold tracking-wide">
                            {doc.systemOfMedicine}
                          </span>
                        )}
                        <span className="specialty-tag-modern">{doc.specialty}</span>
                      </div>

                      <h3 className="doctor-name-modern">
                        <button
                          type="button"
                          onClick={() => router.push(`${basePath}/${doc.id}`)}
                          className="hover:text-indigo-600 transition text-left pr-8 sm:pr-0 inline-flex flex-wrap items-baseline gap-1.5"
                        >
                          <span className="font-extrabold">{displayName}</span>
                          {primaryDegree && (
                            <span className="text-xs font-semibold text-slate-500 font-normal">
                              · {primaryDegree}
                            </span>
                          )}
                        </button>
                      </h3>

                      {/* Rating Row */}
                      <div className="flex items-center gap-1.5 mt-1 text-xs">
                        <div className="flex items-center text-amber-400">
                          <Star className="size-3.5 fill-amber-400 text-amber-400" />
                        </div>
                        <span className="font-bold text-[#101044]">
                          {doc.rating && doc.rating > 0 ? Number(doc.rating).toFixed(1) : '5.0'}
                        </span>
                        <span className="text-slate-400">({doc.reviews || 0} reviews)</span>
                      </div>

                      {/* Meta Chips */}
                      <div className="meta-chips-row mt-2.5">
                        <div className="meta-chip-item">
                          <Briefcase className="size-3 text-indigo-500 shrink-0" />
                          <span>{doc.experience}</span>
                        </div>
                        <div className="meta-chip-item">
                          <MapPin className="size-3 text-indigo-500 shrink-0" />
                          <span className="truncate max-w-[140px] sm:max-w-[180px]">{doc.location}</span>
                        </div>
                      </div>

                      {/* Fees */}
                      <div className="fees-row-modern mt-3">
                        {doc.videoFee !== null && doc.physicalFee !== null ? (
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="fee-pill-item">
                              <Video className="size-3 text-indigo-600" />
                              <span>Online: ₹{doc.videoFee}</span>
                            </span>
                            <span className="fee-pill-item">
                              <Building2 className="size-3 text-emerald-600" />
                              <span>Clinic: ₹{doc.physicalFee}</span>
                            </span>
                          </div>
                        ) : doc.videoFee !== null ? (
                          <span className="fee-pill-item">
                            <Video className="size-3 text-indigo-600" />
                            <span>Online Video: ₹{doc.videoFee}</span>
                          </span>
                        ) : doc.physicalFee !== null ? (
                          <span className="fee-pill-item">
                            <Building2 className="size-3 text-emerald-600" />
                            <span>In-Clinic: ₹{doc.physicalFee}</span>
                          </span>
                        ) : (
                          <span className="fee-pill-item">
                            <span>Free Consultation</span>
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Card Actions Footer */}
                  <div className="doctor-card-footer">
                    <button
                      type="button"
                      className="btn-view-modern"
                      onClick={() => router.push(`${basePath}/${doc.id}`)}
                    >
                      View Profile
                    </button>
                    <button
                      type="button"
                      className="btn-book-modern flex items-center justify-center gap-1.5"
                      onClick={() => router.push(`/patient/find-doctor/book/${doc.id}`)}
                    >
                      <CalendarCheck className="size-3.5" />
                      <span>Book Appointment</span>
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        )}

        {/* Modern Pagination */}
        {totalPages > 1 && (
          <div className="pagination-modern" role="navigation" aria-label="Pagination">
            <button
              disabled={currentPage === 1}
              aria-label="Previous page"
              className="page-nav-btn"
              onClick={() => {
                updateFilter('page', String(currentPage - 1));
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            >
              <ChevronLeft className="size-4" />
            </button>

            {/* Desktop windowed page numbers */}
            <div className="hidden sm:flex items-center gap-1.5">
              {(() => {
                const getPaginationRange = (curr: number, total: number) => {
                  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
                  if (curr <= 4) return [1, 2, 3, 4, 5, '...', total];
                  if (curr >= total - 3) return [1, '...', total - 4, total - 3, total - 2, total - 1, total];
                  return [1, '...', curr - 1, curr, curr + 1, '...', total];
                };

                return getPaginationRange(currentPage, totalPages).map((p, idx) => {
                  if (p === '...') {
                    return (
                      <span key={`ellipsis-${idx}`} className="px-2 text-xs font-bold text-slate-400 select-none">
                        …
                      </span>
                    );
                  }
                  const pageNum = p as number;
                  return (
                    <button
                      key={pageNum}
                      className={`page-num-btn ${pageNum === currentPage ? 'active' : ''}`}
                      aria-current={pageNum === currentPage ? 'page' : undefined}
                      onClick={() => {
                        updateFilter('page', String(pageNum));
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                    >
                      {pageNum}
                    </button>
                  );
                });
              })()}
            </div>

            {/* Mobile compact Page Indicator */}
            <div className="flex sm:hidden items-center px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 shadow-2xs">
              Page {currentPage} of {totalPages}
            </div>

            <button
              disabled={currentPage === totalPages}
              aria-label="Next page"
              className="page-nav-btn"
              onClick={() => {
                updateFilter('page', String(currentPage + 1));
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            >
              <ChevronRight className="size-4" />
            </button>
          </div>
        )}
      </section>
    </div>
  );
}