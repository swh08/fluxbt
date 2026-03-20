'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';
import { signIn } from 'next-auth/react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useI18n } from '@/contexts/i18n-context';

function getLoginErrorMessage(code: string | null, t: (key: string) => string): string {
  if (code === 'CredentialsSignin') {
    return t('auth.invalidCredentials');
  }

  return t('auth.unexpectedError');
}

export function LoginForm() {
  const router = useRouter();
  const { t } = useI18n();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    startTransition(() => {
      void (async () => {
        const result = await signIn('credentials', {
          redirect: false,
          username,
          password,
          callbackUrl: '/',
        });

        if (!result || result.error) {
          setError(getLoginErrorMessage(result?.error ?? null, t));
          return;
        }

        router.replace('/');
        router.refresh();
      })();
    });
  }

  return (
    <form className="space-y-5" onSubmit={handleSubmit}>
      <div className="space-y-2">
        <Label htmlFor="username">{t('auth.username')}</Label>
        <Input
          id="username"
          name="username"
          autoComplete="username"
          value={username}
          onChange={(event) => setUsername(event.target.value)}
          placeholder={t('auth.usernamePlaceholder')}
          disabled={isPending}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">{t('auth.password')}</Label>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          placeholder={t('auth.passwordPlaceholder')}
          disabled={isPending}
        />
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertTitle>{t('auth.loginFailed')}</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending ? t('auth.loggingIn') : t('auth.signIn')}
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        {t('auth.noAccount')}{' '}
        <Link href="/register" className="font-medium text-primary hover:underline">
          {t('auth.goToRegister')}
        </Link>
      </p>
    </form>
  );
}
