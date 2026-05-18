// User roles
export type UserRole = 'consumer' | 'expert' | 'brand_admin' | 'admin';

// Base user from Supabase Auth
export interface AuthUser {
  id: string;
  email: string;
  createdAt: string;
}

// Profile stored in our database
export interface Profile {
  id: string;
  email: string;
  fullName: string | null;
  avatarUrl: string | null;
  role: UserRole;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// Expert-specific details
export interface ExpertDetails {
  id: string;
  expertise: string[];
  linkedinUrl: string | null;
  bio: string | null;
  yearsOfExperience: number | null;
  isVerified: boolean;
  verificationDate: string | null;
  rating: number;
  totalReviews: number;
  createdAt: string;
  updatedAt: string;
}

// Brand-specific details
export interface BrandDetails {
  id: string;
  brandName: string;
  businessType: string | null;
  websiteUrl: string | null;
  description: string | null;
  logoUrl: string | null;
  isVerified: boolean;
  verificationDate: string | null;
  createdAt: string;
  updatedAt: string;
}

// Combined user with profile and role-specific details
export interface UserWithProfile extends AuthUser {
  profile: Profile | null;
  expertDetails?: ExpertDetails | null;
  brandDetails?: BrandDetails | null;
}

// Session data
export interface Session {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  expiresAt: number;
}

// Auth response
export interface AuthResponse {
  user: AuthUser;
  profile: Profile | null;
  session: Session | null;
}

// Request with authenticated user
import { Request } from 'express';

export interface AuthenticatedRequest extends Request {
  user?: AuthUser;
  profile?: Profile;
}

// Database row types (snake_case from Supabase)
export interface ProfileRow {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  role: UserRole;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ExpertDetailsRow {
  id: string;
  expertise: string[];
  linkedin_url: string | null;
  bio: string | null;
  years_of_experience: number | null;
  is_verified: boolean;
  verification_date: string | null;
  rating: number;
  total_reviews: number;
  created_at: string;
  updated_at: string;
}

export interface BrandDetailsRow {
  id: string;
  brand_name: string;
  business_type: string | null;
  website_url: string | null;
  description: string | null;
  logo_url: string | null;
  is_verified: boolean;
  verification_date: string | null;
  created_at: string;
  updated_at: string;
}

// Helper to convert snake_case to camelCase
export function toProfile(row: ProfileRow): Profile {
  return {
    id: row.id,
    email: row.email,
    fullName: row.full_name,
    avatarUrl: row.avatar_url,
    role: row.role,
    isActive: row.is_active,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function toExpertDetails(row: ExpertDetailsRow): ExpertDetails {
  return {
    id: row.id,
    expertise: row.expertise,
    linkedinUrl: row.linkedin_url,
    bio: row.bio,
    yearsOfExperience: row.years_of_experience,
    isVerified: row.is_verified,
    verificationDate: row.verification_date,
    rating: Number(row.rating),
    totalReviews: row.total_reviews,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function toBrandDetails(row: BrandDetailsRow): BrandDetails {
  return {
    id: row.id,
    brandName: row.brand_name,
    businessType: row.business_type,
    websiteUrl: row.website_url,
    description: row.description,
    logoUrl: row.logo_url,
    isVerified: row.is_verified,
    verificationDate: row.verification_date,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}
