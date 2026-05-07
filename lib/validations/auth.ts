import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('validation.email.invalid'),
  password: z.string().min(1, 'validation.password.required'),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email('validation.email.invalid'),
});

export const resetPasswordSchema = z
  .object({
    token: z.string().min(1, 'validation.token.required'),
    newPassword: z
      .string()
      .min(8, 'validation.password.minLength')
      .regex(/[A-Z]/, 'validation.password.uppercase')
      .regex(/[a-z]/, 'validation.password.lowercase')
      .regex(/[0-9]/, 'validation.password.number'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'validation.password.mismatch',
    path: ['confirmPassword'],
  });

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'validation.currentPassword.required'),
    newPassword: z
      .string()
      .min(8, 'validation.password.minLength')
      .regex(/[A-Z]/, 'validation.password.uppercase')
      .regex(/[a-z]/, 'validation.password.lowercase')
      .regex(/[0-9]/, 'validation.password.number'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'validation.password.mismatch',
    path: ['confirmPassword'],
  });

export type LoginInput = z.infer<typeof loginSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
