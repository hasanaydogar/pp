import { z } from 'zod';
import { validateCurrency } from '@/lib/types/currency';
import { badRequest } from './errors';

/**
 * UUID validation schema
 */
const UUIDSchema = z.string().uuid();

/**
 * Validates if a string is a valid UUID format
 * @param id - The string to validate
 * @returns true if valid UUID, false otherwise
 */
export function validateUUID(id: string): boolean {
  try {
    UUIDSchema.parse(id);
    return true;
  } catch {
    return false;
  }
}

/**
 * Validates UUID and throws error if invalid
 * @param id - The string to validate
 * @throws Error if UUID is invalid
 */
export function validateUUIDOrThrow(id: string): void {
  try {
    UUIDSchema.parse(id);
  } catch {
    throw new Error('Invalid UUID format');
  }
}

/**
 * Zod schema type helper
 */
export type ZodSchema<T> = z.ZodType<T>;

/**
 * Validates data with Zod schema and returns validated data
 * @param schema - Zod schema to validate against
 * @param data - Data to validate
 * @returns Validated data of type T
 * @throws ZodError if validation fails
 */
export function validateWithZod<T>(
  schema: z.ZodType<T>,
  data: unknown,
): T {
  return schema.parse(data);
}

/**
 * Safely validates data with Zod schema
 * Returns success flag and validated data or error
 * @param schema - Zod schema to validate against
 * @param data - Data to validate
 * @returns Object with success flag and data or error
 */
export function safeValidateWithZod<T>(
  schema: z.ZodType<T>,
  data: unknown,
): { success: true; data: T } | { success: false; error: z.ZodError } {
  const result = schema.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data };
  }
  return { success: false, error: result.error };
}

/**
 * Validates currency code and throws 400 error if invalid
 * @param currency Currency code to validate
 * @throws NextResponse with 400 status if invalid
 */
export function validateCurrencyOrThrow(currency: string): void {
  try {
    validateCurrency(currency);
  } catch (error) {
    if (error instanceof Error) {
      throw badRequest(error.message);
    }
    throw badRequest('Invalid currency');
  }
}

