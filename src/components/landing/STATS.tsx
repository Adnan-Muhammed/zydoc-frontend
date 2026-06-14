// src/components/Stats.tsx


import React, { useState } from 'react';

const STATS = () => {
    return (
        <section className="stats-section">
            <div className="stats-container">
                <div className="stat-card">
                    <div className="stat-number">1000+</div>
                    <div className="stat-label">Verified Doctors</div>
                </div>
                <div className="stat-card">
                    <div className="stat-number">50K+</div>
                    <div className="stat-label">Happy Patients</div>
                </div>
                <div className="stat-card">
                    <div className="stat-number">4.9★</div>
                    <div className="stat-label">Patient Rating</div>
                </div>
                <div className="stat-card">
                    <div className="stat-number">24/7</div>
                    <div className="stat-label">Available Support</div>
                </div>
            </div>
        </section>


    )
}
export default STATS;