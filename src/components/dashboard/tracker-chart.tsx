'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { useI18n } from '@/contexts/i18n-context';
import { useBackground } from '@/contexts/background-context';

interface TrackerData {
  name: string;
  uploadGB: number;
  color: string;
}

const trackerData: TrackerData[] = [
  { name: 'openbittorrent', uploadGB: 78.5, color: '#3b82f6' },
  { name: 'opentrackr', uploadGB: 56.2, color: '#10b981' },
  { name: 'torrent', uploadGB: 43.8, color: '#8b5cf6' },
  { name: 'explodie', uploadGB: 32.4, color: '#f59e0b' },
  { name: 'coppersurfer', uploadGB: 24.6, color: '#ef4444' },
  { name: 'Others', uploadGB: 35.1, color: '#6b7280' },
];

interface TrackerPieChartProps {
  isMobile?: boolean;
}

interface TrackerSegment extends TrackerData {
  percentage: number;
  startAngle: number;
  endAngle: number;
}

export function TrackerPieChart({ isMobile = false }: TrackerPieChartProps) {
  const { t } = useI18n();
  const { backgroundImage } = useBackground();
  const [hoveredSegment, setHoveredSegment] = useState<TrackerSegment | null>(null);
  const cardBorderClass = backgroundImage ? 'border-white/15' : 'border-border';
  const dividerBorderClass = backgroundImage ? 'border-white/10' : 'border-border';
  const tooltipBorderClass = backgroundImage ? 'border-white/15' : 'border-border';
  const totalUpload = trackerData.reduce((sum, t) => sum + t.uploadGB, 0);

  // Calculate pie chart segments
  const segments = trackerData.reduce<TrackerSegment[]>((allSegments, tracker) => {
    const percentage = tracker.uploadGB / totalUpload;
    const startAngle = allSegments[allSegments.length - 1]?.endAngle ?? 0;
    const endAngle = startAngle + percentage * 360;

    return [
      ...allSegments,
      {
        ...tracker,
        percentage,
        startAngle,
        endAngle,
      },
    ];
  }, []);

  // Create SVG arc path
  const createArcPath = (startAngle: number, endAngle: number, radius: number, innerRadius: number = 0) => {
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
    <div className={cn(
      'relative overflow-hidden rounded-lg border',
      isMobile ? 'p-3' : 'p-4',
      cardBorderClass,
      backgroundImage
        ? 'bg-card/70 backdrop-blur-xl supports-[backdrop-filter]:bg-card/55'
        : 'bg-card',
      'flex flex-col'
    )}>
      {/* Pie Chart - 占据主要空间 */}
      <div className="flex-1 flex items-center justify-center min-h-0">
        <div className="relative w-full h-full max-w-[180px] max-h-[180px] aspect-square">
          <svg
            viewBox="0 0 100 100"
            className="w-full h-full"
            preserveAspectRatio="xMidYMid meet"
          >
            {segments.map((segment, index) => (
              <path
                key={index}
                d={createArcPath(segment.startAngle, segment.endAngle, 45, 0)}
                fill={segment.color}
                className={cn(
                  "transition-all duration-150 cursor-pointer",
                  hoveredSegment === segment ? "opacity-100" : "opacity-90"
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
          
          {/* Hover tooltip */}
          {hoveredSegment && (
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
              <div className={cn(
                'px-2 py-1 rounded-md shadow-lg border text-center',
                tooltipBorderClass,
                backgroundImage
                  ? 'bg-popover/80 backdrop-blur-xl supports-[backdrop-filter]:bg-popover/60'
                  : 'bg-popover/95 backdrop-blur-sm',
              )}>
                <div className="text-xs font-medium text-foreground">{hoveredSegment.name}</div>
                <div className="text-[10px] text-muted-foreground">
                  {hoveredSegment.uploadGB} GB ({(hoveredSegment.percentage * 100).toFixed(1)}%)
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Legend - 横向排列 */}
      <div className={cn(
        'mt-2 pt-2 border-t',
        dividerBorderClass,
        'grid gap-x-3 gap-y-1',
        isMobile ? 'grid-cols-2 text-[10px]' : 'grid-cols-3 text-xs'
      )}>
        {segments.map((tracker, index) => (
          <div key={index} className="flex items-center gap-1.5">
            <div
              className="w-2 h-2 rounded-full flex-shrink-0"
              style={{ backgroundColor: tracker.color }}
            />
            <span className="text-muted-foreground truncate flex-1">{tracker.name}</span>
            <span className="font-mono font-medium flex-shrink-0 text-[10px]">{(tracker.percentage * 100).toFixed(0)}%</span>
          </div>
        ))}
      </div>

      {/* Total */}
      <div className={cn(
        'mt-2 pt-2 border-t flex justify-between',
        dividerBorderClass,
        isMobile ? 'text-xs' : 'text-sm'
      )}>
        <span className="text-muted-foreground">{t('uploadDistribution.totalToday')}</span>
        <span className="font-mono font-semibold text-emerald-500">{totalUpload.toFixed(1)} GB</span>
      </div>
    </div>
  );
}
