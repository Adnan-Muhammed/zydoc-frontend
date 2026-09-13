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


// 'use client';

// import { UserPlus, Search, Calendar, Video } from 'lucide-react';

// const HowItWorks = () => {
//     const steps = [
//         {
//             icon: UserPlus,
//             title: 'Create Account',
//             description: 'Sign up in seconds with your basic information and health preferences.'
//         },
//         {
//             icon: Search,
//             title: 'Find Doctor',
//             description: 'Browse verified doctors by specialty, experience, and availability.'
//         },
//         {
//             icon: Calendar,
//             title: 'Book Appointment',
//             description: 'Choose your preferred time and consultation type—video, chat, or call.'
//         },
//         {
//             icon: Video,
//             title: 'Get Treatment',
//             description: 'Consult with your doctor and receive prescriptions and health advice.'
//         }
//     ];

//     return (
//         <section id="how-it-works" className="w-full py-16 md:py-24 bg-gradient-to-b from-white to-slate-50/50">
//             <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
//                 {/* SECTION HEADER */}
//                 <div className="text-center mb-12 md:mb-16 space-y-4">
//                     <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-slate-900">
//                         Simple, Four-Step Process
//                     </h2>
//                     <p className="text-lg text-slate-600 max-w-2xl mx-auto">
//                         Get expert medical consultation in just a few minutes.
//                     </p>
//                 </div>

//                 {/* STEPS GRID */}
//                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
//                     {steps.map((step, index) => {
//                         const Icon = step.icon;
//                         const isLast = index === steps.length - 1;
                        
//                         return (
//                             <div key={index} className="relative">
//                                 {/* STEP CARD */}
//                                 <div className="group relative bg-white rounded-xl border border-slate-200/60 p-6 md:p-8 h-full hover:shadow-lg hover:border-blue-200 transition-all duration-300">
//                                     {/* STEP NUMBER BADGE */}
//                                     <div className="absolute -top-4 -left-4 flex items-center justify-center h-10 w-10 rounded-lg bg-blue-600 text-white font-bold shadow-lg text-sm">
//                                         {index + 1}
//                                     </div>

//                                     {/* ICON */}
//                                     <div className="inline-flex items-center justify-center h-14 w-14 rounded-lg bg-blue-50 text-blue-600 mb-4 group-hover:bg-blue-100 group-hover:scale-110 transition-all duration-300">
//                                         <Icon className="h-7 w-7" />
//                                     </div>

//                                     {/* CONTENT */}
//                                     <div className="space-y-2">
//                                         <h3 className="text-lg font-bold text-slate-900">
//                                             {step.title}
//                                         </h3>
//                                         <p className="text-sm text-slate-600 leading-relaxed">
//                                             {step.description}
//                                         </p>
//                                     </div>
//                                 </div>

//                                 {/* CONNECTOR LINE (hidden on last item and mobile) */}
//                                 {!isLast && (
//                                     <div className="hidden lg:block absolute top-1/2 -right-8 w-8 h-0.5 bg-gradient-to-r from-blue-200 to-transparent transform -translate-y-1/2 group-hover:from-blue-400 transition-colors duration-300" />
//                                 )}
//                             </div>
//                         );
//                     })}
//                 </div>

//                 {/* ADDITIONAL INFO */}
//                 <div className="mt-12 md:mt-16 bg-gradient-to-r from-blue-50 to-blue-50/50 rounded-xl border border-blue-200/60 p-6 md:p-8">
//                     <div className="flex flex-col md:flex-row gap-6 md:gap-8">
//                         <div className="flex-1">
//                             <h3 className="text-lg font-bold text-slate-900 mb-2">Average time to consultation</h3>
//                             <p className="text-slate-600">Most appointments are scheduled within 24 hours. Emergency consultations available 24/7.</p>
//                         </div>
//                         <div className="flex-1">
//                             <h3 className="text-lg font-bold text-slate-900 mb-2">What you'll need</h3>
//                             <p className="text-slate-600">A smartphone or computer with internet access. Video consultation recommended for best experience.</p>
//                         </div>
//                     </div>
//                 </div>
//             </div>
//         </section>
//     );
// };

// export default HowItWorks;