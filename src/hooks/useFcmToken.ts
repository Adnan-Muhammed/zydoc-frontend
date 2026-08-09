// src/hooks/useFcmToken.ts

import { useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import { getFcmToken } from "../lib/firebase/messaging";
import axiosInstance from "../api/axiosInstance";
import type { RootState } from "../redux/store";

/**
 * useFcmToken — Custom hook for FCM token registration.
 *
 * This hook should be called once inside doctor-protected layouts/pages.
 * It automatically:
 *  1. Waits for the auth check to complete (isAuthChecked) — prevents race conditions.
 *  2. Verifies the user is authenticated and is a doctor before proceeding.
 *  3. Calls getFcmToken() to request permission and get the device token.
 *  4. Sends the token to the backend PATCH /api/doctors/fcm-token endpoint.
 *  5. Persists a "registered" flag in sessionStorage to avoid redundant calls
 *     on re-renders or navigating between doctor pages in the same session.
 */
export function useFcmToken() {
  const { user, isAuthenticated, isAuthChecked } = useSelector((state: RootState) => state.auth);
  const hasRegistered = useRef(false); // In-memory guard against React StrictMode double-invoke

  useEffect(() => {
    // --- DIAGNOSTIC LOGS (remove these after confirming FCM works) ---
    console.log("[useFcmToken] Effect triggered:", {
      isAuthChecked,
      isAuthenticated,
      role: user?.role,
      hasRegistered: hasRegistered.current,
      sessionFlag: sessionStorage.getItem("fcm_registered"),
    });

    // Wait until the auth check API call has fully resolved.
    // Without this, the layout mounts with isAuthenticated=false before
    // checkAuth() completes, and the hook exits early and never re-runs correctly.
    if (!isAuthChecked) {
      console.log("[useFcmToken] Waiting for auth check to complete...");
      return;
    }

    if (!isAuthenticated || !user) {
      console.log("[useFcmToken] User not authenticated — skipping FCM registration.");
      return;
    }

    // Case-insensitive role check to handle "Doctor" vs "doctor" variants
    if (user.role?.toLowerCase() !== "doctor") {
      console.log(`[useFcmToken] Role is "${user.role}" — FCM only registers for doctors.`);
      return;
    }

    if (hasRegistered.current || sessionStorage.getItem("fcm_registered") === "true") {
      console.log("[useFcmToken] Already registered this session — skipping.");
      return;
    }

    const registerToken = async () => {
      try {
        console.log("[useFcmToken] Starting FCM token registration...");
        const token = await getFcmToken();

        if (!token) {
          // getFcmToken() logs the reason internally
          return;
        }

        // Send the token to the backend — mounted at /api/doctor/ in server.js
        await axiosInstance.patch("/doctor/fcm-token", { fcmToken: token });

        // Mark as registered for this browser session
        hasRegistered.current = true;
        sessionStorage.setItem("fcm_registered", "true");
        console.log("[useFcmToken] ✅ FCM token successfully registered with the backend.");
      } catch (error: unknown) {
        const err = error as { response?: { data?: { message?: string } }; message?: string };
        console.error(
          "[useFcmToken] ❌ Failed to register FCM token:",
          err.response?.data?.message ?? err.message
        );
      }
    };

    registerToken();
  }, [isAuthChecked, isAuthenticated, user]);
}
