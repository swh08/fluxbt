'use client';

import { useMemo } from 'react';
import { ComposableMap, Geographies, Geography } from 'react-simple-maps';
import worldCountries from '@/data/world-countries.json';
import { cn } from '@/lib/utils';
import { useI18n } from '@/contexts/i18n-context';
import { useBackground } from '@/contexts/background-context';
import { formatBytes } from '@/lib/formatters';
import type { CountryUploadShare } from '@/lib/types';

interface UploadDistributionMapProps {
  items: CountryUploadShare[];
  isMobile?: boolean;
}

function getFeatureCountryCode(feature: { properties?: Record<string, unknown> }) {
  const isoA2 = typeof feature.properties?.ISO_A2 === 'string' ? feature.properties.ISO_A2 : '';
  const fallback = typeof feature.properties?.ISO_A2_EH === 'string' ? feature.properties.ISO_A2_EH : '';
  const normalized = (isoA2 && isoA2 !== '-99' ? isoA2 : fallback).trim().toUpperCase();
  return normalized === '-99' ? '' : normalized;
}

export function UploadDistributionMap({
  items,
  isMobile = false,
}: UploadDistributionMapProps) {
  const { t } = useI18n();
  const { backgroundImage } = useBackground();
  const cardBorderClass = backgroundImage ? 'border-white/15' : 'border-border';
  const dividerBorderClass = backgroundImage ? 'border-white/10' : 'border-border';
  const totalUploaded = useMemo(
    () => items.reduce((sum, item) => sum + item.uploadBytes, 0),
    [items],
  );
  const maxUploaded = useMemo(
    () => items.reduce((max, item) => Math.max(max, item.uploadBytes), 0),
    [items],
  );
  const uploadByCountryCode = useMemo(
    () => new Map(items.map((item) => [item.countryCode.trim().toUpperCase(), item] as const)),
    [items],
  );
  const legendData = useMemo(
    () => items.slice(0, isMobile ? 6 : 8),
    [items, isMobile],
  );

  const getCountryFill = (country: CountryUploadShare | undefined) => {
    if (!country || maxUploaded <= 0) {
      return 'currentColor';
    }

    const intensity = country.uploadBytes / maxUploaded;
    return `rgba(16, 185, 129, ${0.35 + intensity * 0.65})`;
  };

  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-lg border',
        isMobile ? 'p-3' : 'p-4',
        cardBorderClass,
        backgroundImage
          ? 'bg-card/70 backdrop-blur-xl supports-[backdrop-filter]:bg-card/55'
          : 'bg-card',
      )}
    >
      {items.length === 0 ? (
        <div className="flex min-h-[240px] items-center justify-center text-sm text-muted-foreground">
          {t('empty.noResults')}
        </div>
      ) : (
        <>
          <div className="relative w-full" style={{ height: isMobile ? 140 : 200 }}>
            <ComposableMap
              projection="geoMercator"
              projectionConfig={{
                scale: isMobile ? 130 : 170,
                center: [10, 30],
              }}
              className="h-full w-full"
            >
              <Geographies geography={worldCountries as never}>
                {({ geographies }) =>
                  geographies.map((geography) => {
                    const countryCode = getFeatureCountryCode(geography as { properties?: Record<string, unknown> });

                    if (countryCode === 'AQ') {
                      return null;
                    }

                    const country = uploadByCountryCode.get(countryCode);

                    return (
                      <Geography
                        key={geography.rsmKey}
                        geography={geography}
                        fill={getCountryFill(country)}
                        stroke="currentColor"
                        strokeWidth={country ? 0.5 : 0.3}
                        className={cn(
                          country
                            ? 'text-emerald-500/30'
                            : backgroundImage
                              ? 'text-white/10'
                              : 'text-muted-foreground/20 dark:text-muted-foreground/10',
                        )}
                        style={{
                          default: { outline: 'none' },
                          hover: { outline: 'none' },
                          pressed: { outline: 'none' },
                        }}
                      />
                    );
                  })
                }
              </Geographies>
            </ComposableMap>
          </div>

          <div className={cn('mt-3 border-t', dividerBorderClass)} />

          <div
            className={cn(
              'mt-3 grid gap-2',
              isMobile ? 'grid-cols-2 text-[10px]' : 'grid-cols-2 text-xs',
            )}
          >
            {legendData.map((item) => (
              <div key={item.id} className="flex items-center justify-between gap-2">
                <span className="truncate text-muted-foreground">
                  {item.countryName || item.countryCode}
                </span>
                <span className="font-mono font-medium text-emerald-500">
                  {formatBytes(item.uploadBytes)}
                </span>
              </div>
            ))}
          </div>

          <div
            className={cn(
              'mt-3 flex justify-between border-t pt-3',
              dividerBorderClass,
              isMobile ? 'text-xs' : 'text-sm',
            )}
          >
            <span className="text-muted-foreground">{t('dashboard.todayUploaded')}</span>
            <span className="font-mono font-semibold text-emerald-500">{formatBytes(totalUploaded)}</span>
          </div>

        </>
      )}
    </div>
  );
}
