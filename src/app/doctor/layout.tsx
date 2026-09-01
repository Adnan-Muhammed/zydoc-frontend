// src/app/doctor/layout.tsx
import { FcmTokenManager } from "@/components/FcmTokenManager";
import { VideoCallNotificationManager } from "@/modules/video-call";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {/* Silently registers the FCM token for push notifications — renders nothing */}
      <FcmTokenManager />
      {/* Silently listens for video call notifications — renders nothing */}
      <VideoCallNotificationManager />
      <main className="min-h-screen bg-slate-600">
        {children}
      </main>
    </>
  );
}