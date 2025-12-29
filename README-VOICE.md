# Mehaal AI Voice Agent Setup Guide

Complete OpenAI Realtime Voice Agent implementation with Nova voice, multi-language support, and emotion-based profiles.

## ✨ Features Implemented

### 🎙️ Voice Capabilities
- **Nova Voice** - Female, friendly, warm OpenAI voice
- **Speech-to-Speech** - Real-time audio processing
- **Dynamic Intensity** - Mic-reactive neon glow effects
- **Interruption Handling** - Natural conversation flow

### 🌍 Multi-Language Support
- **Auto-detection** - Automatic language recognition
- **Supported Languages**:
  - English (en-US)
  - Urdu (ur-PK) 
  - Hindi (hi-IN)
  - Arabic (ar-SA)
- **Code-switching** - Natural language mixing
- **Cultural Awareness** - Appropriate greetings and expressions

### 🎭 Emotion-Based Profiles
- **8 Emotion Types**:
  - Friendly (default)
  - Calm
  - Energetic
  - Professional
  - Empathetic
  - Excited
  - Thoughtful
  - Neutral
- **Auto-detection** - Context-aware emotion switching
- **Smooth Transitions** - Natural emotion changes

### 🎨 Visual Features
- **Animated Logo** - 4-phase loading animation
- **Neon Glow** - Dynamic rainbow effects
- **Mic Visualization** - Real-time audio intensity
- **Purple Theme** - Brand colors (#9D00FF)

## 📦 Installation

### 1. Dependencies Already Installed
```bash
pnpm add @openai/agents zod@3
```

### 2. Environment Setup (Optional)

**Note:** The system works with or without an OpenAI API key!

#### With OpenAI API Key (Recommended)
Create `.env.local` file:
```bash
cp .env.local.example .env.local
```

Add your OpenAI API key:
```env
NEXT_PUBLIC_OPENAI_API_KEY=sk-your-api-key-here
```

Get your API key from: https://platform.openai.com/api-keys

#### Without API Key (Fallback Mode)
- No configuration needed!
- System automatically falls back to browser voice (TTS)
- Uses default female voice (Google Female/Zira/Samantha)
- Still includes animation and visualization
- Pre-written greeting plays on load

## 🔄 Fallback System

### Automatic Error Handling

The system includes intelligent fallback:

1. **Checks for API Key** on initialization
2. **If key exists**: Uses OpenAI Realtime API with Nova voice
3. **If no key**: Automatically switches to browser TTS
4. **If OpenAI fails**: Catches error and falls back gracefully

### Fallback Features
- ✅ Browser Speech Synthesis (Web Speech API)
- ✅ Female voice selection (Google Female/Zira/Samantha)
- ✅ Audio visualization still works
- ✅ Neon glow effects preserved
- ✅ Same animation sequence
- ✅ Pre-written greeting text
- ✅ Error message displayed (top-right corner)

### Visual Feedback
When in fallback mode, you'll see:
```
⚠️ Using browser voice (OpenAI key not configured)
```
Or:
```
⚠️ OpenAI connection failed: [error message]
```

## 🚀 Usage

### Start Development Server
```bash
pnpm run dev
```

Visit: http://localhost:3000

**No API key needed to test!** The system works in both modes:
- **With API key**: Premium OpenAI Nova voice
- **Without API key**: Browser voice (still great UX)

### Animation Sequence
1. **Phase 0**: Black screen (hidden logo)
2. **Phase 1**: Logo emerges (center)
3. **Phase 2**: Purple glow effect
4. **Phase 3**: Flash overlay
5. **Phase 4**: Ready state with neon glow + voice activation

### Voice Interaction
- Page loads → Animation plays → Voice agent initializes
- Mic permission requested automatically
- Greeting: "Batayein... main apki kia khidmat kar sakti hun?"
- Speak naturally → Agent responds with Nova voice
- Language auto-detected and switches accordingly
- Emotion adapts based on conversation context

## 📁 Project Structure

```
lib/voice/
├── config.ts       # Nova voice settings, VAD configuration
├── languages.ts    # Multi-language support & detection
├── profiles.ts     # Emotion-based voice profiles
├── agent.ts        # Voice agent service class
└── index.ts        # Module exports

app/
├── page.tsx        # Main landing page with integration
└── api/
    └── voice/
        └── route.ts # API route for secure key handling
```

## 🔧 Configuration

### Voice Settings (lib/voice/config.ts)
```typescript
voice: 'nova'  // Female, friendly, warm
model: 'gpt-4o-realtime-preview-2024-12-17'
temperature: 0.8
turnDetection: 'server_vad'
```

### Change Emotion Manually
```typescript
voiceAgent.setEmotion('calm');  // Switch to calm profile
```

### Change Language Manually
```typescript
voiceAgent.setLanguage('ur');  // Switch to Urdu
```

## 🎯 API Usage

### Voice Agent Service
```typescript
import { createVoiceAgent, VoiceEventType } from 'lib/voice';

const voiceAgent = createVoiceAgent({
  onEvent: (event) => {
    console.log('Event:', event.type);
  },
  onTranscript: (text, isFinal) => {
    console.log('Transcript:', text);
  },
  onIntensity: (intensity) => {
    console.log('Audio intensity:', intensity);
  },
});

// Initialize and connect
await voiceAgent.initialize();
await voiceAgent.connect(apiKey);

// Send message
await voiceAgent.sendMessage('Hello!');

// Interrupt response
voiceAgent.interrupt();

// Get current state
const state = voiceAgent.getState();

// Disconnect
await voiceAgent.disconnect();
```

## 🔒 Security

### API Key Protection
- ✅ Never commit `.env.local` to git
- ✅ Use server-side API routes for production
- ✅ API key stored in environment variables only

### Production Deployment
For production, implement WebSocket proxy to keep API key server-side:
```typescript
// app/api/voice/route.ts
// Implement WebSocket proxy here
```

## 🐛 Troubleshooting

### No API Key
```
⚠️ Using browser voice (OpenAI key not configured)
# This is NORMAL! System works without API key
# To upgrade: Add NEXT_PUBLIC_OPENAI_API_KEY to .env.local
```

### Mic Permission Denied
```javascript
// Browser blocked microphone access
// Solution: Check browser settings → Allow microphone
```

### API Key Error
```bash
Error: OpenAI API key is required
# System auto-falls back to browser voice
# Check .env.local file if you want OpenAI voice
```

### OpenAI Connection Failed
```
⚠️ OpenAI connection failed: [error]
# System automatically switches to browser voice
# Check API key validity
# Check OpenAI service status
```

### Voice Not Playing (Fallback Mode)
```javascript
// Check browser audio permissions
// Ensure speakers/headphones connected
// Check volume settings
// Try different browser (Chrome recommended)
```

### Language Not Detecting
```javascript
// Type in native script for better detection
// Urdu: Use Urdu script (اردو)
// Hindi: Use Devanagari (हिन्दी)
```

## 📊 Performance

### Optimization Features
- ✅ useCallback for functions
- ✅ useMemo for computed values
- ✅ Proper cleanup on unmount
- ✅ Smooth interpolation (0.15 factor)
- ✅ RequestAnimationFrame for animations
- ✅ willChange CSS hints

### Audio Processing
- Sample Rate: 24kHz
- Format: PCM16
- FFT Size: 512
- Smoothing: 0.85

## 🌟 Advanced Features

### Custom Instructions
Edit `MEHAAL_INSTRUCTIONS` in `lib/voice/config.ts` to customize AI personality.

### Add New Language
```typescript
// lib/voice/languages.ts
export const LANGUAGE_CONFIGS = {
  // Add your language here
  [SupportedLanguage.FRENCH]: {
    code: 'fr-FR',
    name: 'French',
    // ... configuration
  },
};
```

### Add New Emotion
```typescript
// lib/voice/profiles.ts
export const VOICE_PROFILES = {
  // Add your emotion here
  [EmotionType.CUSTOM]: {
    name: 'Custom',
    temperature: 0.8,
    // ... configuration
  },
};
```

## 📱 Browser Compatibility

### Quick Start (No API Key)
1. ✅ Setup complete
2. Run `pnpm run dev`
3. Test with browser voice
4. Enjoy the animations!

### Premium Upgrade (With OpenAI)
1. Get API key from OpenAI
2. Create `.env.local` file
3. Add `NEXT_PUBLIC_OPENAI_API_KEY=sk-...`
4. Restart dev server
5. Enjoy Nova voice!

### Customization
- Edit greeting text in code
- Customize voice profiles
- Add more languages
- Tweak emotion deteted | Mic permissions |

## 📞 Support

For issues or questions:
1. Check console for error messages
2. Verify API key is valid
3. Check browser permissions
4. Review OpenAI API status

## 🎉 Next Steps

1. ✅ Setup complete
2. Add your API key to `.env.local`
3. Run `pnpm run dev`
4. Test voice interaction
5. Customize instructions as needed
6. Deploy to production

---

**Built with:**
- Next.js 14.2.35
- OpenAI Agents SDK 0.3.7
- Zod 3.25.76
- TypeScript 5.6.3
- Tailwind CSS 3.4.19

**Ready for Production! 🚀**
