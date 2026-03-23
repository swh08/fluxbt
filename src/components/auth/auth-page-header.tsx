'use client';

import Image from 'next/image';
import { CardDescription, CardTitle } from '@/components/ui/card';
import { useI18n } from '@/contexts/i18n-context';

interface AuthPageHeaderProps {
  mode: 'login' | 'register';
}

export function AuthPageHeader({ mode }: AuthPageHeaderProps) {
  const { t } = useI18n();

  const titleKey = mode === 'login' ? 'auth.loginTitle' : 'auth.registerTitle';
  const descriptionKey =
    mode === 'login' ? 'auth.loginDescription' : 'auth.registerDescription';

  return (
    <>
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
        <Image src="/logo.svg" alt="FluxBT logo" width={36} height={36} className="h-9 w-9" priority />
      </div>
      <div className="space-y-1">
        <CardTitle className="text-2xl">{t(titleKey)}</CardTitle>
        <CardDescription>{t(descriptionKey)}</CardDescription>
      </div>
    </>
  );
}
