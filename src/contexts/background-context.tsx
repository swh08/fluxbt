'use client';

import * as React from 'react';
import {
  loadPersistedBackgroundImage,
  persistBackgroundImage,
} from '@/lib/background-storage';

interface BackgroundContextType {
  backgroundImage: string | null;
  backgroundBlur: number;
  backgroundOpacity: number;
  setBackground: (image: string | null) => void;
  setBlur: (blur: number) => void;
  setOpacity: (opacity: number) => void;
  clearBackground: () => void;
}

const BackgroundContext = React.createContext<BackgroundContextType | undefined>(undefined);

const BLUR_KEY = 'fluxbt-background-blur';
const OPACITY_KEY = 'fluxbt-background-opacity';

export function BackgroundProvider({ children }: { children: React.ReactNode }) {
  const [backgroundImage, setBackgroundImage] = React.useState<string | null>(null);
  const [backgroundBlur, setBackgroundBlur] = React.useState(0);
  const [backgroundOpacity, setBackgroundOpacity] = React.useState(100);

  React.useEffect(() => {
    let cancelled = false;

    const loadBackground = async () => {
      try {
        const savedBackground = await loadPersistedBackgroundImage();

        if (!cancelled && savedBackground) {
          setBackgroundImage(savedBackground);
        }
      } catch (error) {
        console.error('Failed to load persisted background image.', error);
      }
    };

    let savedBlur: string | null = null;
    let savedOpacity: string | null = null;

    try {
      savedBlur = localStorage.getItem(BLUR_KEY);
      savedOpacity = localStorage.getItem(OPACITY_KEY);
    } catch (error) {
      console.error('Failed to read background display settings.', error);
    }

    if (savedBlur) {
      setBackgroundBlur(parseInt(savedBlur, 10));
    }
    if (savedOpacity) {
      setBackgroundOpacity(parseInt(savedOpacity, 10));
    }

    void loadBackground();

    return () => {
      cancelled = true;
    };
  }, []);

  const setBackground = (image: string | null) => {
    setBackgroundImage(image);

    void persistBackgroundImage(image).catch((error) => {
      console.error('Failed to persist background image.', error);
    });
  };

  const setBlur = (blur: number) => {
    setBackgroundBlur(blur);
    try {
      localStorage.setItem(BLUR_KEY, blur.toString());
    } catch (error) {
      console.error('Failed to persist background blur.', error);
    }
  };

  const setOpacity = (opacity: number) => {
    setBackgroundOpacity(opacity);
    try {
      localStorage.setItem(OPACITY_KEY, opacity.toString());
    } catch (error) {
      console.error('Failed to persist background opacity.', error);
    }
  };

  const clearBackground = () => {
    setBackgroundImage(null);
    void persistBackgroundImage(null).catch((error) => {
      console.error('Failed to clear persisted background image.', error);
    });
  };

  return (
    <BackgroundContext.Provider
      value={{
        backgroundImage,
        backgroundBlur,
        backgroundOpacity,
        setBackground,
        setBlur,
        setOpacity,
        clearBackground,
      }}
    >
      {children}
    </BackgroundContext.Provider>
  );
}

export function useBackground() {
  const context = React.useContext(BackgroundContext);
  if (context === undefined) {
    throw new Error('useBackground must be used within a BackgroundProvider');
  }
  return context;
}
