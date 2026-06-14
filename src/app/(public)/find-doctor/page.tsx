// // src/app/find-doctor/page.tsx
// 'use client';
// import React, { useState } from 'react';
// import Link from 'next/link';
// import './finddoctor.css';
// import '../landing.css'; // Reuse header/footer styles
// import Header from '@/components/layout/Header';

// const DUMMY_DOCTORS = [
//     {
//         id: 1,
//         name: "Dr. Sarah Johnson",
//         specialty: "General Practitioner",
//         experience: "12 years experience",
//         location: "New York, NY",
//         type: "Online & In-person",
//         rating: 5,
//         reviews: 125,
//         fee: 50,
//         image: "https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=400&h=300&fit=crop"
//     },
//     {
//         id: 2,
//         name: "Dr. Michael Chen",
//         specialty: "Pediatrician",
//         experience: "8 years experience",
//         location: "Los Angeles, CA",
//         type: "Online & In-person",
//         rating: 5,
//         reviews: 98,
//         fee: 45,
//         image: "https://images.unsplash.com/photo-1534581597156-b0e3f34d1049?w=400&h=300&fit=crop"
//     },
//     {
//         id: 3,
//         name: "Dr. Emily Rodriguez",
//         specialty: "Dentist",
//         experience: "15 years experience",
//         location: "Chicago, IL",
//         type: "In-person only",
//         rating: 4.5,
//         reviews: 156,
//         fee: 60,
//         image: "https://images.unsplash.com/photo-1559839734033-6461a1a8587b?w=400&h=300&fit=crop"
//     },
//     {
//         id: 4,
//         name: "Dr. James Wilson",
//         specialty: "Cardiologist",
//         experience: "20 years experience",
//         location: "Houston, TX",
//         type: "Online & In-person",
//         rating: 5,
//         reviews: 203,
//         fee: 85,
//         image: "https://images.unsplash.com/photo-1536064482ad12f183d518a65ec16f751f7b9d79?w=400&h=300&fit=crop"
//     },
//     {
//         id: 5,
//         name: "Dr. Lisa Martinez",
//         specialty: "Psychiatrist",
//         experience: "10 years experience",
//         location: "San Francisco, CA",
//         type: "Online only",
//         rating: 4.5,
//         reviews: 167,
//         fee: 70,
//         image: "https://images.unsplash.com/photo-1546239891-730f19ad5896?w=400&h=300&fit=crop"
//     },
//     {
//         id: 6,
//         name: "Dr. Robert Kim",
//         specialty: "Dermatologist",
//         experience: "14 years experience",
//         location: "Seattle, WA",
//         type: "Online & In-person",
//         rating: 5,
//         reviews: 141,
//         fee: 55,
//         image: "https://images.unsplash.com/photo-1618498082410-f3fc0ab4cb6f?w=400&h=300&fit=crop"
//     }
// ];

// export default function FindDoctorPage() {
//     const [priceRange, setPriceRange] = useState(200);

//     return (
//         <div>
//             {/* Header & Navigation */}
//             {/* <header>
//                 <nav className="navbar">
//                     <Link href="/" className="logo">
//                         <i className="fas fa-hospital-user"></i>
//                         Zydoc
//                     </Link>
//                     <ul className="nav-menu">
//                         <li><Link href="/">Home</Link></li>
//                         <li><a href="#doctors">Doctors</a></li>
//                         <li><a href="#">Services</a></li>
//                         <li><a href="#">About</a></li>
//                         <li><a href="#">Contact</a></li>
//                     </ul>
//                     <div className="nav-buttons">
//                         <Link href="/patient/signup" className="btn-outline">Sign Up</Link>
//                         <Link href="/login" className="btn-solid">Login</Link>
//                     </div>
//                 </nav>
//             </header> */}
//             <Header />

//             {/* Page Header */}
//             <section className="page-header" style={{ marginTop: '70px' }}>
//                 <h1>Find Your Doctor</h1>
//                 <p>Search and book appointments with verified medical professionals</p>
//             </section>

//             {/* Search Container */}
//             <div className="search-container">
//                 <div className="search-box">
//                     <input type="text" className="search-input" placeholder="Search by doctor name, specialization..." />
//                     <button className="search-button">
//                         <i className="fas fa-search"></i> Search
//                     </button>
//                 </div>
//             </div>

