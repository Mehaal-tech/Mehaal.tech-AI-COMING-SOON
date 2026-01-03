import { Show, onMount, createEffect } from 'solid-js';
import { voiceAgentState, transitionAIState, setCurrentText } from '~/state/voice-agent-state';
import { speakText, startListening } from '@ai/engine';
import { VoiceVisualizer } from './VoiceVisualizer';
import { useKeyboardShortcuts } from '~/lib/keyboard-shortcuts';

export function Hero() {
  onMount(() => {
    // Initialize AI and start speaking
    initializeAI();
  });

  // Keyboard shortcuts
  useKeyboardShortcuts({
    onSpace: handleMicClick,
    onEscape: () => transitionAIState('ready'),
  });

  const handleMicClick = () => {
    if (!voiceAgentState.isMicEnabled) return;
    
    // Start listening
    transitionAIState('listening');
    startListening();
  };

  return (
    <div 
      class="flex flex-col items-center justify-center gap-8 md:gap-12 py-12 md:py-20 px-4"
      role="main"
      aria-label="AI Voice Assistant Interface"
    >
      {/* AI Core Logo with persistent glow */}
      <div class="relative" role="img" aria-label="AI Agent Core">
        {/* Breathing glow effect */}
        <div 
          class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 md:w-48 md:h-48 rounded-full pointer-events-none breathe-glow"
          aria-hidden="true"
          style={{
            background: `radial-gradient(circle, var(--color-ai-glow) 0%, transparent 60%)`,
            filter: 'blur(30px)',
          }}
        />
        
        {/* AI Logo */}
        <img 
          src="/icon.svg" 
          alt="AI Agent" 
          class="w-32 h-32 md:w-40 md:h-40 relative z-10"
        />
        
        {/* Active state indicator */}
        <Show when={voiceAgentState.state === 'speaking'}>
          <div 
            class="absolute -top-2 -right-2 w-4 h-4 bg-green-500 rounded-full animate-pulse"
            role="status"
            aria-label="AI is speaking"
            style={{
              'box-shadow': '0 0 10px rgba(0, 255, 0, 0.5)',
            }}
          />
        </Show>
        
        <Show when={voiceAgentState.state === 'listening'}>
          <div 
            class="absolute -top-2 -right-2 w-4 h-4 bg-blue-500 rounded-full animate-pulse"
            role="status"
            aria-label="AI is listening"
            style={{
              'box-shadow': '0 0 10px rgba(0, 100, 255, 0.5)',
            }}
          />
        </Show>
      </div>

      {/* Voice Visualizer */}
      <VoiceVisualizer isActive={voiceAgentState.state === 'speaking'} />

      {/* Spoken text container */}
      <div class="max-w-xl md:max-w-2xl px-6 md:px-8 text-center">
        <Show when={voiceAgentState.currentText} fallback={
          <p class="text-gray-400 text-base md:text-lg italic" role="status" aria-live="polite">
            Initializing AI...
          </p>
        }>
          <p 
            class="text-lg md:text-xl text-gray-200 leading-relaxed"
            role="status"
            aria-live="polite"
            aria-atomic="true"
          >
            {voiceAgentState.currentText}
          </p>
        </Show>
      </div>

      {/* Microphone button */}
      <button
        onClick={handleMicClick}
        disabled={!voiceAgentState.isMicEnabled}
        class="relative group ripple-effect focus-trap"
        classList={{
          'opacity-50 cursor-not-allowed': !voiceAgentState.isMicEnabled,
          'hover:scale-110': voiceAgentState.isMicEnabled,
        }}
        style={{
          transition: 'all 0.3s ease',
        }}
        aria-label={voiceAgentState.isMicEnabled ? 'Activate microphone (Space)' : 'Microphone disabled'}
        aria-pressed={voiceAgentState.state === 'listening'}
        tabindex={0}
      >
        {/* Button glow when enabled */}
        <Show when={voiceAgentState.isMicEnabled}>
          <div 
            class="absolute inset-0 -m-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
            aria-hidden="true"
            style={{
              background: `radial-gradient(circle, var(--color-ai-glow) 0%, transparent 70%)`,
              filter: 'blur(15px)',
            }}
          />
        </Show>
        
        {/* Mic icon */}
        <div class="relative w-16 h-16 md:w-20 md:h-20 rounded-full bg-white/10 flex items-center justify-center backdrop-blur-sm">
          <Show 
            when={voiceAgentState.state === 'listening'}
            fallback={
              <svg class="w-8 h-8 md:w-10 md:h-10" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/>
                <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/>
              </svg>
            }
          >
            {/* Listening indicator */}
            <div class="w-3 h-3 bg-blue-500 rounded-full animate-pulse" />
          </Show>
        </div>
      </button>
      
      {/* Keyboard hint */}
      <Show when={voiceAgentState.isMicEnabled}>
        <p class="text-xs md:text-sm text-gray-500 mt-3" role="note">
          Press <kbd class="px-2 py-1 bg-gray-800 rounded text-gray-300">Space</kbd> to speak
        </p>
      </Show>

      {/* State indicator text */}
      <p class="text-sm md:text-base text-gray-500" role="status" aria-live="polite">
        <Show when={voiceAgentState.state === 'speaking'}>
          AI is speaking...
        </Show>
        <Show when={voiceAgentState.state === 'listening'}>
          Listening...
        </Show>
        <Show when={voiceAgentState.state === 'processing'}>
          Processing...
        </Show>
        <Show when={voiceAgentState.state === 'ready'}>
          Ready
        </Show>
      </p>
    </div>
  );
}

// Initialize AI agent
async function initializeAI() {
  try {
    transitionAIState('boot');
    
    // Simulate boot time
    await sleep(1000);
    
    transitionAIState('ready');
    await sleep(500);
    
    // AI speaks first
    transitionAIState('speaking');
    const welcomeText = 'Welcome to Mehaal.Tech AI. I am your intelligent assistant. How may I help you today?';
    setCurrentText(welcomeText);
    
    // Simulate speaking duration
    await speakText(welcomeText);
    
    // Enable mic after speaking
    transitionAIState('ready');
  } catch (error) {
    console.error('[Hero] AI initialization failed:', error);
    setCurrentText('Failed to initialize AI. Please refresh the page.');
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}
