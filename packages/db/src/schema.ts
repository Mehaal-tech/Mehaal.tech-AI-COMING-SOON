/**
 * Database Schema Definitions
 * 
 * TODO: Replace with real database schema
 * Options:
 * 1. Drizzle ORM + PostgreSQL
 * 2. Prisma + PostgreSQL
 * 3. Supabase (PostgreSQL)
 * 4. MongoDB with Mongoose
 * 
 * Migration checklist:
 * - [ ] Set up database provider
 * - [ ] Create migration files
 * - [ ] Set up connection pooling
 * - [ ] Add indexes for performance
 * - [ ] Implement soft deletes
 * - [ ] Add audit trails
 * - [ ] Set up database backups
 */

export interface User {
  id: string;
  email: string;
  name: string;
  password_hash?: string;
  role: 'owner' | 'management' | 'client' | 'franchise' | 'partner';
  tenant_id?: string;
  avatar?: string;
  permissions: string[];
  created_at: Date;
  updated_at: Date;
  last_login?: Date;
}

export interface Tenant {
  id: string;
  name: string;
  slug: string;
  domain?: string;
  theme_config?: Record<string, any>;
  settings?: Record<string, any>;
  status: 'active' | 'suspended' | 'trial';
  subscription_tier?: string;
  created_at: Date;
  updated_at: Date;
}

export interface Page {
  id: string;
  tenant_id?: string;
  title: string;
  slug: string;
  content: string;
  meta_title?: string;
  meta_description?: string;
  status: 'draft' | 'published' | 'archived';
  author_id: string;
  created_at: Date;
  updated_at: Date;
  published_at?: Date;
}

export interface Service {
  id: string;
  tenant_id?: string;
  name: string;
  description?: string;
  category: string;
  price_monthly?: number;
  price_yearly?: number;
  features: string[];
  active: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface Pricing {
  id: string;
  tenant_id?: string;
  plan_name: string;
  price_monthly: number;
  price_yearly?: number;
  features: string[];
  limits: Record<string, any>;
  active: boolean;
  sort_order?: number;
  created_at: Date;
  updated_at: Date;
}

export interface Media {
  id: string;
  tenant_id?: string;
  filename: string;
  original_name: string;
  mime_type: string;
  size: number;
  url: string;
  thumbnail_url?: string;
  metadata?: Record<string, any>;
  uploaded_by: string;
  created_at: Date;
}

export interface Session {
  id: string;
  user_id: string;
  token: string;
  expires_at: Date;
  ip_address?: string;
  user_agent?: string;
  created_at: Date;
}

export interface ConversationHistory {
  id: string;
  user_id: string;
  session_id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  metadata?: Record<string, any>;
  created_at: Date;
}

export interface ApiKey {
  id: string;
  tenant_id: string;
  name: string;
  key_hash: string;
  permissions: string[];
  last_used_at?: Date;
  expires_at?: Date;
  created_at: Date;
}
