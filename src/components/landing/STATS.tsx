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








// 'use client';

// import { Users, Heart, Star, Clock } from 'lucide-react';

// const STATS = () => {
//     const stats = [
//         {
//             icon: Users,
//             value: '1000+',
//             label: 'Verified Doctors',
//             description: 'Licensed healthcare professionals'
//         },
//         {
//             icon: Heart,
//             value: '50K+',
//             label: 'Happy Patients',
//             description: 'Trust and satisfaction guaranteed'
//         },
//         {
//             icon: Star,
//             value: '4.9★',
//             label: 'Patient Rating',
//             description: 'Based on verified reviews'
//         },
//         {
//             icon: Clock,
//             value: '24/7',
//             label: 'Always Available',
//             description: 'Round-the-clock support'
//         },
//     ];

//     return (
//         <section className="w-full py-16 md:py-24 bg-gradient-to-b from-slate-50/50 to-white">
//             <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
//                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
//                     {stats.map((stat, index) => {
//                         const Icon = stat.icon;
//                         return (
//                             <div
//                                 key={index}
//                                 className="group relative bg-white rounded-xl border border-slate-200/60 p-6 md:p-8 hover:shadow-lg transition-all duration-300 hover:border-blue-200/60"
//                             >
//                                 {/* ICON BACKGROUND */}
//                                 <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-full blur-2xl opacity-0 group-hover:opacity-40 transition-opacity duration-300 -z-10" />

//                                 {/* ICON */}
//                                 <div className="inline-flex items-center justify-center h-12 w-12 rounded-lg bg-blue-100 text-blue-600 mb-4 group-hover:scale-110 transition-transform duration-300">
//                                     <Icon className="h-6 w-6" />
//                                 </div>

//                                 {/* CONTENT */}
//                                 <div className="space-y-2">
//                                     <div className="text-3xl md:text-4xl font-bold text-slate-900">
//                                         {stat.value}
//                                     </div>
//                                     <div className="text-sm font-semibold text-slate-900">
//                                         {stat.label}
//                                     </div>
//                                     <div className="text-xs text-slate-600">
//                                         {stat.description}
//                                     </div>
//                                 </div>
//                             </div>
//                         );
//                     })}
//                 </div>
//             </div>
//         </section>
//     );
// };

// export default STATS;