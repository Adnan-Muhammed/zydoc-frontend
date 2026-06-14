// src/components/HowItWorks.tsx

import React from 'react';

const HowItWorks = () => {
    return (
        <section className="how-it-works" id="how-it-works">
            <div className="steps-container">
                <div className="section-title">
                    <h2>How It Works</h2>
                    <p>Get expert medical consultation in just a few simple steps.</p>
                </div>

                <div className="steps-grid">
                    <div className="step">
                        <div className="step-number">1</div>
                        <h3>Sign Up</h3>
                        <p>Create your account in minutes with basic information and preferences.</p>
                    </div>

                    <div className="step">
                        <div className="step-number">2</div>
                        <h3>Find Doctor</h3>
                        <p>Browse through our verified doctors and select based on specialty and availability.</p>
                    </div>

                    <div className="step">
                        <div className="step-number">3</div>
                        <h3>Book Appointment</h3>
                        <p>Choose your preferred time slot and consultation type (video, chat, or call).</p>
                    </div>

                    <div className="step">
                        <div className="step-number">4</div>
                        <h3>Consult Online</h3>
                        <p>Attend your appointment and get expert medical advice from your home.</p>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default HowItWorks;