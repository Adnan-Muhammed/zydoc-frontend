import ScheduleClient from './ScheduleClient';

export const metadata = {
  title: 'My Schedule | Doctor Dashboard',
  description: 'View and manage your daily availability and appointments.',
};

export default function DoctorSchedulePage() {
  return <ScheduleClient />;
}
