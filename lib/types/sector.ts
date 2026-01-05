import { z } from 'zod';

// ============================================================================
// POSITION CATEGORY
// ============================================================================

export enum PositionCategory {
  CORE = 'CORE',
  SATELLITE = 'SATELLITE',
  NEW = 'NEW',
}

export const PositionCategoryLabels: Record<PositionCategory, string> = {
  [PositionCategory.CORE]: 'Ana Pozisyon',
  [PositionCategory.SATELLITE]: 'Uydu Pozisyon',
  [PositionCategory.NEW]: 'Yeni Pozisyon',
};

export const PositionCategoryColors: Record<PositionCategory, string> = {
  [PositionCategory.CORE]: 'green',
  [PositionCategory.SATELLITE]: 'blue',
  [PositionCategory.NEW]: 'yellow',
};

// ============================================================================
// SECTOR
// ============================================================================

export interface Sector {
  id: string;
  name: string;
  display_name: string;
  color?: string | null;
  created_at: string;
}

export const SectorSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(50),
  display_name: z.string().min(1).max(100),
  color: z.string().nullable().optional(),
  created_at: z.string().datetime(),
});

// ============================================================================
// ASSET METADATA
// ============================================================================

export interface AssetMetadata {
  id: string;
  asset_id: string;
  
  // Sector Info
  sector_id?: string | null;
  api_sector?: string | null;
  manual_sector_id?: string | null;
  manual_name?: string | null;
  
  // Position Category
  auto_category?: PositionCategory | null;
  manual_category?: PositionCategory | null;
  
  // Additional Info
  isin?: string | null;
  exchange?: string | null;
  country?: string | null;
  
  created_at: string;
  updated_at?: string | null;
  
  // Joined data
  sector?: Sector | null;
  manual_sector?: Sector | null;
}

export const AssetMetadataSchema = z.object({
  id: z.string().uuid(),
  asset_id: z.string().uuid(),
  sector_id: z.string().uuid().nullable().optional(),
  api_sector: z.string().nullable().optional(),
  manual_sector_id: z.string().uuid().nullable().optional(),
  manual_name: z.string().nullable().optional(),
  auto_category: z.nativeEnum(PositionCategory).nullable().optional(),
  manual_category: z.nativeEnum(PositionCategory).nullable().optional(),
  isin: z.string().nullable().optional(),
  exchange: z.string().nullable().optional(),
  country: z.string().nullable().optional(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime().nullable().optional(),
});

export const UpdateAssetMetadataSchema = z.object({
  sector_id: z.string().uuid().nullable().optional(),
  manual_sector_id: z.string().uuid().nullable().optional(),
  manual_name: z.string().nullable().optional(),
  manual_category: z.nativeEnum(PositionCategory).nullable().optional(),
  isin: z.string().nullable().optional(),
  exchange: z.string().nullable().optional(),
  country: z.string().nullable().optional(),
});

export type UpdateAssetMetadata = z.infer<typeof UpdateAssetMetadataSchema>;

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

export function getEffectiveSector(metadata: AssetMetadata): Sector | null {
  return metadata.manual_sector || metadata.sector || null;
}

export function getEffectiveCategory(metadata: AssetMetadata): PositionCategory | null {
  return metadata.manual_category || metadata.auto_category || null;
}

export function getSectorDisplayName(metadata: AssetMetadata): string | null {
  const sector = getEffectiveSector(metadata);
  return sector?.display_name || metadata.api_sector || null;
}
