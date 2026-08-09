// src/app/api/firebase-config/route.ts

import { NextResponse } from "next/server";

/**
 * GET /api/firebase-config
 *
 * This endpoint exists ONLY to serve the Firebase public configuration to the
 * service worker (public/firebase-messaging-sw.js).
 *
 * WHY this exists:
 *   Service workers run in an isolated scope and cannot access `process.env`
 *   or `window`. They also cannot `import` ES modules. The only way to get
 *   environment variables into a service worker safely is either:
 *     (a) Hard-code values (insecure / not suitable for multiple environments)
 *     (b) Use a build step to replace placeholders (complex)
 *     (c) Have the SW fetch a dedicated endpoint on activation — THIS approach.
 *
 * Security note:
 *   All values returned here are NEXT_PUBLIC_ variables — they are already
 *   baked into the client-side JavaScript bundle by Next.js at build time.
 *   There is NO sensitive information in this response.
 *
 * The service worker fetches this route during its `activate` event and
 * stores the config in-memory before calling `initializeApp()`.
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

  // Validate that all required fields are present
  const missingKeys = Object.entries(config)
    .filter(([, v]) => !v)
    .map(([k]) => k);

  if (missingKeys.length > 0) {
    console.error(
      `[/api/firebase-config] Missing env vars: ${missingKeys.join(", ")}`
    );
    return NextResponse.json(
      { error: "Firebase configuration is incomplete on the server." },
      { status: 500 }
    );
  }

  return NextResponse.json(config, {
    headers: {
      // Cache for 1 hour — these values only change during deployments
      "Cache-Control": "public, max-age=3600",
    },
  });
}
