/**
 * Synchronous Firebase config bootstrap for the classic FCM service worker.
 * The values are NEXT_PUBLIC_ config values, matching the browser Firebase app.
 */
export async function GET() {
  const config = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  };

  const missingKeys = Object.entries(config)
    .filter(([, value]) => !value)
    .map(([key]) => key);

  if (missingKeys.length) {
    console.error(`[firebase-config/sw.js] Missing env vars: ${missingKeys.join(", ")}`);
    return new Response("throw new Error('Firebase configuration is incomplete');", {
      status: 500,
      headers: { "Content-Type": "application/javascript; charset=utf-8", "Cache-Control": "no-store" },
    });
  }

  return new Response(`self.__FIREBASE_CONFIG__ = ${JSON.stringify(config)};`, {
    headers: {
      "Content-Type": "application/javascript; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
