import {
  PositionCategory,
  PositionCategoryLabels,
  PositionCategoryColors,
  Sector,
  AssetMetadata,
  getEffectiveSector,
  getEffectiveCategory,
  getSectorDisplayName,
} from '../sector';

describe('sector type helper functions', () => {
  // Mock data
  const mockSector: Sector = {
    id: 'sector-1',
    name: 'technology',
    display_name: 'Teknoloji',
    color: '#3B82F6',
    created_at: '2025-01-01T00:00:00Z',
  };

  const mockManualSector: Sector = {
    id: 'sector-2',
    name: 'finance',
    display_name: 'Finans',
    color: '#10B981',
    created_at: '2025-01-01T00:00:00Z',
  };

  const createMockMetadata = (overrides: Partial<AssetMetadata> = {}): AssetMetadata => ({
    id: 'metadata-1',
    asset_id: 'asset-1',
    sector_id: null,
    api_sector: null,
    manual_sector_id: null,
    manual_name: null,
    auto_category: null,
    manual_category: null,
    isin: null,
    exchange: null,
    country: null,
    created_at: '2025-01-01T00:00:00Z',
    updated_at: null,
    sector: null,
    manual_sector: null,
    ...overrides,
  });

  describe('PositionCategory enum', () => {
    it('should have correct values', () => {
      expect(PositionCategory.CORE).toBe('CORE');
      expect(PositionCategory.SATELLITE).toBe('SATELLITE');
      expect(PositionCategory.NEW).toBe('NEW');
    });

    it('should have 3 categories', () => {
      const categories = Object.values(PositionCategory);
      expect(categories.length).toBe(3);
    });
  });

  describe('PositionCategoryLabels', () => {
    it('should have correct labels for all categories', () => {
      expect(PositionCategoryLabels[PositionCategory.CORE]).toBe('Ana Pozisyon');
      expect(PositionCategoryLabels[PositionCategory.SATELLITE]).toBe('Uydu Pozisyon');
      expect(PositionCategoryLabels[PositionCategory.NEW]).toBe('Yeni Pozisyon');
    });

    it('should have labels for all categories', () => {
      Object.values(PositionCategory).forEach(category => {
        expect(PositionCategoryLabels[category]).toBeDefined();
        expect(typeof PositionCategoryLabels[category]).toBe('string');
      });
    });
  });

  describe('PositionCategoryColors', () => {
    it('should have correct colors for all categories', () => {
      expect(PositionCategoryColors[PositionCategory.CORE]).toBe('green');
      expect(PositionCategoryColors[PositionCategory.SATELLITE]).toBe('blue');
      expect(PositionCategoryColors[PositionCategory.NEW]).toBe('yellow');
    });

    it('should have colors for all categories', () => {
      Object.values(PositionCategory).forEach(category => {
        expect(PositionCategoryColors[category]).toBeDefined();
        expect(typeof PositionCategoryColors[category]).toBe('string');
      });
    });
  });

  describe('getEffectiveSector', () => {
    it('should return manual sector when available', () => {
      const metadata = createMockMetadata({
        sector: mockSector,
        manual_sector: mockManualSector,
      });

      expect(getEffectiveSector(metadata)).toEqual(mockManualSector);
    });

    it('should fall back to sector when manual_sector is null', () => {
      const metadata = createMockMetadata({
        sector: mockSector,
        manual_sector: null,
      });

      expect(getEffectiveSector(metadata)).toEqual(mockSector);
    });

    it('should return null when both sectors are null', () => {
      const metadata = createMockMetadata({
        sector: null,
        manual_sector: null,
      });

      expect(getEffectiveSector(metadata)).toBeNull();
    });

    it('should prioritize manual_sector over sector', () => {
      const metadata = createMockMetadata({
        sector: mockSector,
        manual_sector: mockManualSector,
      });

      const effectiveSector = getEffectiveSector(metadata);
      expect(effectiveSector?.id).toBe('sector-2');
      expect(effectiveSector?.name).toBe('finance');
    });
  });

  describe('getEffectiveCategory', () => {
    it('should return manual category when available', () => {
      const metadata = createMockMetadata({
        auto_category: PositionCategory.NEW,
        manual_category: PositionCategory.CORE,
      });

      expect(getEffectiveCategory(metadata)).toBe(PositionCategory.CORE);
    });

    it('should fall back to auto_category when manual_category is null', () => {
      const metadata = createMockMetadata({
        auto_category: PositionCategory.SATELLITE,
        manual_category: null,
      });

      expect(getEffectiveCategory(metadata)).toBe(PositionCategory.SATELLITE);
    });

    it('should return null when both categories are null', () => {
      const metadata = createMockMetadata({
        auto_category: null,
        manual_category: null,
      });

      expect(getEffectiveCategory(metadata)).toBeNull();
    });

    it('should prioritize manual_category over auto_category', () => {
      const metadata = createMockMetadata({
        auto_category: PositionCategory.NEW,
        manual_category: PositionCategory.SATELLITE,
      });

      expect(getEffectiveCategory(metadata)).toBe(PositionCategory.SATELLITE);
    });
  });

  describe('getSectorDisplayName', () => {
    it('should return manual sector display name when available', () => {
      const metadata = createMockMetadata({
        sector: mockSector,
        manual_sector: mockManualSector,
        api_sector: 'API Sector',
      });

      expect(getSectorDisplayName(metadata)).toBe('Finans');
    });

    it('should return sector display name when manual_sector is null', () => {
      const metadata = createMockMetadata({
        sector: mockSector,
        manual_sector: null,
        api_sector: 'API Sector',
      });

      expect(getSectorDisplayName(metadata)).toBe('Teknoloji');
    });

    it('should fall back to api_sector when both sectors are null', () => {
      const metadata = createMockMetadata({
        sector: null,
        manual_sector: null,
        api_sector: 'Technology Sector',
      });

      expect(getSectorDisplayName(metadata)).toBe('Technology Sector');
    });

    it('should return null when all sector sources are null', () => {
      const metadata = createMockMetadata({
        sector: null,
        manual_sector: null,
        api_sector: null,
      });

      expect(getSectorDisplayName(metadata)).toBeNull();
    });

    it('should prioritize in correct order: manual_sector > sector > api_sector', () => {
      // All available - should use manual_sector
      const metadata1 = createMockMetadata({
        sector: mockSector,
        manual_sector: mockManualSector,
        api_sector: 'API Sector',
      });
      expect(getSectorDisplayName(metadata1)).toBe('Finans');

      // No manual_sector - should use sector
      const metadata2 = createMockMetadata({
        sector: mockSector,
        manual_sector: null,
        api_sector: 'API Sector',
      });
      expect(getSectorDisplayName(metadata2)).toBe('Teknoloji');

      // Only api_sector - should use api_sector
      const metadata3 = createMockMetadata({
        sector: null,
        manual_sector: null,
        api_sector: 'API Sector',
      });
      expect(getSectorDisplayName(metadata3)).toBe('API Sector');
    });
  });
});
