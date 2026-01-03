import { Button, Input, Card } from '@ui/kit';
import { createSignal } from 'solid-js';
import { useNavigate } from '@solidjs/router';
import { login } from '@auth/lib';
import { useAuth } from '@auth/lib';

export default function LoginPage() {
  const navigate = useNavigate();
  const { setSession } = useAuth();
  
  const [email, setEmail] = createSignal('');
  const [password, setPassword] = createSignal('');
  const [error, setError] = createSignal('');
  const [loading, setLoading] = createSignal(false);

  const handleLogin = async (e: Event) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const session = await login({
        email: email(),
        password: password(),
      });

      setSession(session);
      
      // Redirect based on role
      const roleRoutes = {
        owner: '/dashboard/owner',
        management: '/dashboard/management',
        client: '/dashboard/client',
        franchise: '/dashboard/franchise',
        partner: '/dashboard/partner',
      };
      
      navigate(roleRoutes[session.user.role] || '/');
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div class="min-h-screen flex items-center justify-center bg-black p-4">
      <div class="w-full max-w-md">
        <div class="text-center mb-8">
          <img src="/icon.svg" alt="Logo" class="h-16 w-auto mx-auto mb-4" />
          <h1 class="text-3xl font-bold text-white mb-2">Welcome Back</h1>
          <p class="text-gray-400">Sign in to continue to Mehaal.Tech AI</p>
        </div>

        <Card>
          <form onSubmit={handleLogin} class="space-y-4">
            <Input
              type="email"
              label="Email"
              placeholder="you@example.com"
              value={email()}
              onInput={setEmail}
              required
              error={error() ? ' ' : undefined}
            />

            <Input
              type="password"
              label="Password"
              placeholder="••••••••"
              value={password()}
              onInput={setPassword}
              required
            />

            {error() && (
              <div class="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-500 text-sm">
                {error()}
              </div>
            )}

            <Button
              variant="primary"
              class="w-full"
              loading={loading()}
              onClick={handleLogin}
            >
              Sign In
            </Button>

            <div class="text-center text-sm text-gray-400">
              <p>Demo accounts:</p>
              <p class="mt-1">owner@mehaal.tech (Owner)</p>
              <p>manager@mehaal.tech (Management)</p>
              <p>client@mehaal.tech (Client)</p>
              <p class="mt-2 text-xs">Password: any</p>
            </div>
          </form>
        </Card>

        <div class="mt-6 text-center">
          <a href="/auth/register" class="text-sm text-brand-primary hover:underline">
            Don't have an account? Sign up
          </a>
        </div>
      </div>
    </div>
  );
}
