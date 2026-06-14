// src/components/find-doctor/DoctorFilters.tsx
'use client';
import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
 
export default function DoctorFilters() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [searchValue, setSearchValue] = useState('');

    // Sync initial search value from URL query parameter
    useEffect(() => {
        setSearchValue(searchParams.get('search') || '');
    }, [searchParams]);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        const params = new URLSearchParams(searchParams.toString());
        if (searchValue.trim()) {
            params.set('search', searchValue.trim());
        } else {
            params.delete('search');
        }
        router.push(`/find-doctor?${params.toString()}`);
    };

    return (
        <form onSubmit={handleSearch} style={{ display: 'flex', width: '100%' }}>
            <input
                type="text"
                className="search-input"
                placeholder="Search by doctor name, specialization..."
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                aria-label="Search doctors"
            />
            <button type="submit" className="search-button">
                <i className="fas fa-search"></i> Search
            </button>
        </form>
    );
}