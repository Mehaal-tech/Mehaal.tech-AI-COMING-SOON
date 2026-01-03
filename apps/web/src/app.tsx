import { Suspense } from 'solid-js';
import '@unocss/reset/tailwind.css';
import 'virtual:uno.css';
import './styles/globals.css';

export default function App() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <div id="app">
        {/* Routes will be rendered here by SolidStart */}
      </div>
    </Suspense>
  );
}
