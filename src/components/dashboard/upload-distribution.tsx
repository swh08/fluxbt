'use client';

import { useMemo } from 'react';
import {
  ComposableMap,
  Geographies,
  Geography,
} from 'react-simple-maps';
import { cn } from '@/lib/utils';
import { useI18n } from '@/contexts/i18n-context';
import { mockServers, CountryUploadData } from '@/lib/mock-data';

// World atlas TopoJSON URL
const geoUrl = 'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json';

interface UploadDistributionMapProps {
  selectedServerId: string;
  isMobile?: boolean;
}

export function UploadDistributionMap({ selectedServerId, isMobile = false }: UploadDistributionMapProps) {
  const { t } = useI18n();

  // Get selected server's upload distribution
  const selectedServer = useMemo(() => {
    return mockServers.find(s => s.id === selectedServerId) || mockServers[0];
  }, [selectedServerId]);

  const countryUploadData = selectedServer.uploadDistribution;

  const totalUpload = useMemo(() => {
    return countryUploadData.reduce((sum, c) => sum + c.uploadGB, 0);
  }, [countryUploadData]);

  const maxUpload = useMemo(() => {
    return Math.max(...countryUploadData.map(c => c.uploadGB));
  }, [countryUploadData]);

  // Create a map for quick lookup by UN numeric code
  const uploadMap = useMemo(() => {
    const map = new Map<string, number>();
    countryUploadData.forEach(c => {
      map.set(c.id, c.uploadGB);
    });
    return map;
  }, [countryUploadData]);

  // Get top countries for legend (sorted by upload)
  const legendData = useMemo(() => {
    return [...countryUploadData]
      .sort((a, b) => b.uploadGB - a.uploadGB)
      .slice(0, isMobile ? 6 : 8);
  }, [countryUploadData, isMobile]);

  // Get fill color based on upload amount
  const getCountryFill = (upload: number | undefined): string => {
    if (!upload) {
      return 'currentColor';
    }
    
    const intensity = upload / maxUpload;
    const opacity = 0.35 + intensity * 0.65;
    
    return `rgba(16, 185, 129, ${opacity})`;
  };

  return (
    <div className={cn(
      'relative overflow-hidden rounded-lg border',
      isMobile ? 'p-3' : 'p-4',
      'bg-card border-border'
    )}>
      {/* World Map */}
      <div className="relative w-full" style={{ height: isMobile ? 140 : 200 }}>
        <ComposableMap
          projection="geoMercator"
          projectionConfig={{
            scale: isMobile ? 130 : 170,
            center: [10, 30],
          }}
          className="w-full h-full"
        >
          <Geographies geography={geoUrl}>
            {({ geographies }) =>
              geographies
                .filter((geo) => geo.id !== '010')
                .map((geo) => {
                  const countryId = geo.id;
                  const upload = uploadMap.get(countryId);
                  const hasData = upload !== undefined;
                  const fillColor = getCountryFill(upload);
                  
                  return (
                    <Geography
                      key={geo.rsmKey}
                      geography={geo}
                      fill={fillColor}
                      stroke="currentColor"
                      strokeWidth={hasData ? 0.5 : 0.3}
                      className={hasData ? 'text-emerald-500/30' : 'text-muted-foreground/20 dark:text-muted-foreground/10'}
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

      {/* Divider */}
      <div className="mt-3 border-t border-border" />

      {/* Legend */}
      <div className={cn(
        'mt-3 grid gap-2',
        isMobile ? 'grid-cols-2 text-[10px]' : 'grid-cols-2 text-xs'
      )}>
        {legendData.map((country, index) => (
          <div key={index} className="flex items-center justify-between gap-1">
            <span className="text-muted-foreground truncate">{t(country.nameKey)}</span>
            <span className="font-mono text-emerald-500 font-medium">{country.uploadGB} GB</span>
          </div>
        ))}
      </div>

      {/* Total */}
      <div className={cn(
        'mt-3 pt-3 border-t border-border flex justify-between',
        isMobile ? 'text-xs' : 'text-sm'
      )}>
        <span className="text-muted-foreground">{t('uploadDistribution.totalToday')}</span>
        <span className="font-mono font-semibold text-emerald-500">{totalUpload.toFixed(1)} GB</span>
      </div>
    </div>
  );
}
