import { createSignal, onCleanup, Show } from "solid-js";

interface VoiceAgentProps {
  onTranscript: (text: string) => void;
  onSpeechStart: () => void;
  onSpeechEnd: () => void;
}

export default function VoiceAgent(props: VoiceAgentProps) {
  const [isListening, setIsListening] = createSignal(false);
  const [isProcessing, setIsProcessing] = createSignal(false);
  const [error, setError] = createSignal<string | null>(null);
  const [isSpeaking, setIsSpeaking] = createSignal(false);
  
  let mediaRecorder: MediaRecorder | null = null;
  let audioChunks: Blob[] = [];
  let speechSynthesis: SpeechSynthesis | null = null;

  const startListening = async () => {
    try {
      setError(null);
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
      audioChunks = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunks.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        setIsProcessing(true);
        const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
        
        try {
          await processAudio(audioBlob);
        } catch (err) {
          console.error("Error processing audio:", err);
          setError(err instanceof Error ? err.message : "Failed to process audio");
        } finally {
          setIsProcessing(false);
        }
        
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.onerror = (event) => {
        console.error("MediaRecorder error:", event);
        setError("Recording error occurred");
        setIsListening(false);
      };

      mediaRecorder.start();
      setIsListening(true);
      props.onSpeechStart();
    } catch (error) {
      console.error("Error accessing microphone:", error);
      setError("Microphone access denied. Please enable microphone permissions.");
    }
  };

  const stopListening = () => {
    if (mediaRecorder && mediaRecorder.state !== 'inactive') {
      mediaRecorder.stop();
      setIsListening(false);
      props.onSpeechEnd();
    }
  };

  const processAudio = async (audioBlob: Blob) => {
    const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
    
    if (!apiKey || apiKey === 'your-openai-api-key-here') {
      // Demo mode fallback
      const demoResponse = "Hello! This is a demo response. Please configure your OpenAI API key in the .env file to enable real voice interaction with AI.";
      props.onTranscript(demoResponse);
      await speakText(demoResponse);
      return;
    }

    try {
      // Transcribe audio using OpenAI Whisper
      const formData = new FormData();
      formData.append('file', audioBlob, 'audio.webm');
      formData.append('model', import.meta.env.VITE_WHISPER_MODEL || 'whisper-1');
      formData.append('language', 'en');

      const transcriptionResponse = await fetch('https://api.openai.com/v1/audio/transcriptions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
        },
        body: formData
      });

      if (!transcriptionResponse.ok) {
        throw new Error(`Transcription failed: ${transcriptionResponse.statusText}`);
      }

      const transcriptionData = await transcriptionResponse.json();
      const userText = transcriptionData.text;
      
      console.log("User said:", userText);
      props.onTranscript(userText);

      // Get AI response
      const aiResponse = await getAIResponse(userText, apiKey);
      
      // Speak the response
      await speakText(aiResponse);
      
    } catch (error) {
      console.error("Error in processAudio:", error);
      throw error;
    }
  };

  const getAIResponse = async (userMessage: string, apiKey: string): Promise<string> => {
    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: import.meta.env.VITE_OPENAI_MODEL || 'gpt-4-turbo-preview',
          messages: [
            {
              role: 'system',
              content: 'You are a friendly AI assistant for Mehaal.tech, a company launching an AI-powered voice interaction platform. Keep responses concise and enthusiastic about the upcoming launch.'
            },
            {
              role: 'user',
              content: userMessage
            }
          ],
          max_tokens: 150,
          temperature: 0.7,
        })
      });

      if (!response.ok) {
        throw new Error(`AI response failed: ${response.statusText}`);
      }

      const data = await response.json();
      return data.choices[0].message.content;
    } catch (error) {
      console.error("Error getting AI response:", error);
      return "I'm having trouble connecting right now. Please try again in a moment!";
    }
  };

  const speakText = async (text: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      if (!('speechSynthesis' in window)) {
        console.warn("Speech synthesis not supported");
        resolve();
        return;
      }

      // Cancel any ongoing speech
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      utterance.volume = 1.0;
      
      // Try to use a better voice if available
      const voices = window.speechSynthesis.getVoices();
      const preferredVoice = voices.find(voice => 
        voice.lang.startsWith('en') && (voice.name.includes('Google') || voice.name.includes('Microsoft'))
      );
      if (preferredVoice) {
        utterance.voice = preferredVoice;
      }

      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => {
        setIsSpeaking(false);
        resolve();
      };
      utterance.onerror = (event) => {
        console.error("Speech synthesis error:", event);
        setIsSpeaking(false);
        reject(event);
      };

      window.speechSynthesis.speak(utterance);
    });
  };

  onCleanup(() => {
    if (mediaRecorder) {
      stopListening();
    }
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
  });

  return (
    <div class="flex flex-col items-center gap-4">
      <button
        onMouseDown={startListening}
        onMouseUp={stopListening}
        onTouchStart={startListening}
        onTouchEnd={stopListening}
        disabled={isProcessing() || isSpeaking()}
        class="relative w-20 h-20 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 
               flex items-center justify-center cursor-pointer transition-all duration-300
               hover:scale-110 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
        classList={{
          "animate-[mic-pulse_1.5s_ease-in-out_infinite]": isListening(),
        }}
        style={{
          "box-shadow": isListening() 
            ? "0 0 40px rgba(0, 255, 255, 0.8)" 
            : "0 0 20px rgba(0, 255, 255, 0.5)"
        }}
        aria-label={isListening() ? "Recording... Release to stop" : "Press and hold to speak"}
        role="button"
        tabindex="0"
      >
        <Show when={!isProcessing() && !isSpeaking()} fallback={
          <svg class="w-10 h-10 text-white animate-spin" fill="none" viewBox="0 0 24 24" aria-hidden="true">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        }>
          <svg class="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
            <path d="M7 4a3 3 0 016 0v6a3 3 0 11-6 0V4z"/>
            <path d="M5.5 9.643a.75.75 0 00-1.5 0V10c0 3.06 2.29 5.585 5.25 5.954V17.5h-1.5a.75.75 0 000 1.5h4.5a.75.75 0 000-1.5h-1.5v-1.546A6.001 6.001 0 0016 10v-.357a.75.75 0 00-1.5 0V10a4.5 4.5 0 01-9 0v-.357z"/>
          </svg>
        </Show>
      </button>
      
      <div class="text-center min-h-[40px]">
        <Show when={error()}>
          <p class="text-red-400 text-sm font-medium" role="alert">
            {error()}
          </p>
        </Show>
        <Show when={!error()}>
          <p class="text-cyan-300 text-sm font-medium" aria-live="polite">
            <Show when={isListening()}>
              🎤 Listening...
            </Show>
            <Show when={isProcessing()}>
              ⚙️ Processing...
            </Show>
            <Show when={isSpeaking()}>
              🔊 Speaking...
            </Show>
            <Show when={!isListening() && !isProcessing() && !isSpeaking()}>
              Press & Hold to Speak
            </Show>
          </p>
        </Show>
      </div>
    </div>
  );
}
