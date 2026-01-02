# 🚀 Deployment Guide - Mehaal.tech

This guide covers deploying your Mehaal.tech AI Voice Platform to various hosting providers.

## 📋 Pre-Deployment Checklist

- [ ] All environment variables configured in `.env`
- [ ] OpenAI API key is valid and has credits
- [ ] Launch date is set in `VITE_LAUNCH_DATE`
- [ ] Social media links updated in `SocialLinks.tsx`
- [ ] Contact email updated in `SocialLinks.tsx`
- [ ] Build completes without errors: `pnpm build`
- [ ] All tests pass: `pnpm test`

## 🌐 Deployment Options

### Option 1: Vercel (Recommended)

**Why Vercel?**
- Zero-config deployment for SolidStart
- Automatic HTTPS
- Global CDN
- Preview deployments for PRs
- Free tier available

**Steps:**

1. **Install Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **Login to Vercel**
   ```bash
   vercel login
   ```

3. **Deploy**
   ```bash
   vercel
   ```

4. **Set Environment Variables**
   - Go to Vercel Dashboard > Project > Settings > Environment Variables
   - Add all variables from `.env.example`:
     - `VITE_OPENAI_API_KEY`
     - `VITE_LAUNCH_DATE`
     - `VITE_OPENAI_MODEL`
     - `VITE_WHISPER_MODEL`

5. **Deploy to Production**
   ```bash
   vercel --prod
   ```

**Custom Domain:**
- Go to Vercel Dashboard > Project > Settings > Domains
- Add your custom domain (e.g., mehaal.tech)
- Update DNS records as instructed

---

### Option 2: Netlify

**Why Netlify?**
- Easy drag-and-drop deployment
- Automatic HTTPS
- Form handling built-in
- Free tier available

**Steps:**

1. **Install Netlify CLI**
   ```bash
   npm i -g netlify-cli
   ```

2. **Login to Netlify**
   ```bash
   netlify login
   ```

3. **Initialize Site**
   ```bash
   netlify init
   ```

4. **Configure Build Settings**
   - Build command: `pnpm build`
   - Publish directory: `.output/public`
   - Functions directory: `.output/server`

5. **Set Environment Variables**
   ```bash
   netlify env:set VITE_OPENAI_API_KEY "your-key-here"
   netlify env:set VITE_LAUNCH_DATE "2026-03-01"
   ```

6. **Deploy**
   ```bash
   netlify deploy --prod
   ```

---

### Option 3: Cloudflare Pages

**Why Cloudflare Pages?**
- Lightning-fast global network
- Unlimited bandwidth
- Free tier with generous limits
- Built-in DDoS protection

**Steps:**

