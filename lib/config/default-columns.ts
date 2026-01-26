import { ColumnConfig, COLUMN_IDS } from '@/lib/types/table-columns';

/**
 * Current preferences version - increment when schema changes
 */
export const PREFERENCES_VERSION = 2;

/**
 * Default column configuration matching the current SortableAssetsTable layout
 * Order and visibility match the existing table structure
 */
export const DEFAULT_COLUMNS: ColumnConfig[] = [
  {
    id: COLUMN_IDS.ROW_NUMBER,
    label: '#',
    visible: true,
    sortable: false,
    required: false,
    order: 0,
    align: 'center',
    responsiveHide: 'hidden sm:table-cell',
  },
  {
    id: COLUMN_IDS.SYMBOL,
    label: 'Sembol',
    visible: true,
    sortable: true,
    required: true, // Cannot be hidden
    order: 1,
    align: 'left',
  },
  {
    id: COLUMN_IDS.CURRENT_PRICE,
    label: 'Son Fiyat',
    visible: true,
    sortable: true,
    required: false,
    order: 2,
    align: 'right',
    responsiveHide: 'hidden sm:table-cell',
  },
  {
    id: COLUMN_IDS.WEIGHT,
    label: 'Ağırlık',
    visible: true,
    sortable: true,
    required: false,
    order: 3,
    align: 'right',
  },
  {
    id: COLUMN_IDS.CURRENT_VALUE,
    label: 'Değer',
    visible: true,
    sortable: true,
    required: false,
    order: 4,
    align: 'right',
  },
  {
    id: COLUMN_IDS.COST_BASIS,
    label: 'Maliyet',
    visible: true,
    sortable: true,
    required: false,
    order: 5,
    align: 'right',
    responsiveHide: 'hidden lg:table-cell',
  },
  {
    id: COLUMN_IDS.GAIN_LOSS,
    label: 'G/Z',
    visible: true,
    sortable: true,
    required: false,
    order: 6,
    align: 'right',
    responsiveHide: 'hidden md:table-cell',
  },
  {
    id: COLUMN_IDS.GAIN_LOSS_PERCENT,
    label: 'G/Z %',
    visible: true,
    sortable: true,
    required: false,
    order: 7,
    align: 'right',
  },
  {
    id: COLUMN_IDS.DAILY_CHANGE_PERCENT,
    label: 'Günlük %',
    visible: true,
    sortable: true,
    required: false,
    order: 8,
    align: 'right',
    responsiveHide: 'hidden xl:table-cell',
  },
  {
    id: COLUMN_IDS.DAILY_CHANGE_AMOUNT,
    label: 'Günlük TL',
    visible: true,
    sortable: true,
    required: false,
    order: 9,
    align: 'right',
    responsiveHide: 'hidden xl:table-cell',
  },
  {
    id: COLUMN_IDS.CATEGORY,
    label: 'Kategori',
    visible: true,
    sortable: true,
    required: false,
    order: 10,
    align: 'left',
    responsiveHide: 'hidden lg:table-cell',
  },
  {
    id: COLUMN_IDS.ACTIONS,
    label: 'Aksiyon',
    visible: true,
    sortable: false,
    required: true, // Cannot be hidden
    order: 11,
    align: 'right',
  },
];

/**
 * Get a deep copy of default columns
 */
export function getDefaultColumns(): ColumnConfig[] {
  return DEFAULT_COLUMNS.map(col => ({ ...col }));
}
