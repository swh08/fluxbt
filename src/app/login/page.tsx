import { redirect } from 'next/navigation';
import { AuthPageHeader } from '@/components/auth/auth-page-header';
import { LoginForm } from '@/components/auth/login-form';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { getAppSession } from '@/lib/auth/session';

export default async function LoginPage() {
  const session = await getAppSession();

  if (session) {
    redirect('/');
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-12">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.18),_transparent_45%),radial-gradient(circle_at_bottom,_rgba(59,130,246,0.14),_transparent_40%)]" />
      <Card className="relative z-10 w-full max-w-md border-white/10 bg-card/80 shadow-2xl backdrop-blur-xl">
        <CardHeader className="space-y-3 text-center">
          <AuthPageHeader mode="login" />
        </CardHeader>
        <CardContent>
          <LoginForm />
        </CardContent>
      </Card>
    </main>
  );
}
