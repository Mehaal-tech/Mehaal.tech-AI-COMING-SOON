import { createStore } from 'solid-js/store';

export type AIState =
  | 'init'        // Initializing
  | 'boot'        // Booting AI
  | 'ready'       // Ready to speak
  | 'speaking'    // AI is speaking
  | 'listening'   // AI is listening to user
  | 'processing'; // AI is processing response

interface VoiceAgentState {
  state: AIState;
  currentText: string;
  isMicEnabled: boolean;
  audioPlaying: boolean;
}

const [voiceAgentState, setVoiceAgentState] = createStore<VoiceAgentState>({
  state: 'init',
  currentText: '',
  isMicEnabled: false,
  audioPlaying: false,
});

// State transitions
export function transitionAIState(nextState: AIState) {
  setVoiceAgentState({ state: nextState });
  
  // State-specific side effects
  switch (nextState) {
    case 'speaking':
      setVoiceAgentState({ 
        isMicEnabled: false, 
        audioPlaying: true 
      });
      break;
    case 'listening':
      setVoiceAgentState({ 
        isMicEnabled: true, 
        audioPlaying: false 
      });
      break;
    case 'processing':
      setVoiceAgentState({ 
        isMicEnabled: false, 
        audioPlaying: false 
      });
      break;
    case 'ready':
      setVoiceAgentState({ 
        isMicEnabled: false, 
        audioPlaying: false,
        currentText: ''
      });
      break;
  }
}

export function setCurrentText(text: string) {
  setVoiceAgentState({ currentText: text });
}

export { voiceAgentState };