//             {/* Main Content */}
//             <div className="main-content">
//                 {/* Sidebar Filters */}
//                 <aside className="filters-sidebar">
//                     <h3 style={{ marginBottom: '1.5rem', fontWeight: 700, color: 'var(--text-dark)' }}>Filters</h3>

//                     {/* Specialization Filter */}
//                     <div className="filter-group">
//                         <div className="filter-title">Specialization</div>
//                         <div className="filter-options">
//                             <div className="filter-option">
//                                 <input type="checkbox" id="gp" defaultChecked />
//                                 <label htmlFor="gp">General Practice</label>
//                                 <span className="filter-count">45</span>
//                             </div>
//                             <div className="filter-option">
//                                 <input type="checkbox" id="cardio" />
//                                 <label htmlFor="cardio">Cardiology</label>
//                                 <span className="filter-count">28</span>
//                             </div>
//                             <div className="filter-option">
//                                 <input type="checkbox" id="derma" />
//                                 <label htmlFor="derma">Dermatology</label>
//                                 <span className="filter-count">32</span>
//                             </div>
//                             <div className="filter-option">
//                                 <input type="checkbox" id="pedia" />
//                                 <label htmlFor="pedia">Pediatrics</label>
//                                 <span className="filter-count">18</span>
//                             </div>
//                             <div className="filter-option">
//                                 <input type="checkbox" id="psych" />
//                                 <label htmlFor="psych">Psychiatry</label>
//                                 <span className="filter-count">22</span>
//                             </div>
//                             <div className="filter-option">
//                                 <input type="checkbox" id="dent" />
//                                 <label htmlFor="dent">Dentistry</label>
//                                 <span className="filter-count">15</span>
//                             </div>
//                         </div>
//                     </div>

//                     {/* Location Filter */}
//                     <div className="filter-group">
//                         <div className="filter-title">Location</div>
//                         <div className="filter-options">
//                             <div className="filter-option">
//                                 <input type="checkbox" id="online" defaultChecked />
//                                 <label htmlFor="online">Online Consultations</label>
//                                 <span className="filter-count">145</span>
//                             </div>
//                             <div className="filter-option">
//                                 <input type="checkbox" id="city1" />
//                                 <label htmlFor="city1">New York, NY</label>
//                                 <span className="filter-count">89</span>
//                             </div>
//                             <div className="filter-option">
//                                 <input type="checkbox" id="city2" />
//                                 <label htmlFor="city2">Los Angeles, CA</label>
//                                 <span className="filter-count">76</span>
//                             </div>
//                             <div className="filter-option">
//                                 <input type="checkbox" id="city3" />
//                                 <label htmlFor="city3">Chicago, IL</label>
//                                 <span className="filter-count">54</span>
//                             </div>
//                             <div className="filter-option">
//                                 <input type="checkbox" id="city4" />
//                                 <label htmlFor="city4">Houston, TX</label>
//                                 <span className="filter-count">42</span>
//                             </div>
//                         </div>
//                     </div>

//                     {/* Experience Filter */}
//                     <div className="filter-group">
//                         <div className="filter-title">Experience</div>
//                         <div className="filter-options">
//                             <div className="filter-option">
//                                 <input type="checkbox" id="exp1" />
//                                 <label htmlFor="exp1">0-5 years</label>
//                                 <span className="filter-count">45</span>
//                             </div>
//                             <div className="filter-option">
//                                 <input type="checkbox" id="exp2" />
//                                 <label htmlFor="exp2">5-10 years</label>
//                                 <span className="filter-count">67</span>
//                             </div>
//                             <div className="filter-option">
//                                 <input type="checkbox" id="exp3" />
//                                 <label htmlFor="exp3">10+ years</label>
//                                 <span className="filter-count">88</span>
//                             </div>
//                         </div>
//                     </div>

//                     {/* Price Range Filter */}
//                     <div className="filter-group">
//                         <div className="filter-title">Consultation Fee</div>
//                         <div className="range-slider">
//                             <input
//                                 type="range"
//                                 min="20"
//                                 max="200"
//                                 value={priceRange}
//                                 onChange={(e) => setPriceRange(Number(e.target.value))}
//                                 id="priceRange"
//                             />
//                             <div className="range-values">
//                                 <span>$20</span>
//                                 <span>${priceRange}</span>
//                             </div>
//                         </div>
//                     </div>

