// src/lib/firebase/messaging.ts

import { getToken } from "firebase/messaging";
import { getFirebaseMessaging } from "./client";

/**
 * Requests notification permission from the browser and retrieves the FCM token.
 *
 * This function handles all the setup steps in one place:
 *  1. Checks for browser support (returns null on unsupported browsers / SSR).
 *  2. Registers (or reuses) the firebase-messaging-sw.js service worker.
 *  3. Requests the Notification permission prompt if not already granted.
 *  4. Retrieves the FCM registration token using the VAPID key.
 *
 * @returns {Promise<string | null>} The FCM token, or null if unavailable/denied.
 */
export async function getFcmToken(): Promise<string | null> {
  // Guard: Service Workers do not exist in Node (SSR) or very old browsers
  if (typeof window === "undefined" || !("serviceWorker" in navigator)) {
    console.warn("[FCM] Service Workers are not supported in this environment.");
    return null;
  }

  const messaging = await getFirebaseMessaging();
  if (!messaging) {
    console.warn("[FCM] Firebase Messaging is not supported in this browser.");
    return null;
  }

  // Check existing permission state before calling requestPermission()
  // to avoid showing the prompt multiple times.
  if (Notification.permission === "denied") {
    console.warn("[FCM] Notification permission was denied by the user.");
    return null;
  }

  if (Notification.permission === "default") {
    const permission = await Notification.requestPermission();
    if (permission !== "granted") {
      console.warn("[FCM] User did not grant notification permission.");
      return null;
    }
  }

  // Register the service worker explicitly so we can pass the scope.
  // This is more reliable than letting Firebase auto-discover it.
  let swRegistration: ServiceWorkerRegistration | undefined;
  try {
    // Step 1: Register the SW (or no-op if already registered)
    await navigator.serviceWorker.register(
      "/firebase-messaging-sw.js",
      { scope: "/" }
    );

    // Step 2: WAIT for the SW to be fully ACTIVE before calling getToken().
    //
    // WHY: navigator.serviceWorker.register() resolves as soon as the SW
    // is *registered* — but the SW may still be in the "installing" or
    // "activating" state at that point. Calling getToken() (which internally
    // calls PushManager.subscribe()) while the SW is not yet active throws:
    //   "Subscription failed - no active Service Worker"
    //
    // navigator.serviceWorker.ready is a Promise that only resolves once
    // there is an *active* SW controlling the page. This guarantees the SW
    // has fully installed and activated before we proceed.
    swRegistration = await navigator.serviceWorker.ready;

    console.log("[FCM] Service worker active and ready:", swRegistration.scope);
  } catch (swError) {
    console.error("[FCM] Service worker registration failed:", swError);
    return null;
  }

  const vapidKey = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY;
  if (!vapidKey) {
    console.error("[FCM] NEXT_PUBLIC_FIREBASE_VAPID_KEY is not set in .env");
    return null;
  }

  try {
    const token = await getToken(messaging, {
      vapidKey,
      serviceWorkerRegistration: swRegistration,
    });

    if (token) {
      console.log("[FCM] ✅ Token retrieved successfully.");
      return token;
    } else {
      console.warn("[FCM] getToken returned an empty value. Check VAPID key and SW registration.");
      return null;
    }
  } catch (error: unknown) {
    const err = error as Error;
    console.error("[FCM] Error retrieving FCM token:", err.message);
    return null;
  }
}
