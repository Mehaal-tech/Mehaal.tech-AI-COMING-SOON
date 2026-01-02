import { createSignal, onCleanup, onMount, Show } from "solid-js";

interface VoiceAgentProps {
  onTranscript: (text: string) => void;
  onSpeechStart: () => void;
  onSpeechEnd: () => void;
}

// OpenAI Realtime API for Speech-to-Speech
const REALTIME_API_URL = "wss://api.openai.com/v1/realtime";
const REALTIME_MODEL = "gpt-4o-realtime-preview-2024-12-17";

export default function VoiceAgent(props: VoiceAgentProps) {
  const [isConnected, setIsConnected] = createSignal(false);
  const [isListening, setIsListening] = createSignal(false);
  const [isProcessing, setIsProcessing] = createSignal(false);
  const [error, setError] = createSignal<string | null>(null);
  const [isSpeaking, setIsSpeaking] = createSignal(false);
  const [transcript, setTranscript] = createSignal("");
  
  let websocket: WebSocket | null = null;
  let audioContext: AudioContext | null = null;
  let mediaStream: MediaStream | null = null;
  let audioWorklet: AudioWorkletNode | null = null;
  let sourceNode: MediaStreamAudioSourceNode | null = null;

  // Initialize Audio Context for playback
  const initAudioContext = async () => {
    if (!audioContext) {
      audioContext = new AudioContext({ sampleRate: 24000 });
    }
    if (audioContext.state === 'suspended') {
      await audioContext.resume();
    }
    return audioContext;
  };

  // Connect to OpenAI Realtime API
  const connectToRealtime = async () => {
    const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
    
    if (!apiKey || apiKey === 'your-openai-api-key-here') {
      setError("Please configure your OpenAI API key in the .env file");
      return false;
    }

    try {
      const url = `${REALTIME_API_URL}?model=${REALTIME_MODEL}`;
      websocket = new WebSocket(url, [
        "realtime",
        `openai-insecure-api-key.${apiKey}`,
        "openai-beta.realtime-v1"
      ]);

      websocket.onopen = () => {
        console.log("[Realtime] Connected to OpenAI");
        setIsConnected(true);
        setError(null);
        
        // Configure the session
        websocket?.send(JSON.stringify({
          type: "session.update",
          session: {
            modalities: ["text", "audio"],
            instructions: "You are a friendly AI assistant for Mehaal.tech, a company launching an AI-powered voice interaction platform. Keep responses concise and enthusiastic about the upcoming launch. Speak naturally and warmly.",
            voice: "alloy",
            input_audio_format: "pcm16",
            output_audio_format: "pcm16",
            input_audio_transcription: {
              model: "whisper-1"
            },
            turn_detection: {
              type: "server_vad",
              threshold: 0.5,
              prefix_padding_ms: 300,
              silence_duration_ms: 500
            }
          }
        }));
      };

      websocket.onmessage = (event) => {
        handleRealtimeMessage(JSON.parse(event.data));
      };

      websocket.onerror = (event) => {
        console.error("[Realtime] WebSocket error:", event);
        setError("Connection error. Please try again.");
        setIsConnected(false);
      };

      websocket.onclose = (event) => {
        console.log("[Realtime] Connection closed:", event.code, event.reason);
        setIsConnected(false);
        if (event.code !== 1000) {
          setError("Connection lost. Click to reconnect.");
        }
      };

      return true;
    } catch (err) {
      console.error("[Realtime] Connection failed:", err);
      setError("Failed to connect to AI service");
      return false;
    }
  };

  // Audio playback queue
  let audioQueue: Float32Array<ArrayBuffer>[] = [];
  let isPlaying = false;

  const playAudioQueue = async () => {
    if (isPlaying || audioQueue.length === 0 || !audioContext) return;
    
    isPlaying = true;
    setIsSpeaking(true);

    while (audioQueue.length > 0) {
      const audioData = audioQueue.shift()!;
      const audioBuffer = audioContext.createBuffer(1, audioData.length, 24000);
      audioBuffer.copyToChannel(audioData, 0);
      
      const source = audioContext.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(audioContext.destination);
      
      await new Promise<void>((resolve) => {
        source.onended = () => resolve();
        source.start();
      });
    }

    isPlaying = false;
    setIsSpeaking(false);
  };

  // Handle messages from Realtime API
  const handleRealtimeMessage = (message: any) => {
    switch (message.type) {
      case "session.created":
        console.log("[Realtime] Session created:", message.session.id);
        break;

      case "session.updated":
        console.log("[Realtime] Session updated");
        break;

      case "input_audio_buffer.speech_started":
        console.log("[Realtime] User started speaking");
        setIsListening(true);
        props.onSpeechStart();
        break;

      case "input_audio_buffer.speech_stopped":
        console.log("[Realtime] User stopped speaking");
        setIsListening(false);
        props.onSpeechEnd();
        break;

      case "conversation.item.input_audio_transcription.completed":
        console.log("[Realtime] User transcript:", message.transcript);
        setTranscript(message.transcript);
        props.onTranscript(message.transcript);
        break;

      case "response.audio_transcript.delta":
        // AI is generating text response
        setIsProcessing(true);
        break;

      case "response.audio_transcript.done":
        console.log("[Realtime] AI transcript:", message.transcript);
        setIsProcessing(false);
        break;

      case "response.audio.delta":
        // Received audio chunk from AI
        if (message.delta) {
          const binaryData = atob(message.delta);
          const bytes = new Uint8Array(binaryData.length);
          for (let i = 0; i < binaryData.length; i++) {
            bytes[i] = binaryData.charCodeAt(i);
          }
          // Convert PCM16 to Float32
          const int16Array = new Int16Array(bytes.buffer);
          const float32Array = new Float32Array(int16Array.length);
          for (let i = 0; i < int16Array.length; i++) {
            float32Array[i] = int16Array[i] / 32768;
          }
          audioQueue.push(float32Array);
          playAudioQueue();
        }
        break;

      case "response.audio.done":
        console.log("[Realtime] AI audio complete");
        break;

      case "response.done":
        console.log("[Realtime] Response complete");
        setIsProcessing(false);
        break;

      case "error":
        console.error("[Realtime] Error:", message.error);
        setError(message.error?.message || "An error occurred");
        break;
    }
  };

  // Start microphone and stream audio to Realtime API
  const startMicrophone = async () => {
    try {
      setError(null);
      
      // Initialize audio context
      await initAudioContext();
      
      // Connect to Realtime API if not connected
      if (!isConnected()) {
        const connected = await connectToRealtime();
        if (!connected) return;
        // Wait for connection to establish
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      // Get microphone access
      mediaStream = await navigator.mediaDevices.getUserMedia({ 
        audio: { 
          sampleRate: 24000,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true 
        } 
      });

      // Create audio processing pipeline
      const ctx = audioContext!;
      sourceNode = ctx.createMediaStreamSource(mediaStream);
      
      // Use ScriptProcessor for audio capture (simpler than AudioWorklet for this use case)
      const processor = ctx.createScriptProcessor(4096, 1, 1);
      
      processor.onaudioprocess = (e) => {
        if (!websocket || websocket.readyState !== WebSocket.OPEN) return;
        
        const inputData = e.inputBuffer.getChannelData(0);
        
        // Resample to 24kHz if needed and convert to PCM16
        const pcm16 = new Int16Array(inputData.length);
        for (let i = 0; i < inputData.length; i++) {
          const s = Math.max(-1, Math.min(1, inputData[i]));
          pcm16[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
        }
        
        // Convert to base64
        const bytes = new Uint8Array(pcm16.buffer);
        let binary = '';
        for (let i = 0; i < bytes.length; i++) {
          binary += String.fromCharCode(bytes[i]);
        }
        const base64Audio = btoa(binary);
        
        // Send to Realtime API
        websocket.send(JSON.stringify({
          type: "input_audio_buffer.append",
          audio: base64Audio
        }));
      };

      sourceNode.connect(processor);
      processor.connect(ctx.destination);
      
      setIsListening(true);
      console.log("[Realtime] Microphone started");
      
    } catch (err) {
      console.error("[Realtime] Microphone error:", err);
      setError("Microphone access denied. Please enable microphone permissions.");
    }
  };

  // Stop microphone
  const stopMicrophone = () => {
    if (mediaStream) {
      mediaStream.getTracks().forEach(track => track.stop());
      mediaStream = null;
    }
    if (sourceNode) {
      sourceNode.disconnect();
      sourceNode = null;
    }
    setIsListening(false);
    console.log("[Realtime] Microphone stopped");
  };

  // Toggle conversation
  const toggleConversation = async () => {
    if (isListening()) {
      stopMicrophone();
    } else {
      await startMicrophone();
    }
  };

  // Cleanup on unmount
  onCleanup(() => {
    stopMicrophone();
    if (websocket) {
      websocket.close(1000, "Component unmounting");
      websocket = null;
    }
    if (audioContext) {
      audioContext.close();
      audioContext = null;
    }
  });

  return (
    <div class="flex flex-col items-center gap-4">
      {/* Connection Status */}
      <div class="flex items-center gap-2 mb-2">
        <div 
          class="w-2 h-2 rounded-full"
          classList={{
            "bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.8)]": isConnected(),
            "bg-yellow-500 shadow-[0_0_8px_rgba(234,179,8,0.8)]": !isConnected() && !error(),
            "bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)]": !!error(),
          }}
        />
        <span class="text-xs text-cyan-300/70">
          {isConnected() ? "Connected" : error() ? "Disconnected" : "Ready"}
        </span>
      </div>

      <button
        onClick={toggleConversation}
        disabled={isProcessing() || isSpeaking()}
        class="relative w-20 h-20 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 
               flex items-center justify-center cursor-pointer transition-all duration-300
               hover:scale-110 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
        classList={{
          "animate-[mic-pulse_1.5s_ease-in-out_infinite]": isListening(),
          "ring-4 ring-cyan-400/50": isConnected() && isListening(),
        }}
        style={{
          "box-shadow": isListening() 
            ? "0 0 40px rgba(0, 255, 255, 0.8)" 
            : "0 0 20px rgba(0, 255, 255, 0.5)"
        }}
        aria-label={isListening() ? "Click to stop listening" : "Click to start talking"}
        role="button"
        tabindex="0"
      >
        <Show when={!isProcessing() && !isSpeaking()} fallback={
          <svg class="w-10 h-10 text-white animate-spin" fill="none" viewBox="0 0 24 24" aria-hidden="true">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        }>
          <Show when={isListening()} fallback={
            <svg class="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
              <path d="M7 4a3 3 0 016 0v6a3 3 0 11-6 0V4z"/>
              <path d="M5.5 9.643a.75.75 0 00-1.5 0V10c0 3.06 2.29 5.585 5.25 5.954V17.5h-1.5a.75.75 0 000 1.5h4.5a.75.75 0 000-1.5h-1.5v-1.546A6.001 6.001 0 0016 10v-.357a.75.75 0 00-1.5 0V10a4.5 4.5 0 01-9 0v-.357z"/>
            </svg>
          }>
            {/* Stop icon when listening */}
            <svg class="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
              <rect x="5" y="5" width="10" height="10" rx="1" />
            </svg>
          </Show>
        </Show>
      </button>
      
      <div class="text-center min-h-[60px]">
        <Show when={error()}>
          <p class="text-red-400 text-sm font-medium" role="alert">
            {error()}
          </p>
        </Show>
        <Show when={!error()}>
          <p class="text-cyan-300 text-sm font-medium" aria-live="polite">
            <Show when={isListening()}>
              🎤 Listening... (Click to stop)
            </Show>
            <Show when={isProcessing()}>
              ⚙️ AI is thinking...
            </Show>
            <Show when={isSpeaking()}>
              🔊 AI is speaking...
            </Show>
            <Show when={!isListening() && !isProcessing() && !isSpeaking()}>
              Click to Start Conversation
            </Show>
          </p>
          <Show when={transcript()}>
            <p class="text-cyan-300/60 text-xs mt-2 max-w-[250px] truncate">
              You: "{transcript()}"
            </p>
          </Show>
        </Show>
      </div>
    </div>
  );
}
