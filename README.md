# Mehaal.tech - AI Voice Platform Coming Soon

**Revolutionary AI-powered voice interaction platform**

## 🚀 Features

- ✨ Stunning Animated Landing Page with multi-stage neon animations
- 🎤 AI Voice Agent powered by OpenAI Whisper & GPT-4
- 🗣️ Text-to-Speech with natural voice responses
- ⏱️ Live Countdown Timer to launch date
- 📧 Email Subscriptions with API integration
- 🔗 Social Media Integration
- 📱 Fully Responsive design
- 🎯 SEO Optimized with meta tags and structured data
- ♿ Accessibility features (ARIA, keyboard navigation)
- 🚀 Performance optimized (lazy loading, service worker)
- 🛡️ Error boundaries and comprehensive error handling

## 🛠️ Installation

```bash
# Install dependencies
pnpm install

# Configure environment
cp .env.example .env
# Edit .env and add your OpenAI API key

# Start development server
pnpm dev
```

## 📁 Project Structure

- **src/components/** - Reusable UI components
- **src/routes/** - File-based routing and API endpoints
- **src/styles/** - Global styles and animations
- **public/** - Static assets and brand materials

## 🎮 Usage

1. Voice Interaction: Press and hold microphone to speak
2. Email Subscription: Enter email to get notified at launch
3. Countdown Timer: Automatically counts to launch date

## 🏗️ Build & Deploy

```bash
# Build for production
pnpm build

# Start production server
pnpm start
```

## 📝 Environment Variables

- `VITE_OPENAI_API_KEY` - OpenAI API key (required)
- `VITE_LAUNCH_DATE` - Target launch date (default: 2026-03-01)
- `VITE_OPENAI_MODEL` - GPT model (default: gpt-4-turbo-preview)
- `VITE_WHISPER_MODEL` - Whisper model (default: whisper-1)

## 🧪 Testing

```bash
pnpm test
```

## 📄 License

MIT License - See LICENSE file for details

---

Made with ❤️ by the Mehaal.tech team
