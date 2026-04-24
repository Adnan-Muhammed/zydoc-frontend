


// pageXOffset.js root
'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Header from '../components/layout/Header';
import { useAppSelector } from '../redux/hooks';
import './landing.css';

export default function LandingPage() {
    const { isAuthenticated, user, isLoading } = useAppSelector((state) => state.auth);
    const [activeFaq, setActiveFaq] = useState<number | null>(null);

    const getDashboardLink = () => {
        if (!user) return '/';
        return `/${user.role}/dashboard`;
    };

    const toggleAccordion = (index: number) => {
        setActiveFaq(activeFaq === index ? null : index);
    };

    return (
        <div>
            {/* Header & Navigation */}
            <Header />

            {/* Hero Section */}
            <section className="hero" id="home">
                <div className="hero-container">
                    <div className="hero-content">
                        <span className="hero-badge">✓ 24/7 Services Available</span>
                        <h1>Your Health, Our Technology. Trusted Doctors at Your Fingertips.</h1>
                        <p>Connect with certified healthcare professionals instantly. Whether in person or online, we provide
                            quick, safe, and effortless medical consultations from the comfort of your home.</p>
                        <div className="hero-buttons">
                            <Link href={isAuthenticated ? getDashboardLink() : "/login"} className="btn-primary">
                                <i className="fas fa-calendar-check"></i>
                                {isAuthenticated ? "Member Dashboard" : "Book Appointment"}
                            </Link>
                            <Link href="/find-doctor" className="btn-secondary">
                                Find Doctors
                                <i className="fas fa-arrow-right"></i>
                            </Link>
                        </div>
                    </div>
                    <div>
                        <img src="https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=500&h=500&fit=crop"
                            alt="Healthcare professionals" />
                    </div>
                </div>
            </section>

            {/* Statistics Section */}
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

            {/* Features Section */}
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

            {/* How It Works Section */}
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

            {/* Testimonials Section */}
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

            {/* FAQ Section */}
            <section className="faq" id="faq">
                <div className="faq-container">
                    <div className="section-title">
                        <h2>Frequently Asked Questions</h2>
                        <p>Find answers to common questions about our services.</p>
                    </div>

                    <div className="accordion">
                        <div className="accordion-item">
                            <div className={`accordion-header ${activeFaq === 0 ? 'active' : ''}`} onClick={() => toggleAccordion(0)}>
                                <span>How do I book an appointment?</span>
                                <div className="accordion-icon">
                                    <i className="fas fa-chevron-down"></i>
                                </div>
                            </div>
                            <div className={`accordion-content ${activeFaq === 0 ? 'active' : ''}`}>
                                <div className="accordion-text">
                                    Simply create an account, browse doctors by specialty, select your preferred doctor and time
                                    slot, and complete the booking. You'll receive a confirmation email with details.
                                </div>
                            </div>
                        </div>

                        <div className="accordion-item">
                            <div className={`accordion-header ${activeFaq === 1 ? 'active' : ''}`} onClick={() => toggleAccordion(1)}>
                                <span>What if I need to reschedule my appointment?</span>
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

                        <div className="accordion-item">
                            <div className={`accordion-header ${activeFaq === 2 ? 'active' : ''}`} onClick={() => toggleAccordion(2)}>
                                <span>Are the doctors qualified and verified?</span>
                                <div className="accordion-icon">
                                    <i className="fas fa-chevron-down"></i>
                                </div>
                            </div>
                            <div className={`accordion-content ${activeFaq === 2 ? 'active' : ''}`}>
                                <div className="accordion-text">
                                    Yes, all our doctors are licensed, verified medical professionals. They undergo thorough
                                    verification of their credentials, licenses, and qualifications before being listed on our
                                    platform.
                                </div>
                            </div>
                        </div>

                        <div className="accordion-item">
                            <div className={`accordion-header ${activeFaq === 3 ? 'active' : ''}`} onClick={() => toggleAccordion(3)}>
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

                        <div className="accordion-item">
                            <div className={`accordion-header ${activeFaq === 4 ? 'active' : ''}`} onClick={() => toggleAccordion(4)}>
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

            {/* Blog Section */}
            <section className="blog" id="blog">
                <div className="blog-container">
                    <div className="section-title">
                        <h2>Health Tips & Articles</h2>
                        <p>Stay informed with our latest health tips and medical articles.</p>
                    </div>

                    <div className="blog-grid">
                        <div className="blog-card">
                            <div className="blog-image">
                                <img src="https://images.unsplash.com/photo-1505576399279-565b52d4ac71?w=400&h=200&fit=crop"
                                    alt="Blog" />
                            </div>
                            <div className="blog-content">
                                <span className="blog-category">Health Tips</span>
                                <h3>5 Essential Habits for Better Heart Health</h3>
                                <p>Learn the most important habits you can develop to keep your heart healthy and reduce
                                    cardiovascular risks.</p>
                                <div className="blog-footer">
                                    <span>Mar 15, 2025</span>
                                    <Link href="#" className="blog-link">Read More →</Link>
                                </div>
                            </div>
                        </div>

                        <div className="blog-card">
                            <div className="blog-image">
                                <img src="https://images.unsplash.com/photo-1576091160399-7f94aa4d9b8a?w=400&h=200&fit=crop"
                                    alt="Blog" />
                            </div>
                            <div className="blog-content">
                                <span className="blog-category">Wellness</span>
                                <h3>Understanding Mental Health: Breaking the Stigma</h3>
                                <p>Mental health is just as important as physical health. Discover how to recognize and address
                                    common mental health issues.</p>
                                <div className="blog-footer">
                                    <span>Mar 10, 2025</span>
                                    <Link href="#" className="blog-link">Read More →</Link>
                                </div>
                            </div>
                        </div>

                        <div className="blog-card">
                            <div className="blog-image">
                                <img src="https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&h=200&fit=crop"
                                    alt="Blog" />
                            </div>
                            <div className="blog-content">
                                <span className="blog-category">Nutrition</span>
                                <h3>Complete Guide to Balanced Diet for All Ages</h3>
                                <p>Explore the essential nutrients your body needs and learn how to create a balanced diet plan
                                    for optimal health.</p>
                                <div className="blog-footer">
                                    <span>Mar 5, 2025</span>
                                    <Link href="#" className="blog-link">Read More →</Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="cta">
                <div className="cta-content">
                    <h2>Ready to Start Your Health Journey?</h2>
                    <p>Join thousands of patients who are already experiencing better healthcare with Zydoc. Get expert
                        medical advice from home today.</p>
                    <div className="cta-buttons">
                        <Link href={isAuthenticated ? getDashboardLink() : "/login"} className="btn-cta">
                            {isAuthenticated ? "Go to Your Dashboard" : "Book Your First Appointment"}
                        </Link>
                        <Link href="/find-doctor" className="btn-cta"
                            style={{ background: 'transparent', color: 'white', border: '2px solid white' }}>Find Doctors</Link>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer>
                <div className="footer-content">
                    <div className="footer-grid">
                        <div className="footer-section">
                            <a href="#" className="logo">
                                <i className="fas fa-hospital-user"></i>
                                Zydoc
                            </a>
                            <p style={{ marginTop: '1rem' }}>Your trusted partner in healthcare. Modern technology, human care.</p>
                        </div>

                        <div className="footer-section">
                            <h3>Quick Links</h3>
                            <ul>
                                <li><a href="#home">Home</a></li>
                                <li><Link href="/find-doctor">Find Doctors</Link></li>
                                <li><a href="#faq">FAQ</a></li>
                                <li><a href="#blog">Blog</a></li>
                                <li><Link href="/admin/login" style={{ color: 'rgba(255,255,255,0.5)' }}>Admin Portal</Link></li>
                            </ul>
                        </div>

                        <div className="footer-section">
                            <h3>Company</h3>
                            <ul>
                                <li><a href="#">About Us</a></li>
                                <li><a href="#">Careers</a></li>
                                <li><a href="#">Privacy Policy</a></li>
                                <li><a href="#">Terms of Service</a></li>
                            </ul>
                        </div>

                        <div className="footer-section">
                            <h3>Support</h3>
                            <ul>
                                <li><a href="#">Help Center</a></li>
                                <li><a href="#">Contact Us</a></li>
                                <li><a href="#">Email: support@zydoc.com</a></li>
                                <li><a href="#">Phone: +1 (555) 123-4567</a></li>
                            </ul>
                        </div>
                    </div>

                    <div className="footer-bottom">
                        <p>&copy; 2025 Zydoc. All rights reserved. | Privacy Policy | Terms of Service</p>
                    </div>
                </div>
            </footer>
        </div>
    );
}
