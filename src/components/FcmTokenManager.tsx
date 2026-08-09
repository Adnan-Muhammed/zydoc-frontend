"use client";

// src/components/FcmTokenManager.tsx
//
// Invisible component that initialises FCM token registration for doctors.
//
// HOW TO USE:
//   Import and render this component once inside your doctor-specific layout.
//   It renders null — it has no visual output whatsoever.
//
//   Example (src/app/doctor/layout.tsx or src/app/doctor/dashboard/layout.tsx):
//
//     import { FcmTokenManager } from "@/components/FcmTokenManager";
//
//     export default function DoctorLayout({ children }) {
//       return (
//         <>
//           <FcmTokenManager />
//           {children}
//         </>
//       );
//     }
//
// WHY a component instead of calling the hook in the layout directly:
//   Next.js layout files can be Server Components by default. React hooks
//   (like useEffect, useSelector) cannot be called in Server Components.
//   This wrapper carries the "use client" directive, making it safe to import
//   into any layout — server or client.

import { useFcmToken } from "../hooks/useFcmToken";

export function FcmTokenManager() {
  // The hook internally checks: isAuthenticated + role === "doctor"
  // so it is safe to render on any page that might be visited by non-doctors.
  useFcmToken();

  // Renders nothing — purely a side-effect component
  return null;
}
