import type { User, Session, LoginCredentials, RegisterData, Role } from './types';

/**
 * Authentication Service - Dummy Implementation
 * 
 * TODO: Replace with real authentication provider
 * Options:
 * 1. NextAuth.js / Auth.js
 * 2. Supabase Auth
 * 3. Firebase Auth
 * 4. Custom JWT-based auth with backend
 * 
 * Integration checklist:
 * - [ ] Set up authentication provider
 * - [ ] Implement token refresh logic
 * - [ ] Add password reset flow
 * - [ ] Implement OAuth providers (Google, GitHub, etc.)
 * - [ ] Add MFA support
 * - [ ] Implement session management
 */

const DUMMY_USERS: Record<string, User> = {
  'owner@mehaal.tech': {
    id: '1',
    email: 'owner@mehaal.tech',
    name: 'Admin User',
    role: 'owner',
    permissions: ['*'], // All permissions
  },
  'manager@mehaal.tech': {
    id: '2',
    email: 'manager@mehaal.tech',
    name: 'Manager User',
    role: 'management',
    permissions: ['read:projects', 'write:projects', 'read:team', 'write:team'],
  },
  'client@mehaal.tech': {
    id: '3',
    email: 'client@mehaal.tech',
    name: 'Client User',
    role: 'client',
    permissions: ['read:services', 'read:billing', 'write:support'],
  },
};

/**
 * Login user
 * @returns Session object
 * 
 * TODO: Replace with real API call
 */
export async function login(credentials: LoginCredentials): Promise<Session> {
  // Simulate network delay
  await delay(1000);

  const user = DUMMY_USERS[credentials.email];
  
  if (!user) {
    throw new Error('Invalid credentials');
  }

  // Mock session
  const session: Session = {
    token: generateMockToken(),
    expiresAt: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
    user,
  };

  // Store in localStorage
  localStorage.setItem('auth_session', JSON.stringify(session));

  console.log('[Auth] User logged in:', user.email);
  return session;
}

/**
 * Logout user
 * 
 * TODO: Replace with real API call to invalidate token
 */
export async function logout(): Promise<void> {
  await delay(500);
  
  localStorage.removeItem('auth_session');
  console.log('[Auth] User logged out');
}

/**
 * Register new user
 * 
 * TODO: Replace with real API call
 */
export async function register(data: RegisterData): Promise<Session> {
  await delay(1000);

  const user: User = {
    id: generateId(),
    email: data.email,
    name: data.name,
    role: data.role || 'client',
    permissions: getDefaultPermissions(data.role || 'client'),
  };

  const session: Session = {
    token: generateMockToken(),
    expiresAt: Date.now() + 24 * 60 * 60 * 1000,
    user,
  };

  localStorage.setItem('auth_session', JSON.stringify(session));
  
  console.log('[Auth] User registered:', user.email);
  return session;
}

/**
 * Check if user is authenticated
 * 
 * TODO: Replace with token validation API call
 */
export async function checkAuth(): Promise<Session | null> {
  const sessionData = localStorage.getItem('auth_session');
  
  if (!sessionData) {
    return null;
  }

  try {
    const session: Session = JSON.parse(sessionData);
    
    // Check if session is expired
    if (session.expiresAt < Date.now()) {
      localStorage.removeItem('auth_session');
      return null;
    }

    return session;
  } catch (error) {
    console.error('[Auth] Failed to parse session:', error);
    return null;
  }
}

/**
 * Check if user has specific role
 */
export function hasRole(user: User | null, role: Role | Role[]): boolean {
  if (!user) return false;
  
  const roles = Array.isArray(role) ? role : [role];
  return roles.includes(user.role);
}

/**
 * Check if user has specific permission
 */
export function hasPermission(user: User | null, permission: string): boolean {
  if (!user) return false;
  
  // Owner has all permissions
  if (user.permissions.includes('*')) return true;
  
  return user.permissions.includes(permission);
}

/**
 * Get default permissions for role
 */
function getDefaultPermissions(role: Role): string[] {
  const permissionMap: Record<Role, string[]> = {
    owner: ['*'],
    management: ['read:projects', 'write:projects', 'read:team', 'write:team', 'read:reports'],
    client: ['read:services', 'read:billing', 'write:support'],
    franchise: ['read:locations', 'write:locations', 'read:inventory', 'write:inventory'],
    partner: ['read:referrals', 'read:commissions', 'write:referrals'],
  };
  
  return permissionMap[role] || [];
}

// Helper functions
function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function generateMockToken(): string {
  return `mock_token_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

function generateId(): string {
  return `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}
