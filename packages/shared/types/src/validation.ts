/**
 * Input Validation Utilities for GraphWiz-XR
 *
 * Provides Zod-based validation schemas and utility functions for
 * consistent input validation across the application.
 *
 * @example
 * ```ts
 * import { safeJsonParse, stringSchema, emailSchema } from '@graphwiz/types/validation';
 *
 * const result = safeJsonParse(jsonString, UserSettingsSchema);
 * if (result.success) {
 *   console.log(result.data);
 * } else {
 *   console.error(result.error);
 * }
 * ```
 */

import { z } from 'zod';

// Re-export Zod for convenience
export { z };

/**
 * String schema with min/max length validation
 */
export const stringSchema = (min: number, max: number, fieldName: string) =>
  z
    .string()
    .min(min, `${fieldName} must be at least ${min} characters`)
    .max(max, `${fieldName} must be at most ${max} characters`)
    .trim();

/**
 * Number schema with range validation
 */
export const numberSchema = (min: number, max: number, fieldName: string) =>
  z
    .number()
    .min(min, `${fieldName} must be at least ${min}`)
    .max(max, `${fieldName} must be at most ${max}`);

/**
 * Integer schema with range validation
 */
export const integerSchema = (min: number, max: number, fieldName: string) =>
  z
    .number()
    .int(`${fieldName} must be an integer`)
    .min(min, `${fieldName} must be at least ${min}`)
    .max(max, `${fieldName} must be at most ${max}`);

/**
 * Boolean schema with custom error messages
 */
export const booleanSchema = (fieldName: string) =>
  z.boolean({
    required_error: `${fieldName} is required`,
    invalid_type_error: `${fieldName} must be a boolean`
  });

/**
 * Safe JSON parse with schema validation
 * Returns a result object instead of throwing
 */
export function safeJsonParse<T>(
  json: string,
  schema: z.ZodSchema<T>
): { success: true; data: T } | { success: false; error: string } {
  try {
    const parsed = JSON.parse(json);
    const result = schema.safeParse(parsed);

    if (result.success) {
      return { success: true, data: result.data };
    } else {
      const firstError = result.error.errors[0];
      return {
        success: false,
        error: firstError
          ? `${firstError.path.join('.')}: ${firstError.message}`
          : 'Validation failed'
      };
    }
  } catch (error) {
    return {
      success: false,
      error: `Invalid JSON: ${error instanceof Error ? error.message : String(error)}`
    };
  }
}

/**
 * Email validation schema
 */
export const emailSchema = z.string().email('Invalid email address').trim().toLowerCase();

/**
 * URL validation schema
 */
export const urlSchema = z.string().url('Invalid URL').trim();

/**
 * UUID validation schema
 */
export const uuidSchema = z.string().uuid('Invalid UUID format');

/**
 * Hex color validation schema (e.g., #FF0000)
 */
export const hexColorSchema = z
  .string()
  .regex(/^#[0-9A-Fa-f]{6}$/, 'Invalid hex color format (expected #RRGGBB)');

/**
 * Positive integer schema
 */
export const positiveIntSchema = z.number().int().positive();

/**
 * Non-empty string schema
 */
export const nonEmptyStringSchema = z.string().min(1, 'Value cannot be empty').trim();

/**
 * Date string schema (ISO 8601)
 */
export const isoDateStringSchema = z.string().datetime('Invalid ISO date format');

/**
 * Safe parse with error extraction
 * Returns the first error message or null if valid
 */
export function getFirstError<T>(schema: z.ZodSchema<T>, data: unknown): string | null {
  const result = schema.safeParse(data);
  if (result.success) return null;
  const firstError = result.error.errors[0];
  return firstError ? `${firstError.path.join('.')}: ${firstError.message}` : 'Validation failed';
}

/**
 * Validate and throw with descriptive error
 */
export function validateOrThrow<T>(schema: z.ZodSchema<T>, data: unknown, context?: string): T {
  const result = schema.safeParse(data);
  if (result.success) return result.data;

  const messages = result.error.errors.map((e) => `${e.path.join('.')}: ${e.message}`);
  const prefix = context ? `[${context}] ` : '';
  throw new Error(`${prefix}Validation failed: ${messages.join('; ')}`);
}

/**
 * Create optional schema from required
 */
export function optional<T extends z.ZodTypeAny>(schema: T) {
  return schema.optional();
}

/**
 * Create nullable schema
 */
export function nullable<T extends z.ZodTypeAny>(schema: T) {
  return schema.nullable();
}

/**
 * Default value schema
 */
export function withDefault<T extends z.ZodTypeAny, D>(schema: T, defaultValue: D) {
  return schema.default(defaultValue);
}

/**
 * Common entity ID schema
 */
export const entityIdSchema = z.string().min(1).max(100);

/**
 * Room ID schema
 */
export const roomIdSchema = z.string().min(1).max(100);

/**
 * User ID schema
 */
export const userIdSchema = z.string().uuid();

/**
 * Display name schema (2-50 chars, alphanumeric + spaces)
 */
export const displayNameSchema = z
  .string()
  .min(2, 'Display name must be at least 2 characters')
  .max(50, 'Display name must be at most 50 characters')
  .regex(/^[\w\s-]+$/, 'Display name can only contain letters, numbers, spaces, and hyphens')
  .trim();

/**
 * Position schema (3D vector)
 */
export const positionSchema = z.object({
  x: z.number(),
  y: z.number(),
  z: z.number()
});

/**
 * Rotation schema (quaternion)
 */
export const rotationSchema = z.object({
  x: z.number().min(-1).max(1),
  y: z.number().min(-1).max(1),
  z: z.number().min(-1).max(1),
  w: z.number().min(-1).max(1)
});

/**
 * Position array schema [x, y, z]
 */
export const positionArraySchema = z.tuple([z.number(), z.number(), z.number()]);

/**
 * Rotation array schema [x, y, z, w]
 */
export const rotationArraySchema = z.tuple([z.number(), z.number(), z.number(), z.number()]);
