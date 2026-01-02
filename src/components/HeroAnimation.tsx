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

  onMount(() => {
    // Stage 0: Black screen (0-0.5s)
    setTimeout(() => {
      setStage(1); // Logo emerges
    }, 500);
    
    // Stage 2: Content appears (3s)
    setTimeout(() => {
      setStage(2);
    }, 3000);
  });

  // Handle AI agent messages - cards appear when agent speaks
  const handleAgentMessage = (text: string, side: 'left' | 'right') => {
    setCurrentMessage({ text, side });
    setLogoPosition(side === 'left' ? 'right' : 'left');
  };

  const handleAgentMessageEnd = () => {
    setCurrentMessage(null);
    setLogoPosition('center');
  };

  return (
    <div class="relative w-full h-full overflow-hidden flex flex-col items-center justify-center">
      
      {/* Center AI Agent Logo - Emerges with glow */}
      <Show when={stage() >= 1}>
        <div 
          class="absolute transition-all duration-700 ease-out z-20"
          classList={{
            "left-1/2 -translate-x-1/2": logoPosition() === 'center',
            "left-8 md:left-16 lg:left-24 translate-x-0": logoPosition() === 'left',
            "right-8 md:right-16 lg:right-24 left-auto translate-x-0": logoPosition() === 'right',
          }}
          style={{
            top: "calc(50% - 120px)",
            transform: logoPosition() === 'center' ? "translateX(-50%)" : "none"
          }}
        >
          <img 
            src="/brand/LOGO-LIGHT.png" 
            alt="Mehaal.tech AI Agent"
            class="w-24 h-24 md:w-32 md:h-32 lg:w-36 lg:h-36 object-contain"
            loading="eager"
            style={{
              animation: stage() === 1 
                ? "logo-emerge 1.8s cubic-bezier(0.34, 1.56, 0.64, 1) forwards, logo-glow-pulse 3s ease-in-out 1.8s infinite" 
                : "logo-glow-pulse 3s ease-in-out infinite"
            }}
          />
        </div>
      </Show>

      {/* "Launching Soon...." Text */}
      <Show when={stage() >= 1}>
        <div 
          class="absolute z-10"
          style={{
            top: "calc(50% + 30px)",
            animation: "fade-in 1.5s ease-out 1.5s both"
          }}
        >
          <h1 
            class="text-2xl md:text-4xl lg:text-5xl font-semibold tracking-[0.3em] text-center"
            style={{
              color: "#6b5ce7",
              "font-family": "CabinetGrotesk-Variable, sans-serif",
              "text-shadow": "0 0 30px rgba(107, 92, 231, 0.4)"
            }}
          >
            Launching Soon....
          </h1>
        </div>
      </Show>

      {/* Voice Agent & Content - Below */}
      <Show when={stage() >= 2}>
        <div 
          class="absolute z-30"
          style={{
            top: "calc(50% + 100px)",
            animation: "fade-in 1s ease-out forwards"
          }}
        >
          <VoiceAgent 
            onTranscript={(text) => console.log("Transcript:", text)}
            onSpeechStart={() => console.log("Speech started")}
            onSpeechEnd={() => console.log("Speech ended")}
            onAgentMessage={handleAgentMessage}
            onAgentMessageEnd={handleAgentMessageEnd}
          />
        </div>

        {/* Email & Social - Bottom */}
        <div 
          class="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 w-full max-w-lg px-4"
          style={{
            animation: "fade-in 1.2s ease-out 0.3s both"
          }}
        >
          <div class="flex flex-col items-center gap-3">
            <EmailSubscription />
            <SocialLinks />
          </div>
        </div>
      </Show>

      {/* Message Cards - Only when agent is speaking */}
      <Show when={currentMessage()}>
        <div 
          class="absolute top-1/2 -translate-y-1/2 max-w-sm z-10 mx-4"
          classList={{
            "left-4 md:left-16": currentMessage()!.side === 'left',
            "right-4 md:right-16": currentMessage()!.side === 'right',
          }}
          style={{
            animation: currentMessage()!.side === 'left' 
              ? "slide-in-left 0.4s ease-out forwards" 
              : "slide-in-right 0.4s ease-out forwards"
          }}
        >
          <div 
            class="bg-black/70 backdrop-blur-md border border-purple-500/30 rounded-xl p-4 md:p-5"
            style={{
              "box-shadow": "0 0 20px rgba(124, 106, 239, 0.2)"
            }}
          >
            <p 
              class="text-purple-100 text-sm md:text-base leading-relaxed"
              style={{ "font-family": "CabinetGrotesk-Variable, sans-serif" }}
            >
              {currentMessage()!.text}
            </p>
          </div>
        </div>
      </Show>
    </div>
  );
}
