'use client';

import { Badge } from '@/components/ui/badge';
import { PositionCategory, PositionCategoryLabels, PositionCategoryColors } from '@/lib/types/sector';
import { PencilIcon } from '@heroicons/react/16/solid';

interface CategoryBadgeProps {
  category: PositionCategory | null | undefined;
  isManualOverride?: boolean;
  size?: 'sm' | 'md';
  className?: string;
  showLabel?: boolean;
}

// Map category to badge color variant
function getCategoryBadgeColor(category: PositionCategory | null | undefined): 'green' | 'blue' | 'amber' | 'zinc' {
  if (!category) return 'zinc';

  const colorMap: Record<PositionCategory, 'green' | 'blue' | 'amber'> = {
    [PositionCategory.CORE]: 'green',
    [PositionCategory.SATELLITE]: 'blue',
    [PositionCategory.NEW]: 'amber',
  };

  return colorMap[category] || 'zinc';
}

// Short labels for compact display
const SHORT_LABELS: Record<PositionCategory, string> = {
  [PositionCategory.CORE]: 'Core',
  [PositionCategory.SATELLITE]: 'Uydu',
  [PositionCategory.NEW]: 'Yeni',
};

export function CategoryBadge({
  category,
  isManualOverride = false,
  size = 'sm',
  className,
  showLabel = true,
}: CategoryBadgeProps) {
  if (!category) {
    return null;
  }

  const badgeColor = getCategoryBadgeColor(category);
  const label = showLabel ? SHORT_LABELS[category] : '';

  return (
    <Badge
      color={badgeColor}
      className={className}
      title={`${PositionCategoryLabels[category]}${isManualOverride ? ' (Manuel)' : ''}`}
    >
      <span className="flex items-center gap-1">
        {label}
        {isManualOverride && (
          <PencilIcon className="h-3 w-3 opacity-60" />
        )}
      </span>
    </Badge>
  );
}

// Compact version for table cells with weight indicator
interface CategoryBadgeWithWeightProps {
  category: PositionCategory | null | undefined;
  isManualOverride?: boolean;
  weight?: number;
  isOverWeight?: boolean;
}

export function CategoryBadgeWithWeight({
  category,
  isManualOverride = false,
  weight,
  isOverWeight = false,
}: CategoryBadgeWithWeightProps) {
  if (!category) {
    return <span className="text-zinc-400 text-xs">-</span>;
  }

  return (
    <div className="flex items-center gap-1.5">
      <CategoryBadge
        category={category}
        isManualOverride={isManualOverride}
        size="sm"
      />
      {isOverWeight && (
        <span className="text-red-500 text-xs font-medium" title="Ağırlık limiti aşıldı">
          ⚠️
        </span>
      )}
    </div>
  );
}

// Icon-only version for very compact displays
export function CategoryIcon({ category }: { category: PositionCategory | null | undefined }) {
  if (!category) return null;

  const iconMap: Record<PositionCategory, string> = {
    [PositionCategory.CORE]: '🟢',
    [PositionCategory.SATELLITE]: '🔵',
    [PositionCategory.NEW]: '🟡',
  };

  return (
    <span title={PositionCategoryLabels[category]} className="text-sm">
      {iconMap[category]}
    </span>
  );
}
