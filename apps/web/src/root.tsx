// @refresh reload
import { Suspense, ErrorBoundary } from 'solid-js';
import { Router } from '@solidjs/router';
import { FileRoutes } from '@solidjs/start/router';
import '@unocss/reset/tailwind.css';
import 'virtual:uno.css';
import './styles/globals.css';

export default function Root() {
  return (
    <Router
      root={(props) => (
        <ErrorBoundary
          fallback={(err, reset) => (
            <div class="min-h-screen flex items-center justify-center bg-black text-white">
              <div class="text-center max-w-md p-8">
                <h1 class="text-3xl font-bold mb-4">⚠️ Something went wrong</h1>
                <p class="text-gray-400 mb-6">{err.toString()}</p>
                <button 
                  onClick={reset}
                  class="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
                >
                  Try Again
                </button>
              </div>
            </div>
          )}
        >
          <Suspense 
            fallback={
              <div class="min-h-screen flex items-center justify-center bg-black">
                <div class="text-white text-xl">Loading...</div>
              </div>
            }
          >
            {props.children}
          </Suspense>
        </ErrorBoundary>
      )}
    >
      <FileRoutes />
    </Router>
  );
}
