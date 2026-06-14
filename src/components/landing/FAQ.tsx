// src/components/FAQ.tsx

'use client';

import React, { useState } from 'react';

const FAQ = () => {
    const [activeFaq, setActiveFaq] = useState<number | null>(null);

    const toggleAccordion = (index: number) => {
        setActiveFaq(activeFaq === index ? null : index);
    };

    return (
        <section className="faq" id="faq">
            <div className="faq-container">
                <div className="section-title">
                    <h2>Frequently Asked Questions</h2>
                    <p>Find answers to common questions about our services.</p>
                </div>

                <div className="accordion">

                    {/* ITEM 1 */}
                    <div className="accordion-item">
                        <div
                            className={`accordion-header ${activeFaq === 0 ? 'active' : ''}`}
                            onClick={() => toggleAccordion(0)}
                        >
                            <span>How do I book an appointment?</span>
                            <div className="accordion-icon">
                                <i className="fas fa-chevron-down"></i>
                            </div>
                        </div>

                        <div className={`accordion-content ${activeFaq === 0 ? 'active' : ''}`}>
                            <div className="accordion-text">
                                Simply create an account, browse doctors by specialty, select your preferred doctor and time
                                slot, and complete the booking. You'll receive a confirmation email with details.                            </div>
                        </div>
                    </div>

                    {/* ITEM 2 */}
                    <div className="accordion-item">
                        <div
                            className={`accordion-header ${activeFaq === 1 ? 'active' : ''}`}
                            onClick={() => toggleAccordion(1)}
                        >
                            <span>What if I need to reschedule?</span>
                            <div className="accordion-icon">
                                <i className="fas fa-chevron-down"></i>
                            </div>
                        </div>

                        <div className={`accordion-content ${activeFaq === 1 ? 'active' : ''}`}>
                            <div className="accordion-text">
                                You can reschedule or cancel your appointment up to 2 hours before the scheduled time
                                through your dashboard. No cancellation fee applies if done within this timeframe.
                            </div>
                        </div>
                    </div>

                    {/* ITEM 3 */}
                    <div className="accordion-item">
                        <div
                            className={`accordion-header ${activeFaq === 2 ? 'active' : ''}`}
                            onClick={() => toggleAccordion(2)}
                        >
                            <span>Are the doctors qualified and verified?</span>
                            <div className="accordion-icon">
                                <i className="fas fa-chevron-down"></i>
                            </div>
                        </div>

                        <div className={`accordion-content ${activeFaq === 2 ? 'active' : ''}`}>
                            <div className="accordion-text">
                                Yes, all our doctors are licensed, verified medical professionals. They undergo thorough
                                verification of their credentials, licenses, and qualifications before being listed on our
                                platform.                            </div>
                        </div>
                    </div>

                    {/* ITEM 4 */}
                    <div className="accordion-item">
                        <div
                            className={`accordion-header ${activeFaq === 3 ? 'active' : ''}`}
                            onClick={() => toggleAccordion(3)}
                        >
                            <span>How much does a consultation cost?</span>
                            <div className="accordion-icon">
                                <i className="fas fa-chevron-down"></i>
                            </div>
                        </div>

                        <div className={`accordion-content ${activeFaq === 3 ? 'active' : ''}`}>
                            <div className="accordion-text">
                                Consultation fees vary based on the doctor's experience and specialty, typically ranging
                                from $20 to $100. You can see the exact fee before booking an appointment.
                            </div>
                        </div>
                    </div>

                    {/* ITEM 5 */}
                    <div className="accordion-item">
                        <div
                            className={`accordion-header ${activeFaq === 4 ? 'active' : ''}`}
                            onClick={() => toggleAccordion(4)}
                        >
                            <span>Is my personal and medical information secure?</span>
                            <div className="accordion-icon">
                                <i className="fas fa-chevron-down"></i>
                            </div>
                        </div>

                        <div className={`accordion-content ${activeFaq === 4 ? 'active' : ''}`}>
                            <div className="accordion-text">
                                Absolutely. We use end-to-end encryption and comply with HIPAA regulations to protect your
                                data. Your information is never shared without your consent.
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </section>
    );
};

export default FAQ;