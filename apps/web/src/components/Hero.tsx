import { Show, onMount, createEffect } from 'solid-js';
import { voiceAgentState, transitionAIState, setCurrentText } from '~/state/voice-agent-state';
import { speakText, startListening } from '@ai/engine';

export function Hero() {
  onMount(() => {
    // Initialize AI and start speaking
    initializeAI();
  });

  const handleMicClick = () => {
    if (!voiceAgentState.isMicEnabled) return;
    
    // Start listening
    transitionAIState('listening');
    startListening();
  };

  return (
    <div class="flex flex-col items-center justify-center gap-12 py-20">
      {/* AI Core Logo with persistent glow */}
      <div class="relative">
        {/* Breathing glow effect */}
        <div 
          class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 rounded-full pointer-events-none breathe-glow"
          style={{
            background: `radial-gradient(circle, var(--color-ai-glow) 0%, transparent 60%)`,
            filter: 'blur(30px)',
          }}
        />
        
        {/* AI Logo */}
        <img 
          src="/icon.svg" 
          alt="AI Agent" 
          class="w-40 h-40 relative z-10"
        />
        
        {/* Active state indicator */}
        <Show when={voiceAgentState.state === 'speaking'}>
          <div 
            class="absolute -top-2 -right-2 w-4 h-4 bg-green-500 rounded-full animate-pulse"
            style={{
              'box-shadow': '0 0 10px rgba(0, 255, 0, 0.5)',
            }}
          />
        </Show>
        
        <Show when={voiceAgentState.state === 'listening'}>
          <div 
            class="absolute -top-2 -right-2 w-4 h-4 bg-blue-500 rounded-full animate-pulse"
            style={{
              'box-shadow': '0 0 10px rgba(0, 100, 255, 0.5)',
            }}
          />
        </Show>
      </div>

      {/* Spoken text container */}
      <div class="max-w-2xl px-8 text-center">
        <Show when={voiceAgentState.currentText} fallback={
          <p class="text-gray-400 text-lg italic">Initializing AI...</p>
        }>
          <p class="text-xl text-gray-200 leading-relaxed">
            {voiceAgentState.currentText}
          </p>
        </Show>
      </div>

      {/* Microphone button */}
      <button
        onClick={handleMicClick}
        disabled={!voiceAgentState.isMicEnabled}
        class="relative group"
        classList={{
          'opacity-50 cursor-not-allowed': !voiceAgentState.isMicEnabled,
          'hover:scale-110': voiceAgentState.isMicEnabled,
        }}
        style={{
          transition: 'all 0.3s ease',
        }}
      >
        {/* Button glow when enabled */}
        <Show when={voiceAgentState.isMicEnabled}>
          <div 
            class="absolute inset-0 -m-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
            style={{
              background: `radial-gradient(circle, var(--color-ai-glow) 0%, transparent 70%)`,
              filter: 'blur(15px)',
            }}
          />
        </Show>
        
        {/* Mic icon */}
        <div class="relative w-16 h-16 rounded-full bg-white/10 flex items-center justify-center backdrop-blur-sm">
          <Show 
            when={voiceAgentState.state === 'listening'}
            fallback={
              <svg class="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
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

      {/* State indicator text */}
      <p class="text-sm text-gray-500">
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
  transitionAIState('boot');
  
  // Simulate boot time
  await sleep(1000);
  
  transitionAIState('ready');
  await sleep(500);
  
  // AI speaks first
  transitionAIState('speaking');
  setCurrentText('Welcome to Mehaal.Tech AI. I am your intelligent assistant. How may I help you today?');
  
  // Simulate speaking duration
  await speakText('Welcome to Mehaal.Tech AI. I am your intelligent assistant. How may I help you today?');
  
  // Enable mic after speaking
  transitionAIState('ready');
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}
