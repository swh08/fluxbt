'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { useI18n } from '@/contexts/i18n-context';
import { useBackground } from '@/contexts/background-context';
import { formatBytes } from '@/lib/formatters';
import type { TrackerShare } from '@/lib/types';

const TRACKER_COLORS = ['#3b82f6', '#10b981', '#8b5cf6', '#f59e0b', '#ef4444', '#6b7280'];

interface TrackerPieChartProps {
  shares: TrackerShare[];
  isMobile?: boolean;
}

interface TrackerSegment extends TrackerShare {
  color: string;
  startAngle: number;
  endAngle: number;
}

export function TrackerPieChart({ shares, isMobile = false }: TrackerPieChartProps) {
  const { t } = useI18n();
  const { backgroundImage } = useBackground();
  const [hoveredSegment, setHoveredSegment] = useState<TrackerSegment | null>(null);
  const cardBorderClass = backgroundImage ? 'border-white/15' : 'border-border';
  const dividerBorderClass = backgroundImage ? 'border-white/10' : 'border-border';
  const tooltipBorderClass = backgroundImage ? 'border-white/15' : 'border-border';
  const totalUpload = shares.reduce((sum, share) => sum + share.uploadBytes, 0);

  const segments = shares.reduce<TrackerSegment[]>((allSegments, share, index) => {
    const percentage = totalUpload > 0 ? share.uploadBytes / totalUpload : 0;
    const startAngle = allSegments[allSegments.length - 1]?.endAngle ?? 0;
    const endAngle = startAngle + percentage * 360;

    return [
      ...allSegments,
      {
        ...share,
        percentage,
        color: TRACKER_COLORS[index % TRACKER_COLORS.length],
        startAngle,
        endAngle,
      },
    ];
  }, []);

  const createArcPath = (startAngle: number, endAngle: number, radius: number, innerRadius = 0) => {
    // SVG arc commands cannot render a full 360deg pie slice when the start/end points overlap.
    if (endAngle - startAngle >= 359.999) {
      return [
        `M 50 ${50 - radius}`,
        `A ${radius} ${radius} 0 1 1 50 ${50 + radius}`,
        `A ${radius} ${radius} 0 1 1 50 ${50 - radius}`,
        'Z',
      ].join(' ');
    }

    const startRad = (startAngle - 90) * (Math.PI / 180);
    const endRad = (endAngle - 90) * (Math.PI / 180);
    const x1 = 50 + radius * Math.cos(startRad);
    const y1 = 50 + radius * Math.sin(startRad);
    const x2 = 50 + radius * Math.cos(endRad);
    const y2 = 50 + radius * Math.sin(endRad);
    const x3 = 50 + innerRadius * Math.cos(endRad);
    const y3 = 50 + innerRadius * Math.sin(endRad);
    const x4 = 50 + innerRadius * Math.cos(startRad);
    const y4 = 50 + innerRadius * Math.sin(startRad);
    const largeArc = endAngle - startAngle > 180 ? 1 : 0;

    return `M ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2} L ${x3} ${y3} A ${innerRadius} ${innerRadius} 0 ${largeArc} 0 ${x4} ${y4} Z`;
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
        'flex flex-col',
      )}
    >
      {segments.length === 0 ? (
        <div className="flex min-h-[240px] flex-1 items-center justify-center text-sm text-muted-foreground">
          {t('empty.noResults')}
        </div>
      ) : (
        <>
          <div className="flex min-h-0 flex-1 items-center justify-center">
            <div className="relative aspect-square h-full w-full max-h-[180px] max-w-[180px]">
              <svg viewBox="0 0 100 100" className="h-full w-full" preserveAspectRatio="xMidYMid meet">
                {segments.map((segment) => (
                  <path
                    key={segment.id}
                    d={createArcPath(segment.startAngle, segment.endAngle, 45, 0)}
                    fill={segment.color}
                    className={cn(
                      'cursor-pointer transition-all duration-150',
                      hoveredSegment === segment ? 'opacity-100' : 'opacity-90',
                    )}
                    style={{
                      transformOrigin: '50px 50px',
                      transform: hoveredSegment === segment ? 'scale(1.02)' : 'scale(1)',
                    }}
                    onMouseEnter={() => setHoveredSegment(segment)}
                    onMouseLeave={() => setHoveredSegment(null)}
                  />
                ))}
              </svg>

              {hoveredSegment && (
                <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
                  <div
                    className={cn(
                      'rounded-md border px-2 py-1 text-center shadow-lg',
                      tooltipBorderClass,
                      backgroundImage
                        ? 'bg-popover/80 backdrop-blur-xl supports-[backdrop-filter]:bg-popover/60'
                        : 'bg-popover/95 backdrop-blur-sm',
                    )}
                  >
                    <div className="text-xs font-medium text-foreground">{hoveredSegment.name}</div>
                    <div className="text-[10px] text-muted-foreground">
                      {formatBytes(hoveredSegment.uploadBytes)} ({(hoveredSegment.percentage * 100).toFixed(1)}%)
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div
            className={cn(
              'mt-2 grid gap-x-3 gap-y-1 border-t pt-2',
              dividerBorderClass,
              isMobile ? 'grid-cols-2 text-[10px]' : 'grid-cols-3 text-xs',
            )}
          >
            {segments.map((tracker) => (
              <div key={tracker.id} className="flex items-center gap-1.5">
                <div
                  className="h-2 w-2 flex-shrink-0 rounded-full"
                  style={{ backgroundColor: tracker.color }}
                />
                <span className="flex-1 truncate text-muted-foreground">{tracker.name}</span>
                <span className="flex-shrink-0 font-mono text-[10px] font-medium">
                  {(tracker.percentage * 100).toFixed(0)}%
                </span>
              </div>
            ))}
          </div>

          <div
            className={cn(
              'mt-2 flex justify-between border-t pt-2',
              dividerBorderClass,
              isMobile ? 'text-xs' : 'text-sm',
            )}
          >
            <span className="text-muted-foreground">{t('uploadDistribution.totalToday')}</span>
            <span className="font-mono font-semibold text-emerald-500">{formatBytes(totalUpload)}</span>
          </div>
        </>
      )}
    </div>
  );
}
