import dayjs from 'dayjs';
import { redirect } from 'next/navigation';

export default function ScheduleRoot() {
  const monday = dayjs().startOf('week').add(1, 'day').format('YYYY-MM-DD');
  redirect(`/schedule/${monday}`);
}
