import { onMount, Show, createSignal } from 'solid-js';
import { loadingState, advanceLoadingPhase } from '~/state/loading-state';

export function LoadingSequence() {
  const [glowStyle, setGlowStyle] = createSignal<Record<string, string>>({});

  onMount(() => {
    // State machine orchestration
    const runSequence = async () => {
      // Phase 1: Black screen (500ms)
      await sleep(500);
      
      // Phase 2: Logo emerges (1200ms)
      advanceLoadingPhase('logo-emerge');
      await sleep(1200);
      
      // Phase 3: Glow expands (1500ms)
      advanceLoadingPhase('glow-expand');
      setGlowStyle({
        animation: 'glow-expand 1.5s cubic-bezier(0.16, 1, 0.3, 1) forwards',
      });
      await sleep(1500);
      
      // Phase 4: Glow retracts (1200ms)
      advanceLoadingPhase('glow-retract');
      setGlowStyle({
        animation: 'glow-retract 1.2s cubic-bezier(0.16, 1, 0.3, 1) forwards',
      });
      await sleep(1200);
      
      // Phase 5: Content loads (800ms)
      advanceLoadingPhase('content-load');
      await sleep(800);
      
      // Phase 6: Steady state
      advanceLoadingPhase('steady');
    };

    runSequence();
  });

  const isActive = () => loadingState.phase !== 'steady';

  return (
    <Show when={isActive()}>
      {/* Full screen black overlay */}
      <div 
        class="fixed inset-0 z-50 bg-black flex flex-col items-center justify-center"
        classList={{
          'opacity-100': loadingState.phase !== 'content-load' && loadingState.phase !== 'steady',
          'opacity-0 pointer-events-none': loadingState.phase === 'content-load' || loadingState.phase === 'steady',
        }}
        style={{
          transition: 'opacity 0.8s ease-out',
        }}
        role="progressbar"
        aria-valuenow={loadingState.progress}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="Loading application"
      >
        {/* Center logo */}
        <Show when={loadingState.logoVisible}>
          <div class="relative">
            {/* Logo image */}
            <img 
              src="/icon.svg" 
              alt="AI Logo" 
              class="w-32 h-32 relative z-10"
              style={{
                animation: 'emerge 1.2s cubic-bezier(0.16, 1, 0.3, 1) forwards',
              }}
            />
            
            {/* Expanding/Retracting glow */}
            <Show when={loadingState.glowExpanded}>
              <div 
                class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full"
                style={{
                  background: `radial-gradient(circle, var(--color-ai-glow) 0%, transparent 70%)`,
                  filter: 'blur(30px)',
                  ...glowStyle(),
                }}
              />
            </Show>
            
            {/* Persistent glow (thin leak) */}
            <Show when={loadingState.persistentGlow}>
              <div 
                class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 rounded-full pointer-events-none"
                style={{
                  background: `radial-gradient(circle, var(--color-ai-glow) 0%, transparent 60%)`,
                  filter: 'blur(20px)',
                  opacity: '0.4',
                }}
              />
            </Show>
          </div>
        </Show>
        
        {/* Progress indicator */}
        <div class="absolute bottom-12 left-1/2 -translate-x-1/2 w-64 md:w-96">
          <div class="flex items-center gap-3 text-gray-400 text-sm mb-2">
            <span class="font-mono">{loadingState.progress}%</span>
            <div class="flex-1 h-1 bg-gray-800 rounded-full overflow-hidden">
              <div 
                class="h-full bg-gradient-to-r from-blue-600 to-blue-400 transition-all duration-300"
                style={{ width: `${loadingState.progress}%` }}
              />
            </div>
          </div>
          <p class="text-center text-xs text-gray-500">
            {loadingState.phase === 'black-screen' && 'Initializing...'}
            {loadingState.phase === 'logo-emerge' && 'Loading AI Core...'}
            {loadingState.phase === 'glow-expand' && 'Activating Systems...'}
            {loadingState.phase === 'glow-retract' && 'Preparing Interface...'}
            {loadingState.phase === 'content-load' && 'Almost Ready...'}
          </p>
        </div>
      </div>
    </Show>
  );
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}
