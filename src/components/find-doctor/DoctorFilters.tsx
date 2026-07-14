// src/components/find-doctor/DoctorFilters.tsx
'use client';
import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';

export default function DoctorFilters() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const pathname = usePathname();
    const [searchValue, setSearchValue] = useState('');

    // Sync initial search value from URL query parameter only on mount
    // to prevent it from overwriting what the user is currently typing
    // when they click a filter in the sidebar.
    useEffect(() => {
        const currentSearch = searchParams.get('search');
        if (currentSearch !== null) {
            setSearchValue(currentSearch);
        }
    }, []);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        const params = new URLSearchParams(searchParams.toString());
        if (searchValue.trim()) {
            params.set('search', searchValue.trim());
        } else {
            params.delete('search');
        }
        params.set('page', '1'); // Reset to page 1 on new search
        router.push(`${pathname}?${params.toString()}`);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setSearchValue(val);

        // If the user clears the input completely, automatically update the URL 
        // to remove the search parameter so they don't have to manually click "Search"
        if (val.trim() === '') {
            const params = new URLSearchParams(searchParams.toString());
            params.delete('search');
            params.set('page', '1');
            router.push(`${pathname}?${params.toString()}`);
        }
    };

    return (
        <form onSubmit={handleSearch} style={{ display: 'flex', width: '100%' }}>
            <input
                type="text"
                className="search-input"
                placeholder="Search by doctor name, specialization..."
                value={searchValue}
                onChange={handleInputChange}
                aria-label="Search doctors"
            />
            <button type="submit" className="search-button">
                <i className="fas fa-search"></i> Search
            </button>
        </form>
    );
}