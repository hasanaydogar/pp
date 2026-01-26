'use client';

import React, { useCallback, useMemo } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { Popover, PopoverButton, PopoverPanel } from '@headlessui/react';
import { AdjustmentsHorizontalIcon, ArrowPathIcon } from '@heroicons/react/20/solid';
import { ColumnConfig } from '@/lib/types/table-columns';
import { SortableColumnItem } from './sortable-column-item';
import { Button } from '@/components/ui/button';
import clsx from 'clsx';

interface ColumnConfigPanelProps {
  columns: ColumnConfig[];
  onReorder: (columns: ColumnConfig[]) => void;
  onToggleVisibility: (columnId: string) => void;
  onReset: () => void;
}

export function ColumnConfigPanel({
  columns,
  onReorder,
  onToggleVisibility,
  onReset,
}: ColumnConfigPanelProps) {
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Memoize column IDs for SortableContext
  const columnIds = useMemo(() => columns.map((c) => c.id), [columns]);

  // Memoize drag end handler
  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;

      if (over && active.id !== over.id) {
        const oldIndex = columns.findIndex((col) => col.id === active.id);
        const newIndex = columns.findIndex((col) => col.id === over.id);

        const newColumns = arrayMove(columns, oldIndex, newIndex).map(
          (col, index) => ({ ...col, order: index })
        );

        onReorder(newColumns);
      }
    },
    [columns, onReorder]
  );

  // Memoize counts
  const { visibleCount, totalCount } = useMemo(
    () => ({
      visibleCount: columns.filter((c) => c.visible).length,
      totalCount: columns.length,
    }),
    [columns]
  );

  return (
    <Popover className="relative">
      {({ open }) => (
        <>
          <PopoverButton
            className={clsx(
              'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg',
              'text-sm font-medium',
              'text-zinc-600 dark:text-zinc-400',
              'hover:text-zinc-900 dark:hover:text-white',
              'hover:bg-zinc-100 dark:hover:bg-zinc-800',
              'focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1',
              'transition-colors',
              open && 'bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white'
            )}
            title="Tablo kolonlarını düzenle"
          >
            <AdjustmentsHorizontalIcon className="h-5 w-5" />
            <span className="hidden sm:inline">Kolonlar</span>
          </PopoverButton>

          <PopoverPanel
            className={clsx(
              'absolute right-0 z-50 mt-2 w-72',
              'origin-top-right rounded-xl',
              'bg-white dark:bg-zinc-900',
              'shadow-lg ring-1 ring-zinc-950/5 dark:ring-white/10',
              'focus:outline-none'
            )}
          >
            <div className="p-4">
              {/* Header */}
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-zinc-900 dark:text-white">
                  Tablo Kolonları
                </h3>
                <span className="text-xs text-zinc-500 dark:text-zinc-400">
                  {visibleCount}/{totalCount} görünür
                </span>
              </div>

              {/* Column List */}
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext
                  items={columnIds}
                  strategy={verticalListSortingStrategy}
                >
                  <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                    {columns.map((column) => (
                      <SortableColumnItem
                        key={column.id}
                        column={column}
                        onToggleVisibility={onToggleVisibility}
                      />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>

              {/* Footer */}
              <div className="mt-4 pt-3 border-t border-zinc-200 dark:border-zinc-700">
                <Button
                  plain
                  onClick={onReset}
                  className="w-full justify-center text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
                >
                  <ArrowPathIcon className="h-4 w-4 mr-1.5" />
                  Varsayılana Sıfırla
                </Button>
              </div>
            </div>
          </PopoverPanel>
        </>
      )}
    </Popover>
  );
}
