import { redirect } from 'next/navigation';
import { UserRoundPlus } from 'lucide-react';
import { RegisterForm } from '@/components/auth/register-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { getAppSession } from '@/lib/auth/session';

export default async function RegisterPage() {
  const session = await getAppSession();

  if (session) {
    redirect('/');
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-12">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(34,197,94,0.18),_transparent_45%),radial-gradient(circle_at_bottom,_rgba(59,130,246,0.14),_transparent_40%)]" />
      <Card className="relative z-10 w-full max-w-md border-white/10 bg-card/80 shadow-2xl backdrop-blur-xl">
        <CardHeader className="space-y-3 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/15 text-emerald-400">
            <UserRoundPlus className="h-6 w-6" />
          </div>
          <div className="space-y-1">
            <CardTitle className="text-2xl">Create your FluxBT account</CardTitle>
            <CardDescription>Register a local username to protect your self-hosted dashboard.</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <RegisterForm />
        </CardContent>
      </Card>
    </main>
  );
}
