'use client';

import { useBackground } from '@/contexts/background-context';

export function BackgroundImage() {
  const { backgroundImage, backgroundBlur, backgroundOpacity } = useBackground();

  if (!backgroundImage) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-[-1] pointer-events-none"
      style={{
        backgroundImage: `url(${backgroundImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        filter: `blur(${backgroundBlur}px)`,
        opacity: backgroundOpacity / 100,
        transform: backgroundBlur > 0 ? `scale(${1 + backgroundBlur / 100})` : 'none',
      }}
    />
  );
}
