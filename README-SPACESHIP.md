# Mehaal.Tech AI - Spaceship Hyperlift Deployment

## 🚀 Deployment to Spaceship Hyperlift Manager

### Prerequisites
- Docker installed
- Spaceship account configured
- Application registered on Hyperlift Manager

---

## 📦 Quick Deploy

### 1. Build Production Image
```bash
# Build optimized Docker image
docker build -f Dockerfile.landing -t mehaal-ai:production .

# Verify image
docker images | grep mehaal-ai
```

### 2. Test Locally First
```bash
# Run production container locally
docker run -p 3000:3000 \
  -e NEXT_PUBLIC_OPENAI_API_KEY=sk-your-key \
  -e NODE_ENV=production \
  mehaal-ai:production

# Visit: http://localhost:3000
```

### 3. Tag for Registry
```bash
# Tag for your registry (update with your details)
docker tag mehaal-ai:production registry.spaceship.com/your-username/mehaal-ai:latest
docker tag mehaal-ai:production registry.spaceship.com/your-username/mehaal-ai:v1.0.0
```

### 4. Push to Registry
```bash
# Login to Spaceship registry
docker login registry.spaceship.com

# Push images
docker push registry.spaceship.com/your-username/mehaal-ai:latest
docker push registry.spaceship.com/your-username/mehaal-ai:v1.0.0
```

---

## ⚙️ Hyperlift Manager Configuration

### Application Settings

**Basic Configuration:**
```yaml
name: mehaal-tech-ai
image: registry.spaceship.com/your-username/mehaal-ai:latest
port: 3000
protocol: http
```

**Environment Variables:**
```yaml
NEXT_PUBLIC_OPENAI_API_KEY: sk-your-openai-key-here  # Optional
NODE_ENV: production
NEXT_TELEMETRY_DISABLED: 1
NEXT_PUBLIC_APP_URL: https://your-domain.com
PORT: 3000
HOSTNAME: 0.0.0.0
```

**Resources:**
```yaml
cpu: 1
memory: 512Mi  # Minimum recommended
replicas: 1    # Scale as needed
```

**Health Check:**
```yaml
path: /
port: 3000
interval: 30s
timeout: 10s
```

---

## 🔧 Docker Compose (Alternative)

If Hyperlift supports docker-compose:

```yaml
version: '3.8'

services:
  mehaal-ai:
    image: registry.spaceship.com/your-username/mehaal-ai:latest
    container_name: mehaal-landing-prod
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - NEXT_TELEMETRY_DISABLED=1
      - NEXT_PUBLIC_OPENAI_API_KEY=${OPENAI_API_KEY}
      - PORT=3000
      - HOSTNAME=0.0.0.0
    restart: always
    healthcheck:
      test: ["CMD", "wget", "--quiet", "--tries=1", "--spider", "http://localhost:3000"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s
```

---

## 🌐 Domain Configuration

### DNS Settings
Point your domain to Spaceship Hyperlift:
```
Type: A or CNAME
Host: @ or www
Value: [Provided by Spaceship]
```

### SSL/TLS
Hyperlift typically handles SSL automatically. If manual:
```yaml
ssl: true
certificate: auto  # Let's Encrypt
```

---

## 📊 Monitoring

### Logs
```bash
# Via Hyperlift Manager UI
- Application Logs
- Error Logs
- Access Logs

# Or via CLI (if available)
hyperlift logs mehaal-tech-ai --tail 100 --follow
```

### Metrics
Monitor in Hyperlift dashboard:
- CPU Usage
- Memory Usage
- Request Count
- Response Time
- Error Rate

---

## 🔄 Updates & Rollback

### Deploy New Version
```bash
# Build new version
docker build -f Dockerfile.landing -t mehaal-ai:production .

# Tag with version
docker tag mehaal-ai:production registry.spaceship.com/your-username/mehaal-ai:v1.1.0

# Push
docker push registry.spaceship.com/your-username/mehaal-ai:v1.1.0

# Update in Hyperlift Manager
# Change image tag to v1.1.0
```

### Rollback
```bash
# In Hyperlift Manager:
# Change image tag back to previous version (e.g., v1.0.0)
# Or use rollback feature if available
```

---

## 🔐 Security Checklist

✅ Environment Variables:
- [ ] OPENAI_API_KEY set (or omitted for fallback mode)
- [ ] NODE_ENV=production
- [ ] Secrets not in Dockerfile

✅ Network:
- [ ] Only port 3000 exposed
- [ ] HTTPS enabled
- [ ] Security headers configured (already in next.config.js)

✅ Container:
- [ ] Running as non-root user (nextjs)
- [ ] Minimal base image (alpine)
- [ ] No development dependencies in production

---

## 🚨 Troubleshooting

### Container Won't Start
```bash
# Check logs
docker logs mehaal-landing-prod

# Common issues:
# - Missing environment variables
# - Port already in use
# - Build failed
```

### Application Errors
```bash
# Check application logs in Hyperlift
# Look for:
# - JavaScript errors
# - API connection issues
# - Missing assets
```

### Performance Issues
```bash
# Increase resources:
cpu: 2
memory: 1Gi

# Or scale horizontally:
replicas: 2
```

---

## 📝 Production Checklist

Before deploying:
- [ ] Build successful: `pnpm run build`
- [ ] Docker image builds: `docker build -f Dockerfile.landing .`
- [ ] Local container works: `docker run -p 3000:3000 ...`
- [ ] Environment variables configured
- [ ] Domain DNS configured
- [ ] SSL certificate active
- [ ] Health checks passing
- [ ] Monitoring enabled

After deploying:
- [ ] Site accessible via domain
- [ ] Voice interaction works (OpenAI or fallback)
- [ ] Mobile responsive
- [ ] Dark theme working
- [ ] Logo/favicon displaying
- [ ] Performance acceptable (Lighthouse score)

---

## 📞 Support

**Spaceship Hyperlift:**
- Documentation: https://www.spaceship.com/docs
- Support: support@spaceship.com

**Application Issues:**
- Check [README-VOICE.md](README-VOICE.md) for voice features
- Check [README-DEPLOYMENT.md](README-DEPLOYMENT.md) for general deployment

---

**Ready to Deploy!** 🚀

```bash
# Quick commands:
docker build -f Dockerfile.landing -t mehaal-ai:production .
docker tag mehaal-ai:production registry.spaceship.com/YOUR_USERNAME/mehaal-ai:latest
docker push registry.spaceship.com/YOUR_USERNAME/mehaal-ai:latest
```

Then configure in Hyperlift Manager UI!
