import {
  mapSymbolForYahoo,
  isBISTStock,
  getExchangeName,
} from '../symbol-mapper';

describe('symbol-mapper', () => {
  describe('mapSymbolForYahoo', () => {
    it('should add .IS suffix for TRY currency (BIST stocks)', () => {
      expect(mapSymbolForYahoo('THYAO', 'TRY')).toBe('THYAO.IS');
      expect(mapSymbolForYahoo('BIMAS', 'TRY')).toBe('BIMAS.IS');
      expect(mapSymbolForYahoo('ARCLK', 'TRY')).toBe('ARCLK.IS');
      expect(mapSymbolForYahoo('AGESA', 'TRY')).toBe('AGESA.IS');
    });

    it('should not add suffix for USD currency', () => {
      expect(mapSymbolForYahoo('AAPL', 'USD')).toBe('AAPL');
      expect(mapSymbolForYahoo('MSFT', 'USD')).toBe('MSFT');
      expect(mapSymbolForYahoo('GOOGL', 'USD')).toBe('GOOGL');
    });

    it('should add .DE suffix for EUR currency', () => {
      expect(mapSymbolForYahoo('SAP', 'EUR')).toBe('SAP.DE');
      expect(mapSymbolForYahoo('BMW', 'EUR')).toBe('BMW.DE');
    });

    it('should add .L suffix for GBP currency', () => {
      expect(mapSymbolForYahoo('HSBA', 'GBP')).toBe('HSBA.L');
      expect(mapSymbolForYahoo('BP', 'GBP')).toBe('BP.L');
    });

    it('should uppercase and trim symbols', () => {
      expect(mapSymbolForYahoo('thyao', 'TRY')).toBe('THYAO.IS');
      expect(mapSymbolForYahoo(' aapl ', 'USD')).toBe('AAPL');
      expect(mapSymbolForYahoo('Msft', 'USD')).toBe('MSFT');
    });

    it('should handle unknown currencies without suffix', () => {
      expect(mapSymbolForYahoo('TEST', 'XYZ')).toBe('TEST');
      expect(mapSymbolForYahoo('STOCK', 'UNKNOWN')).toBe('STOCK');
    });
  });

  describe('isBISTStock', () => {
    it('should return true for TRY currency', () => {
      expect(isBISTStock('TRY')).toBe(true);
      expect(isBISTStock('try')).toBe(true);
    });

    it('should return false for other currencies', () => {
      expect(isBISTStock('USD')).toBe(false);
      expect(isBISTStock('EUR')).toBe(false);
      expect(isBISTStock('GBP')).toBe(false);
    });
  });

  describe('getExchangeName', () => {
    it('should return correct exchange names', () => {
      expect(getExchangeName('TRY')).toBe('Borsa Istanbul');
      expect(getExchangeName('USD')).toBe('NYSE/NASDAQ');
      expect(getExchangeName('EUR')).toBe('Frankfurt');
      expect(getExchangeName('GBP')).toBe('London');
    });

    it('should return Unknown for unknown currencies', () => {
      expect(getExchangeName('XYZ')).toBe('Unknown');
    });
  });
});
