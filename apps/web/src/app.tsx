import { Router } from '@solidjs/router';
import { FileRoutes } from '@solidjs/start/router';
import { Suspense } from 'solid-js';
import '@unocss/reset/tailwind.css';
import 'virtual:uno.css';
import './styles/globals.css';

export default function App() {
  return (
    <Router
      root={(props) => (
        <Suspense>
          {props.children}
        </Suspense>
      )}
    >
      <FileRoutes />
    </Router>
  );
}
