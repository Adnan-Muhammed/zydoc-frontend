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


// 'use client';

// import { Star, CheckCircle } from 'lucide-react';

// const Testimonials = () => {
//     const testimonials = [
//         {
//             name: 'Jennifer Smith',
//             role: 'Patient',
//             avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop',
//             rating: 5,
//             text: 'Zydoc made healthcare incredibly convenient. I consulted with a specialist within hours instead of waiting weeks. The entire process was smooth and professional.',
//             verified: true
//         },
//         {
//             name: 'Michael Torres',
//             role: 'Patient',
//             avatar: 'https://images.unsplash.com/photo-1507009766669-87a1920ba129?w=100&h=100&fit=crop',
//             rating: 5,
//             text: 'The doctors are truly professional and thorough. I felt heard and understood throughout the consultation. The follow-up care was excellent. Highly impressed with the service.',
//             verified: true
//         },
//         {
//             name: 'Amanda Lee',
//             role: 'Patient',
//             avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop',
//             rating: 5,
//             text: 'As a busy parent, Zydoc has been a lifesaver. I can schedule appointments during my lunch break and consult from home. Top-notch service at affordable prices.',
//             verified: true
//         }
//     ];

//     const renderStars = (rating: number) => (
//         <div className="flex gap-1">
//             {[...Array(5)].map((_, i) => (
//                 <Star
//                     key={i}
//                     className={`h-4 w-4 ${i < rating ? 'fill-amber-400 text-amber-400' : 'text-slate-300'}`}
//                 />
//             ))}
//         </div>
//     );

//     return (
//         <section id="testimonials" className="w-full py-16 md:py-24 bg-white">
//             <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
//                 {/* SECTION HEADER */}
//                 <div className="text-center mb-12 md:mb-16 space-y-4">
//                     <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-slate-900">
//                         Trusted by Thousands of Patients
//                     </h2>
//                     <p className="text-lg text-slate-600 max-w-2xl mx-auto">
//                         Real feedback from real patients who have experienced Zydoc's care.
//                     </p>
//                 </div>

//                 {/* TESTIMONIALS GRID */}
//                 <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
//                     {testimonials.map((testimonial, index) => (
//                         <div
//                             key={index}
//                             className="group relative bg-slate-50 rounded-xl border border-slate-200/60 p-6 md:p-8 hover:shadow-lg hover:border-slate-300 transition-all duration-300 flex flex-col"
//                         >
//                             {/* HOVER EFFECT */}
//                             <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-full blur-2xl opacity-0 group-hover:opacity-40 transition-opacity duration-300 -z-10" />

//                             {/* RATING STARS */}
//                             <div className="mb-4">
//                                 {renderStars(testimonial.rating)}
//                             </div>

//                             {/* TESTIMONIAL TEXT */}
//                             <p className="text-slate-700 leading-relaxed mb-6 flex-grow">
//                                 "{testimonial.text}"
//                             </p>

//                             {/* AUTHOR INFO */}
//                             <div className="flex items-center gap-4 pt-4 border-t border-slate-200">
//                                 <img
//                                     src={testimonial.avatar}
//                                     alt={testimonial.name}
//                                     className="h-12 w-12 rounded-full object-cover"
//                                 />
//                                 <div className="flex-1">
//                                     <div className="flex items-center gap-2">
//                                         <h4 className="font-semibold text-slate-900">
//                                             {testimonial.name}
//                                         </h4>
//                                         {testimonial.verified && (
//                                             <CheckCircle className="h-4 w-4 text-emerald-600" />
//                                         )}
//                                     </div>
//                                     <p className="text-sm text-slate-600">
//                                         {testimonial.role}
//                                     </p>
//                                 </div>
//                             </div>
//                         </div>
//                     ))}
//                 </div>

//                 {/* TRUST INDICATOR */}
//                 <div className="mt-12 md:mt-16 text-center">
//                     <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-50 border border-emerald-200 rounded-full mb-4">
//                         <CheckCircle className="h-4 w-4 text-emerald-600" />
//                         <span className="text-sm font-medium text-emerald-900">All reviews are from verified patients</span>
//                     </div>
//                     <p className="text-slate-600 text-sm">
//                         4.9★ average rating from 50,000+ patient reviews
//                     </p>
//                 </div>
//             </div>
//         </section>
//     );
// };

// export default Testimonials;