//                     {/* Rating Filter */}
//                     <div className="filter-group">
//                         <div className="filter-title">Rating</div>
//                         <div className="filter-options">
//                             <div className="filter-option">
//                                 <input type="checkbox" id="rating5" />
//                                 <label htmlFor="rating5">★★★★★ (5.0)</label>
//                                 <span className="filter-count">12</span>
//                             </div>
//                             <div className="filter-option">
//                                 <input type="checkbox" id="rating4" />
//                                 <label htmlFor="rating4">★★★★☆ (4.0+)</label>
//                                 <span className="filter-count">87</span>
//                             </div>
//                             <div className="filter-option">
//                                 <input type="checkbox" id="rating3" />
//                                 <label htmlFor="rating3">★★★☆☆ (3.0+)</label>
//                                 <span className="filter-count">134</span>
//                             </div>
//                         </div>
//                     </div>

//                     <button className="clear-filters">Clear Filters</button>
//                 </aside>

//                 {/* Doctors Grid */}
//                 <section className="doctors-section" id="doctors">
//                     <div className="results-header">
//                         <div className="results-info">
//                             Showing <strong>1-{DUMMY_DOCTORS.length}</strong> of <strong>145</strong> doctors
//                         </div>
//                         <select className="sort-dropdown">
//                             <option value="popular">Most Popular</option>
//                             <option value="rating">Highest Rated</option>
//                             <option value="price-low">Lowest Fee</option>
//                             <option value="price-high">Highest Fee</option>
//                             <option value="newest">Newest First</option>
//                         </select>
//                     </div>

//                     <div className="doctors-grid">
//                         {DUMMY_DOCTORS.map(doc => (
//                             <div className="doctor-card" key={doc.id}>
//                                 <div className="doctor-image">
//                                     <img src={doc.image} alt={doc.name} />
//                                     <div className="doctor-badge">
//                                         <i className="fas fa-check-circle"></i> Verified
//                                     </div>
//                                 </div>
//                                 <div className="doctor-info">
//                                     <h3 className="doctor-name">{doc.name}</h3>
//                                     <div className="doctor-specialty">{doc.specialty}</div>
//                                     <div className="doctor-details">
//                                         <div className="detail-item">
//                                             <i className="fas fa-briefcase"></i>
//                                             <span>{doc.experience}</span>
//                                         </div>
//                                         <div className="detail-item">
//                                             <i className="fas fa-map-marker-alt"></i>
//                                             <span>{doc.location}</span>
//                                         </div>
//                                         <div className="detail-item">
//                                             <i className="fas fa-video"></i>
//                                             <span>{doc.type}</span>
//                                         </div>
//                                     </div>
//                                     <div className="doctor-rating">
//                                         <div className="stars">
//                                             {Array.from({ length: Math.floor(doc.rating) }).map((_, i) => (
//                                                 <i key={i} className="fas fa-star"></i>
//                                             ))}
//                                             {doc.rating % 1 !== 0 && <i className="fas fa-star-half-alt"></i>}
//                                         </div>
//                                         <span className="rating-count">({doc.reviews} reviews)</span>
//                                     </div>
//                                     <div className="doctor-fee">
//                                         ${doc.fee} <span className="fee-label">per consultation</span>
//                                     </div>
//                                     <div className="doctor-actions">
//                                         <button className="btn-view">View Profile</button>
//                                         <button className="btn-book">Book Now</button>
//                                     </div>
//                                 </div>
//                             </div>
//                         ))}
//                     </div>

//                     {/* Pagination */}
//                     <div className="pagination">
//                         <button className="disabled">
//                             <i className="fas fa-chevron-left"></i>
//                         </button>
//                         <button className="active">1</button>
//                         <button>2</button>
//                         <button>3</button>
//                         <button>4</button>
//                         <span>...</span>
//                         <button>12</button>
//                         <button>
//                             <i className="fas fa-chevron-right"></i>
//                         </button>
//                     </div>
//                 </section>
//             </div>

//             {/* Footer */}
//             <footer>
//                 <div className="footer-content">
//                     <div className="footer-grid">
//                         <div className="footer-section">
//                             <Link href="/" className="logo">
//                                 <i className="fas fa-hospital-user"></i>
//                                 Zydoc
//                             </Link>
//                             <p style={{ marginTop: '1rem' }}>Your trusted partner in healthcare. Modern technology, human care.</p>
//                         </div>

