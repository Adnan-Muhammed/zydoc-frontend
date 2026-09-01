"use client";

import { useSelector } from "react-redux";
import { useVideoCallNotifications } from "../hooks/useVideoCallNotifications";

export function VideoCallNotificationManager() {
  const { user, isAuthChecked } = useSelector((state: any) => state.auth);

  const userId = user?._id || user?.id;
  const role = user?.role;

  // Wait until auth is verified before hooking up the socket
  useVideoCallNotifications(isAuthChecked ? userId : undefined, isAuthChecked ? role : undefined);

  return null;
}
// Cache invalidation
