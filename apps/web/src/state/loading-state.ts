import { createStore } from 'solid-js/store';

export type LoadingPhase = 
  | 'black'           // Initial black screen
  | 'logo-emerge'     // Logo appears
  | 'glow-expand'     // Glow expands from logo
  | 'glow-retract'    // Glow retracts, leaves persistent glow
  | 'content-load'    // Content loads behind mask
  | 'steady';         // Final steady state

interface LoadingState {
  phase: LoadingPhase;
  logoVisible: boolean;
  glowExpanded: boolean;
  glowRetracted: boolean;
  persistentGlow: boolean;
  contentVisible: boolean;
}

const [loadingState, setLoadingState] = createStore<LoadingState>({
  phase: 'black',
  logoVisible: false,
  glowExpanded: false,
  glowRetracted: false,
  persistentGlow: false,
  contentVisible: false,
});

// State machine controller
export function advanceLoadingPhase(nextPhase: LoadingPhase) {
  switch (nextPhase) {
    case 'logo-emerge':
      setLoadingState({ phase: nextPhase, logoVisible: true });
      break;
    case 'glow-expand':
      setLoadingState({ phase: nextPhase, glowExpanded: true });
      break;
    case 'glow-retract':
      setLoadingState({ 
        phase: nextPhase, 
        glowRetracted: true,
        persistentGlow: true,
      });
      break;
    case 'content-load':
      setLoadingState({ phase: nextPhase, contentVisible: true });
      break;
    case 'steady':
      setLoadingState({ phase: nextPhase });
      break;
  }
}

export { loadingState };