//                         <div className="footer-section">
//                             <h3>Quick Links</h3>
//                             <ul>
//                                 <li><Link href="/">Home</Link></li>
//                                 <li><Link href="/find-doctor">Find Doctors</Link></li>
//                                 <li><a href="#">Services</a></li>
//                                 <li><a href="#">Contact</a></li>
//                             </ul>
//                         </div>

//                         <div className="footer-section">
//                             <h3>Company</h3>
//                             <ul>
//                                 <li><a href="#">About Us</a></li>
//                                 <li><a href="#">Privacy Policy</a></li>
//                                 <li><a href="#">Terms of Service</a></li>
//                                 <li><a href="#">Contact</a></li>
//                             </ul>
//                         </div>

//                         <div className="footer-section">
//                             <h3>Support</h3>
//                             <ul>
//                                 <li><a href="#">Help Center</a></li>
//                                 <li><a href="#">Contact Us</a></li>
//                                 <li>Email: support@zydoc.com</li>
//                                 <li>Phone: +1 (555) 123-4567</li>
//                             </ul>
//                         </div>
//                     </div>

//                     <div className="footer-bottom">
//                         <p>&copy; 2025 Zydoc. All rights reserved. | Privacy Policy | Terms of Service</p>
//                     </div>
//                 </div>
//             </footer>
//         </div>
//     );
// }




// src/app/find-doctor/page.tsx
// ✅ NO 'use client' — This is a Server Component for SEO


import axiosInstance from "@/api/axiosInstance";


import { Metadata } from 'next';
import DoctorFilters from '@/components/find-doctor/DoctorFilters';
import DoctorList from '@/components/find-doctor/DoctorList';
import { cookies } from 'next/headers';
import './finddoctor.css';
import { getDoctors } from "@/lib/doctors";
// import '../../(public)/landing.css';

export const metadata: Metadata = {
    title: "Find a Doctor Near You | Zydoc",
    description: "Search and book appointments with 1000+ verified doctors. Filter by specialty, location, experience, and consultation fee. Online & in-person available.",
    keywords: ["find doctor", "book doctor appointment", "online consultation", "specialist near me"],
    openGraph: {
        title: "Find a Doctor | Zydoc",
        description: "Browse and book with 1000+ verified medical professionals.",
        type: "website",
    },
};

// In the future: replace with real API fetch
async function getDoctorsDummy() {
    // TODO: Replace with real API call:
    // const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/doctors`, { cache: 'no-store' });
    // return res.json();
console.log();

    return [
        {
            id: 1,
            name: "Dr. Sarah Johnson",
            specialty: "General Practitioner",
            experience: "12 years experience",
            location: "New York, NY",
            type: "Online & In-person",
            rating: 5,
            reviews: 125,
            fee: 50,
            image: "https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=400&h=300&fit=crop",
        },
        {
            id: 2,
            name: "Dr. Michael Chen",
            specialty: "Pediatrician",
            experience: "8 years experience",
            location: "Los Angeles, CA",
            type: "Online & In-person",
            rating: 5,
            reviews: 98,
            fee: 45,
            image: "https://images.unsplash.com/photo-1534581597156-b0e3f34d1049?w=400&h=300&fit=crop",
        },
        {
            id: 3,
            name: "Dr. Emily Rodriguez",
            specialty: "Dentist",
            experience: "15 years experience",
            location: "Chicago, IL",
            type: "In-person only",
            rating: 4.5,
            reviews: 156,
            fee: 60,
            image: "https://images.unsplash.com/photo-1559839734033-6461a1a8587b?w=400&h=300&fit=crop",
        },
        {
            id: 4,
            name: "Dr. James Wilson",
            specialty: "Cardiologist",
            experience: "20 years experience",
            location: "Houston, TX",
            type: "Online & In-person",
            rating: 5,
            reviews: 203,
            fee: 85,
            image: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400&h=300&fit=crop",
        },
        {
            id: 5,
            name: "Dr. Lisa Martinez",
            specialty: "Psychiatrist",
            experience: "10 years experience",
            location: "San Francisco, CA",
            type: "Online only",
            rating: 4.5,
            reviews: 167,
            fee: 70,
            image: "https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=400&h=300&fit=crop",
        },
        {
            id: 6,
            name: "Dr. Robert Kim",
            specialty: "Dermatologist",
            experience: "14 years experience",
            location: "Seattle, WA",
            type: "Online & In-person",
            rating: 5,
            reviews: 141,
            fee: 55,
            image: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=400&h=300&fit=crop",
        },
    ];
}



