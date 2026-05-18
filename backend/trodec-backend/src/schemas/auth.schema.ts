import { z } from 'zod';

// Valid user roles (admin can only be assigned by system, not during signup)
export const userRoleSchema = z.enum(['consumer', 'expert', 'brand_admin', 'admin']);

// Sign up schema
export const signUpSchema = z.object({
  email: z
    .string({ required_error: 'Email is required' })
    .email('Invalid email format'),
  password: z
    .string({ required_error: 'Password is required' })
    .min(8, 'Password must be at least 8 characters')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'Password must contain at least one uppercase letter, one lowercase letter, and one number'
    ),
  role: userRoleSchema,
  fullName: z.string().min(2, 'Full name must be at least 2 characters').optional(),
  // Expert-specific fields
  expertise: z.array(z.string()).optional(),
  linkedinUrl: z.string().url('Invalid LinkedIn URL').optional(),
  // Brand-specific fields
  brandName: z.string().min(2, 'Brand name must be at least 2 characters').optional(),
}).refine((data) => {
  // Expert must have expertise
  if (data.role === 'expert' && (!data.expertise || data.expertise.length === 0)) {
    return false;
  }
  return true;
}, {
  message: 'Experts must provide at least one area of expertise',
  path: ['expertise'],
}).refine((data) => {
  // Brand admin must have brand name
  if (data.role === 'brand_admin' && !data.brandName) {
    return false;
  }
  return true;
}, {
  message: 'Brand admins must provide a brand name',
  path: ['brandName'],
});

// Sign in schema
export const signInSchema = z.object({
  email: z
    .string({ required_error: 'Email is required' })
    .email('Invalid email format'),
  password: z
    .string({ required_error: 'Password is required' })
    .min(1, 'Password is required'),
});

// Refresh token schema
export const refreshTokenSchema = z.object({
  refreshToken: z
    .string({ required_error: 'Refresh token is required' })
    .min(1, 'Refresh token is required'),
});

// Google OAuth schema
export const googleOAuthSchema = z.object({
  redirectTo: z
    .string({ required_error: 'Redirect URL is required' })
    .url('Invalid redirect URL'),
});

// Change password schema
export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z
    .string()
    .min(8, 'New password must be at least 8 characters')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'Password must contain uppercase, lowercase, and a number'
    ),
});

// Type exports
export type SignUpInput = z.infer<typeof signUpSchema>;
export type SignInInput = z.infer<typeof signInSchema>;
export type RefreshTokenInput = z.infer<typeof refreshTokenSchema>;
export type GoogleOAuthInput = z.infer<typeof googleOAuthSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
