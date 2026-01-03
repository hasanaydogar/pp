import clsx from 'clsx';

interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular';
  width?: string | number;
  height?: string | number;
  animation?: 'pulse' | 'wave' | 'none';
}

/**
 * Skeleton Loader Component
 * Displays loading placeholder with shimmer animation
 */
export function Skeleton({
  className,
  variant = 'rectangular',
  width,
  height,
  animation = 'pulse',
}: SkeletonProps) {
  const baseStyles = 'bg-zinc-200 dark:bg-zinc-800';
  
  const variantStyles = {
    text: 'rounded',
    circular: 'rounded-full',
    rectangular: 'rounded-lg',
  };

  const animationStyles = {
    pulse: 'animate-pulse',
    wave: 'animate-[shimmer_2s_infinite]',
    none: '',
  };

  const style: React.CSSProperties = {};
  if (width) style.width = typeof width === 'number' ? `${width}px` : width;
  if (height) style.height = typeof height === 'number' ? `${height}px` : height;

  return (
    <div
      className={clsx(
        baseStyles,
        variantStyles[variant],
        animationStyles[animation],
        className,
      )}
      style={style}
    />
  );
}

/**
 * Skeleton variants for common use cases
 */

export function SkeletonCard() {
  return (
    <div className="rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
      <Skeleton variant="rectangular" height={24} width="60%" className="mb-4" />
      <Skeleton variant="text" height={16} width="100%" className="mb-2" />
      <Skeleton variant="text" height={16} width="80%" />
    </div>
  );
}

export function SkeletonTable() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex gap-4">
          <Skeleton variant="rectangular" height={20} width="20%" />
          <Skeleton variant="rectangular" height={20} width="30%" />
          <Skeleton variant="rectangular" height={20} width="25%" />
          <Skeleton variant="rectangular" height={20} width="25%" />
        </div>
      ))}
    </div>
  );
}

export function SkeletonList() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="flex items-center gap-4">
          <Skeleton variant="circular" width={48} height={48} />
          <div className="flex-1 space-y-2">
            <Skeleton variant="text" height={16} width="40%" />
            <Skeleton variant="text" height={14} width="60%" />
          </div>
        </div>
      ))}
    </div>
  );
}

