import { createSignal, onMount, Show, For } from "solid-js";
import VoiceAgent from "./VoiceAgent";
import CountdownTimer from "./CountdownTimer";
import EmailSubscription from "./EmailSubscription";
import SocialLinks from "./SocialLinks";

interface Message {
  text: string;
  side: 'left' | 'right';
}

export default function HeroAnimation() {
  const [stage, setStage] = createSignal(0);
  const [showMic, setShowMic] = createSignal(false);
  const [messages, setMessages] = createSignal<Message[]>([]);
  const [currentMessage, setCurrentMessage] = createSignal<Message | null>(null);
  const [logoPosition, setLogoPosition] = createSignal<'center' | 'up' | 'left' | 'right'>('center');

  console.log("HeroAnimation mounted, stage:", stage());

  // Demo greeting messages from AI agent
  const greetingMessages = [
    { text: "Welcome to Mehaal.tech! We're revolutionizing AI-powered voice interactions.", side: 'left' as const },
    { text: "Our platform enables seamless real-time conversations with advanced AI agents.", side: 'right' as const },
    { text: "Experience the future of human-AI communication, launching soon!", side: 'left' as const },
  ];

  let messageIndex = 0;

  onMount(() => {
    console.log("Starting animation sequence");
    // Stage 0: Black screen (0-1s)
    setTimeout(() => {
      console.log("Stage 1: Logo emerges");
      setStage(1);
    }, 1000);
    
    // Stage 1: Logo emerges (1-2.5s)
    setTimeout(() => setStage(2), 2500);
    
    // Stage 2: Neon glow expands (2.5-4s)
    setTimeout(() => setStage(3), 4000);
    
    // Stage 3: Glow returns to logo (4-5s)
    setTimeout(() => setStage(4), 5000);
    
    // Stage 4: Content appears, logo moves up (5-6s)
    setTimeout(() => {
      setStage(5);
      setLogoPosition('up');
    }, 6000);
    
    // Stage 5: Start greeting messages (6.5s)
    setTimeout(() => {
      setStage(6);
      showNextMessage();
    }, 6500);
  });

  const showNextMessage = () => {
    if (messageIndex < greetingMessages.length) {
      const msg = greetingMessages[messageIndex];
      setCurrentMessage(msg);
      
      // Move logo based on message side
      if (msg.side === 'left') {
        setLogoPosition('right');
      } else {
        setLogoPosition('left');
      }
      
      // Show message for 4 seconds
      setTimeout(() => {
        setMessages([...messages(), msg]);
        setCurrentMessage(null);
        messageIndex++;
        
        if (messageIndex < greetingMessages.length) {
          setTimeout(() => showNextMessage(), 500);
        } else {
          // All messages done, show mic
          setTimeout(() => {
            setLogoPosition('center');
            setShowMic(true);
            setStage(7);
          }, 1000);
        }
      }, 4000);
    }
  };

  const handleTranscript = (text: string) => {
    console.log("User said:", text);
    // You can add logic here to respond to user input
  };

  return (
    <div class="relative w-full h-full overflow-hidden">
      {/* Stage 0-1: Black screen with logo emergence */}
      <Show when={stage() >= 1}>
        <div 
          class="absolute inset-0 flex items-center justify-center transition-all duration-1000"
          classList={{
            "opacity-100": stage() === 1,
            "opacity-0": stage() > 1,
          }}
        >
          <img 
            src="/brand/LOGO-LIGHT.png" 
            alt="Logo"
            class="w-64 h-64 object-contain"
            style={{
              animation: stage() === 1 ? "logo-emerge 1.5s ease-out forwards" : "none"
            }}
          />
        </div>
      </Show>

      {/* Stage 2: Neon glow expansion */}
      <Show when={stage() === 2}>
        <div 
          class="absolute inset-0 flex items-center justify-center"
        >
          <div 
            class="w-64 h-64 rounded-full"
            style={{
              animation: "neon-glow-expand 1.5s ease-out forwards",
              "background-image": "url(/brand/LOGO-LIGHT.png)",
              "background-size": "contain",
              "background-position": "center",
              "background-repeat": "no-repeat"
            }}
          />
        </div>
      </Show>

      {/* Stage 3+: Main content with logo */}
      <Show when={stage() >= 3}>
        <div class="relative w-full h-full flex flex-col">
          {/* Logo with neon glow and position transitions */}
          <div 
            class="absolute transition-all duration-1000 ease-in-out z-20"
            classList={{
              "top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2": logoPosition() === 'center',
              "top-24 left-1/2 -translate-x-1/2": logoPosition() === 'up',
              "top-1/2 left-32 -translate-y-1/2 md:left-32 left-16": logoPosition() === 'right',
              "top-1/2 right-32 -translate-y-1/2 md:right-32 right-16": logoPosition() === 'left',
            }}
          >
            <img 
              src="/brand/LOGO-LIGHT.png" 
              alt="Mehaal.tech Logo - AI Voice Platform"
              class="w-32 h-32 md:w-48 md:h-48 object-contain"
              loading="eager"
              style={{
                filter: stage() >= 3 
                  ? "drop-shadow(0 0 8px rgba(0, 255, 255, 0.6)) drop-shadow(0 0 16px rgba(0, 255, 255, 0.4))"
                  : "none",
                animation: stage() >= 3 ? "neon-pulse 2s ease-in-out infinite" : "none"
              }}
            />
          </div>

          {/* "Launching Soon" text */}
          <Show when={stage() >= 5}>
            <div 
              class="absolute transition-all duration-1000 w-full"
              classList={{
                "top-64 md:top-80": logoPosition() === 'up',
                "opacity-100": stage() >= 5,
                "opacity-0": stage() < 5,
              }}
              style={{
                animation: stage() === 5 ? "fade-in 1s ease-out forwards" : "none"
              }}
            >
              <div class="flex flex-col items-center gap-8">
                <h1 class="text-3xl md:text-5xl lg:text-6xl font-bold text-cyan-300 tracking-wider text-center px-4"
                    style={{
                      "text-shadow": "0 0 20px rgba(0, 255, 255, 0.6), 0 0 40px rgba(0, 255, 255, 0.4)",
                      "font-family": "CabinetGrotesk-Variable, sans-serif"
                    }}
                    role="heading"
                    aria-level="1">
                  Launching Soon
                </h1>
                
                {/* Countdown Timer */}
                <CountdownTimer />
                
                {/* Email Subscription */}
                <EmailSubscription />
                
                {/* Social Links */}
                <SocialLinks />
              </div>
            </div>
          </Show>

          {/* Message Cards */}
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
                   style={{
                     "box-shadow": "0 0 30px rgba(0, 255, 255, 0.3)"
                   }}
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

          {/* Microphone - Push to Talk */}
          <Show when={showMic()}>
            <div 
              class="absolute bottom-12 md:bottom-20 left-1/2 -translate-x-1/2 z-30"
              style={{
                animation: "fade-in 1s ease-out forwards"
              }}
              role="region"
              aria-label="Voice interaction">

              <VoiceAgent 
                onTranscript={handleTranscript}
                onSpeechStart={() => console.log("Speech started")}
                onSpeechEnd={() => console.log("Speech ended")}
              />
            </div>
          </Show>
        </div>
      </Show>
    </div>
  );
}
