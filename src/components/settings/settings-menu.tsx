'use client';

import * as React from 'react';
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
import { Check, Sun, Moon, Monitor, Languages, Image as ImageIcon, X, Upload } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SettingsMenuProps {
  children: React.ReactNode;
}

export function SettingsMenu({ children }: SettingsMenuProps) {
  const { theme, setTheme } = useTheme();
  const { language, setLanguage, t } = useI18n();
  const { backgroundImage, backgroundBlur, backgroundOpacity, setBackground, setBlur, setOpacity, clearBackground } = useBackground();
  const [mounted, setMounted] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

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
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
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
          className={cn(
            'w-56 p-2',
            'bg-popover border-border shadow-lg',
            'rounded-lg'
          )}
        >
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
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
}
