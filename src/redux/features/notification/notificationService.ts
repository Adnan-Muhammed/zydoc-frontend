import axiosInstance from '../../../api/axiosInstance';
import { NOTIFICATIONS } from '../../../api/endpoints';

export interface NotificationItem {
  _id: string;
  recipientId: string;
  recipientModel: string;
  type: string;
  title: string;
  message: string;
  referenceId?: string;
  isRead: boolean;
  createdAt: string;
}

const getNotifications = async () => {
  const response = await axiosInstance.get(NOTIFICATIONS.LIST);
  return response.data.data;
};

const markAsRead = async (id: string) => {
  const response = await axiosInstance.patch(NOTIFICATIONS.MARK_AS_READ(id));
  return response.data.data;
};

const markAllAsRead = async () => {
  const response = await axiosInstance.patch(NOTIFICATIONS.MARK_ALL_AS_READ);
  return response.data;
};

const notificationService = {
  getNotifications,
  markAsRead,
  markAllAsRead,
};

export default notificationService;
