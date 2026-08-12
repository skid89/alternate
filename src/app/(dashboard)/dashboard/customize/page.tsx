import { verifyAndGetSession } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { redirect } from 'next/navigation';
import Customizer from '@/components/dashboard/Customizer';

export default async function CustomizePage() {
  const session = await verifyAndGetSession();
  if (!session) {
    redirect('/login');
  }

  const profile = await prisma.profile.findUnique({
    where: { userId: session.userId }
  });

  if (!profile) {
    redirect('/login');
  }

  return (
    <div className="customize-dashboard-wrapper animate-fade">
      <Customizer initialProfile={profile} />
    </div>
  );
}
