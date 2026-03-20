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

function getRegisterErrorMessage(code: string | null, t: (key: string) => string): string {
  switch (code) {
    case 'USERNAME_TAKEN':
      return t('auth.usernameTaken');
    case 'PASSWORD_MISMATCH':
      return t('auth.passwordMismatch');
    case 'USERNAME_REQUIRED':
    case 'INVALID_INPUT':
      return t('auth.usernameRequired');
    case 'PASSWORD_REQUIRED':
      return t('auth.passwordRequired');
    case 'CredentialsSignin':
      return t('auth.invalidCredentials');
    default:
      return t('auth.unexpectedError');
  }
}

export function RegisterForm() {
  const router = useRouter();
  const { t } = useI18n();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    startTransition(() => {
      void (async () => {
        const response = await fetch('/api/auth/register', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            username,
            password,
            confirmPassword,
          }),
        });

        if (!response.ok) {
          const payload = (await response.json().catch(() => null)) as { error?: string } | null;
          setError(getRegisterErrorMessage(payload?.error ?? null, t));
          return;
        }

        const loginResult = await signIn('credentials', {
          redirect: false,
          username,
          password,
          callbackUrl: '/',
        });

        if (!loginResult || loginResult.error) {
          setError(getRegisterErrorMessage(loginResult?.error ?? null, t));
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
          autoComplete="new-password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          placeholder={t('auth.passwordPlaceholder')}
          disabled={isPending}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="confirmPassword">{t('auth.confirmPassword')}</Label>
        <Input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          autoComplete="new-password"
          value={confirmPassword}
          onChange={(event) => setConfirmPassword(event.target.value)}
          placeholder={t('auth.confirmPasswordPlaceholder')}
          disabled={isPending}
        />
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertTitle>{t('auth.registerFailed')}</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending ? t('auth.registering') : t('auth.createAccount')}
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        {t('auth.hasAccount')}{' '}
        <Link href="/login" className="font-medium text-primary hover:underline">
          {t('auth.goToLogin')}
        </Link>
      </p>
    </form>
  );
}
