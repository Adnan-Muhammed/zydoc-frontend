import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { fetchNotifications, markNotificationRead, markAllNotificationsRead } from './notificationThunk';
import { NotificationItem } from './notificationService';

interface NotificationState {
  notifications: NotificationItem[];
  unreadCount: number;
  loading: boolean;
  error: string | null;
}

const initialState: NotificationState = {
  notifications: [],
  unreadCount: 0,
  loading: false,
  error: null,
};

const calculateUnreadCount = (notifications: NotificationItem[]) => {
  return notifications.filter((n) => !n.isRead).length;
};

const notificationSlice = createSlice({
  name: 'notification',
  initialState,
  reducers: {
    addRealTimeNotification: (state, action: PayloadAction<NotificationItem>) => {
      // Avoid duplicates
      const exists = state.notifications.find((n) => n._id === action.payload._id);
      if (!exists) {
        state.notifications.unshift(action.payload);
        state.unreadCount = calculateUnreadCount(state.notifications);
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Notifications
      .addCase(fetchNotifications.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchNotifications.fulfilled, (state, action: PayloadAction<NotificationItem[]>) => {
        state.loading = false;
        state.notifications = action.payload;
        state.unreadCount = calculateUnreadCount(state.notifications);
      })
      .addCase(fetchNotifications.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Mark as Read
      .addCase(markNotificationRead.fulfilled, (state, action: PayloadAction<NotificationItem>) => {
        const index = state.notifications.findIndex((n) => n._id === action.payload._id);
        if (index !== -1) {
          state.notifications[index].isRead = true;
          state.unreadCount = calculateUnreadCount(state.notifications);
        }
      })
      
      // Mark All as Read
      .addCase(markAllNotificationsRead.fulfilled, (state) => {
        state.notifications.forEach((n) => {
          n.isRead = true;
        });
        state.unreadCount = 0;
      });
  },
});

export const { addRealTimeNotification } = notificationSlice.actions;
export default notificationSlice.reducer;
