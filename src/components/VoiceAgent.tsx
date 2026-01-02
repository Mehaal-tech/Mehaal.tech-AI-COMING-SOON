import { createSignal, onCleanup, Show } from "solid-js";

interface VoiceAgentProps {
  onTranscript: (text: string) => void;
  onSpeechStart: () => void;
  onSpeechEnd: () => void;
}

export default function VoiceAgent(props: VoiceAgentProps) {
  const [isListening, setIsListening] = createSignal(false);
  const [isProcessing, setIsProcessing] = createSignal(false);
  
  let mediaRecorder: MediaRecorder | null = null;
  let audioChunks: Blob[] = [];

  const startListening = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorder = new MediaRecorder(stream);
      audioChunks = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunks.push(event.data);
      };

      mediaRecorder.onstop = async () => {
        setIsProcessing(true);
        const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
        
        // Convert to base64 and send to OpenAI
        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = async () => {
          const base64Audio = reader.result as string;
          await processAudio(base64Audio);
        };
        
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsListening(true);
      props.onSpeechStart();
    } catch (error) {
      console.error("Error accessing microphone:", error);
    }
  };

  const stopListening = () => {
    if (mediaRecorder && mediaRecorder.state !== 'inactive') {
      mediaRecorder.stop();
      setIsListening(false);
      props.onSpeechEnd();
    }
  };

  const processAudio = async (audioBase64: string) => {
    try {
      const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
      
      // Mock response for demo - Replace with actual OpenAI API call
      setTimeout(() => {
        props.onTranscript("Hello! This is a demo response. Please configure your OpenAI API key in .env file to enable real voice interaction.");
        setIsProcessing(false);
      }, 1500);

      // Uncomment below for actual OpenAI integration:
      /*
      const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          file: audioBase64,
          model: 'whisper-1'
        })
      });
      
      const data = await response.json();
      props.onTranscript(data.text);
      setIsProcessing(false);
      */
    } catch (error) {
      console.error("Error processing audio:", error);
      setIsProcessing(false);
    }
  };

  onCleanup(() => {
    if (mediaRecorder) {
      stopListening();
    }
  });

  return (
    <div class="flex flex-col items-center gap-4">
      <button
        onMouseDown={startListening}
        onMouseUp={stopListening}
        onTouchStart={startListening}
        onTouchEnd={stopListening}
        disabled={isProcessing()}
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
      >
        <Show when={!isProcessing()} fallback={
          <svg class="w-10 h-10 text-white animate-spin" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        }>
          <svg class="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10 12a2 2 0 100-4 2 2 0 000 4z"/>
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM7 9a1 1 0 011-1h4a1 1 0 110 2H8a1 1 0 01-1-1z" clip-rule="evenodd"/>
          </svg>
        </Show>
      </button>
      
      <p class="text-cyan-300 text-sm font-medium">
        <Show when={isListening()}>
          Listening...
        </Show>
        <Show when={isProcessing()}>
          Processing...
        </Show>
        <Show when={!isListening() && !isProcessing()}>
          Press & Hold to Speak
        </Show>
      </p>
    </div>
  );
}
