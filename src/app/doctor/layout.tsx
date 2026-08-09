// src/app/doctor/layout.tsx
import { FcmTokenManager } from "@/components/FcmTokenManager";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {/* Silently registers the FCM token for push notifications — renders nothing */}
      <FcmTokenManager />
      <main className="min-h-screen bg-slate-600">
        {children}
      </main>
    </>
  );
}