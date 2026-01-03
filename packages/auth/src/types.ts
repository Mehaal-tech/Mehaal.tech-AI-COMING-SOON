export type Role = 'owner' | 'management' | 'client' | 'franchise' | 'partner';

export interface User {
  id: string;
  email: string;
  name: string;
  role: Role;
  avatar?: string;
  tenantId?: string;
  permissions: string[];
}

export interface Session {
  token: string;
  expiresAt: number;
  user: User;
}

export interface AuthState {
  user: User | null;
  session: Session | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  name: string;
  role?: Role;
}
