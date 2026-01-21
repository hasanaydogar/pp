import {
  CashTransactionType,
  getCashTransactionSign,
  getCashTransactionLabel,
} from '../cash';

describe('cash type helper functions', () => {
  describe('getCashTransactionSign', () => {
    describe('positive cash flow transactions (increases cash)', () => {
      it('should return 1 for DEPOSIT', () => {
        expect(getCashTransactionSign(CashTransactionType.DEPOSIT)).toBe(1);
      });

      it('should return 1 for SELL_ASSET', () => {
        expect(getCashTransactionSign(CashTransactionType.SELL_ASSET)).toBe(1);
      });

      it('should return 1 for DIVIDEND', () => {
        expect(getCashTransactionSign(CashTransactionType.DIVIDEND)).toBe(1);
      });

      it('should return 1 for INTEREST', () => {
        expect(getCashTransactionSign(CashTransactionType.INTEREST)).toBe(1);
      });

      it('should return 1 for TRANSFER_IN', () => {
        expect(getCashTransactionSign(CashTransactionType.TRANSFER_IN)).toBe(1);
      });
    });

    describe('negative cash flow transactions (decreases cash)', () => {
      it('should return -1 for WITHDRAW', () => {
        expect(getCashTransactionSign(CashTransactionType.WITHDRAW)).toBe(-1);
      });

      it('should return -1 for BUY_ASSET', () => {
        expect(getCashTransactionSign(CashTransactionType.BUY_ASSET)).toBe(-1);
      });

      it('should return -1 for FEE', () => {
        expect(getCashTransactionSign(CashTransactionType.FEE)).toBe(-1);
      });

      it('should return -1 for TRANSFER_OUT', () => {
        expect(getCashTransactionSign(CashTransactionType.TRANSFER_OUT)).toBe(-1);
      });
    });

    it('should cover all transaction types', () => {
      // Verify all enum values are handled
      const allTypes = Object.values(CashTransactionType);
      allTypes.forEach(type => {
        const sign = getCashTransactionSign(type);
        expect([1, -1]).toContain(sign);
      });
    });
  });

  describe('getCashTransactionLabel', () => {
    it('should return correct label for DEPOSIT', () => {
      expect(getCashTransactionLabel(CashTransactionType.DEPOSIT)).toBe('Para Yatırma');
    });

    it('should return correct label for WITHDRAW', () => {
      expect(getCashTransactionLabel(CashTransactionType.WITHDRAW)).toBe('Para Çekme');
    });

    it('should return correct label for BUY_ASSET', () => {
      expect(getCashTransactionLabel(CashTransactionType.BUY_ASSET)).toBe('Varlık Alımı');
    });

    it('should return correct label for SELL_ASSET', () => {
      expect(getCashTransactionLabel(CashTransactionType.SELL_ASSET)).toBe('Varlık Satışı');
    });

    it('should return correct label for DIVIDEND', () => {
      expect(getCashTransactionLabel(CashTransactionType.DIVIDEND)).toBe('Temettü');
    });

    it('should return correct label for FEE', () => {
      expect(getCashTransactionLabel(CashTransactionType.FEE)).toBe('Komisyon/Ücret');
    });

    it('should return correct label for INTEREST', () => {
      expect(getCashTransactionLabel(CashTransactionType.INTEREST)).toBe('Faiz Geliri');
    });

    it('should return correct label for TRANSFER_IN', () => {
      expect(getCashTransactionLabel(CashTransactionType.TRANSFER_IN)).toBe('Transfer (Gelen)');
    });

    it('should return correct label for TRANSFER_OUT', () => {
      expect(getCashTransactionLabel(CashTransactionType.TRANSFER_OUT)).toBe('Transfer (Giden)');
    });

    it('should cover all transaction types', () => {
      const allTypes = Object.values(CashTransactionType);
      allTypes.forEach(type => {
        const label = getCashTransactionLabel(type);
        expect(typeof label).toBe('string');
        expect(label.length).toBeGreaterThan(0);
      });
    });
  });

  describe('CashTransactionType enum', () => {
    it('should have all expected transaction types', () => {
      expect(CashTransactionType.DEPOSIT).toBe('DEPOSIT');
      expect(CashTransactionType.WITHDRAW).toBe('WITHDRAW');
      expect(CashTransactionType.BUY_ASSET).toBe('BUY_ASSET');
      expect(CashTransactionType.SELL_ASSET).toBe('SELL_ASSET');
      expect(CashTransactionType.DIVIDEND).toBe('DIVIDEND');
      expect(CashTransactionType.FEE).toBe('FEE');
      expect(CashTransactionType.INTEREST).toBe('INTEREST');
      expect(CashTransactionType.TRANSFER_IN).toBe('TRANSFER_IN');
      expect(CashTransactionType.TRANSFER_OUT).toBe('TRANSFER_OUT');
    });

    it('should have 9 transaction types', () => {
      const types = Object.values(CashTransactionType);
      expect(types.length).toBe(9);
    });
  });
});
