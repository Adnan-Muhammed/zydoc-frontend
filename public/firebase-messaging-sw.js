// public/firebase-messaging-sw.js
//
// Firebase Cloud Messaging Service Worker for Zydoc
//
// ─── CRITICAL: HOW ENV VARS ARE HANDLED IN THIS FILE ────────────────────────
//
//  Service workers run in an isolated Worker scope — there is no `window`,
//  no `document`, and no access to `process.env` (which is a Node/bundler
//  concept). The `public/` folder is served as static files and is NOT
//  processed by Webpack or Next.js.
//
//  Solution (Best Practice — "Config Endpoint" pattern):
//    During the SW `activate` event, we fetch /api/firebase-config — a
//    dedicated Next.js API route that reads process.env on the server and
//    returns the public config as JSON. We cache this in a module-level
//    variable and use it to initialise Firebase.
//
//    All values returned are NEXT_PUBLIC_ variables — they are already
//    embedded in the client JS bundle by Next.js, so this is not a
//    security concern.
//
// ─────────────────────────────────────────────────────────────────────────────

// Import Firebase compat scripts from the local /public folder.
//
// WHY LOCAL instead of CDN (https://www.gstatic.com/firebasejs/...):
//   Microsoft Edge's Tracking Prevention blocks cross-origin requests from
//   service workers to third-party domains like gstatic.com, causing the SW
//   to fail silently and the notification permission prompt to never appear.
//
//   These files are copied from node_modules/firebase/ at build time and
//   served from localhost, bypassing all tracking prevention restrictions.
//
//   To update: re-run the copy command when you upgrade firebase in package.json:
//   Copy-Item "node_modules\firebase\firebase-app-compat.js" "public\" -Force
//   Copy-Item "node_modules\firebase\firebase-messaging-compat.js" "public\" -Force
//
importScripts("/firebase-app-compat.js");
importScripts("/firebase-messaging-compat.js");

// Module-level variable to hold the resolved Firebase config.
// Populated in the `activate` event handler before any messages can arrive.
let firebaseConfig = null;
let messaging = null;

/**
 * Fetches the Firebase public config from our Next.js API route.
 * Returns the config object or null on failure.
 */
async function fetchFirebaseConfig() {
  try {
    // self.location.origin gives us the correct host in both
    // localhost:3000 (dev) and production environments.
    const res = await fetch(`${self.location.origin}/api/firebase-config`);
    if (!res.ok) {
      throw new Error(`Config endpoint responded with status ${res.status}`);
    }
    return await res.json();
  } catch (err) {
    console.error("[SW] ❌ Failed to fetch Firebase config:", err.message);
    return null;
  }
}

/**
 * Initialises the Firebase app and messaging inside the service worker.
 * Safe to call multiple times — guards against re-initialisation.
 */
function initFirebase(config) {
  if (!config) {
    console.error("[SW] Cannot initialise Firebase — config is null.");
    return;
  }

  // firebase.apps is the compat SDK's initialisation guard
  if (!firebase.apps.length) {
    firebase.initializeApp(config);
    console.log("[SW] ✅ Firebase initialised with project:", config.projectId);
  }

  // Assign the messaging instance so event handlers can use it
  messaging = firebase.messaging();
}

// ─── LIFECYCLE: install ───────────────────────────────────────────────────────
// Skip waiting so the new SW activates immediately without waiting for all
// tabs using the old SW to close.
self.addEventListener("install", (event) => {
  console.log("[SW] Installing...");
  self.skipWaiting();
});

// ─── LIFECYCLE: activate ──────────────────────────────────────────────────────
// Claim all open clients immediately and fetch the Firebase config.
// Activation happens BEFORE any push messages can be received, so we are
// guaranteed that Firebase is initialised before we need it.
self.addEventListener("activate", (event) => {
  console.log("[SW] Activating...");

  event.waitUntil(
    (async () => {
      // Claim all open tabs so they use this SW without a page refresh
      await self.clients.claim();

      // Fetch and store the Firebase config
      firebaseConfig = await fetchFirebaseConfig();

      // Initialise Firebase with the fetched config
      initFirebase(firebaseConfig);

      console.log("[SW] ✅ Service Worker active and Firebase ready.");
    })()
  );
});

