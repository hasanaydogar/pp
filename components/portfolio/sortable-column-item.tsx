'use client';

import React, { useCallback, memo } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { ColumnConfig } from '@/lib/types/table-columns';
import { Bars3Icon } from '@heroicons/react/20/solid';
import clsx from 'clsx';

interface SortableColumnItemProps {
  column: ColumnConfig;
  onToggleVisibility: (columnId: string) => void;
}

export const SortableColumnItem = memo(function SortableColumnItem({
  column,
  onToggleVisibility,
}: SortableColumnItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: column.id });

  // Memoize toggle handler
  const handleToggle = useCallback(() => {
    onToggleVisibility(column.id);
  }, [onToggleVisibility, column.id]);

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={clsx(
        'flex items-center gap-3 px-3 py-2 rounded-lg',
        'bg-white dark:bg-zinc-800',
        'border border-zinc-200 dark:border-zinc-700',
        isDragging && 'opacity-50 shadow-lg z-50',
        !isDragging && 'hover:bg-zinc-50 dark:hover:bg-zinc-700/50'
      )}
    >
      {/* Drag Handle */}
      <button
        type="button"
        className={clsx(
          'cursor-grab active:cursor-grabbing touch-none',
          'text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300',
          'focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1 rounded'
        )}
        {...attributes}
        {...listeners}
        aria-label={`Reorder ${column.label}`}
      >
        <Bars3Icon className="h-5 w-5" />
      </button>

      {/* Checkbox */}
      <label className="flex items-center gap-2 flex-1 cursor-pointer">
        <input
          type="checkbox"
          checked={column.visible}
          disabled={column.required}
          onChange={handleToggle}
          className={clsx(
            'h-4 w-4 rounded border-zinc-300 dark:border-zinc-600',
            'text-indigo-600 focus:ring-indigo-500',
            'disabled:opacity-50 disabled:cursor-not-allowed'
          )}
          aria-label={`Toggle ${column.label} visibility`}
          aria-describedby={column.required ? `${column.id}-required` : undefined}
        />
        <span
          className={clsx(
            'text-sm',
            column.visible
              ? 'text-zinc-900 dark:text-white'
              : 'text-zinc-500 dark:text-zinc-400',
            column.required && 'font-medium'
          )}
        >
          {column.label}
        </span>
        {column.required && (
          <span
            id={`${column.id}-required`}
            className="text-xs text-zinc-400 dark:text-zinc-500"
          >
            (zorunlu)
          </span>
        )}
      </label>
    </div>
  );
});
