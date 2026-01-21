'use client';

import { Badge } from '@/components/ui/badge';
import { Sector } from '@/lib/types/sector';

interface SectorBadgeProps {
  sector: Sector | null | undefined;
  apiSector?: string | null;
  size?: 'sm' | 'md';
  className?: string;
}

// Default color if sector has no color defined
const DEFAULT_SECTOR_COLOR = '#6B7280';

// Map sector colors to badge color variants
function getSectorBadgeColor(sector: Sector | null | undefined): 'zinc' | 'green' | 'blue' | 'amber' | 'red' | 'purple' | 'cyan' | 'orange' | 'pink' {
  if (!sector?.color) return 'zinc';

  const colorMap: Record<string, 'zinc' | 'green' | 'blue' | 'amber' | 'red' | 'purple' | 'cyan' | 'orange' | 'pink'> = {
    '#3B82F6': 'blue',      // technology
    '#10B981': 'green',     // finance
    '#EF4444': 'red',       // healthcare
    '#F59E0B': 'amber',     // energy
    '#8B5CF6': 'purple',    // consumer
    '#6B7280': 'zinc',      // industrial
    '#EC4899': 'pink',      // materials
    '#14B8A6': 'cyan',      // utilities
    '#F97316': 'orange',    // real_estate
    '#06B6D4': 'cyan',      // communication
  };

  return colorMap[sector.color] || 'zinc';
}

export function SectorBadge({ sector, apiSector, size = 'sm', className }: SectorBadgeProps) {
  // Determine display name
  const displayName = sector?.display_name || apiSector;

  if (!displayName) {
    return null;
  }

  const badgeColor = getSectorBadgeColor(sector);

  return (
    <Badge
      color={badgeColor}
      className={className}
      title={sector?.display_name || apiSector || undefined}
    >
      {displayName}
    </Badge>
  );
}

// Compact version for table cells
export function SectorBadgeCompact({ sector, apiSector }: { sector: Sector | null | undefined; apiSector?: string | null }) {
  const displayName = sector?.display_name || apiSector;

  if (!displayName) {
    return <span className="text-zinc-400 text-xs">-</span>;
  }

  // Truncate long names
  const shortName = displayName.length > 12 ? displayName.slice(0, 10) + '...' : displayName;

  return (
    <SectorBadge
      sector={sector}
      apiSector={shortName !== displayName ? shortName : apiSector}
      size="sm"
    />
  );
}
