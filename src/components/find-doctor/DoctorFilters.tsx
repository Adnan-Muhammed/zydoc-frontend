'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { Search, X, ArrowRight } from 'lucide-react';

interface DoctorFiltersProps {
  className?: string;
  placeholder?: string;
  onSearchComplete?: () => void;
  targetPath?: string;
}

export default function DoctorFilters({
  className,
  placeholder = 'Search by doctor name, specialty, symptom...',
  onSearchComplete,
  targetPath,
}: DoctorFiltersProps = {}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const [searchValue, setSearchValue] = useState('');

  const destinationPath = targetPath || (pathname.startsWith('/find-doctor') || pathname.startsWith('/patient') ? pathname : '/find-doctor');
  const isExternalPage = pathname !== destinationPath;

  // Sync search value from URL query parameter
  useEffect(() => {
    const currentSearch = searchParams.get('search');
    if (currentSearch !== null) {
      setSearchValue(currentSearch);
    } else {
      setSearchValue('');
    }
  }, [searchParams]);

  const handleSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const params = new URLSearchParams(searchParams.toString());
    if (searchValue.trim()) {
      params.set('search', searchValue.trim());
    } else {
      params.delete('search');
    }
    params.set('page', '1'); // Reset to page 1 on new search
    router.push(`${destinationPath}?${params.toString()}`);
    onSearchComplete?.();
  };

  const handleClear = () => {
    setSearchValue('');
    if (!isExternalPage) {
      const params = new URLSearchParams(searchParams.toString());
      params.delete('search');
      params.set('page', '1');
      router.push(`${destinationPath}?${params.toString()}`);
    }
    onSearchComplete?.();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearchValue(val);

    if (!isExternalPage && val.trim() === '') {
      const params = new URLSearchParams(searchParams.toString());
      params.delete('search');
      params.set('page', '1');
      router.push(`${destinationPath}?${params.toString()}`);
    }
  };

  return (
    <form onSubmit={handleSearch} className={`search-form-modern ${className || ''}`} role="search">
      <div className="search-input-wrapper">
        <Search className="search-icon-inside" />
        <input
          type="text"
          className="search-input-modern"
          placeholder={placeholder}
          value={searchValue}
          onChange={handleInputChange}
          onKeyDown={(e) => {
            if (e.key === 'Escape') {
              handleClear();
            }
          }}
          aria-label="Search doctors by name or specialty"
        />
        {searchValue && (
          <button
            type="button"
            onClick={handleClear}
            className="search-clear-btn"
            aria-label="Clear search text"
          >
            <X className="size-4 text-slate-400 hover:text-slate-600" />
          </button>
        )}
      </div>

      <button type="submit" className="search-submit-btn" aria-label="Search doctors">
        <span className="hidden sm:inline">Find Doctors</span>
        <span className="sm:hidden">Search</span>
        <ArrowRight className="size-3.5 sm:size-4" />
      </button>
    </form>
  );
}