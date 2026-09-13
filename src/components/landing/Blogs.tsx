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




// 'use client';

// import Link from 'next/link';
// import { Calendar, ArrowRight, Heart } from 'lucide-react';

// const Blogs = () => {
//     const blogs = [
//         {
//             id: 1,
//             category: 'Heart Health',
//             title: '5 Essential Habits for Better Heart Health',
//             excerpt: 'Learn the most important habits you can develop to keep your heart healthy and reduce cardiovascular risks. Expert tips from cardiologists.',
//             image: 'https://images.unsplash.com/photo-1505576399279-565b52d4ac71?w=600&h=400&fit=crop',
//             date: 'Mar 15, 2025',
//             readTime: '5 min read',
//             author: 'Dr. Sarah Chen'
//         },
//         {
//             id: 2,
//             category: 'Mental Wellness',
//             title: 'Understanding Mental Health: Breaking the Stigma',
//             excerpt: 'Mental health is just as important as physical health. Discover how to recognize and address common mental health challenges effectively.',
//             image: 'https://images.unsplash.com/photo-1576091160399-7f94aa4d9b8a?w=600&h=400&fit=crop',
//             date: 'Mar 10, 2025',
//             readTime: '7 min read',
//             author: 'Dr. Michael Park'
//         },
//         {
//             id: 3,
//             category: 'Nutrition',
//             title: 'Complete Guide to Balanced Diet for All Ages',
//             excerpt: 'Explore the essential nutrients your body needs and learn how to create a balanced diet plan for optimal health and wellness.',
//             image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600&h=400&fit=crop',
//             date: 'Mar 5, 2025',
//             readTime: '6 min read',
//             author: 'Nutritionist Lisa Wong'
//         }
//     ];

//     return (
//         <section id="blog" className="w-full py-16 md:py-24 bg-gradient-to-b from-white to-slate-50/50">
//             <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
//                 {/* SECTION HEADER */}
//                 <div className="text-center mb-12 md:mb-16 space-y-4">
//                     <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-slate-900">
//                         Health Tips & Articles
//                     </h2>
//                     <p className="text-lg text-slate-600 max-w-2xl mx-auto">
//                         Stay informed with expert health tips and medical insights from our healthcare professionals.
//                     </p>
//                 </div>

//                 {/* BLOG GRID */}
//                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 mb-12">
//                     {blogs.map((blog) => (
//                         <Link
//                             key={blog.id}
//                             href={`/blog/${blog.id}`}
//                             className="group bg-white rounded-xl overflow-hidden border border-slate-200/60 hover:shadow-lg hover:border-slate-300 transition-all duration-300 flex flex-col"
//                         >
//                             {/* IMAGE CONTAINER */}
//                             <div className="relative h-48 md:h-56 overflow-hidden bg-slate-200">
//                                 <img
//                                     src={blog.image}
//                                     alt={blog.title}
//                                     className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
//                                 />
//                                 {/* CATEGORY BADGE */}
//                                 <div className="absolute top-4 right-4">
//                                     <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white text-xs font-semibold rounded-full shadow-md">
//                                         <Heart className="h-3 w-3" />
//                                         {blog.category}
//                                     </span>
//                                 </div>
//                             </div>

//                             {/* CONTENT */}
//                             <div className="flex flex-col flex-grow p-6 md:p-8">
//                                 {/* TITLE */}
//                                 <h3 className="text-lg md:text-xl font-bold text-slate-900 mb-3 line-clamp-2 group-hover:text-blue-600 transition-colors">
//                                     {blog.title}
//                                 </h3>

//                                 {/* EXCERPT */}
//                                 <p className="text-sm md:text-base text-slate-600 leading-relaxed mb-4 flex-grow line-clamp-3">
//                                     {blog.excerpt}
//                                 </p>

//                                 {/* META INFO */}
//                                 <div className="pt-4 border-t border-slate-200/60 space-y-3">
//                                     <div className="flex items-center justify-between text-xs text-slate-500">
//                                         <div className="flex items-center gap-4">
//                                             <span className="flex items-center gap-1">
//                                                 <Calendar className="h-3.5 w-3.5" />
//                                                 {blog.date}
//                                             </span>
//                                             <span>{blog.readTime}</span>
//                                         </div>
//                                     </div>
//                                     <div className="flex items-center justify-between">
//                                         <span className="text-xs font-medium text-slate-600">
//                                             By {blog.author}
//                                         </span>
//                                         <ArrowRight className="h-4 w-4 text-blue-600 group-hover:translate-x-1 transition-transform" />
//                                     </div>
//                                 </div>
//                             </div>
//                         </Link>
//                     ))}
//                 </div>

//                 {/* VIEW ALL ARTICLES */}
//                 <div className="text-center">
//                     <Link
//                         href="/blog"
//                         className="inline-flex items-center justify-center gap-2 px-6 py-3 md:px-8 md:py-4 bg-slate-100 text-slate-900 font-semibold rounded-lg hover:bg-slate-200 active:scale-95 transition-all duration-200"
//                     >
//                         <span>View All Articles</span>
//                         <ArrowRight className="h-5 w-5" />
//                     </Link>
//                 </div>

//                 {/* NEWSLETTER SECTION */}
//                 <div className="mt-16 md:mt-20 bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-8 md:p-12 text-white">
//                     <div className="max-w-2xl mx-auto text-center space-y-4">
//                         <h3 className="text-2xl md:text-3xl font-bold">
//                             Get Weekly Health Tips
//                         </h3>
//                         <p className="text-blue-100">
//                             Subscribe to our newsletter for expert health advice, wellness tips, and medical insights delivered to your inbox every week.
//                         </p>
//                         <form className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto mt-6" onSubmit={(e) => e.preventDefault()}>
//                             <input
//                                 type="email"
//                                 placeholder="Enter your email"
//                                 className="flex-grow px-4 py-3 rounded-lg text-slate-900 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-300"
//                                 required
//                             />
//                             <button
//                                 type="submit"
//                                 className="px-6 py-3 bg-white text-blue-600 font-semibold rounded-lg hover:bg-blue-50 active:scale-95 transition-all duration-200 whitespace-nowrap"
//                             >
//                                 Subscribe
//                             </button>
//                         </form>
//                     </div>
//                 </div>
//             </div>
//         </section>
//     );
// };

// export default Blogs;