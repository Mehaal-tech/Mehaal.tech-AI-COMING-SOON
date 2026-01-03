export type { User, Session, Role, AuthState } from './types';
export { AuthProvider, useAuth } from './context';
export { login, logout, register, checkAuth, hasRole, hasPermission } from './auth-service';
export { withAuth, requireRole } from './guards';
