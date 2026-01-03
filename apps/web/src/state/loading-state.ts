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
  progress: number; // 0-100
  logoVisible: boolean;
  glowExpanded: boolean;
  glowRetracted: boolean;
  persistentGlow: boolean;
  contentVisible: boolean;
}

const [loadingState, setLoadingState] = createStore<LoadingState>({
  phase: 'black',
  progress: 0,
  logoVisible: false,
  glowExpanded: false,
  glowRetracted: false,
  persistentGlow: false,
  contentVisible: false,
});

// State machine controller
export function advanceLoadingPhase(nextPhase: LoadingPhase) {
  const progressMap: Record<LoadingPhase, number> = {
    'black': 0,
    'logo-emerge': 20,
    'glow-expand': 45,
    'glow-retract': 70,
    'content-load': 90,
    'steady': 100,
  };
  
  switch (nextPhase) {
    case 'logo-emerge':
      setLoadingState({ phase: nextPhase, progress: progressMap[nextPhase], logoVisible: true });
      break;
    case 'glow-expand':
      setLoadingState({ phase: nextPhase, progress: progressMap[nextPhase], glowExpanded: true });
      break;
    case 'glow-retract':
      setLoadingState({ 
        phase: nextPhase,
        progress: progressMap[nextPhase],
        glowRetracted: true,
        persistentGlow: true,
      });
      break;
    case 'content-load':
      setLoadingState({ phase: nextPhase, progress: progressMap[nextPhase], contentVisible: true });
      break;
    case 'steady':
      setLoadingState({ phase: nextPhase, progress: progressMap[nextPhase] });
      break;
  }
}

export { loadingState };
