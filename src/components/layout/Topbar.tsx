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

interface TopbarProps {
  onToggleSidebar: () => void; 
  title?: string;
  role: string; 
}

export default function Topbar({ onToggleSidebar, title, role }: TopbarProps) {
  const { user } = useAppSelector((state) => state.auth);

  const displayTitle = title || (role ? `${role.charAt(0).toUpperCase() + role.slice(1)} Dashboard` : 'Dashboard');

  const getInitials = (name: string): string => {
    if (!name) return 'U';
    const parts = name.split(' ');
    return parts.length > 1 ? (parts[0] [0] + parts[1][0]).toUpperCase() : name[0].toUpperCase();
  };

  return (
    <header className="dashboard-topbar">
      <div className="topbar-left">
        <button className="topbar-menu-btn" onClick={onToggleSidebar}>
          <i className="fas fa-bars"></i>
        </button>
        <h2 className="topbar-page-title">{displayTitle}</h2>
      </div>

      <div className="topbar-right">
        <div className="topbar-search-container">
          <i className="fas fa-search search-icon"></i>
          <input type="text" placeholder="Search anything..." className="topbar-search-input" />
        </div>

        <div className="topbar-actions">
          <button className="topbar-icon-btn">
            <i className="fas fa-bell"></i>
            <span className="topbar-notif-dot"></span>
          </button>
          <button className="topbar-icon-btn">
            <i className="fas fa-envelope"></i>
          </button>

          <div className="topbar-profile">
            <div className="topbar-avatar">
              {getInitials(user?.name || role)}
            </div>
            <span className="topbar-user-name">{user?.name || `Demo ${role}`}</span>
            <i className="fas fa-chevron-down dropdown-icon"></i>
          </div>
        </div>
      </div>
    </header> 
  );
}