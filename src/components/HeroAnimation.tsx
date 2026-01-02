import { createSignal, onMount, Show } from "solid-js";
import VoiceAgent from "./VoiceAgent";
import EmailSubscription from "./EmailSubscription";
import SocialLinks from "./SocialLinks";

interface Message {
  text: string;
  side: 'left' | 'right';
}

export default function HeroAnimation() {
  const [stage, setStage] = createSignal(0);
  const [currentMessage, setCurrentMessage] = createSignal<Message | null>(null);
  const [logoPosition, setLogoPosition] = createSignal<'center' | 'left' | 'right'>('center');
  const [isAgentSpeaking, setIsAgentSpeaking] = createSignal(false);

  console.log("HeroAnimation mounted, stage:", stage());

  onMount(() => {
    console.log("Starting animation sequence");
    // Stage 0: Black screen (0-1s)
    setTimeout(() => {
      console.log("Stage 1: Logo emerges with glow");
      setStage(1);
    }, 1000);
    
    // Stage 1: Logo emerges and glows (1-3.5s)
    setTimeout(() => {
      console.log("Stage 2: Content appears");
      setStage(2);
    }, 3500);
  });

  // Handle AI agent messages - cards appear when agent speaks
  const handleAgentMessage = (text: string, side: 'left' | 'right') => {
    setCurrentMessage({ text, side });
    setIsAgentSpeaking(true);
    
    // Move logo based on message side
    if (side === 'left') {
      setLogoPosition('right');
    } else {
      setLogoPosition('left');
    }
  };

  const handleAgentMessageEnd = () => {
    setCurrentMessage(null);
    setIsAgentSpeaking(false);
    setLogoPosition('center');
  };

  const handleTranscript = (text: string) => {
    console.log("Transcript:", text);
  };

  const handleSpeechStart = () => {
    console.log("User started speaking");
  };

  const handleSpeechEnd = () => {
    console.log("User stopped speaking");
  };

  return (
    <div class="relative w-full h-full overflow-hidden flex items-center justify-center">
      {/* Stage 1+: Logo emerges with neon glow */}
      <Show when={stage() >= 1}>
        <div 
          class="absolute transition-all duration-1000 ease-in-out z-20"
          classList={{
            "top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2": logoPosition() === 'center',
            "top-1/2 left-16 md:left-32 -translate-y-1/2": logoPosition() === 'right',
            "top-1/2 right-16 md:right-32 -translate-y-1/2": logoPosition() === 'left',
          }}
        >
          <img 
            src="/brand/LOGO-LIGHT.png" 
            alt="Mehaal.tech Logo - AI Voice Platform"
            class="w-40 h-40 md:w-56 md:h-56 lg:w-64 lg:h-64 object-contain cursor-pointer"
            loading="eager"
            style={{
              filter: "drop-shadow(0 0 12px rgba(0, 255, 255, 0.8)) drop-shadow(0 0 24px rgba(0, 255, 255, 0.5)) drop-shadow(0 0 48px rgba(0, 255, 255, 0.3))",
              animation: stage() === 1 ? "logo-emerge 2s ease-out forwards" : "neon-pulse 3s ease-in-out infinite"
            }}
          />
        </div>
      </Show>

      {/* Stage 2+: Content appears */}
      <Show when={stage() >= 2}>
        {/* Voice Agent Button - Below Logo */}
        <div 
          class="absolute bottom-32 md:bottom-40 left-1/2 -translate-x-1/2 z-30"
          style={{
            animation: "fade-in 1s ease-out forwards"
          }}
          role="region"
          aria-label="Voice interaction"
        >
          <VoiceAgent 
            onTranscript={handleTranscript}
            onSpeechStart={handleSpeechStart}
            onSpeechEnd={handleSpeechEnd}
            onAgentMessage={handleAgentMessage}
            onAgentMessageEnd={handleAgentMessageEnd}
          />
        </div>

        {/* Email & Social - Bottom */}
        <div 
          class="absolute bottom-4 md:bottom-8 left-1/2 -translate-x-1/2 z-20 w-full max-w-md px-4"
          style={{
            animation: "fade-in 1.5s ease-out forwards"
          }}
        >
          <div class="flex flex-col items-center gap-4">
            <EmailSubscription />
            <SocialLinks />
          </div>
        </div>
      </Show>

      {/* Message Cards - Only when agent is speaking */}
      <Show when={currentMessage()}>
        <div 
          class="absolute top-1/2 -translate-y-1/2 max-w-md z-10 mx-4 md:mx-0"
          classList={{
            "left-4 md:left-16": currentMessage()!.side === 'left',
            "right-4 md:right-16": currentMessage()!.side === 'right',
          }}
          style={{
            animation: currentMessage()!.side === 'left' 
              ? "slide-in-left 0.5s ease-out forwards" 
              : "slide-in-right 0.5s ease-out forwards"
          }}
        >
          <div class="bg-black/80 backdrop-blur-lg border border-cyan-500/30 rounded-2xl p-4 md:p-6 shadow-2xl"
               role="alert"
               aria-live="polite">
            <p class="text-cyan-100 text-sm md:text-lg leading-relaxed"
               style={{
                 "font-family": "CabinetGrotesk-Variable, sans-serif"
               }}>
              {currentMessage()!.text}
            </p>
          </div>
        </div>
      </Show>
    </div>
  );
}
