# Mehaal.Tech AI - Production Deployment Guide

## 🚀 Production Ready Features

### ✅ Implemented
- Site name: **Mehaal.Tech AI**
- Tagline: **Intelligence Beyond Impossible**
- Favicon: Mehaal logo (brand/FAVICON.png)
- SEO metadata optimized
- Open Graph tags for social sharing
- PWA manifest with branding
- Security headers configured
- Production optimizations enabled

### 🌐 Deployment Options

#### Option 1: Vercel (Recommended)
```bash
# Install Vercel CLI
pnpm add -g vercel

# Deploy
vercel

# For production
vercel --prod
```

**Environment Variables on Vercel:**
1. Go to Project Settings → Environment Variables
2. Add: `NEXT_PUBLIC_OPENAI_API_KEY` (optional)
3. Value: `sk-your-openai-key`

#### Option 2: Docker Production
```bash
# Build production image
docker build -f Dockerfile.landing -t mehaal-ai:latest .

# Run production container
docker run -p 80:3000 \
  -e NEXT_PUBLIC_OPENAI_API_KEY=sk-your-key \
  mehaal-ai:latest

# Or with docker-compose
docker-compose up -d landing
```

#### Option 3: Manual Build
```bash
# Build for production
pnpm run build

# Start production server
pnpm run start

# Server runs on http://localhost:3000
```

### 🔒 Security Features
- ✅ X-Frame-Options: DENY
- ✅ X-Content-Type-Options: nosniff
- ✅ Referrer-Policy configured
- ✅ Permissions-Policy for privacy
- ✅ Microphone permission controlled
- ✅ No powered-by header

### ⚡ Performance Optimizations
- ✅ SWC minification enabled
- ✅ Image optimization (AVIF/WebP)
- ✅ Compression enabled
- ✅ React strict mode
- ✅ Static asset caching

### 📱 PWA Support
- ✅ Web manifest included
- ✅ Theme color: #9D00FF (purple)
- ✅ Standalone display mode
- ✅ App icons configured

### 🤖 SEO Ready
- ✅ robots.txt configured
- ✅ Meta description optimized
- ✅ Keywords included
- ✅ Open Graph tags
- ✅ Twitter card support

### 🎨 Branding
- **Site Name:** Mehaal.Tech AI
- **Tagline:** Intelligence Beyond Impossible
- **Primary Color:** #9D00FF (Purple)
- **Font:** CabinetGrotesk
- **Logo:** /brand/FAVICON.png

## 📋 Pre-Deployment Checklist

### Required
- [ ] Set `NEXT_PUBLIC_OPENAI_API_KEY` in environment (or skip for browser voice)
- [ ] Update domain in Open Graph URLs (currently: mehaal.tech)
- [ ] Test build: `pnpm run build`
- [ ] Test production mode: `pnpm run start`

### Optional
- [ ] Add custom domain
- [ ] Configure CDN
- [ ] Set up analytics
- [ ] Add sitemap.xml
- [ ] Configure SSL/HTTPS
- [ ] Set up error monitoring (Sentry)

## 🌍 Domain Configuration

After deployment, update these files:

**app/layout.tsx** - Line ~17:
```typescript
url: "https://your-domain.com", // Update this
```

## 🔧 Environment Variables

### Production (.env.production)
```env
# Optional: OpenAI API Key (fallback to browser voice if not set)
NEXT_PUBLIC_OPENAI_API_KEY=sk-your-production-key

# Optional: Analytics
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
```

## 📊 Monitoring

### Build Check
```bash
pnpm run build
# Should complete without errors
# Check .next folder created
```

### Health Check
```bash
curl http://localhost:3000
# Should return 200 OK
```

## 🚨 Troubleshooting

### Build Errors
```bash
# Clear cache and rebuild
rm -rf .next
pnpm run build
```

### Voice Not Working
- Check OPENAI_API_KEY is set (or system uses browser fallback)
- Verify domain allows microphone permissions
- Check HTTPS is enabled (required for mic access)

### Favicon Not Showing
- Clear browser cache
- Check /brand/FAVICON.png exists
- Verify manifest.json is accessible

## 🎉 Post-Deployment

1. Test on multiple devices
2. Verify voice interaction works
3. Check mobile responsiveness
4. Test dark theme
5. Validate SEO metadata
6. Monitor performance metrics

---

**Ready for Production!** 🚀

For support: [Documentation](../README-VOICE.md)
