import NotificationList from '../../../../components/notifications/NotificationList';

export const metadata = {
  title: 'Notifications | Patient Dashboard',
};

export default function PatientNotificationsPage() {
  return <NotificationList role="patient" />;
}
