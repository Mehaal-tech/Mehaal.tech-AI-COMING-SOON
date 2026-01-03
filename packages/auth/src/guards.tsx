import { JSX } from 'solid-js';
import { useNavigate } from '@solidjs/router';
import { useAuth } from './context';
import type { Role } from './types';
import { hasRole } from './auth-service';

/**
 * HOC to protect routes that require authentication
 * 
 * TODO: Integrate with router guards
 */
export function withAuth<T extends Record<string, any>>(
  Component: (props: T) => JSX.Element,
  redirectTo: string = '/auth/login'
) {
  return (props: T) => {
    const { state } = useAuth();
    const navigate = useNavigate();

    if (!state().isAuthenticated && !state().isLoading) {
      navigate(redirectTo);
      return null;
    }

    if (state().isLoading) {
      return (
        <div class="flex items-center justify-center min-h-screen">
          <div class="text-white">Loading...</div>
        </div>
      );
    }

    return <Component {...props} />;
  };
}

/**
 * HOC to protect routes that require specific role
 * 
 * TODO: Add more granular permission checks
 */
export function requireRole<T extends Record<string, any>>(
  Component: (props: T) => JSX.Element,
  allowedRoles: Role | Role[],
  redirectTo: string = '/auth/unauthorized'
) {
  return (props: T) => {
    const { state } = useAuth();
    const navigate = useNavigate();

    if (!state().isAuthenticated && !state().isLoading) {
      navigate('/auth/login');
      return null;
    }

    if (state().isLoading) {
      return (
        <div class="flex items-center justify-center min-h-screen">
          <div class="text-white">Loading...</div>
        </div>
      );
    }

    if (!hasRole(state().user, allowedRoles)) {
      navigate(redirectTo);
      return null;
    }

    return <Component {...props} />;
  };
}
