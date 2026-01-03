import { validateUUID, validateUUIDOrThrow, validateWithZod } from '../utils';
import { z } from 'zod';

describe('UUID Validation', () => {
  describe('validateUUID', () => {
    it('should return true for valid UUID', () => {
      const validUUID = '123e4567-e89b-12d3-a456-426614174000';
      expect(validateUUID(validUUID)).toBe(true);
    });

    it('should return false for invalid UUID', () => {
      const invalidUUID = 'not-a-uuid';
      expect(validateUUID(invalidUUID)).toBe(false);
    });

    it('should return false for empty string', () => {
      expect(validateUUID('')).toBe(false);
    });

    it('should return false for null', () => {
      expect(validateUUID(null as unknown as string)).toBe(false);
    });
  });

  describe('validateUUIDOrThrow', () => {
    it('should not throw for valid UUID', () => {
      const validUUID = '123e4567-e89b-12d3-a456-426614174000';
      expect(() => validateUUIDOrThrow(validUUID)).not.toThrow();
    });

    it('should throw for invalid UUID', () => {
      const invalidUUID = 'not-a-uuid';
      expect(() => validateUUIDOrThrow(invalidUUID)).toThrow('Invalid UUID format');
    });
  });
});

describe('Zod Validation', () => {
  const TestSchema = z.object({
    name: z.string().min(1),
    age: z.number().positive(),
  });

  describe('validateWithZod', () => {
    it('should return validated data for valid input', () => {
      const validData = { name: 'John', age: 30 };
      const result = validateWithZod(TestSchema, validData);
      expect(result).toEqual(validData);
    });

    it('should throw ZodError for invalid input', () => {
      const invalidData = { name: '', age: -5 };
      expect(() => validateWithZod(TestSchema, invalidData)).toThrow();
    });

    it('should throw ZodError for missing fields', () => {
      const invalidData = { name: 'John' };
      expect(() => validateWithZod(TestSchema, invalidData)).toThrow();
    });
  });
});

