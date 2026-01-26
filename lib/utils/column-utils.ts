import { ColumnConfig } from '@/lib/types/table-columns';

/**
 * Reorder columns by moving an item from one index to another
 * Returns a new array with updated order values
 */
export function reorderColumns(
  columns: ColumnConfig[],
  fromIndex: number,
  toIndex: number
): ColumnConfig[] {
  const result = [...columns];
  const [moved] = result.splice(fromIndex, 1);
  result.splice(toIndex, 0, moved);

  // Update order values
  return result.map((col, index) => ({ ...col, order: index }));
}

/**
 * Toggle column visibility
 * Required columns cannot be toggled
 */
export function toggleColumn(
  columns: ColumnConfig[],
  columnId: string
): ColumnConfig[] {
  return columns.map(col =>
    col.id === columnId && !col.required
      ? { ...col, visible: !col.visible }
      : col
  );
}

/**
 * Set column visibility explicitly
 */
export function setColumnVisibility(
  columns: ColumnConfig[],
  columnId: string,
  visible: boolean
): ColumnConfig[] {
  return columns.map(col =>
    col.id === columnId && !col.required
      ? { ...col, visible }
      : col
  );
}

/**
 * Get only visible columns, sorted by order
 */
export function getVisibleColumns(columns: ColumnConfig[]): ColumnConfig[] {
  return columns
    .filter(col => col.visible)
    .sort((a, b) => a.order - b.order);
}

/**
 * Find column index by ID
 */
export function findColumnIndex(columns: ColumnConfig[], columnId: string): number {
  return columns.findIndex(col => col.id === columnId);
}

/**
 * Get column by ID
 */
export function getColumnById(columns: ColumnConfig[], columnId: string): ColumnConfig | undefined {
  return columns.find(col => col.id === columnId);
}

/**
 * Validate columns array has all required columns visible
 */
export function validateColumns(columns: ColumnConfig[]): boolean {
  const requiredColumns = columns.filter(col => col.required);
  return requiredColumns.every(col => col.visible);
}

/**
 * Merge saved preferences with default columns
 * Handles cases where new columns were added or columns were removed
 */
export function mergeWithDefaults(
  savedColumns: ColumnConfig[],
  defaultColumns: ColumnConfig[]
): ColumnConfig[] {
  const savedIds = new Set(savedColumns.map(c => c.id));
  const defaultIds = new Set(defaultColumns.map(c => c.id));

  // Start with saved columns that still exist in defaults
  const merged = savedColumns.filter(col => defaultIds.has(col.id));

  // Add any new columns from defaults that weren't in saved
  for (const defaultCol of defaultColumns) {
    if (!savedIds.has(defaultCol.id)) {
      merged.push({ ...defaultCol, order: merged.length });
    }
  }

  // Re-index order
  return merged.map((col, index) => ({ ...col, order: index }));
}
