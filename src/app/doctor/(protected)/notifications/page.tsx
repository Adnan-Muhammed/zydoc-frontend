import NotificationList from '../../../../components/notifications/NotificationList';

export const metadata = {
  title: 'Notifications | Doctor Dashboard',
};

export default function DoctorNotificationsPage() {
  return <NotificationList role="doctor" />;
}
