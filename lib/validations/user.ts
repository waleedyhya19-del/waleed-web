import { z } from 'zod';
import { Role, Language } from '@/lib/api/types';

export const createUserSchema = z.object({
  email: z.string().email('validation.email.invalid'),
  password: z
    .string()
    .min(8, 'validation.password.minLength')
    .regex(/[A-Z]/, 'validation.password.uppercase')
    .regex(/[a-z]/, 'validation.password.lowercase')
    .regex(/[0-9]/, 'validation.password.number'),
  displayName: z
    .string()
    .min(1, 'validation.displayName.required')
    .max(100, 'validation.displayName.maxLength'),
  phone: z
    .string()
    .regex(/^\+?[1-9]\d{1,14}$/, 'validation.phone.invalid')
    .optional()
    .or(z.literal('')),
  role: z.nativeEnum(Role, 'validation.role.invalid'),
  preferredLanguage: z.nativeEnum(Language).optional(),
});

export const updateUserSchema = z.object({
  displayName: z
    .string()
    .min(1, 'validation.displayName.required')
    .max(100, 'validation.displayName.maxLength')
    .optional(),
  phone: z
    .string()
    .regex(/^\+?[1-9]\d{1,14}$/, 'validation.phone.invalid')
    .optional()
    .or(z.literal('')),
  role: z.nativeEnum(Role, 'validation.role.invalid').optional(),
  preferredLanguage: z.nativeEnum(Language).optional(),
});

export const updateMeSchema = z.object({
  displayName: z
    .string()
    .min(1, 'validation.displayName.required')
    .max(100, 'validation.displayName.maxLength')
    .optional(),
  phone: z
    .string()
    .regex(/^\+?[1-9]\d{1,14}$/, 'validation.phone.invalid')
    .optional()
    .or(z.literal('')),
  preferredLanguage: z.nativeEnum(Language).optional(),
});

export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type UpdateMeInput = z.infer<typeof updateMeSchema>;
