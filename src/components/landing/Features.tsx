// src/app/(public)/components/Features.tsx

import React from 'react';

const Features = () => {
    return (
        <section className="features" id="features">
            <div className="features-container">
                <div className="section-title">
                    <h2>Why Choose Zydoc?</h2>
                    <p>Experience healthcare the modern way with our innovative features and dedicated support.</p>
                </div>

                <div className="features-grid">
                    <div className="feature-item">
                        <div className="feature-icon">🔒</div>
                        <h3>Secure & Private</h3>
                        <p>Your health data is encrypted and protected with industry-leading security standards.</p>
                    </div>

                    <div className="feature-item">
                        <div className="feature-icon">⚡</div>
                        <h3>Quick Access</h3>
                        <p>Get appointments within 24 hours with no lengthy waiting periods or bureaucracy.</p>
                    </div>

                    <div className="feature-item">
                        <div className="feature-icon">💰</div>
                        <h3>Affordable Pricing</h3>
                        <p>Transparent pricing with no hidden charges. Choose plans that fit your budget.</p>
                    </div>

                    <div className="feature-item">
                        <div className="feature-icon">📱</div>
                        <h3>Mobile Friendly</h3>
                        <p>Access your health records and consultations anytime, anywhere on your device.</p>
                    </div>

                    <div className="feature-item">
                        <div className="feature-icon">🌍</div>
                        <h3>Online & Offline</h3>
                        <p>Choose between online video consultations or in-person visits at our clinics.</p>
                    </div>

                    <div className="feature-item">
                        <div className="feature-icon">✅</div>
                        <h3>Verified Professionals</h3>
                        <p>All doctors are licensed, verified, and have excellent track records.</p>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Features;