1. **Push to GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/yourusername/mehaal-tech.git
   git push -u origin main
   ```

2. **Connect to Cloudflare Pages**
   - Go to [Cloudflare Dashboard](https://dash.cloudflare.com)
   - Pages > Create a project
   - Connect your GitHub repository

3. **Configure Build**
   - Framework preset: SolidStart
   - Build command: `pnpm build`
   - Build output directory: `.output/public`

4. **Set Environment Variables**
   - Add all variables from `.env.example` in the Cloudflare dashboard

5. **Deploy**
   - Click "Save and Deploy"

---

### Option 4: Self-Hosted (VPS/Docker)

**For:** Advanced users who want full control

**Requirements:**
- Linux server (Ubuntu 22.04+ recommended)
- Node.js 22+
- PM2 for process management
- Nginx for reverse proxy

**Steps:**

1. **Setup Server**
   ```bash
   # Update system
   sudo apt update && sudo apt upgrade -y
   
   # Install Node.js 22
   curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
   sudo apt install -y nodejs
   
   # Install PM2
   sudo npm i -g pm2 pnpm
   ```

2. **Clone and Build**
   ```bash
   cd /var/www
   git clone https://github.com/yourusername/mehaal-tech.git
   cd mehaal-tech
   pnpm install
   pnpm build
   ```

3. **Configure Environment**
   ```bash
   cp .env.example .env
   nano .env  # Add your environment variables
   ```

4. **Start with PM2**
   ```bash
   pm2 start pnpm --name "mehaal-tech" -- start
   pm2 save
   pm2 startup
   ```

5. **Configure Nginx**
   ```nginx
   server {
       listen 80;
       server_name mehaal.tech;
       
       location / {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

6. **Enable HTTPS with Let's Encrypt**
   ```bash
   sudo apt install certbot python3-certbot-nginx
   sudo certbot --nginx -d mehaal.tech
   ```

---

## 🔐 Security Best Practices

### Environment Variables
- **Never commit `.env` file to Git**
- Use different API keys for dev/staging/production
- Rotate API keys regularly
- Set rate limits on OpenAI API

### API Security
```typescript
// Add rate limiting to API routes
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
```

### Content Security Policy
Add to `entry-server.tsx`:
```html
<meta http-equiv="Content-Security-Policy" 
      content="default-src 'self'; script-src 'self' 'unsafe-inline'; 
               connect-src 'self' https://api.openai.com; 
               img-src 'self' data: https:; 
               style-src 'self' 'unsafe-inline';">
```

---

## 📊 Monitoring & Analytics

### 1. Google Analytics
```typescript
// Add to .env
VITE_GA_TRACKING_ID=G-XXXXXXXXXX

// Add to entry-client.tsx
if (import.meta.env.VITE_GA_TRACKING_ID) {
  // Initialize GA
}
```

### 2. Sentry (Error Tracking)
```bash
pnpm add @sentry/solidstart
```

### 3. Plausible (Privacy-friendly)
```html
<!-- Add to entry-server.tsx -->
<script defer data-domain="mehaal.tech" 
        src="https://plausible.io/js/script.js"></script>
```

---

## 🧪 Testing in Production

### Before Going Live
```bash
# Test build locally
pnpm build
pnpm start

# Check all features:
# ✓ Voice agent works
# ✓ Countdown timer accurate
# ✓ Email subscription stores data
# ✓ All animations smooth
# ✓ Responsive on mobile
# ✓ Service worker caches assets
```

### Lighthouse Checks
- Performance: > 90
- Accessibility: > 95
- Best Practices: > 90
- SEO: > 95

---

## 🔄 CI/CD Pipeline

### GitHub Actions Example

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Production

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '22'
    
    - name: Install pnpm
      run: npm i -g pnpm
    
    - name: Install dependencies
      run: pnpm install
    
    - name: Run tests
      run: pnpm test
    
    - name: Build
      run: pnpm build
      env:
        VITE_OPENAI_API_KEY: ${{ secrets.OPENAI_API_KEY }}
        VITE_LAUNCH_DATE: ${{ secrets.LAUNCH_DATE }}
    
    - name: Deploy to Vercel
      uses: amondnet/vercel-action@v20
      with:
        vercel-token: ${{ secrets.VERCEL_TOKEN }}
        vercel-org-id: ${{ secrets.ORG_ID }}
        vercel-project-id: ${{ secrets.PROJECT_ID }}
```

---

## 📈 Post-Deployment

### DNS Configuration
```
Type    Name    Value                   TTL
A       @       76.76.21.21            Auto
CNAME   www     your-app.vercel.app    Auto
```

### Performance Optimization
- Enable CDN caching
- Compress images
- Enable HTTP/2
- Use WebP format for images

### Backup Strategy
- Daily database backups (if using DB)
- Weekly full site backups
- Store backups in multiple locations

---

## 🆘 Troubleshooting

### Build Fails
```bash
# Clear cache and rebuild
rm -rf .vinxi node_modules
pnpm install
pnpm build
```

### Voice Agent Not Working
- Check OpenAI API key is valid
- Verify API has credits
- Check browser console for errors
- Ensure HTTPS is enabled (required for microphone)

### Slow Performance
- Check Lighthouse scores
- Enable compression
- Optimize images
- Review animation performance

---

## 📞 Support

- **Documentation**: Check README.md
- **Issues**: GitHub Issues
- **Email**: hello@mehaal.tech
- **Discord**: [Join our community](#)

---

Made with ❤️ by Mehaal.tech
