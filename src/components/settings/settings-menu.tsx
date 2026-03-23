'use client';

import * as React from 'react';
import { signOut } from 'next-auth/react';
import { useTheme } from 'next-themes';
import { useI18n } from '@/contexts/i18n-context';
import { useBackground } from '@/contexts/background-context';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu';
import { Slider } from '@/components/ui/slider';
import { Check, Sun, Moon, Monitor, Languages, Image as ImageIcon, X, Upload, LogOut } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  getSessionUserDisplayName,
  getSessionUserInitial,
  type SessionUserIdentity,
} from '@/lib/auth/session-user';

interface SettingsMenuProps {
  children: React.ReactNode;
  user?: SessionUserIdentity;
}

export function SettingsMenu({ children, user }: SettingsMenuProps) {
  const { theme, setTheme } = useTheme();
  const { language, setLanguage, t } = useI18n();
  const { backgroundImage, backgroundBlur, backgroundOpacity, setBackground, setBlur, setOpacity, clearBackground } = useBackground();
  const [mounted, setMounted] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const displayName = getSessionUserDisplayName(user ?? {});
  const userInitial = getSessionUserInitial(user ?? {});

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        setBackground(result);
        e.target.value = '';
      };
      reader.onerror = () => {
        e.target.value = '';
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleSignOut = () => {
    const callbackUrl =
      typeof window === 'undefined'
        ? '/login'
        : new URL('/login', window.location.origin).toString();

    void signOut({ callbackUrl });
  };

  if (!mounted) {
    return <>{children}</>;
  }

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />
      <DropdownMenu>
        <DropdownMenuTrigger asChild>{children}</DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          onCloseAutoFocus={(event) => event.preventDefault()}
          className={cn(
            'w-56 p-2',
            'border-border rounded-lg',
            backgroundImage
              ? 'bg-popover/80 backdrop-blur-xl supports-[backdrop-filter]:bg-popover/60 shadow-2xl'
              : 'bg-popover shadow-lg',
            'rounded-lg'
          )}
        >
          <div className="rounded-md border border-border/70 bg-muted/35 px-3 py-2">
            <div className="flex items-center gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/15 text-sm font-semibold text-primary">
                {userInitial}
              </span>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-foreground">
                  {displayName}
                </p>
                <p className="text-xs text-muted-foreground">
                  {t('auth.username')}
                </p>
              </div>
            </div>
          </div>

          <DropdownMenuSeparator className="my-2" />

          {/* Theme Section */}
          <DropdownMenuLabel className="flex items-center gap-2 text-xs font-medium text-muted-foreground uppercase tracking-wider px-2 pt-1 pb-2">
            <Sun className="w-3.5 h-3.5" />
            {t('settings.theme')}
          </DropdownMenuLabel>
          <DropdownMenuSeparator className="my-1" />
          <DropdownMenuRadioGroup value={theme} onValueChange={setTheme}>
            <DropdownMenuRadioItem
              value="light"
              className={cn(
                'flex items-center gap-2 cursor-pointer rounded-md px-2 py-1.5 text-sm',
                'focus:bg-accent focus:text-accent-foreground',
                theme === 'light' && 'bg-accent/50'
              )}
            >
              <Sun className="w-4 h-4 text-amber-500" />
              <span className="flex-1">{t('settings.themeLight')}</span>
              {theme === 'light' && <Check className="w-4 h-4 text-primary" />}
            </DropdownMenuRadioItem>
            <DropdownMenuRadioItem
              value="dark"
              className={cn(
                'flex items-center gap-2 cursor-pointer rounded-md px-2 py-1.5 text-sm',
                'focus:bg-accent focus:text-accent-foreground',
                theme === 'dark' && 'bg-accent/50'
              )}
            >
              <Moon className="w-4 h-4 text-indigo-400" />
              <span className="flex-1">{t('settings.themeDark')}</span>
              {theme === 'dark' && <Check className="w-4 h-4 text-primary" />}
            </DropdownMenuRadioItem>
            <DropdownMenuRadioItem
              value="system"
              className={cn(
                'flex items-center gap-2 cursor-pointer rounded-md px-2 py-1.5 text-sm',
                'focus:bg-accent focus:text-accent-foreground',
                theme === 'system' && 'bg-accent/50'
              )}
            >
              <Monitor className="w-4 h-4 text-muted-foreground" />
              <span className="flex-1">{t('settings.themeSystem')}</span>
              {theme === 'system' && <Check className="w-4 h-4 text-primary" />}
            </DropdownMenuRadioItem>
          </DropdownMenuRadioGroup>

          <DropdownMenuSeparator className="my-2" />

          {/* Background Section */}
          <DropdownMenuLabel className="flex items-center gap-2 text-xs font-medium text-muted-foreground uppercase tracking-wider px-2 pt-1 pb-2">
            <ImageIcon className="w-3.5 h-3.5" />
            {t('settings.background')}
          </DropdownMenuLabel>
          <DropdownMenuSeparator className="my-1" />
          
          {/* Upload Button */}
          <DropdownMenuItem
            onClick={handleUploadClick}
            className={cn(
              'flex items-center gap-2 cursor-pointer rounded-md px-2 py-1.5 text-sm',
              'focus:bg-accent focus:text-accent-foreground'
            )}
          >
            <Upload className="w-4 h-4 text-muted-foreground" />
            <span className="flex-1">{t('settings.uploadBackground')}</span>
          </DropdownMenuItem>

          {/* Clear Background - only show if has background */}
          {backgroundImage && (
            <DropdownMenuItem
              onClick={clearBackground}
              className={cn(
                'flex items-center gap-2 cursor-pointer rounded-md px-2 py-1.5 text-sm',
                'focus:bg-accent focus:text-accent-foreground text-destructive'
              )}
            >
              <X className="w-4 h-4" />
              <span className="flex-1">{t('settings.clearBackground')}</span>
            </DropdownMenuItem>
          )}

          {/* Blur Slider - only show if has background */}
          {backgroundImage && (
            <div className="px-2 py-2">
              <div className="flex items-center justify-between text-xs text-muted-foreground mb-1.5">
                <span>{t('settings.blur')}</span>
                <span>{backgroundBlur}px</span>
              </div>
              <Slider
                value={[backgroundBlur]}
                onValueChange={([value]) => setBlur(value)}
                min={0}
                max={20}
                step={1}
                className="w-full"
              />
            </div>
          )}

          {/* Opacity Slider - only show if has background */}
          {backgroundImage && (
            <div className="px-2 py-2">
              <div className="flex items-center justify-between text-xs text-muted-foreground mb-1.5">
                <span>{t('settings.opacity')}</span>
                <span>{backgroundOpacity}%</span>
              </div>
              <Slider
                value={[backgroundOpacity]}
                onValueChange={([value]) => setOpacity(value)}
                min={10}
                max={100}
                step={5}
                className="w-full"
              />
            </div>
          )}

          <DropdownMenuSeparator className="my-2" />

          {/* Language Section */}
          <DropdownMenuLabel className="flex items-center gap-2 text-xs font-medium text-muted-foreground uppercase tracking-wider px-2 pt-1 pb-2">
            <Languages className="w-3.5 h-3.5" />
            {t('settings.language')}
          </DropdownMenuLabel>
          <DropdownMenuSeparator className="my-1" />
          <DropdownMenuRadioGroup value={language} onValueChange={(v) => setLanguage(v as 'zh' | 'en')}>
            <DropdownMenuRadioItem
              value="zh"
              className={cn(
                'flex items-center gap-2 cursor-pointer rounded-md px-2 py-1.5 text-sm',
                'focus:bg-accent focus:text-accent-foreground',
                language === 'zh' && 'bg-accent/50'
              )}
            >
              <span className="w-4 h-4 flex items-center justify-center text-xs font-medium rounded bg-red-500/10 text-red-500">
                中
              </span>
              <span className="flex-1">{t('languages.zh')}</span>
              {language === 'zh' && <Check className="w-4 h-4 text-primary" />}
            </DropdownMenuRadioItem>
            <DropdownMenuRadioItem
              value="en"
              className={cn(
                'flex items-center gap-2 cursor-pointer rounded-md px-2 py-1.5 text-sm',
                'focus:bg-accent focus:text-accent-foreground',
                language === 'en' && 'bg-accent/50'
              )}
            >
              <span className="w-4 h-4 flex items-center justify-center text-xs font-medium rounded bg-blue-500/10 text-blue-500">
                En
              </span>
              <span className="flex-1">{t('languages.en')}</span>
              {language === 'en' && <Check className="w-4 h-4 text-primary" />}
            </DropdownMenuRadioItem>
          </DropdownMenuRadioGroup>

          <DropdownMenuSeparator className="my-2" />

          <DropdownMenuItem
            onClick={handleSignOut}
            className={cn(
              'flex items-center gap-2 cursor-pointer rounded-md px-2 py-1.5 text-sm',
              'focus:bg-accent focus:text-accent-foreground text-destructive'
            )}
          >
            <LogOut className="w-4 h-4" />
            <span className="flex-1">{t('auth.logout')}</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
}
