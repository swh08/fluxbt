import { redirect } from 'next/navigation';
import { HomeShell } from '@/components/app/home-shell';
import { getAppSession } from '@/lib/auth/session';

export default async function HomePage() {
  const session = await getAppSession();

  if (!session) {
    redirect('/login');
  }

  return (
    <HomeShell
      currentUser={{
        username: session.user.username,
        name: session.user.name,
      }}
    />
  );
}