// const getDoctors = async () => {
//   const response = await axiosInstance.get("/doctors");
//   console.log(response.data)

//   return response.data;
// };

const getDoctorsList = async (searchParams?: any) => {
    const response = await getDoctors(searchParams);
    if (!response || !response.doctors) {
        return { doctors: [], pagination: null };
    }

    const doctors = response.doctors.map((doc: any) => {
        const hasVideo = doc.consultationSettings?.video?.enabled;
        const hasPhysical = doc.consultationSettings?.physical?.enabled;
        let typeStr = "Online & In-person";
        if (hasVideo && !hasPhysical) {
            typeStr = "Online only";
        } else if (!hasVideo && hasPhysical) {
            typeStr = "In-person only";
        }

        const fee = doc.consultationSettings?.video?.enabled 
            ? (doc.consultationSettings?.video?.fee ?? 0)
            : (doc.consultationSettings?.physical?.fee ?? 0);

        const videoFee = hasVideo ? (doc.consultationSettings?.video?.fee ?? 0) : null;
        const physicalFee = hasPhysical ? (doc.consultationSettings?.physical?.fee ?? 0) : null;
        const clinicName = doc.consultationSettings?.physical?.clinicName || "";
        const clinicAddress = doc.consultationSettings?.physical?.clinicAddress || "";

        const location = doc.consultationSettings?.physical?.clinicAddress || "Online / Remote";
        let image = "https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=400&h=300&fit=crop";
        if (doc.avatarUrl) {
            if (doc.avatarUrl.startsWith('http://') || doc.avatarUrl.startsWith('https://')) {
                image = doc.avatarUrl;
            } else {
                const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:5001';
                const cleanPath = doc.avatarUrl.startsWith('/') ? doc.avatarUrl : `/${doc.avatarUrl}`;
                image = `${baseUrl}${cleanPath}`;
            }
        }


        return {
            id: String(doc.id || doc._id),
            name: doc.name || `${doc.firstName || ""} ${doc.lastName || ""}`.trim() || "Doctor",
            specialty: doc.specialty || "General Practitioner",
            experience: `${doc.yearsOfExperience || 0} years experience`,
            location: location,
            type: typeStr,
            rating: doc.rating ?? 5.0,
            reviews: doc.reviewCount ?? 0,
            fee: fee,
            videoFee: videoFee,
            physicalFee: physicalFee,
            clinicName: clinicName,
            clinicAddress: clinicAddress,
            image: image
        }; 
    });

    return { doctors, pagination: response.pagination };
};

async function getUser(accessToken: string) {
    try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/me`, {
            headers: { Cookie: `accessToken=${accessToken}` },
            cache: 'no-store',
        });
        if (!res.ok) return null;
        const data = await res.json();
        return data.user ?? null;
    } catch {
        return null;
    }
}

export default async function FindDoctorPage({
    searchParams
}: {
    searchParams: { search?: string; page?: string };
}) {
    const cookieStore = cookies();
    const accessToken = cookieStore.get('accessToken')?.value;

    // Fetch ALL doctors so client-side filtering works correctly on the entire dataset
    const doctorsDataPromise = getDoctorsList({ search: searchParams.search, limit: 0 });
    const userPromise = accessToken ? getUser(accessToken) : Promise.resolve(null);                             

    const [doctorsData, user] = await Promise.all([doctorsDataPromise, userPromise]);

    



    return (


        <div>
            {/* <Header user={user} /> */}

            {/* SEO-friendly static page header — rendered in HTML, crawlable */}
            <section className="page-header" style={{ marginTop: '70px' }}>
                <h1>Find Your Doctor</h1>
                <p>Search and book appointments with verified medical professionals</p>
            </section>

            {/* Static search bar shell — interactivity handled in DoctorFilters client component */}
            <div className="search-container">
                <div className="search-box">
                    {/* DoctorFilters takes over search interactivity on the client */}
                    <DoctorFilters />
                </div>
            </div>

            {/* Main layout: sidebar + doctor grid */}
            <div className="main-content">
                {/* 
          Doctor list is pre-rendered on the server with real data.
          DoctorList is a Client Component only for sort/filter interactivity.
          All doctor cards are in the initial HTML for SEO.
        */}
                <DoctorList doctors={doctorsData.doctors} />
            </div>


        </div>
    );
}