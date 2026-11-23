/**
 * Tests for validation schemas
 */

import { z } from 'zod';
import {
  loginSchema,
  registerSchema,
  createMarketSchema,
  placeBetSchema,
  formatValidationErrors,
} from '../schemas/validation';

describe('Validation Schemas', () => {
  describe('Login Schema', () => {
    it('should validate correct email and password', () => {
      const data = { email: 'user@example.com', password: 'password123' };
      expect(() => loginSchema.parse(data)).not.toThrow();
    });

    it('should reject invalid email', () => {
      const data = { email: 'invalid-email', password: 'password123' };
      expect(() => loginSchema.parse(data)).toThrow();
    });

    it('should reject empty password', () => {
      const data = { email: 'user@example.com', password: '' };
      expect(() => loginSchema.parse(data)).toThrow();
    });
  });

  describe('Register Schema', () => {
    it('should validate correct data', () => {
      const data = {
        email: 'user@example.com',
        password: 'SecurePass123!',
        confirmPassword: 'SecurePass123!',
      };
      expect(() => registerSchema.parse(data)).not.toThrow();
    });

    it('should require uppercase letter in password', () => {
      const data = {
        email: 'user@example.com',
        password: 'securepass123!',
        confirmPassword: 'securepass123!',
      };
      expect(() => registerSchema.parse(data)).toThrow();
    });

    it('should require lowercase letter in password', () => {
      const data = {
        email: 'user@example.com',
        password: 'SECUREPASS123!',
        confirmPassword: 'SECUREPASS123!',
      };
      expect(() => registerSchema.parse(data)).toThrow();
    });

    it('should require number in password', () => {
      const data = {
        email: 'user@example.com',
        password: 'SecurePass!',
        confirmPassword: 'SecurePass!',
      };
      expect(() => registerSchema.parse(data)).toThrow();
    });

    it('should require special character in password', () => {
      const data = {
        email: 'user@example.com',
        password: 'SecurePass123',
        confirmPassword: 'SecurePass123',
      };
      expect(() => registerSchema.parse(data)).toThrow();
    });

    it('should require passwords to match', () => {
      const data = {
        email: 'user@example.com',
        password: 'SecurePass123!',
        confirmPassword: 'DifferentPass123!',
      };
      expect(() => registerSchema.parse(data)).toThrow();
    });
  });

  describe('Create Market Schema', () => {
    it('should validate correct market data', () => {
      const data = {
        title: 'Will Bitcoin reach $100k by end of 2024?',
        description: 'A comprehensive market about Bitcoin price movements',
        category: 'crypto',
        liquidity: 1000,
        closing_at: new Date(Date.now() + 86400000).toISOString(),
        oracle_address: 'GBRPYHIL2CI3FV4BVXLFG7CBISA4MMVN46VC4D3M7DOUIDVBB2UITOL',
      };
      expect(() => createMarketSchema.parse(data)).not.toThrow();
    });

    it('should reject title that is too short', () => {
      const data = {
        title: 'Short',
        description: 'A comprehensive market about Bitcoin price movements',
        category: 'crypto',
        liquidity: 1000,
        closing_at: new Date(Date.now() + 86400000).toISOString(),
        oracle_address: 'GBRPYHIL2CI3FV4BVXLFG7CBISA4MMVN46VC4D3M7DOUIDVBB2UITOL',
      };
      expect(() => createMarketSchema.parse(data)).toThrow();
    });

    it('should reject past closing date', () => {
      const data = {
        title: 'Will Bitcoin reach $100k by end of 2024?',
        description: 'A comprehensive market about Bitcoin price movements',
        category: 'crypto',
        liquidity: 1000,
        closing_at: new Date(Date.now() - 86400000).toISOString(),
        oracle_address: 'GBRPYHIL2CI3FV4BVXLFG7CBISA4MMVN46VC4D3M7DOUIDVBB2UITOL',
      };
      expect(() => createMarketSchema.parse(data)).toThrow();
    });

    it('should reject invalid Stellar address', () => {
      const data = {
        title: 'Will Bitcoin reach $100k by end of 2024?',
        description: 'A comprehensive market about Bitcoin price movements',
        category: 'crypto',
        liquidity: 1000,
        closing_at: new Date(Date.now() + 86400000).toISOString(),
        oracle_address: 'invalid-address',
      };
      expect(() => createMarketSchema.parse(data)).toThrow();
    });
  });

  describe('Place Bet Schema', () => {
    it('should validate correct bet data', () => {
      const data = {
        marketId: 'market123',
        side: 'a',
        amount: 100,
      };
      expect(() => placeBetSchema.parse(data)).not.toThrow();
    });

    it('should reject negative amount', () => {
      const data = {
        marketId: 'market123',
        side: 'a',
        amount: -100,
      };
      expect(() => placeBetSchema.parse(data)).toThrow();
    });

    it('should reject invalid side', () => {
      const data = {
        marketId: 'market123',
        side: 'invalid',
        amount: 100,
      };
      expect(() => placeBetSchema.parse(data)).toThrow();
    });
  });

  describe('Error Formatting', () => {
    it('should format validation errors', () => {
      const schema = z.object({
        email: z.string().email(),
        password: z.string().min(8),
      });

      try {
        schema.parse({ email: 'invalid', password: 'short' });
      } catch (err) {
        if (err instanceof z.ZodError) {
          const errors = formatValidationErrors(err);
          expect(errors.length).toBeGreaterThan(0);
          expect(errors[0]).toHaveProperty('field');
          expect(errors[0]).toHaveProperty('message');
          expect(errors[0]).toHaveProperty('code');
        }
      }
    });
  });
});
