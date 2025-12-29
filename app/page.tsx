'use client';

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import Header from "components/Header";
import Hero from "components/Hero";
import { createVoiceAgent, VoiceEventType, EmotionType } from "lib/voice";

export default function Page() {
  const [uiPhase, setUiPhase] = useState(0);
  const [hue, setHue] = useState(277);
  const [intensity, setIntensity] = useState(0);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [currentEmotion, setCurrentEmotion] = useState<EmotionType>(EmotionType.FRIENDLY);
  const [useFallbackVoice, setUseFallbackVoice] = useState(false);
  const [voiceError, setVoiceError] = useState<string>('');
  
  const hasSpokenRef = useRef(false);
  const hueIntervalRef = useRef<number | null>(null);
  const smoothedIntensityRef = useRef(0);
  const isCleaningUpRef = useRef(false);
  const voiceAgentRef = useRef<ReturnType<typeof createVoiceAgent> | null>(null);
  const fallbackAudioContextRef = useRef<AudioContext | null>(null);
  const fallbackAnalyserRef = useRef<AnalyserNode | null>(null);
  const fallbackRafIdRef = useRef<number | null>(null);

  // Initialize voice agent
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    // Create voice agent with callbacks
    voiceAgentRef.current = createVoiceAgent({
      onEvent: (event) => {
        console.log('Voice event:', event.type);
        
        if (event.type === VoiceEventType.SPEECH_START) {
          setIsSpeaking(true);
        } else if (event.type === VoiceEventType.SPEECH_END) {
          setIsSpeaking(false);
        } else if (event.type === VoiceEventType.ERROR) {
          console.error('Voice error:', event.data);
        }
      },
      onTranscript: (text, isFinal) => {
        if (isFinal) {
          setTranscript(text);
        }
      },
      onIntensity: (newIntensity) => {
        // Smooth interpolation
        smoothedIntensityRef.current += (newIntensity - smoothedIntensityRef.current) * 0.15;
        setIntensity(Math.round(smoothedIntensityRef.current));
      },
    });
    
    setIsReady(true);
    
    return () => {
      if (voiceAgentRef.current) {
        voiceAgentRef.current.destroy();
      }
    };
  }, []);

  // Fallback audio analysis for browser TTS
  const analyzeFallbackAudio = useCallback(() => {
    if (isCleaningUpRef.current) return;
    
    const analyser = fallbackAnalyserRef.current;
    if (!analyser || fallbackAudioContextRef.current?.state === 'closed') return;
    
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    analyser.getByteFrequencyData(dataArray);
    
    let sum = 0;
    const meaningfulRange = Math.floor(bufferLength / 2);
    for (let i = 0; i < meaningfulRange; i++) {
      sum += dataArray[i];
    }
    const rawAverage = sum / meaningfulRange;
    const targetIntensity = Math.min(rawAverage * 3.5, 255);

    smoothedIntensityRef.current += (targetIntensity - smoothedIntensityRef.current) * 0.15;
    setIntensity(Math.round(smoothedIntensityRef.current));
    
    fallbackRafIdRef.current = requestAnimationFrame(analyzeFallbackAudio);
  }, []);

  // Setup fallback audio visualization
  const setupFallbackAudio = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });
      
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      const audioCtx = new AudioContext();
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 512;
      analyser.smoothingTimeConstant = 0.85;
      
      const source = audioCtx.createMediaStreamSource(stream);
      source.connect(analyser);
      
      fallbackAudioContextRef.current = audioCtx;
      fallbackAnalyserRef.current = analyser;
      
      analyzeFallbackAudio();
    } catch (err) {
      console.error('Fallback audio setup error:', err);
    }
  }, [analyzeFallbackAudio]);

  const startAudioVisualizer = useCallback(async () => {
    if (isCleaningUpRef.current) return;
    
    try {
      // Check if API key is available
      const hasApiKey = !!process.env.NEXT_PUBLIC_OPENAI_API_KEY;
      
      if (!hasApiKey) {
        console.warn('No OpenAI API key found, using fallback browser voice');
        setUseFallbackVoice(true);
        setVoiceError('Using browser voice (OpenAI key not configured)');
        
        // Setup fallback audio visualization
        await setupFallbackAudio();
        return;
      }
      
      if (!voiceAgentRef.current) return;
      
      // Initialize and connect voice agent
      await voiceAgentRef.current.initialize();
      await voiceAgentRef.current.connect(process.env.NEXT_PUBLIC_OPENAI_API_KEY);
      
    } catch (err) { 
      console.error("Voice Agent Error:", err);
      setVoiceError(`OpenAI connection failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
      setUseFallbackVoice(true);
      
      // Fallback to browser voice
      await setupFallbackAudio();
    }
  }, [setupFallbackAudio]);

  const speakWithBrowserVoice = useCallback((text: string) => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;
    
    setIsSpeaking(true);
    const utterance = new SpeechSynthesisUtterance(text);
    
    const voices = window.speechSynthesis.getVoices();
    const femaleVoice = voices.find(v => 
      (v.name.includes('Google') && v.name.includes('Female')) || 
      v.name.includes('Zira') ||
      v.name.includes('Microsoft') && v.name.includes('Female') ||
      v.name.includes('Samantha')
    );
    
    if (femaleVoice) utterance.voice = femaleVoice;
    utterance.pitch = 1.1;
    utterance.rate = 0.85;
    utterance.volume = 1.0;
    utterance.lang = 'en-US';
    
    utterance.onend = () => {
      setIsSpeaking(false);
    };
    
    utterance.onerror = (error) => {
      console.error('Speech synthesis error:', error);
      setIsSpeaking(false);
    };
    
    window.speechSynthesis.speak(utterance);
  }, []);

  const speakGreeting = useCallback(() => {
    if (!isReady) return;
    
    const greetingText = "Batayein... main apki kia khidmat kar sakti hun?";
    
    if (useFallbackVoice || !voiceAgentRef.current) {
      // Use browser TTS
      speakWithBrowserVoice(greetingText);
      return;
    }
    
    // Use OpenAI voice agent
    setIsSpeaking(true);
    voiceAgentRef.current.sendMessage(greetingText)
      .then(() => {
        setIsSpeaking(false);
      })
      .catch((error) => {
        console.error('Greeting error:', error);
        setIsSpeaking(false);
        
        // Fallback to browser voice
        setUseFallbackVoice(true);
        speakWithBrowserVoice(greetingText);
      });
  }, [isReady, useFallbackVoice, speakWithBrowserVoice]);

  // Animation sequence
  useEffect(() => {
    if (!isReady) return;
    
    const timer1 = setTimeout(() => {
      setUiPhase(1); // Emerge
      
      const timer2 = setTimeout(() => { 
        setUiPhase(2); // Glow
        
        const timer3 = setTimeout(() => { 
          setUiPhase(3); // Flash
          
          const timer4 = setTimeout(() => { 
            setUiPhase(4); // Ready
            
            if (!hasSpokenRef.current) {
              const timer5 = setTimeout(() => {
                startAudioVisualizer();
                speakGreeting();
                hasSpokenRef.current = true;
              }, 500);
              
              return () => clearTimeout(timer5);
            }
          }, 3000);
          
          return () => clearTimeout(timer4);
        }, 2500);
        
        return () => clearTimeout(timer3);
      }, 1000);
      
      return () => clearTimeout(timer2);
    }, 100);

    return () => clearTimeout(timer1);
  }, [isReady, startAudioVisualizer, speakGreeting]);

  // Color cycling
  useEffect(() => {
    if (uiPhase < 4) return;
    
    hueIntervalRef.current = window.setInterval(() => {
      setHue(prev => (prev + 0.5) % 360);
    }, 50);

    return () => {
      if (hueIntervalRef.current) {
        clearInterval(hueIntervalRef.current);
      }
    };
  }, [uiPhase]);

  // Cleanup
  useEffect(() => {
    return () => {
      isCleaningUpRef.current = true;
      
      if (hueIntervalRef.current) {
        clearInterval(hueIntervalRef.current);
      }
      
      if (fallbackRafIdRef.current) {
        cancelAnimationFrame(fallbackRafIdRef.current);
      }
      
      if (fallbackAudioContextRef.current?.state !== 'closed') {
        fallbackAudioContextRef.current?.close().catch(() => {});
      }
      
      if (voiceAgentRef.current) {
        voiceAgentRef.current.disconnect();
      }
      
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const getLogoStyle = useMemo(() => {
    const baseTransition = "all 1.5s cubic-bezier(0.68, -0.55, 0.27, 1.55)";
    const dynamicIntensity = Math.max(20, intensity * 0.8);
    const neonGlow = `
      drop-shadow(0 0 ${dynamicIntensity}px hsl(${hue}, 100%, 60%)) 
      drop-shadow(0 0 ${dynamicIntensity * 2}px hsl(${hue}, 100%, 50%)) 
      drop-shadow(0 0 ${dynamicIntensity * 3}px hsl(${hue}, 100%, 40%))
    `;
    
    switch(uiPhase) {
      case 0:
        return { 
          top: '50%', left: '50%', transform: 'translate(-50%, -50%) scale(0)', 
          opacity: 0, width: '20rem', height: '20rem', transition: baseTransition,
          willChange: 'transform, opacity'
        };
      case 1:
        return { 
          top: '50%', left: '50%', transform: 'translate(-50%, -50%) scale(1)', 
          opacity: 1, width: '20rem', height: '20rem', transition: baseTransition,
          willChange: 'transform, opacity'
        };
      case 2:
        return { 
          top: '50%', left: '50%', transform: 'translate(-50%, -50%) scale(1.05)', 
          opacity: 1, width: '20rem', height: '20rem', 
          filter: 'drop-shadow(0 0 60px rgba(157, 0, 255, 0.8))', 
          transition: baseTransition,
          willChange: 'transform, filter'
        };
      case 3:
        return { 
          top: '50%', left: '50%', transform: 'translate(-50%, -50%) scale(1.2)', 
          opacity: 0, width: '20rem', height: '20rem', transition: 'all 0.3s',
          willChange: 'transform, opacity'
        };
      case 4:
        return { 
          top: '35%', left: '50%', 
          transform: `translate(-50%, -50%) scale(${isSpeaking ? 1 + intensity/800 : 1})`, 
          opacity: 1, width: '20rem', height: '20rem', 
          filter: neonGlow, 
          transition: 'top 1s, left 1s, width 1s, height 1s, opacity 1s, filter 0.1s ease-out, transform 0.3s ease-out',
          willChange: 'filter, transform'
        };
      default: 
        return { willChange: 'auto' };
    }
  }, [uiPhase, hue, intensity, isSpeaking]);

  const flashOverlayClass = useMemo(() => 
    uiPhase === 3 
      ? "opacity-80 pointer-events-auto duration-500 ease-in-out" 
      : "opacity-0 pointer-events-none duration-[1500ms] ease-out"
  , [uiPhase]);

  const backgroundStyle = useMemo(() => 
    uiPhase >= 4 ? {
      backgroundImage: 'url("/brand/wave-gradient.png")',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundAttachment: 'fixed',
    } : {}
  , [uiPhase]);

  return (
    <>
      {/* Error/Status Message */}
      {voiceError && uiPhase >= 4 && (
        <div className="fixed top-4 right-4 z-[60] bg-yellow-500/10 border border-yellow-500/30 backdrop-blur-md rounded-lg px-4 py-2 text-yellow-300 text-sm animate-fade-in">
          ⚠️ {voiceError}
        </div>
      )}
      
      <div 
        className="flex flex-col min-h-screen bg-black relative overflow-hidden transition-all duration-1000"
        style={backgroundStyle}
      >
        {/* FLASH OVERLAY */}
        <div className={`fixed inset-0 z-[100] bg-purple-300 mix-blend-overlay ${flashOverlayClass}`}></div>
        <div className={`fixed inset-0 z-[99] bg-white/80 ${flashOverlayClass}`}></div>

        {/* Overlay */}
        {uiPhase >= 4 && <div className="absolute inset-0 bg-black/30 transition-opacity duration-1000"></div>}
        
        {/* HERO LOGO */}
        <img 
          src="/brand/mehaal-logo.svg" 
          alt="Mehaal Logo" 
          className="fixed z-50 object-contain"
          style={getLogoStyle}
          loading="eager"
          draggable={false}
        />
        
        {/* Content */}
        <div className={`relative z-10 transition-opacity duration-1000 ${uiPhase === 4 ? 'opacity-100' : 'opacity-0'}`}>
          <Header 
            navItems={[]}
            showThemeSwitch={false}
          />
          <main>
            <Hero 
              title="Coming Soon"
              subtitle="Intelligence beyond impossible"
              buttons={[]}
            />
          </main>
        </div>
      </div>
    </>
  );
}
