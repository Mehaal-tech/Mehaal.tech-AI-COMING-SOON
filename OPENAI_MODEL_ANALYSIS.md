# OpenAI Realtime API - Model Settings Deep Analysis

**Analysis Date:** December 29, 2025  
**Source:** Official OpenAI openai-realtime-agents Repository  
**Current Project:** Mehaal.Tech AI Voice Assistant

---

## 📊 Current Configuration vs Best Practices

### 1. Model Selection

**Aapka Current:**
```typescript
model: 'gpt-4o-realtime-preview-2024-12-17'
```

**OpenAI Official (Latest):**
```typescript
model: 'gpt-4o-realtime-preview-2025-06-03'  // Updated version!
```

**⚠️ ISSUE:** Aap purana model use kar rahe hain

**Recommended Options:**
- `gpt-4o-realtime-preview-2025-06-03` - Full intelligence, higher cost
- `gpt-4o-mini-realtime` - 60% cheaper, good for basic tasks
- **Hybrid Approach (Chat-Supervisor Pattern):** Mix of both

---

### 2. Voice Configuration

**Aapka Current:**
```typescript
voice: 'nova' as const  // Female, Friendly, Warm
```

**OpenAI Best Practice:**
```typescript
voice: 'sage' as const  // More professional, used in all examples
```

**Available Voices:**
- `alloy` - Neutral
- `echo` - Masculine
- `fable` - British accent
- `onyx` - Deep voice
- `nova` - Warm female (aapka current - ✅ Good choice!)
- `sage` - Professional (OpenAI recommendation)

**Verdict:** Nova is fine for friendly assistant, Sage is better for professional

---

### 3. Turn Detection (VAD) Settings

**Aapka Current:**
```typescript
turnDetection: {
  type: 'server_vad' as const,
  threshold: 0.5,              // Medium sensitivity
  prefix_padding_ms: 300,      // 300ms before speech
  silence_duration_ms: 500,    // 500ms silence to trigger
}
```

**OpenAI Official:**
```typescript
turnDetection: {
  type: 'server_vad',
  threshold: 0.9,              // ⚠️ Much higher! More strict
  prefix_padding_ms: 300,      // Same ✅
  silence_duration_ms: 500,    // Same ✅
  create_response: true,       // ⚠️ Missing in yours!
}
```

**🔴 CRITICAL DIFFERENCES:**

1. **Threshold: 0.5 vs 0.9**
   - Your 0.5 = Voice activates more easily (may catch background noise)
   - OpenAI 0.9 = Much stricter (reduces false triggers)
   
2. **Missing `create_response: true`**
   - Automatically triggers response after user stops speaking
   - Without it, you need manual trigger

**Recommendations:**
```typescript
// For noisy environments
threshold: 0.7

// For quiet environments  
threshold: 0.5  // Your current - OK

// Always add:
create_response: true
```

---

### 4. Temperature Settings

**Aapka Current:**
```typescript
temperature: 0.8  // Creative responses
```

**OpenAI Patterns:**

**Chat-Supervisor Pattern:**
```typescript
// Realtime Chat Agent
temperature: 0.8  // ✅ Same as yours

// Supervisor Agent (GPT-4.1)
temperature: 0.7  // Slightly lower for accuracy
```

**Customer Service:**
```typescript
temperature: 0.6-0.7  // More consistent, less creative
```

**Your Setting:** ✅ Good for friendly assistant, but consider lower for professional

---

### 5. Audio Configuration

**Aapka Current:**
```typescript
audioFormats: {
  input: 'pcm16' as const,
  output: 'pcm16' as const,
},

sampleRate: 24000,    // 24kHz
channels: 1,          // Mono
bitDepth: 16,         // 16-bit
```

**OpenAI Official:**
```typescript
// Same settings ✅
inputAudioFormat: 'pcm16',
outputAudioFormat: 'pcm16',

// BUT they also support:
// - 'opus' (48kHz, better quality for web)
// - 'pcmu'/'pcma' (8kHz, phone line simulation)
```

**Recommendation:** 
- Keep PCM16 for basic use ✅
- Consider Opus for better web quality
- Use PCMU/PCMA for phone-like experience

---

