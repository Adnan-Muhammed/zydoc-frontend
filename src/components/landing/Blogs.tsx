// src/components/Blogs.tsx
import React from 'react';
import Link from 'next/link';

const Blogs = () => {
    return (
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
    )
}
export default Blogs;