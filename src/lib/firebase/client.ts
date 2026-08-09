import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getMessaging, isSupported } from "firebase/messaging";

// These are pulled securely because Next.js bakes NEXT_PUBLIC_ vars into the build
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

console.log("Firebase Config:", firebaseConfig);

// Initialize Firebase only if it hasn't been initialized already (prevents hot-reload errors)
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

const auth = getAuth(app);
const db = getFirestore(app);

/**
 * getFirebaseMessaging — lazily returns the Messaging instance.
 *
 * Must be called inside an async function or effect because:
 *  1. Service Workers are not available in SSR / Node environments.
 *  2. `isSupported()` is async and checks browser capabilities at runtime.
 *
 * Usage:
 *   const messaging = await getFirebaseMessaging();
 *   if (messaging) { ... }
 */
export const getFirebaseMessaging = async () => {
  const supported = await isSupported();
  if (!supported) return null;
  return getMessaging(app);
};

export { app, auth, db };



