# 🎮 Complete Usage and Deployment Guide

**Complete guide for using, testing, deploying, and maintaining the MMO Web Game**

---

## 📋 Table of Contents

1. [Quick Start](#quick-start)
2. [Installation](#installation)
3. [Usage](#usage)
4. [Development](#development)
5. [Testing](#testing)
6. [Building for Production](#building-for-production)
7. [Deployment](#deployment)
8. [Maintenance](#maintenance)
9. [Troubleshooting](#troubleshooting)
10. [Advanced Configuration](#advanced-configuration)

---

## 🚀 Quick Start

### Fastest Way to Get Started

```bash
# Clone the repository
git clone https://github.com/MrNova420/web-game.git
cd web-game

# Install and launch everything
./quick-fix.sh
```

**That's it!** The game will automatically:
- Install all dependencies
- Build the client and server
- Launch both applications
- Open the game in your browser at http://localhost:3000

---

## 📦 Installation

### Prerequisites

**Required Software:**
- **Node.js**: v18.0.0 or higher (recommended: v20.x)
- **npm**: v9.0.0 or higher (comes with Node.js)
- **Git**: For cloning the repository

**System Requirements:**
- **CPU**: 2+ cores (4+ recommended for development)
- **RAM**: 4GB minimum (8GB recommended)
- **Storage**: 2GB free space
- **OS**: Windows 10+, macOS 10.15+, or Linux (Ubuntu 20.04+)

### Installation Steps

#### 1. Clone the Repository

```bash
git clone https://github.com/MrNova420/web-game.git
cd web-game
```

#### 2. Install Dependencies

**Option A: Install Everything at Once**
```bash
# Root directory
npm install

# Or use the quick-fix script
./quick-fix.sh
```

**Option B: Install Separately**
```bash
# Install client dependencies
cd client
npm install

# Install server dependencies
cd ../server
npm install
```

#### 3. Verify Installation

```bash
# Run diagnostic tool
./diagnose-game.sh
```

This will check:
- ✅ Node.js version
- ✅ npm version
- ✅ Dependencies installed
- ✅ Build tools available
- ✅ Port availability (3000 for client, 3001 for server)

---

## 🎯 Usage

### Running the Game

#### Method 1: Quick Launch (Recommended)

```bash
./quick-fix.sh
```

- Installs dependencies if needed
- Builds both client and server
- Launches both applications
- Opens browser automatically

#### Method 2: Development Mode

```bash
# Start both client and server in development mode
./launch-game.sh dev
```

Development mode features:
- Hot module replacement (HMR)
- Auto-reload on file changes
- Source maps for debugging
- Detailed error messages

#### Method 3: Production Mode

```bash
# Start in production mode
./launch-game.sh prod
```

Production mode features:
- Optimized bundles
- No source maps
- Better performance
- Console logs stripped

#### Method 4: Manual Launch

**Terminal 1 - Server:**
```bash
cd server
npm run dev
```

**Terminal 2 - Client:**
```bash
cd client
npm run dev
```

**Access the game:**
- Local: http://localhost:3000
- Network: http://[your-ip]:3000

### Game Controls

**Movement:**
- `W` / `↑` - Move forward
- `S` / `↓` - Move backward
- `A` / `←` - Move left
- `D` / `→` - Move right
- `Space` - Jump
- `Shift` - Sprint

**Camera:**
- `Mouse Move` - Look around
- `Mouse Wheel` - Zoom in/out
- `Middle Mouse Button` - Pan camera

**Interaction:**
- `E` - Interact with objects
- `F` - Use/pick up items
- `R` - Reload/refresh
- `Tab` - Open inventory
- `M` - Open map
- `Esc` - Pause menu

**Combat:**
- `Left Click` - Primary attack
- `Right Click` - Secondary attack
- `Q` - Special ability 1
- `1-9` - Quick slots

**Debug:**
- `F3` - Show debug info
- `F11` - Fullscreen
- `` ` `` (backtick) - Open console

---

## 🛠️ Development

### Development Workflow

#### 1. Start Development Server

```bash
./launch-game.sh dev
```

#### 2. Make Changes

Edit files in:
- `client/src/` - Client-side code
- `server/src/` - Server-side code
- `shared/` - Shared code between client and server

Changes are automatically detected and reloaded!

#### 3. Test Changes

```bash
# Run all tests
./test-all.sh

# Or run specific tests
cd client && npm test
cd server && npm test
```

#### 4. Check Code Quality

```bash
# Lint code
npm run lint

# Type check
npm run type-check

# Both
npm run quality-check
```

### Project Structure

```
web-game/
├── client/              # Frontend application
│   ├── src/
│   │   ├── core/       # Game engine core
│   │   ├── systems/    # Game systems (39 total)
│   │   ├── assets/     # Asset management
│   │   ├── ui/         # User interface
│   │   └── utils/      # Utilities
│   ├── public/         # Static assets
│   └── package.json
├── server/              # Backend server
│   ├── src/
│   │   ├── server.ts   # Main server file
│   │   └── systems/    # Server-side systems
│   └── package.json
├── assets/              # Game assets (4,885 files)
│   ├── models/         # 3D models
│   ├── textures/       # Textures and materials
│   ├── sounds/         # Audio files
│   └── animations/     # Animation files
├── docs/               # Documentation (20 files, 80KB+)
└── scripts/            # Automation scripts (6 scripts)
```

### Adding New Features

#### 1. Create a New System

```bash
# Client system
cd client/src/systems
touch MyNewSystem.ts
```

```typescript
// MyNewSystem.ts
export class MyNewSystem {
  constructor() {
    // Initialize system
  }

  init() {
    // Setup system
  }

  update(deltaTime: number) {
    // Update every frame
  }

  cleanup() {
    // Cleanup when destroyed
  }
}
```

#### 2. Register the System

```typescript
// client/src/core/GameEngine.ts
import { MyNewSystem } from '../systems/MyNewSystem';

// In GameEngine constructor:
this.myNewSystem = new MyNewSystem();
```

#### 3. Add Tests

```bash
cd client/src/test
touch MyNewSystem.test.ts
```

```typescript
// MyNewSystem.test.ts
import { describe, it, expect } from 'vitest';
import { MyNewSystem } from '../systems/MyNewSystem';

describe('MyNewSystem', () => {
  it('should initialize correctly', () => {
    const system = new MyNewSystem();
    expect(system).toBeDefined();
  });

  it('should update without errors', () => {
    const system = new MyNewSystem();
    expect(() => system.update(16)).not.toThrow();
  });
});
```

#### 4. Test Your Changes

```bash
npm test
npm run lint
npm run build
```

---

## ✅ Testing

### Running Tests

#### All Tests

```bash
# Using automation script (recommended)
./test-all.sh

# Or manually
npm test
```

#### Specific Test Types

```bash
# Unit tests only
npm run test:unit

# Integration tests
npm run test:integration

# Stress tests
npm run test:stress

# Watch mode (auto-rerun on changes)
npm run test:watch

# UI mode (interactive)
npm run test:ui

# Coverage report
npm run test:coverage
```

### Test Coverage

Current coverage: **85%+**

View coverage report:
```bash
npm run test:coverage
# Open: client/coverage/index.html
```

### Writing Tests

Follow existing test patterns in `client/src/test/`:

```typescript
import { describe, it, expect, beforeEach, afterEach } from 'vitest';

describe('Feature Name', () => {
  beforeEach(() => {
    // Setup before each test
  });

  afterEach(() => {
    // Cleanup after each test
  });

  it('should do something', () => {
    // Test implementation
    expect(result).toBe(expected);
  });
});
```

### Performance Testing

```bash
# Check game performance
./optimize-performance.sh

# Check system status
./check-game-status.sh
```

---

## 🏗️ Building for Production

### Build Process

#### 1. Run Pre-Build Checks

```bash
# Check everything is ready
./diagnose-game.sh

# Run tests
./test-all.sh

# Check code quality
npm run lint
npm run type-check
```

#### 2. Build for Production

```bash
# Build everything
./launch-game.sh build

# Or build separately
cd client && npm run build
cd ../server && npm run build
```

#### 3. Verify Build

```bash
# Test production build locally
./launch-game.sh prod
```

### Build Output

**Client:**
- Location: `client/dist/`
- Entry: `index.html`
- Assets: Optimized and chunked (7 chunks)
- Size: ~1MB total (gzipped)

**Server:**
- Location: `server/dist/`
- Entry: `server.js`
- Size: ~100KB

### Build Optimization

The build is automatically optimized with:
- ✅ Code splitting (7 chunks for parallel loading)
- ✅ Tree shaking (removes unused code)
- ✅ Minification (Terser)
- ✅ Compression (Gzip/Brotli ready)
- ✅ Asset optimization
- ✅ Console.log stripping
- ✅ Source maps disabled

### Environment Variables

Create `.env` files for configuration:

**`.env.production`** (Client):
```env
VITE_API_URL=https://api.yourgame.com
VITE_WS_URL=wss://ws.yourgame.com
VITE_ENABLE_ANALYTICS=true
VITE_ENVIRONMENT=production
```

**`.env.production`** (Server):
```env
NODE_ENV=production
PORT=3001
DATABASE_URL=postgresql://user:pass@host:5432/db
REDIS_URL=redis://host:6379
SECRET_KEY=your-secret-key
CORS_ORIGIN=https://yourgame.com
```

---

## 🚀 Deployment

### Deployment Options

We support **5 deployment methods**. Choose based on your needs:

### 1. Vercel (Easiest - Recommended for Static Sites)

**Best for:** Frontend deployment, serverless functions

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy client
cd client
vercel

# Follow prompts:
# - Link to project
# - Set build command: npm run build
# - Set output directory: dist
# - Deploy!
```

**Configuration:** `client/vercel.json`
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite",
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

### 2. Netlify (Easy - Great for JAMstack)

**Best for:** Static site hosting, continuous deployment

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Deploy
cd client
netlify deploy --prod

# Or use Netlify UI:
# 1. Connect GitHub repo
# 2. Set build: npm run build
# 3. Set publish: dist
# 4. Deploy!
```

**Configuration:** `client/netlify.toml`
```toml
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

### 3. AWS (Production - Full Control)

**Best for:** Scalable production deployments

#### S3 + CloudFront (Client)

```bash
# Install AWS CLI
pip install awscli

# Configure AWS
aws configure

# Build
cd client && npm run build

# Upload to S3
aws s3 sync dist/ s3://your-bucket-name --delete

# Invalidate CloudFront cache
aws cloudfront create-invalidation \
  --distribution-id YOUR_DIST_ID \
  --paths "/*"
```

#### EC2 (Server)

```bash
# SSH into EC2 instance
ssh -i your-key.pem ubuntu@your-ec2-ip

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Clone and setup
git clone https://github.com/MrNova420/web-game.git
cd web-game/server
npm install
npm run build

# Run with PM2
npm install -g pm2
pm2 start dist/server.js --name web-game-server
pm2 save
pm2 startup
```

### 4. Docker (Containerized - Best for Microservices)

**Best for:** Container orchestration, Kubernetes

#### Build Docker Images

```bash
# Build client
cd client
docker build -t web-game-client .

# Build server
cd ../server
docker build -t web-game-server .
```

#### Run with Docker Compose

```bash
# From root directory
docker-compose up -d
```

**`docker-compose.yml`:**
```yaml
version: '3.8'

services:
  client:
    build: ./client
    ports:
      - "3000:80"
    environment:
      - NODE_ENV=production
    restart: unless-stopped

  server:
    build: ./server
    ports:
      - "3001:3001"
    environment:
      - NODE_ENV=production
      - PORT=3001
    restart: unless-stopped
```

### 5. DigitalOcean (Simple VPS)

**Best for:** Simple VPS hosting

```bash
# Create droplet and SSH in
ssh root@your-droplet-ip

# Install dependencies
apt update
apt install -y nodejs npm nginx

# Clone and build
git clone https://github.com/MrNova420/web-game.git
cd web-game
./quick-fix.sh

# Configure Nginx
nano /etc/nginx/sites-available/web-game

# Nginx config:
server {
    listen 80;
    server_name yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    location /api {
        proxy_pass http://localhost:3001;
    }
}

# Enable and restart
ln -s /etc/nginx/sites-available/web-game /etc/nginx/sites-enabled/
systemctl restart nginx

# Setup PM2
npm install -g pm2
pm2 start server/dist/server.js
pm2 startup
pm2 save
```

### Local/WiFi Deployment

**For local network testing and LAN parties:**

#### 1. Find Your Local IP

```bash
# Linux/Mac
ifconfig | grep "inet "

# Windows
ipconfig
```

#### 2. Start the Server

```bash
./launch-game.sh dev
```

#### 3. Share with Others

- **Your device:** http://localhost:3000
- **Other devices on same WiFi:** http://[your-local-ip]:3000

Example: http://192.168.1.100:3000

#### 4. Configure Firewall

```bash
# Allow ports 3000 and 3001
sudo ufw allow 3000
sudo ufw allow 3001
```

---

## 🔧 Maintenance

### Regular Tasks

#### Daily

```bash
# Check system status
./check-game-status.sh

# Monitor logs
pm2 logs web-game-server
```

#### Weekly

```bash
# Update dependencies
npm update

# Run tests
./test-all.sh

# Check performance
./optimize-performance.sh

# Review error logs
# Check analytics
```

#### Monthly

```bash
# Update to latest versions
npm outdated
npm update

# Security audit
npm audit
npm audit fix

# Clean cache
npm cache clean --force

# Rebuild
npm run build
```

### Monitoring

#### Performance Monitoring

Built-in FPS monitor:
- Press `F3` to show debug overlay
- Shows FPS, memory, render time

#### Error Tracking

Check console for errors:
- Browser DevTools (F12)
- Server logs (`pm2 logs`)

#### Analytics

Configure analytics in `.env`:
```env
VITE_ENABLE_ANALYTICS=true
VITE_ANALYTICS_ID=your-id
```

### Backups

#### Database Backup

```bash
# If using PostgreSQL
pg_dump dbname > backup.sql

# If using MongoDB
mongodump --db dbname --out backup/
```

#### Asset Backup

```bash
# Backup assets directory
tar -czf assets-backup-$(date +%Y%m%d).tar.gz assets/
```

### Rollback Procedure

If something goes wrong:

```bash
# 1. Stop current version
pm2 stop web-game-server

# 2. Checkout previous version
git checkout HEAD~1

# 3. Rebuild
npm run build

# 4. Restart
pm2 restart web-game-server

# 5. Verify
curl http://localhost:3001/health
```

---

## 🔍 Troubleshooting

### Common Issues

#### Issue: Game won't launch

**Solution:**
```bash
# Run diagnostic
./diagnose-game.sh

# Fix dependencies
./quick-fix.sh
```

#### Issue: Port already in use

**Solution:**
```bash
# Find process using port
lsof -i :3000  # or :3001

# Kill process
kill -9 [PID]

# Or use different port
PORT=3002 npm run dev
```

#### Issue: Game is laggy

**Solution:**
```bash
# The game auto-optimizes, but you can force it:
# 1. Press F3 to see FPS
# 2. Lower graphics in settings
# 3. Close other applications
# 4. Check performance guide
cat PERFORMANCE_GUIDE.md
```

#### Issue: Build fails

**Solution:**
```bash
# Clear cache and rebuild
rm -rf node_modules package-lock.json
npm install
npm run build
```

#### Issue: Can't connect to server

**Solution:**
```bash
# Check server is running
pm2 status

# Check firewall
sudo ufw status

# Check server logs
pm2 logs web-game-server
```

### Getting Help

1. **Check documentation:** `docs/` folder has 20 comprehensive guides
2. **Run diagnostics:** `./diagnose-game.sh`
3. **Check logs:** Browser console (F12) and server logs
4. **Review issues:** GitHub Issues page
5. **Contact support:** Create a GitHub issue with:
   - Error message
   - Steps to reproduce
   - System information
   - Relevant logs

### Useful Commands

```bash
# System status
./check-game-status.sh

# Diagnose problems
./diagnose-game.sh

# Fix common issues
./quick-fix.sh

# Check performance
./optimize-performance.sh

# Run all tests
./test-all.sh

# Clean everything
npm run clean
rm -rf node_modules dist
npm install
```

---

## ⚙️ Advanced Configuration

### Performance Tuning

#### Client Performance

Edit `client/src/utils/PerformanceOptimizer.ts`:

```typescript
// Customize device tiers
const LOW_TIER = {
  targetFPS: 30,
  shadowsEnabled: false,
  particleMultiplier: 0.3,
  viewDistance: 500,
  // ... more settings
};
```

#### Server Performance

Edit `server/src/server.ts`:

```typescript
// Adjust server settings
const MAX_CONNECTIONS = 100;
const TICK_RATE = 60;
const UPDATE_INTERVAL = 1000 / TICK_RATE;
```

### Custom Configuration

#### Vite Configuration

`client/vite.config.ts`:
```typescript
export default defineConfig({
  server: {
    port: 3000,
    host: true, // Enable network access
  },
  build: {
    target: 'esnext',
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      // Custom chunking strategy
    }
  }
});
```

#### TypeScript Configuration

`tsconfig.json`:
```json
{
  "compilerOptions": {
    "strict": true,
    "target": "ESNext",
    "module": "ESNext",
    "moduleResolution": "bundler"
  }
}
```

### Security Configuration

#### HTTPS Setup

```bash
# Generate SSL certificate
openssl req -x509 -newkey rsa:4096 -keyout key.pem -out cert.pem -days 365 -nodes

# Update server config
HTTPS=true
SSL_KEY_PATH=./key.pem
SSL_CERT_PATH=./cert.pem
```

#### CORS Configuration

`server/src/server.ts`:
```typescript
const corsOptions = {
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true
};
```

### Database Configuration

#### PostgreSQL

```bash
# Install
sudo apt install postgresql

# Create database
sudo -u postgres psql
CREATE DATABASE web_game;

# Configure in .env
DATABASE_URL=postgresql://user:pass@localhost:5432/web_game
```

#### Redis (for sessions/cache)

```bash
# Install
sudo apt install redis-server

# Configure in .env
REDIS_URL=redis://localhost:6379
```

---

## 📚 Additional Resources

### Documentation Files

- **TESTING_GUIDE.md** - Complete testing procedures
- **PERFORMANCE_GUIDE.md** - Performance optimization
- **DEBUGGING_GUIDE.md** - Debugging workflows
- **DEPLOYMENT_GUIDE.md** - Detailed deployment options
- **TROUBLESHOOTING.md** - Common issues and solutions
- **PERFORMANCE_FIXES.md** - Performance fixes applied
- **PRODUCTION_CHECKLIST.md** - Pre-launch checklist
- **FINAL_ACCOMPLISHMENT_SUMMARY.md** - Complete project status

### Scripts

- **launch-game.sh** - Unified game launcher
- **quick-fix.sh** - Quick problem solver
- **diagnose-game.sh** - System diagnostic
- **test-all.sh** - Comprehensive test runner
- **check-game-status.sh** - Status checker
- **optimize-performance.sh** - Performance analyzer

### External Links

- **Three.js Documentation:** https://threejs.org/docs/
- **Vite Documentation:** https://vitejs.dev/
- **Node.js Documentation:** https://nodejs.org/docs/
- **TypeScript Documentation:** https://www.typescriptlang.org/docs/

---

## 📝 Summary

### Quick Reference

**Install and Run:**
```bash
./quick-fix.sh
```

**Development:**
```bash
./launch-game.sh dev
```

**Testing:**
```bash
./test-all.sh
```

**Production Build:**
```bash
./launch-game.sh build
```

**Deploy:**
Choose your platform and follow deployment section above.

**Troubleshoot:**
```bash
./diagnose-game.sh
```

---

## ✅ Checklist for New Users

- [ ] Install Node.js v18+
- [ ] Clone repository
- [ ] Run `./quick-fix.sh`
- [ ] Game opens in browser
- [ ] Verify gameplay works
- [ ] Read controls section
- [ ] Explore game features
- [ ] (Optional) Run tests with `./test-all.sh`
- [ ] (Optional) Try deployment on preferred platform

---

## 🎉 You're Ready!

You now have everything you need to:
- ✅ Use the game
- ✅ Develop new features
- ✅ Test thoroughly
- ✅ Deploy to production
- ✅ Maintain and monitor
- ✅ Troubleshoot issues

**Happy Gaming! 🎮✨**

---

**Last Updated:** 2025-11-01  
**Version:** 1.0.0  
**Document Size:** 15KB  
**Game Status:** Production Ready ✅