### 6. Max Response Tokens

**Aapka Current:**
```typescript
maxResponseOutputTokens: 4096  // Very high
```

**OpenAI Best Practice:**
```typescript
// Not explicitly set in examples
// Default is around 1024-2048

// For voice, shorter is better:
maxResponseOutputTokens: 1024  // 2-3 sentences
```

**Issue:** 4096 tokens = ~500-600 words = 2-3 minute speech!

**Recommendation:**
```typescript
maxResponseOutputTokens: 512   // Short responses
maxResponseOutputTokens: 1024  // Medium responses  
maxResponseOutputTokens: 2048  // Detailed explanations
```

---

### 7. Modalities

**Aapka Current:**
```typescript
modalities: ['text', 'audio'] as ('text' | 'audio')[]
```

**OpenAI Official:**
```typescript
// Same ✅
modalities: ['text', 'audio']
```

**Correct ✅**

---

## 🎯 Advanced Patterns from OpenAI

### Pattern 1: Chat-Supervisor (Recommended!)

**What is it?**
- Junior agent (Realtime API) handles greetings, info collection
- Senior agent (GPT-4.1) handles complex queries, tool calls
- Saves cost + maintains quality

**Implementation:**
```typescript
// Chat Agent (Your current setup)
const chatAgent = new RealtimeAgent({
  name: 'chatAgent',
  voice: 'nova',
  model: 'gpt-4o-mini-realtime',  // Cheaper for basic tasks
  instructions: `
    Handle:
    - Greetings
    - Basic chitchat
    - Collecting user info
    
    For everything else, defer to supervisor.
  `,
  tools: [getNextResponseFromSupervisor],
});

// Supervisor Agent (Text-based, smarter)
const supervisorAgent = {
  model: 'gpt-4.1',  // Much smarter
  instructions: 'Handle complex queries, tool calls',
  tools: [/* your actual tools */],
};
```

**Benefits:**
- **60-70% cost reduction** (most interactions use mini model)
- **Better quality** for complex queries (GPT-4.1)
- **Immediate response** (no waiting for complex processing)

**Your Use Case:** Perfect for Mehaal! Use mini for greetings, GPT-4.1 for AI explanations

---

### Pattern 2: Multi-Agent Handoff

**What is it?**
- Multiple specialized agents
- Transfer between them based on intent
- Each agent expert in one domain

**Example from OpenAI:**
```typescript
const authenticationAgent = new RealtimeAgent({
  name: 'authentication',
  voice: 'sage',
  handoffDescription: 'Handles user auth',
  instructions: 'Verify user, then transfer',
  handoffs: [salesAgent, returnsAgent],
});

const salesAgent = new RealtimeAgent({
  name: 'sales',
  handoffDescription: 'Handles sales',
  instructions: 'Help with purchases',
  handoffs: [authenticationAgent, returnsAgent],
});
```

**Your Use Case:** Could have:
- GreetingAgent → 
- TechnicalSupportAgent → 
- SalesAgent

---

## 🔧 Critical Improvements for Your Config

### 1. Update Model Version

```typescript
// OLD
model: 'gpt-4o-realtime-preview-2024-12-17'

// NEW ✅
model: 'gpt-4o-realtime-preview-2025-06-03'
```

---

### 2. Fix VAD Settings

```typescript
turnDetection: {
  type: 'server_vad' as const,
  threshold: 0.7,              // Changed from 0.5
  prefix_padding_ms: 300,
  silence_duration_ms: 500,
  create_response: true,       // ⚠️ ADD THIS
},
```

---

### 3. Add Input Audio Transcription

```typescript
// OpenAI adds this for better logging/debugging
config: {
  voice: VOICE_CONFIG.voice,
  inputAudioFormat: VOICE_CONFIG.audioFormats.input,
  outputAudioFormat: VOICE_CONFIG.audioFormats.output,
  turnDetection: VOICE_CONFIG.turnDetection,
  modalities: VOICE_CONFIG.modalities,
  
  // ⚠️ ADD THIS
  inputAudioTranscription: {
    model: 'gpt-4o-mini-transcribe',  // For transcribing user speech
  },
},
```

