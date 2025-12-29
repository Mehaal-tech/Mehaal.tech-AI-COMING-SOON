# 🐳 Docker Setup Guide for MehaalAI9.0

## 📋 Prerequisites

- Docker Desktop installed
- Docker Compose installed
- Git (optional)

## 🚀 Quick Start

### 1. Setup Environment Variables

```bash
# Copy environment example file
cp .env.example .env

# Edit .env file with your credentials
```

### 2. Start All Services

```bash
# Start all containers
docker-compose up -d

# View logs
docker-compose logs -f
```

### 3. Access Applications

- **Landing Page:** http://localhost:3000
- **Dashboard:** http://localhost:3001
- **Nginx (Landing):** http://localhost
- **Nginx (Dashboard):** http://dashboard.localhost
- **PostgreSQL:** localhost:5432

## 🏗️ Architecture

```
┌─────────────────────────────────────────┐
│          Nginx (Port 80)                │
│  ┌────────────┐    ┌────────────┐       │
│  │  Landing   │    │ Dashboard  │       │
│  │   :80      │    │   :80      │       │
│  └────────────┘    └────────────┘       │
└─────────────────────────────────────────┘
         │                    │
         ▼                    ▼
┌─────────────────┐  ┌─────────────────┐
│   Landing       │  │   Dashboard     │
│   Container     │  │   Container     │
│   Port: 3000    │  │   Port: 3001    │
└─────────────────┘  └─────────────────┘
                              │
                              ▼
                     ┌─────────────────┐
                     │   PostgreSQL    │
                     │   Port: 5432    │
                     └─────────────────┘
```

## 📦 Services

### 1. Landing (Port 3000)
- Main marketing/landing page
- Next.js 14
- Shared public folder

### 2. Dashboard (Port 3001)
- SaaS dashboard application
- Next.js 15 with Turbopack
- Authentication & payments
- Shared public folder

### 3. PostgreSQL (Port 5432)
- Database for dashboard
- Persistent storage with volumes
- Health checks enabled

### 4. Nginx (Port 80)
- Reverse proxy
- Route traffic to services
- Domain-based routing

## 🔧 Common Commands

### Start Services
```bash
# Start all
docker-compose up -d

# Start specific service
docker-compose up -d landing
docker-compose up -d dashboard
```

### Stop Services
```bash
# Stop all
docker-compose down

# Stop and remove volumes
docker-compose down -v
```

### View Logs
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f landing
docker-compose logs -f dashboard
docker-compose logs -f postgres
```

### Rebuild Containers
```bash
# Rebuild all
docker-compose up -d --build

# Rebuild specific
docker-compose up -d --build landing
```

### Database Operations
```bash
# Access PostgreSQL
docker exec -it mehaal-postgres psql -U mehaal_user -d mehaal_db

# Run migrations
docker exec -it mehaal-dashboard pnpm db:migrate

# Seed database
docker exec -it mehaal-dashboard pnpm db:seed

# Open Drizzle Studio
docker exec -it mehaal-dashboard pnpm db:studio
```

### Execute Commands in Container
```bash
# Landing container
docker exec -it mehaal-landing sh

# Dashboard container
docker exec -it mehaal-dashboard sh

# Install packages
docker exec -it mehaal-dashboard pnpm install package-name
```

## 🔐 Environment Variables

Create `.env` file in root:

```env
# Database
POSTGRES_URL=postgresql://mehaal_user:mehaal_password@postgres:5432/mehaal_db

# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...

# JWT
JWT_SECRET=your-secret-key
```

## 📂 Volume Mounts

- `./public` → Shared between both projects
- `postgres_data` → Database persistence
- `./` → Landing app source (hot reload)
- `./second` → Dashboard app source (hot reload)

## 🌐 Network Configuration

All services run on `mehaal-network` bridge network, allowing:
- Inter-container communication
- Service discovery by name
- Isolated network environment

## 🛠️ Development Workflow

1. **Make changes** to code in your editor
2. **Hot reload** automatically updates in containers
3. **Shared public folder** syncs across both projects
4. **Database** persists data even after restart

## 🚨 Troubleshooting

### Port Already in Use
```bash
# Check what's using the port
netstat -ano | findstr :3000
netstat -ano | findstr :3001

# Stop the process or change ports in docker-compose.yml
```

### Database Connection Issues
```bash
# Check if postgres is healthy
docker-compose ps

# Restart postgres
docker-compose restart postgres

# Check logs
docker-compose logs postgres
```

### Container Won't Start
```bash
# Remove and rebuild
docker-compose down
docker-compose up -d --build

# Check for errors
docker-compose logs
```

### Clear Everything
```bash
# Nuclear option - removes all containers, volumes, images
docker-compose down -v
docker system prune -a
```

## 📊 Monitoring

### Check Container Status
```bash
docker-compose ps
```

### Resource Usage
```bash
docker stats
```

### Network Inspection
```bash
docker network inspect mehaalai90_mehaal-network
```

## 🎯 Production Deployment

For production, modify:

1. Change `NODE_ENV=production`
2. Use production database credentials
3. Set proper JWT_SECRET
4. Configure SSL in nginx
5. Use `docker-compose -f docker-compose.prod.yml up -d`

## 📝 Notes

- Containers share the same `public` folder via volume mount
- Development mode uses hot reload
- Database data persists in Docker volumes
- Nginx provides unified access point
