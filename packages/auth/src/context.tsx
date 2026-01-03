import { createContext, useContext, createSignal, createEffect, JSX } from 'solid-js';
import type { User, Session, AuthState } from './types';
import { checkAuth } from './auth-service';

const AuthContext = createContext<{
  state: () => AuthState;
  setSession: (session: Session | null) => void;
}>();

export function AuthProvider(props: { children: JSX.Element }) {
  const [state, setState] = createSignal<AuthState>({
    user: null,
    session: null,
    isAuthenticated: false,
    isLoading: true,
  });

  const setSession = (session: Session | null) => {
    setState({
      user: session?.user || null,
      session,
      isAuthenticated: !!session,
      isLoading: false,
    });
  };

  // Check authentication on mount
  createEffect(async () => {
    const session = await checkAuth();
    setSession(session);
  });

  return (
    <AuthContext.Provider value={{ state, setSession }}>
      {props.children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
