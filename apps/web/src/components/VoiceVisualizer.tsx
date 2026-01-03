import { createSignal, onMount, onCleanup, Show, For } from 'solid-js';

interface VoiceVisualizerProps {
  isActive: boolean;
  color?: string;
}

export function VoiceVisualizer(props: VoiceVisualizerProps) {
  const [bars, setBars] = createSignal<number[]>(Array(24).fill(20));
  let intervalId: number | undefined;

  onMount(() => {
    if (props.isActive) {
      startAnimation();
    }
  });

  onCleanup(() => {
    if (intervalId) {
      clearInterval(intervalId);
    }
  });

  const startAnimation = () => {
    intervalId = setInterval(() => {
      setBars(Array(24).fill(0).map(() => 20 + Math.random() * 60));
    }, 100) as unknown as number;
  };

  const stopAnimation = () => {
    if (intervalId) {
      clearInterval(intervalId);
      intervalId = undefined;
    }
    setBars(Array(24).fill(20));
  };

  // Watch for active state changes
  const activeState = () => props.isActive;
  
  // Effect to handle animation based on active state
  if (typeof window !== 'undefined') {
    const checkActive = () => {
      if (activeState() && !intervalId) {
        startAnimation();
      } else if (!activeState() && intervalId) {
        stopAnimation();
      }
    };
    setInterval(checkActive, 100);
  }

  return (
    <Show when={props.isActive}>
      <div 
        class="flex items-center justify-center gap-1 h-20 px-4"
        role="presentation"
        aria-label="Voice activity visualization"
      >
        <For each={bars()}>
          {(height, index) => (
            <div 
              class="w-1 rounded-full transition-all duration-100 ease-out"
              style={{
                height: `${height}%`,
                background: props.color || 'var(--color-ai-glow)',
                opacity: 0.8,
                animation: `pulse 0.8s ease-in-out infinite`,
                'animation-delay': `${index() * 0.03}s`,
              }}
            />
          )}
        </For>
      </div>
    </Show>
  );
}
