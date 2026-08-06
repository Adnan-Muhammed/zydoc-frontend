import { createAsyncThunk } from '@reduxjs/toolkit';
import notificationService from './notificationService';
import { NotificationItem } from './notificationService';

export const fetchNotifications = createAsyncThunk<NotificationItem[], void, { rejectValue: string }>(
  'notification/fetchNotifications',
  async (_, thunkAPI) => {
    try {
      return await notificationService.getNotifications();
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || 'Failed to fetch notifications';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const markNotificationRead = createAsyncThunk<NotificationItem, string, { rejectValue: string }>(
  'notification/markNotificationRead',
  async (id, thunkAPI) => {
    try {
      return await notificationService.markAsRead(id);
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || 'Failed to mark notification as read';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const markAllNotificationsRead = createAsyncThunk<void, void, { rejectValue: string }>(
  'notification/markAllNotificationsRead',
  async (_, thunkAPI) => {
    try {
      await notificationService.markAllAsRead();
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || 'Failed to mark all notifications as read';
      return thunkAPI.rejectWithValue(message);
    }
  }
);
