'use client';

import { cn } from '@/lib/utils';

interface SparklineProps {
  data: number[];
  color?: string;
  className?: string;
  height?: number;
  strokeWidth?: number;
  fillOpacity?: number;
}

export function Sparkline({
  data,
  color = 'currentColor',
  className,
  height = 24,
  strokeWidth = 1.5,
  fillOpacity = 0.1,
}: SparklineProps) {
  if (!data.length) return null;

  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;

  // Use viewBox with preserveAspectRatio to allow responsive width
  const width = 100;

  // Calculate points
  const points = data.map((value, index) => {
    const x = (index / (data.length - 1)) * width;
    const y = height - ((value - min) / range) * height;
    return { x, y };
  });

  // Create smooth curve path using bezier curves
  const createSmoothPath = (pts: { x: number; y: number }[]): string => {
    if (pts.length < 2) return '';
    
    let path = `M ${pts[0].x},${pts[0].y}`;
    
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = pts[Math.max(0, i - 1)];
      const p1 = pts[i];
      const p2 = pts[i + 1];
      const p3 = pts[Math.min(pts.length - 1, i + 2)];
      
      // Calculate control points for smooth curve
      const tension = 0.3;
      const cp1x = p1.x + (p2.x - p0.x) * tension;
      const cp1y = p1.y + (p2.y - p0.y) * tension;
      const cp2x = p2.x - (p3.x - p1.x) * tension;
      const cp2y = p2.y - (p3.y - p1.y) * tension;
      
      path += ` C ${cp1x},${cp1y} ${cp2x},${cp2y} ${p2.x},${p2.y}`;
    }
    
    return path;
  };

  const pathD = createSmoothPath(points);
  const areaD = `${pathD} L ${width},${height} L 0,${height} Z`;

  return (
    <svg
      className={cn('overflow-visible w-full', className)}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="none"
    >
      {/* Fill area */}
      <path d={areaD} fill={color} fillOpacity={fillOpacity} />
      {/* Line */}
      <path
        d={pathD}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}