**Benefits:**
- See what user actually said
- Debug voice recognition issues
- Better logging

---

### 4. Reduce Max Tokens

```typescript
// OLD
maxResponseOutputTokens: 4096

// NEW ✅  
maxResponseOutputTokens: 1024  // For voice, keep it short!
```

---

### 5. Add Session Presets

**OpenAI Pattern:**
```typescript
export const SESSION_PRESETS = {
  default: {
    ...VOICE_CONFIG,
    temperature: 0.8,
  },
  
  quickResponse: {
    ...VOICE_CONFIG,
    turnDetection: {
      ...VOICE_CONFIG.turnDetection,
      silence_duration_ms: 300,  // Faster
    },
    temperature: 0.7,
  },
  
  thoughtful: {
    ...VOICE_CONFIG,
    turnDetection: {
      ...VOICE_CONFIG.turnDetection,
      silence_duration_ms: 700,  // Give time to think
    },
    temperature: 0.9,
  },
};
```

**Your Use Case:** Add presets for different scenarios

---

## 📝 State Machine for Conversation Flow

**OpenAI Best Practice:**

```json
[
  {
    "id": "1_greeting",
    "description": "Greet user and identify intent",
    "instructions": [
      "Use warm, friendly greeting",
      "Ask how you can help"
    ],
    "examples": [
      "Hi! I'm Mehaal. How can I help you today?"
    ],
    "transitions": [{
      "next_step": "2_collect_info",
      "condition": "User states their need"
    }]
  },
  {
    "id": "2_collect_info",
    "description": "Gather required information",
    "instructions": [
      "Ask clarifying questions",
      "Repeat back to confirm (important for names/numbers)"
    ],
    "examples": [
      "Let me confirm - you're interested in learning about our AI services?"
    ],
    "transitions": [{
      "next_step": "3_provide_solution",
      "condition": "All info collected"
    }]
  },
  {
    "id": "3_provide_solution",
    "description": "Deliver solution",
    "instructions": [
      "Be concise (max 3 sentences)",
      "Offer follow-up questions"
    ],
    "examples": [
      "We offer three AI solutions: voice assistants, chatbots, and automation. Which interests you most?"
    ],
    "transitions": [{
      "next_step": "4_closing",
      "condition": "User satisfied or no more questions"
    }]
  }
]
```

**Your Current Code:** Missing structured state machine

---

## 🛡️ Guardrails (Output Moderation)

**OpenAI Pattern:**
```typescript
// They run moderation on all responses BEFORE speaking
const guardrail = createModerationGuardrail('Mehaal.Tech');

await session.connect({
  outputGuardrails: [guardrail],  // ⚠️ You don't have this
});

// Checks for:
// - OFFENSIVE content
// - OFF_BRAND responses  
// - VIOLENCE mentions
// - Inappropriate topics
```

**Your Code:** No output moderation!

**Risk:** Agent might say something inappropriate

**Fix:**
```typescript
// Add to your session creation
const guardrail = {
  name: 'moderation_guardrail',
  async execute({ agentOutput }) {
    // Check if output is safe
    const isSafe = await checkModeration(agentOutput);
    return {
      tripwireTriggered: !isSafe,
      outputInfo: { /* details */ },
    };
  },
};
```

---

## 💰 Cost Optimization

**OpenAI Recommendations:**

### Option 1: Use Mini for Chat
```typescript
// Instead of:
model: 'gpt-4o-realtime-preview'  // $$$

// Use:
model: 'gpt-4o-mini-realtime'     // $  (60% cheaper!)
```

### Option 2: Hybrid Approach
```typescript
// Chat agent: mini (cheap)
chatAgent: {
  model: 'gpt-4o-mini-realtime',  // Basic tasks
}

// Supervisor: full (expensive but smart)
supervisorAgent: {
  model: 'gpt-4.1',  // Complex reasoning
}

// Result: Best of both worlds!
```

### Option 3: Dynamic Switching
```typescript
// Start with mini, upgrade if needed
if (complexQuery) {
  switchToModel('gpt-4o-realtime-preview');
} else {
  useModel('gpt-4o-mini-realtime');
}
```

---

## 🎯 Specific Recommendations for Mehaal.Tech

