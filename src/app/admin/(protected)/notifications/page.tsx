import NotificationList from '../../../../components/notifications/NotificationList';

export const metadata = {
  title: 'Notifications | Admin Dashboard',
};

export default function AdminNotificationsPage() {
  return <NotificationList role="admin" />;
}
