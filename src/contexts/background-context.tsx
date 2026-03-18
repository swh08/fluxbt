'use client';

import * as React from 'react';

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

const STORAGE_KEY = 'fluxbt-background';
const BLUR_KEY = 'fluxbt-background-blur';
const OPACITY_KEY = 'fluxbt-background-opacity';

export function BackgroundProvider({ children }: { children: React.ReactNode }) {
  const [backgroundImage, setBackgroundImage] = React.useState<string | null>(null);
  const [backgroundBlur, setBackgroundBlur] = React.useState(0);
  const [backgroundOpacity, setBackgroundOpacity] = React.useState(100);
  const [mounted, setMounted] = React.useState(false);

  // Load from localStorage on mount
  React.useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem(STORAGE_KEY);
    const savedBlur = localStorage.getItem(BLUR_KEY);
    const savedOpacity = localStorage.getItem(OPACITY_KEY);
    
    if (saved) {
      setBackgroundImage(saved);
    }
    if (savedBlur) {
      setBackgroundBlur(parseInt(savedBlur, 10));
    }
    if (savedOpacity) {
      setBackgroundOpacity(parseInt(savedOpacity, 10));
    }
  }, []);

  const setBackground = (image: string | null) => {
    setBackgroundImage(image);
    if (image) {
      localStorage.setItem(STORAGE_KEY, image);
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  };

  const setBlur = (blur: number) => {
    setBackgroundBlur(blur);
    localStorage.setItem(BLUR_KEY, blur.toString());
  };

  const setOpacity = (opacity: number) => {
    setBackgroundOpacity(opacity);
    localStorage.setItem(OPACITY_KEY, opacity.toString());
  };

  const clearBackground = () => {
    setBackgroundImage(null);
    localStorage.removeItem(STORAGE_KEY);
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
