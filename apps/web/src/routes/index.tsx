import { LoadingSequence } from '~/components/LoadingSequence';
import { Header } from '~/components/layout/Header';
import { Footer } from '~/components/layout/Footer';
import { Hero } from '~/components/Hero';
import { Show, createSignal } from 'solid-js';
import { loadingState } from '~/state/loading-state';

export default function Home() {
  const isLoadingComplete = () => loadingState.phase === 'steady';

  return (
    <div class="relative min-h-screen">
      <LoadingSequence />
      
      <Show when={isLoadingComplete()}>
        {/* Body background */}
        <div 
          class="fixed inset-0 -z-10 scroll-bg"
          style={{
            'background-image': 'url(/body-bg.png)',
            'background-size': '200% 100%',
            'background-repeat': 'repeat-x',
          }}
        />

        {/* Main Layout */}
        <div class="flex flex-col min-h-screen">
          <Header />
          
          <main class="flex-1 flex items-center justify-center">
            <Hero />
          </main>
          
          <Footer />
        </div>
      </Show>
    </div>
  );
}
