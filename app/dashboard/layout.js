import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth/next';
import DashboardLayout from '@/components/DashboardLayout';

export default async function Layout({ children }) {
  const session = await getServerSession();

  if (!session) {
    redirect('/auth/signin');
  }

  return <DashboardLayout>{children}</DashboardLayout>;
}