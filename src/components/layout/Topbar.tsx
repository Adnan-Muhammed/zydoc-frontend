// //src/components/layout/Topbar.tsx
// 'use client';

// import React from 'react';
// import { useAppSelector } from '../../redux/hooks'; // redux

// interface TopbarProps {
//   onToggleSidebar: () => void;
//   title?: string;
//   role: string;
// }

// export default function Topbar({ onToggleSidebar, title = 'Dashboard', role }: TopbarProps) {
//   const { user } = useAppSelector((state) => state.auth);

//   const getInitials = (name: string) => {
//     if (!name) return 'U';
//     const parts = name.split(' ');
//     if (parts.length > 1) return (parts[0][0] + parts[1][0]).toUpperCase();
//     return name[0].toUpperCase();
//   };

//   return (
//     <header className="dashboard-topbar">
//       <button className="topbar-menu-btn" onClick={onToggleSidebar}>
//         <i className="fas fa-bars"></i>
//       </button>

//       <div className="topbar-title">{title}</div>

//       <div className="topbar-search">
//         <i className="fas fa-search"></i>
//         <input type="text" placeholder="Search anything..." />
//       </div>

//       <div className="topbar-actions">
//         <div className="topbar-icon-btn" title="Notifications">
//           <i className="fas fa-bell"></i>
//           <span className="topbar-notif-dot"></span>
//         </div>
//         <div className="topbar-icon-btn" title="Messages">
//           <i className="fas fa-envelope"></i>
//         </div>
//         <div className="topbar-profile">
//           <div className="topbar-avatar">{getInitials(user?.name || role)}</div>
//           <div className="topbar-name">{user?.name || `Demo ${role}`}</div>
//           <i className="fas fa-chevron-down" style={{ fontSize: '11px', color: 'var(--gray-400)' }}></i>
//         </div>
//       </div>
//     </header>
//   );
// }




// // src/components/layout/Topbar.tsx
// 'use client';

// import React from 'react';
// import { useAppSelector } from '../../redux/hooks';

// interface TopbarProps {
//   onToggleSidebar: () => void;
//   title?: string;
//   role: string;
// }

// export default function Topbar(
//   props: TopbarProps
// ) {
//   const {
//     onToggleSidebar,
//     title = 'Dashboard',
//     role,
//   } = props;

//   const { user } = useAppSelector(
//     (state) => state.auth
//   );

//   const getInitials = (
//     name: string
//   ): string => {
//     if (!name) return 'U';

//     const parts = name.split(' ');

//     if (parts.length > 1) {
//       return (
//         parts[0][0] + parts[1][0]
//       ).toUpperCase();
//     }

//     return name[0].toUpperCase();
//   };

//   return (
//     <header className="dashboard-topbar">
//       <button
//         className="topbar-menu-btn"
//         onClick={onToggleSidebar}
//       >
//         <i className="fas fa-bars"></i>
//       </button>

//       <div className="topbar-title">
//         {title}
//       </div>

//       <div className="topbar-search">
//         <i className="fas fa-search"></i>
//         <input
//           type="text"
//           placeholder="Search anything..."
//         />
//       </div>

//       <div className="topbar-actions">
//         <div
//           className="topbar-icon-btn"
//           title="Notifications"
//         >
//           <i className="fas fa-bell"></i>
//           <span className="topbar-notif-dot"></span>
//         </div>

//         <div
//           className="topbar-icon-btn"
//           title="Messages"
//         >
//           <i className="fas fa-envelope"></i>
//         </div>

//         <div className="topbar-profile">
//           <div className="topbar-avatar">
//             {getInitials(
//               user?.name || role
//             )}
//           </div>

//           <div className="topbar-name">
//             {user?.name ||
//               `Demo ${role}`}
//           </div>

//           <i
//             className="fas fa-chevron-down"
//             style={{
//               fontSize: '11px',
//               color: 'var(--gray-400)',
//             }}
//           ></i>
//         </div>
//       </div>
//     </header>
//   );
// }







// src/components/layout/Topbar.tsx
'use client';

import React from 'react';
import { useAppSelector } from '../../redux/hooks';
import { useSocket } from '../../hooks/useSocket';

interface TopbarProps {
  onToggleSidebar: () => void; 
  title?: string;
  role: string; 
}

export default function Topbar({ onToggleSidebar, title, role }: TopbarProps) {
  const { user } = useAppSelector((state) => state.auth);
  
  const { hasUnreadNotifications, markNotificationsAsRead } = useSocket({ 
    userId: (user as any)?.profileId || user?.id || (user as any)?._id, 
    role 
  });

  const displayTitle = title || (role ? `${role.charAt(0).toUpperCase() + role.slice(1)} Dashboard` : 'Dashboard');

  const getInitials = (name: string): string => {
    if (!name) return 'U';
    const parts = name.split(' ');
    return parts.length > 1 ? (parts[0] [0] + parts[1][0]).toUpperCase() : name[0].toUpperCase();
  };

  return (
    <header className="dashboard-topbar flex justify-between w-full">
      <div className="topbar-left flex items-center gap-3 sm:gap-4">
        <button className="topbar-menu-btn" onClick={onToggleSidebar}>
          <i className="fas fa-bars"></i>
        </button>
        <h2 className="topbar-page-title text-base sm:text-lg font-semibold text-slate-800 m-0 whitespace-nowrap truncate max-w-[150px] sm:max-w-none">{displayTitle}</h2>
      </div>

      <div className="topbar-right flex items-center gap-2 sm:gap-4">
        <div className="topbar-search-container hidden md:flex items-center bg-slate-100 rounded-lg px-3 py-2 gap-2 border border-slate-200">
          <i className="fas fa-search text-slate-400"></i>
          <input type="text" placeholder="Search anything..." className="topbar-search-input bg-transparent border-none outline-none text-sm text-slate-700 w-48" />
        </div>

        <div className="topbar-actions flex items-center gap-2 sm:gap-3">
          <button 
            onClick={markNotificationsAsRead}
            className="topbar-icon-btn flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-xl border border-slate-200 bg-white text-slate-500 hover:bg-indigo-50 hover:text-indigo-600 transition-colors relative"
          >
            <i className="fas fa-bell"></i>
            {hasUnreadNotifications && (
              <span className="topbar-notif-dot absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
            )}
          </button>
          <button className="topbar-icon-btn flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-xl border border-slate-200 bg-white text-slate-500 hover:bg-indigo-50 hover:text-indigo-600 transition-colors">
            <i className="fas fa-envelope"></i>
          </button>

          <div className="topbar-profile flex items-center gap-2 cursor-pointer bg-slate-50 border border-slate-200 rounded-xl px-2 py-1.5 sm:px-3 sm:py-1.5">
            <div className="topbar-avatar flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-indigo-600 text-white text-xs font-semibold overflow-hidden">
              {user?.avatarUrl ? (
                <img 
                  src={`${process.env.NEXT_PUBLIC_API_URL}${user.avatarUrl.startsWith('/') ? '' : '/'}${user.avatarUrl}`} 
                  alt="Profile" 
                  className="w-full h-full object-cover" 
                />
              ) : (
                getInitials(user?.name || role)
              )}
            </div>
            <span className="topbar-user-name text-xs sm:text-sm font-medium text-slate-700 hidden sm:block">{user?.name || `Demo ${role}`}</span>
            <i className="fas fa-chevron-down text-[10px] text-slate-400"></i>
          </div>
        </div>
      </div>
    </header> 
  );
}