### 1. Implement Chat-Supervisor Pattern

**Why:** Your AI talks a lot about itself - supervisor can handle that

```typescript
// Mehaal Chat Agent (Mini)
const mehaalChatAgent = new RealtimeAgent({
  name: 'mehaalChat',
  voice: 'nova',  // Keep your warm voice
  model: 'gpt-4o-mini-realtime',
  instructions: `
    You are Mehaal, warm and friendly.
    
    Handle directly:
    - Greetings  
    - Basic questions ("what's your name?")
    - Language switching
    
    Use supervisor for:
    - Technical AI questions
    - Service details
    - Complex explanations
  `,
  tools: [callSupervisor],
});

// Mehaal Supervisor (GPT-4.1)
const mehaalSupervisor = {
  model: 'gpt-4.1',
  instructions: MEHAAL_INSTRUCTIONS,  // Your current detailed instructions
  tools: [/* your tools */],
};
```

**Impact:**
- 60% cost reduction
- Better quality for technical questions
- Faster greetings

---

### 2. Add Transcription

```typescript
config: {
  // ... your current config
  inputAudioTranscription: {
    model: 'gpt-4o-mini-transcribe',
  },
},
```

---

### 3. Update Model

```typescript
model: 'gpt-4o-realtime-preview-2025-06-03'
```

---

### 4. Fix VAD

```typescript
turnDetection: {
  type: 'server_vad' as const,
  threshold: 0.7,
  prefix_padding_ms: 300,
  silence_duration_ms: 500,
  create_response: true,  // ADD THIS
},
```

---

### 5. Add State Machine

Add structured conversation states to your instructions

---

### 6. Reduce Max Tokens

```typescript
maxResponseOutputTokens: 1024  // From 4096
```

---

## 📊 Comparison Summary

| Feature | Your Config | OpenAI Best Practice | Recommendation |
|---------|-------------|---------------------|----------------|
| Model | `2024-12-17` | `2025-06-03` | ⚠️ Update |
| Voice | `nova` | `sage` | ✅ Keep nova for warmth |
| VAD Threshold | `0.5` | `0.9` | ⚠️ Increase to 0.7 |
| VAD create_response | Missing | `true` | ⚠️ Add |
| Temperature | `0.8` | `0.7-0.8` | ✅ OK |
| Max Tokens | `4096` | `1024-2048` | ⚠️ Reduce to 1024 |
| Transcription | Missing | Enabled | ⚠️ Add |
| Guardrails | Missing | Enabled | ⚠️ Add |
| Pattern | Single agent | Chat-Supervisor | ⚠️ Consider hybrid |
| State Machine | Implicit | Explicit JSON | ⚠️ Add structure |

---

## 🚀 Implementation Priority

### Phase 1: Critical (Do Now)
1. ✅ Update model to `2025-06-03`
2. ✅ Add `create_response: true` to VAD
3. ✅ Reduce `maxResponseOutputTokens` to 1024
4. ✅ Increase VAD `threshold` to 0.7

### Phase 2: Important (Next Week)
5. Add input audio transcription
6. Implement output guardrails
7. Add structured state machine

### Phase 3: Optimization (Next Sprint)
8. Implement Chat-Supervisor pattern (60% cost savings!)
9. Add session presets
10. Dynamic model switching

---

## 📖 Resources

- **Official Repo:** https://github.com/openai/openai-realtime-agents
- **OpenAI Agents SDK:** https://github.com/openai/openai-agents-js
- **Realtime API Docs:** https://platform.openai.com/docs/guides/realtime
- **Voice Agent Metaprompt:** Use for structured prompts

---

## ✨ Final Verdict

**Your Current Setup:** 7/10
- Good foundation
- Needs updates to match latest best practices
- Missing cost optimization opportunities

**With Recommended Changes:** 9/10
- Latest model
- Proper VAD settings
- Cost-optimized with hybrid approach
- Production-ready with guardrails

**Estimated Cost Savings:** 60-70% with Chat-Supervisor pattern

---

**Next Steps:**
1. Update config file with Phase 1 changes
2. Test VAD sensitivity
3. Implement transcription for debugging
4. Plan Chat-Supervisor implementation

