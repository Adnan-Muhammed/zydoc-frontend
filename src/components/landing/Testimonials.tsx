// src/components/Testimonials.tsx

import React from 'react';

const Testimonials = () => {
    return (
        <section className="testimonials" id="testimonials">
            <div className="testimonials-container">
                <div className="testimonials-header">
                    <div className="section-title">
                        <h2>What Our Patients Say</h2>
                        <p>Real feedback from real patients who have experienced Zydoc's services.</p>
                    </div>
                </div>

                <div className="testimonials-grid">
                    <div className="testimonial-card">
                        <div className="stars">
                            <i className="fas fa-star"></i>
                            <i className="fas fa-star"></i>
                            <i className="fas fa-star"></i>
                            <i className="fas fa-star"></i>
                            <i className="fas fa-star"></i>
                        </div>
                        <div className="testimonial-text">
                            "Zydoc made healthcare so convenient! I was able to consult with a specialist within hours
                            instead of waiting weeks. Highly recommended!"
                        </div>
                        <div className="testimonial-author">
                            <div className="author-avatar">
                                <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=50&h=50&fit=crop"
                                    alt="Avatar" />
                            </div>
                            <div className="author-info">
                                <h4>Jennifer Smith</h4>
                                <p>Patient</p>
                            </div>
                        </div>
                    </div>

                    <div className="testimonial-card">
                        <div className="stars">
                            <i className="fas fa-star"></i>
                            <i className="fas fa-star"></i>
                            <i className="fas fa-star"></i>
                            <i className="fas fa-star"></i>
                            <i className="fas fa-star"></i>
                        </div>
                        <div className="testimonial-text">
                            "The doctors are professional and thorough. I felt heard and understood. The follow-up care was
                            excellent. Thank you!"
                        </div>
                        <div className="testimonial-author">
                            <div className="author-avatar">
                                <img src="https://images.unsplash.com/photo-1507009766669-87a1920ba129?w=50&h=50&fit=crop"
                                    alt="Avatar" />
                            </div>
                            <div className="author-info">
                                <h4>Michael Torres</h4>
                                <p>Patient</p>
                            </div>
                        </div>
                    </div>

                    <div className="testimonial-card">
                        <div className="stars">
                            <i className="fas fa-star"></i>
                            <i className="fas fa-star"></i>
                            <i className="fas fa-star"></i>
                            <i className="fas fa-star"></i>
                            <i className="fas fa-star"></i>
                        </div>
                        <div className="testimonial-text">
                            "As a busy parent, Zydoc has been a lifesaver. I can schedule appointments during lunch and
                            consult from home. Top-notch service!"
                        </div>
                        <div className="testimonial-author">
                            <div className="author-avatar">
                                <img src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=50&h=50&fit=crop"
                                    alt="Avatar" />
                            </div>
                            <div className="author-info">
                                <h4>Amanda Lee</h4>
                                <p>Patient</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}
export default Testimonials;