/**
 * useFormValidation — React Hook Form integration with Zod
 * - Real-time field validation
 * - Async validation support (email uniqueness, etc)
 * - Custom error handling
 * - Type-safe form data
 */

import { useCallback } from 'react';
import { useForm, UseFormProps, FieldValues, Path } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z, ZodSchema } from 'zod';

export interface UseFormValidationOptions<T extends FieldValues> extends Omit<UseFormProps<T>, 'resolver'> {
  schema: ZodSchema;
  mode?: 'onChange' | 'onBlur' | 'onSubmit' | 'onTouched' | 'all';
}

/**
 * Wrapper around useForm with Zod schema validation
 */
export function useFormValidation<T extends FieldValues>({
  schema,
  mode = 'onChange',
  ...rest
}: UseFormValidationOptions<T>) {
  return useForm<T>({
    ...rest,
    resolver: zodResolver(schema),
    mode,
  });
}

/**
 * Hook to validate a single field asynchronously
 */
export function useFieldValidation() {
  const validateField = useCallback(
    async <T extends FieldValues>(
      schema: ZodSchema,
      fieldName: Path<T>,
      value: any
    ): Promise<{ valid: boolean; error?: string }> => {
      try {
        // Create a schema for just this field
        const fieldSchema = z.object({ [fieldName]: schema });
        await fieldSchema.parseAsync({ [fieldName]: value });
        return { valid: true };
      } catch (err) {
        if (err instanceof z.ZodError) {
          const error = err.errors[0];
          return { valid: false, error: error.message };
        }
        return { valid: false, error: 'Validation error' };
      }
    },
    []
  );

  return { validateField };
}

/**
 * Hook for real-time field validation with debounce
 */
export function useRealtimeValidation() {
  const validateField = useCallback(
    async <T extends FieldValues>(
      schema: ZodSchema,
      value: any,
      delayMs = 300
    ): Promise<{ valid: boolean; error?: string }> => {
      return new Promise((resolve) => {
        const timer = setTimeout(async () => {
          try {
            await schema.parseAsync(value);
            resolve({ valid: true });
          } catch (err) {
            if (err instanceof z.ZodError) {
              const error = err.errors[0];
              resolve({ valid: false, error: error.message });
            } else {
              resolve({ valid: false, error: 'Validation error' });
            }
          }
        }, delayMs);

        // Return abort function
        return () => clearTimeout(timer);
      });
    },
    []
  );

  return { validateField };
}

/**
 * Hook for custom validation rules
 */
export function useCustomValidation() {
  const createRule = useCallback(
    <T extends FieldValues>(
      validator: (value: any) => boolean | Promise<boolean>,
      message: string
    ) => {
      return async (value: any) => {
        const result = await Promise.resolve(validator(value));
        return result || message;
      };
    },
    []
  );

  return { createRule };
}
