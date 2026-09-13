// // src/components/FAQ.tsx

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





// 'use client';

// import { useState } from 'react';
// import { ChevronDown } from 'lucide-react';

// const FAQ = () => {
//     const [activeFaq, setActiveFaq] = useState<number | null>(null);

//     const faqs = [
//         {
//             question: 'How do I book an appointment?',
//             answer: 'Sign up for a Zydoc account, browse our verified doctors by specialty and availability, select your preferred doctor and time slot, and complete the booking. You\'ll receive a confirmation email with all the appointment details and joining links for video consultation.'
//         },
//         {
//             question: 'What if I need to reschedule or cancel?',
//             answer: 'You can reschedule or cancel your appointment up to 2 hours before the scheduled time through your dashboard. No cancellation fee applies if done within this timeframe. For cancellations within 2 hours, a fee may apply depending on your consultation plan.'
//         },
//         {
//             question: 'Are all doctors qualified and verified?',
//             answer: 'Yes, absolutely. All doctors on Zydoc are licensed medical professionals. They undergo thorough verification of their credentials, licenses, qualifications, and experience before being listed on our platform. We conduct background checks to ensure patient safety.'
//         },
//         {
//             question: 'How much does a consultation cost?',
//             answer: 'Consultation fees vary based on the doctor\'s experience and specialty, typically ranging from $20 to $100 per session. You can see the exact fee for each doctor before booking. We also offer subscription plans for regular consultations at discounted rates.'
//         },
//         {
//             question: 'Is my personal and medical information secure?',
//             answer: 'Your security is our top priority. We use end-to-end encryption for all communications and comply fully with HIPAA regulations. Your medical information is stored securely and never shared with third parties without your explicit consent. All data is backed up and protected by industry-leading security standards.'
//         },
//         {
//             question: 'Can I consult from anywhere?',
//             answer: 'Yes! You can consult from anywhere with an internet connection. Zydoc works on all devices—smartphones, tablets, and computers. Choose between video consultation (best quality), voice call, or chat based on your preference and the availability of the doctor.'
//         },
//         {
//             question: 'What if I miss my appointment?',
//             answer: 'If you miss your appointment, you can usually reschedule for another time based on the doctor\'s availability. Depending on your consultation plan, you may lose the consultation fee. We\'ll send you reminders before your appointment to help you remember.'
//         },
//         {
//             question: 'Do you provide prescriptions and medical reports?',
//             answer: 'Yes! After your consultation, the doctor can issue prescriptions and medical reports directly to your Zydoc account. You can download these documents, share them with pharmacies, or use them for medical records. Prescriptions are sent to your registered pharmacy or can be collected in person.'
//         }
//     ];

//     const toggleAccordion = (index: number) => {
//         setActiveFaq(activeFaq === index ? null : index);
//     };

//     return (
//         <section id="faq" className="w-full py-16 md:py-24 bg-slate-50/50">
//             <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
//                 {/* SECTION HEADER */}
//                 <div className="text-center mb-12 md:mb-16 space-y-4">
//                     <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-slate-900">
//                         Frequently Asked Questions
//                     </h2>
//                     <p className="text-lg text-slate-600">
//                         Find answers to common questions about our services.
//                     </p>
//                 </div>

//                 {/* ACCORDION */}
//                 <div className="space-y-3 md:space-y-4">
//                     {faqs.map((faq, index) => (
//                         <div
//                             key={index}
//                             className="bg-white rounded-lg border border-slate-200/60 overflow-hidden hover:shadow-md transition-shadow duration-200"
//                         >
//                             <button
//                                 onClick={() => toggleAccordion(index)}
//                                 className="w-full px-6 py-4 md:px-8 md:py-5 flex items-center justify-between hover:bg-slate-50/50 transition-colors duration-200 text-left"
//                             >
//                                 <span className="font-semibold text-slate-900 pr-4">
//                                     {faq.question}
//                                 </span>
//                                 <ChevronDown
//                                     className={`h-5 w-5 text-slate-600 flex-shrink-0 transition-transform duration-300 ${
//                                         activeFaq === index ? 'transform rotate-180' : ''
//                                     }`}
//                                 />
//                             </button>

//                             {/* ACCORDION CONTENT */}
//                             <div
//                                 className={`overflow-hidden transition-all duration-300 ease-in-out ${
//                                     activeFaq === index ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
//                                 }`}
//                             >
//                                 <div className="px-6 py-4 md:px-8 md:py-5 border-t border-slate-200/60 bg-slate-50/30">
//                                     <p className="text-slate-700 leading-relaxed">
//                                         {faq.answer}
//                                     </p>
//                                 </div>
//                             </div>
//                         </div>
//                     ))}
//                 </div>

//                 {/* ADDITIONAL HELP */}
//                 <div className="mt-12 md:mt-16 bg-gradient-to-r from-blue-50 to-blue-50/50 rounded-xl border border-blue-200/60 p-6 md:p-8 text-center">
//                     <h3 className="text-lg font-semibold text-slate-900 mb-2">
//                         Still have questions?
//                     </h3>
//                     <p className="text-slate-600 mb-4">
//                         Our support team is available 24/7 to help you.
//                     </p>
//                     <a
//                         href="mailto:support@zydoc.com"
//                         className="inline-flex items-center justify-center px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors duration-200"
//                     >
//                         Contact Support
//                     </a>
//                 </div>
//             </div>
//         </section>
//     );
// };

// export default FAQ;

