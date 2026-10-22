import { redirect } from 'next/navigation';

// /admin always starts at the login; signed-in staff are sent on to the
// dashboard (Queue + Events) by the login page flow.
export default function AdminIndexPage() {
  redirect('/admin/login');
}
