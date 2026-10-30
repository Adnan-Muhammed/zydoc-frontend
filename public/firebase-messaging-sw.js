// Firebase Messaging service worker. Keep all Firebase event registration
// synchronous during the worker's initial evaluation.
importScripts("/firebase-app-compat.js");
importScripts("/firebase-messaging-compat.js");
importScripts("/api/firebase-config/sw.js");

if (!self.__FIREBASE_CONFIG__) {
  throw new Error("Firebase config was not loaded for the messaging service worker.");
}

const firebaseApp = firebase.initializeApp(self.__FIREBASE_CONFIG__);
const messaging = firebase.messaging(firebaseApp);

messaging.onBackgroundMessage((payload) => {
  // FCM's SDK automatically displays payload.notification when no visible app
  // window is open. Calling showNotification() here as well creates duplicates.
  // Keep this callback for data-only messages, which still need an explicit UI.
  if (payload.notification) return;

  const title = payload.data?.title || "Zydocare Health";
  const body = payload.data?.body || payload.data?.message || "You have a new notification.";
  const link = payload.data?.link || "/doctor/appointments";

  return self.registration.showNotification(title, {
    body,
    icon: "/favicon.ico",
    badge: "/favicon.ico",
    data: { link },
    requireInteraction: false,
  });
});

self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const fullUrl = new URL(event.notification.data?.link || "/doctor/appointments", self.location.origin).href;

  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clients) => {
      const existing = clients.find((client) => new URL(client.url).origin === self.location.origin);
      if (existing && "focus" in existing) {
        return existing.focus().then(() => existing.navigate?.(fullUrl));
      }
      return self.clients.openWindow?.(fullUrl);
    })
  );
});
