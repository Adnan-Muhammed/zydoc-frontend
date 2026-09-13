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


// 'use client';

// import { Lock, Zap, DollarSign, Smartphone, MapPin, CheckCircle } from 'lucide-react';

// const Features = () => {
//     const features = [
//         {
//             icon: Lock,
//             title: 'Secure & Private',
//             description: 'Military-grade encryption protects your health data. HIPAA compliant and fully secure.',
//             color: 'from-blue-600 to-blue-700'
//         },
//         {
//             icon: Zap,
//             title: 'Quick Access',
//             description: 'Book appointments in minutes and consult within 24 hours. No lengthy waiting periods.',
//             color: 'from-amber-600 to-amber-700'
//         },
//         {
//             icon: DollarSign,
//             title: 'Affordable Pricing',
//             description: 'Transparent pricing with no hidden charges. Plans start from just $20 per consultation.',
//             color: 'from-emerald-600 to-emerald-700'
//         },
//         {
//             icon: Smartphone,
//             title: 'Mobile First',
//             description: 'Seamless experience on any device. Manage appointments and health records on the go.',
//             color: 'from-indigo-600 to-indigo-700'
//         },
//         {
//             icon: MapPin,
//             title: 'Online & Offline',
//             description: 'Choose video consultation, phone call, or in-person visit at our partner clinics.',
//             color: 'from-rose-600 to-rose-700'
//         },
//         {
//             icon: CheckCircle,
//             title: 'Verified Doctors',
//             description: 'All doctors are licensed, verified, and have been thoroughly background checked.',
//             color: 'from-teal-600 to-teal-700'
//         }
//     ];

//     return (
//         <section id="features" className="w-full py-16 md:py-24 bg-white">
//             <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
//                 {/* SECTION HEADER */}
//                 <div className="text-center mb-12 md:mb-16 space-y-4">
//                     <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-slate-900">
//                         Why Choose Zydoc?
//                     </h2>
//                     <p className="text-lg text-slate-600 max-w-2xl mx-auto">
//                         We're redefining healthcare with innovative features and unwavering commitment to your wellbeing.
//                     </p>
//                 </div>

//                 {/* FEATURES GRID */}
//                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
//                     {features.map((feature, index) => {
//                         const Icon = feature.icon;
//                         return (
//                             <div
//                                 key={index}
//                                 className="group relative bg-slate-50 rounded-xl border border-slate-200/60 p-6 md:p-8 hover:shadow-lg hover:border-slate-300 transition-all duration-300"
//                             >
//                                 {/* HOVER GLOW */}
//                                 <div className={`absolute top-0 right-0 w-40 h-40 bg-gradient-to-br ${feature.color} rounded-full blur-3xl opacity-0 group-hover:opacity-10 transition-opacity duration-300 -z-10`} />

//                                 {/* ICON */}
//                                 <div className={`inline-flex items-center justify-center h-14 w-14 rounded-lg bg-gradient-to-br ${feature.color} text-white mb-4 group-hover:scale-110 transition-transform duration-300 shadow-md`}>
//                                     <Icon className="h-7 w-7" />
//                                 </div>

//                                 {/* CONTENT */}
//                                 <div className="space-y-3">
//                                     <h3 className="text-lg md:text-xl font-bold text-slate-900">
//                                         {feature.title}
//                                     </h3>
//                                     <p className="text-sm md:text-base text-slate-600 leading-relaxed">
//                                         {feature.description}
//                                     </p>
//                                 </div>

//                                 {/* ACCENT LINE */}
//                                 <div className={`absolute bottom-0 left-0 h-1 bg-gradient-to-r ${feature.color} rounded-b-xl w-0 group-hover:w-full transition-all duration-300`} />
//                             </div>
//                         );
//                     })}
//                 </div>
//             </div>
//         </section>
//     );
// };

// export default Features;