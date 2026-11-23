/**
 * Validation Schemas — Zod schemas for form validation
 * - Login, Register, Create Market, Place Bet
 * - Custom validators for async checks (email uniqueness, etc)
 * - Shared across frontend and backend
 */

import { z } from 'zod';
import { AuthService } from '../services/authService';

// ============================================================
// PASSWORD VALIDATION
// ============================================================

const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number')
  .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character');

// ============================================================
// AUTHENTICATION SCHEMAS
// ============================================================

export const loginSchema = z.object({
  email: z
    .string()
    .email('Invalid email address'),
  password: z
    .string()
    .min(1, 'Password is required'),
});

export type LoginFormData = z.infer<typeof loginSchema>;

export const registerSchema = z
  .object({
    email: z
      .string()
      .email('Invalid email address'),
    password: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine(
    (data) => data.password === data.confirmPassword,
    {
      message: 'Passwords do not match',
      path: ['confirmPassword'],
    }
  );

export type RegisterFormData = z.infer<typeof registerSchema>;

export const verify2FASchema = z.object({
  code: z
    .string()
    .regex(/^\d{6}$/, '2FA code must be 6 digits'),
});

export type Verify2FAFormData = z.infer<typeof verify2FASchema>;

export const passwordResetRequestSchema = z.object({
  email: z
    .string()
    .email('Invalid email address'),
});

export type PasswordResetRequestFormData = z.infer<typeof passwordResetRequestSchema>;

export const passwordResetConfirmSchema = z
  .object({
    password: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine(
    (data) => data.password === data.confirmPassword,
    {
      message: 'Passwords do not match',
      path: ['confirmPassword'],
    }
  );

export type PasswordResetConfirmFormData = z.infer<typeof passwordResetConfirmSchema>;

// ============================================================
// MARKET CREATION SCHEMA
// ============================================================

export const createMarketSchema = z.object({
  title: z
    .string()
    .min(10, 'Title must be at least 10 characters')
    .max(200, 'Title must be at most 200 characters'),
  description: z
    .string()
    .min(20, 'Description must be at least 20 characters')
    .max(2000, 'Description must be at most 2000 characters'),
  category: z
    .string()
    .min(1, 'Category is required'),
  liquidity: z
    .number()
    .positive('Liquidity must be positive')
    .max(1000000, 'Liquidity must be at most 1,000,000 XLM'),
  closing_at: z
    .string()
    .refine(
      (val) => {
        const date = new Date(val);
        return date > new Date();
      },
      'Closing date must be in the future'
    ),
  oracle_address: z
    .string()
    .regex(/^G[A-Za-z0-9]{55}$/, 'Invalid Stellar address'),
});

export type CreateMarketFormData = z.infer<typeof createMarketSchema>;

// ============================================================
// BETTING SCHEMA
// ============================================================

export const placeBetSchema = z.object({
  marketId: z
    .string()
    .min(1, 'Market ID is required'),
  side: z
    .enum(['a', 'b', 'draw'], { errorMap: () => ({ message: 'Invalid outcome' }) }),
  amount: z
    .number()
    .positive('Amount must be positive')
    .max(1000000, 'Amount must be at most 1,000,000 XLM'),
  odds: z
    .number()
    .positive('Odds must be positive')
    .optional(),
});

export type PlaceBetFormData = z.infer<typeof placeBetSchema>;

// ============================================================
// USER PROFILE SCHEMA
// ============================================================

export const updateProfileSchema = z.object({
  username: z
    .string()
    .min(3, 'Username must be at least 3 characters')
    .max(32, 'Username must be at most 32 characters')
    .regex(/^[a-zA-Z0-9_-]+$/, 'Username can only contain letters, numbers, underscores, and hyphens')
    .optional(),
  language: z
    .enum(['en', 'es', 'fr', 'ar'], { errorMap: () => ({ message: 'Invalid language' }) })
    .optional(),
  currency: z
    .enum(['USD', 'EUR', 'GBP', 'JPY', 'XLM'], { errorMap: () => ({ message: 'Invalid currency' }) })
    .optional(),
  timezone: z
    .string()
    .optional(),
});

export type UpdateProfileFormData = z.infer<typeof updateProfileSchema>;

// ============================================================
// CUSTOM ASYNC VALIDATORS
// ============================================================

/**
 * Async validator to check if email is already registered
 */
export const emailExistsValidator = z
  .string()
  .email()
  .refine(
    async (email) => {
      try {
        // This would be a new endpoint: GET /auth/check-email
        // Returns { exists: boolean }
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/auth/check-email?email=${encodeURIComponent(email)}`
        );
        const data = await res.json();
        return !data.exists; // Valid if email does NOT exist
      } catch {
        // If check fails, allow (don't block registration)
        return true;
      }
    },
    { message: 'Email is already registered' }
  );

/**
 * Async validator to check if username is available
 */
export const usernameAvailableValidator = z
  .string()
  .min(3, 'Username must be at least 3 characters')
  .refine(
    async (username) => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/auth/check-username?username=${encodeURIComponent(username)}`
        );
        const data = await res.json();
        return !data.exists; // Valid if username does NOT exist
      } catch {
        return true;
      }
    },
    { message: 'Username is already taken' }
  );

// ============================================================
// VALIDATION ERROR FORMATTING
// ============================================================

export interface ValidationError {
  field: string;
  message: string;
  code: string;
}

/**
 * Format Zod validation errors for display
 */
export function formatValidationErrors(error: z.ZodError): ValidationError[] {
  return error.errors.map((err) => ({
    field: err.path.join('.'),
    message: err.message,
    code: err.code,
  }));
}

/**
 * Get first error message for a field
 */
export function getFirstError(errors: Record<string, any>, field: string): string | null {
  const fieldError = errors[field];
  if (!fieldError) return null;
  if (Array.isArray(fieldError)) return fieldError[0]?.message || null;
  return fieldError?.message || null;
}