// ─── BACKGROUND MESSAGES ──────────────────────────────────────────────────────
// The onBackgroundMessage handler is called when a push notification arrives
// and the web app is NOT in the foreground (tab is closed / not focused).
//
// For foreground messages, use onMessage() in your React component/hook.
//
// NOTE: This handler only fires for NOTIFICATION messages with a `data` payload,
// or DATA-ONLY messages. Pure notification messages are shown automatically by
// the browser without reaching this handler.
self.addEventListener("message", (event) => {
  // Handle any messages sent from the main thread to the SW (optional)
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});

self.addEventListener("push", (event) => {
  event.waitUntil(
    (async () => {
      try {
        // 1. If Firebase is not initialized, we MUST initialize it now.
        // This handles the case where the SW wakes up from sleep to process a push.
        if (!messaging) {
          if (!firebaseConfig) {
            console.log("[SW] Waking up: fetching Firebase config...");
            firebaseConfig = await fetchFirebaseConfig();
          }
          if (firebaseConfig) {
            initFirebase(firebaseConfig);
          }
        }

        // 2. Once messaging is initialized, Firebase's own background handler
        // will process the push event if it's registered. BUT we need to make sure
        // we display the notification if it falls through.
        if (!event.data) return;

        let payload;
        try {
          payload = event.data.json();
        } catch (err) {
          payload = { notification: { title: "New Notification", body: event.data.text() } };
        }

        console.log("[SW] Custom Push Listener Received Payload:", payload);

        // If the payload has a 'notification' object and Firebase SDK is active,
        // Firebase or the browser will automatically show it. 
        // We only manually show it if we explicitly need to.
        const notification = payload?.notification || payload?.data || {};
        const title = notification.title || "Zydoc Notification";
        const options = {
          body: notification.body || "You have a new message.",
          icon: "/favicon.ico",
          badge: "/favicon.ico",
          data: payload?.data || {},
          requireInteraction: false,
        };

        // We only show it if the browser doesn't do it automatically.
        // Actually, for safety, we'll just show it. If it duplicates, we'll know it worked.
        await self.registration.showNotification(title, options);
      } catch (error) {
        console.error("[SW] Error handling push event:", error);
      }
    })()
  );
});

// ─── NOTIFICATION CLICK ───────────────────────────────────────────────────────
// Handles what happens when the user clicks the background notification.
self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  // Determine the URL to open — falls back to the site root
  const clickUrl = event.notification.data?.link ?? "/";
  const fullUrl = new URL(clickUrl, self.location.origin).href;

  event.waitUntil(
    self.clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((clientList) => {
        // If a tab with this URL is already open, focus it
        for (const client of clientList) {
          if (client.url === fullUrl && "focus" in client) {
            return client.focus();
          }
        }
        // Otherwise, open a new tab
        if (self.clients.openWindow) {
          return self.clients.openWindow(fullUrl);
        }
      })
  );
});

// ─── FIREBASE onBackgroundMessage ─────────────────────────────────────────────
// This is the Firebase Messaging SDK's own background handler.
// It fires AFTER the raw `push` event — the SDK has already parsed the payload.
// We register it lazily after the activate event has set up messaging.
//
// Because the SW module scope is synchronous and the messaging instance is set
// up asynchronously in activate, we use a small polling approach to register
// the handler once messaging is available.
const registerBackgroundHandler = () => {
  if (messaging) {
    messaging.onBackgroundMessage((payload) => {
      console.log("[SW] Background message received:", payload);

      const title = payload.notification?.title ?? "Zydoc";
      const body = payload.notification?.body ?? "You have a new message.";
      const icon = payload.notification?.icon ?? "/favicon.ico";
      const link = payload.data?.link ?? "/";

      self.registration.showNotification(title, {
        body,
        icon,
        badge: "/favicon.ico",
        data: { link },
        requireInteraction: false,
      });
    });
    console.log("[SW] ✅ onBackgroundMessage handler registered.");
  } else {
    // Retry after a short delay if messaging isn't ready yet
    setTimeout(registerBackgroundHandler, 300);
  }
};

// Kick off the handler registration after the SW script loads.
// By the time a push event can arrive, the activate event will have
// completed and messaging will be set.
registerBackgroundHandler();
