# Comprehensive Testing & Deployment Guide

## Overview
This guide covers comprehensive testing, debugging, optimization, and deployment of the Fantasy Survival MMO Web Game.

## Table of Contents
1. [Testing Infrastructure](#testing-infrastructure)
2. [Running Tests](#running-tests)
3. [Code Quality](#code-quality)
4. [Performance Testing](#performance-testing)
5. [Stress Testing](#stress-testing)
6. [Cross-Device Testing](#cross-device-testing)
7. [Deployment Methods](#deployment-methods)
8. [Troubleshooting](#troubleshooting)

---

## Testing Infrastructure

### Frameworks Installed
- **Vitest**: Modern, fast unit testing framework
- **@testing-library/react**: React component testing
- **ESLint**: Code quality and linting
- **TypeScript**: Type checking

### Test Structure
```
client/src/test/
├── setup.ts                          # Test configuration
├── *.test.ts                         # Unit tests for systems
├── integration/                      # Integration tests
│   ├── GameEngine.integration.test.ts
│   └── FullGameplay.integration.test.ts
└── stress/                           # Stress and performance tests
    ├── Performance.stress.test.ts
    └── Network.stress.test.ts
```

---

## Running Tests

### Client Tests

```bash
cd client

# Run all tests
npm test

# Run tests with UI
npm run test:ui

# Run tests once (CI mode)
npm run test:run

# Run with coverage
npm run test:coverage

# Type checking
npm run type-check

# Linting
npm run lint
npm run lint:fix
```

### Server Tests

```bash
cd server

# Run all tests
npm test

# Run tests once
npm run test:run

# Run with coverage
npm run test:coverage

# Type checking
npm run type-check

# Linting
npm run lint
npm run lint:fix
```

---

## Code Quality

### Linting
ESLint is configured to check:
- TypeScript best practices
- React best practices
- Code style consistency
- Unused variables
- Type safety

```bash
# Check code quality
npm run lint

# Auto-fix issues
npm run lint:fix
```

### Type Checking
```bash
# Full TypeScript check
npm run type-check
```

---

## Performance Testing

### FPS Monitoring
The game includes a built-in performance monitor:

```typescript
// In game
const performanceMonitor = gameEngine.getSystem('PerformanceMonitor');
const stats = performanceMonitor.getStats();
console.log('FPS:', stats.fps);
console.log('Frame Time:', stats.frameTime);
```

### Performance Benchmarks
- **Target FPS**: 60 FPS
- **Minimum FPS**: 30 FPS
- **Load Time**: < 3 seconds
- **Chunk Loading**: < 100ms per chunk
- **Entity Spawn**: < 10ms per entity

### Running Performance Tests
```bash
cd client
npm run test -- stress/Performance.stress.test.ts
```

---

## Stress Testing

### Entity Stress Test
Tests spawning 1000+ entities:
```bash
npm run test -- stress/Performance.stress.test.ts
```

### Network Stress Test
Tests 100+ simultaneous connections:
```bash
npm run test -- stress/Network.stress.test.ts
```

### Memory Stress Test
Tests handling large data structures without memory leaks.

### Chunk Loading Stress Test
Tests rapid chunk loading/unloading during fast movement.

---

## Cross-Device Testing

### Desktop Testing

**Windows:**
```bash
# Chrome
npm run dev
# Open http://localhost:3000 in Chrome

# Firefox
# Open http://localhost:3000 in Firefox

# Edge
# Open http://localhost:3000 in Edge
```

**macOS:**
```bash
# Safari
npm run dev
# Open http://localhost:3000 in Safari

# Chrome, Firefox also supported
```

**Linux:**
```bash
# Chrome, Firefox
npm run dev
# Open http://localhost:3000
```

### Mobile Testing

#### Local WiFi Testing
1. Start development server:
   ```bash
   cd client
   npm run dev
   ```

2. Find your local IP address:
   ```bash
   # Windows
   ipconfig
   
   # macOS/Linux
   ifconfig
   # or
   ip addr show
   ```

3. On mobile device, navigate to:
   ```
   http://YOUR_LOCAL_IP:3000
   ```
   Example: `http://192.168.1.100:3000`

#### Mobile Browser Requirements
- **iOS**: Safari 14+, Chrome for iOS
- **Android**: Chrome 90+, Firefox 90+
- **Minimum RAM**: 2GB
- **Recommended RAM**: 4GB+

### Performance Expectations by Device

**Desktop (High-End)**
- GPU: GTX 1060 or better
- RAM: 8GB+
- FPS: 60 FPS constant

**Desktop (Mid-Range)**
- GPU: GTX 960 or integrated
- RAM: 4GB+
- FPS: 30-60 FPS

**Mobile (High-End)**
- Device: iPhone 12+, Samsung S20+
- FPS: 30-60 FPS

**Mobile (Mid-Range)**
- Device: iPhone X+, Samsung S10+
- FPS: 20-30 FPS

---

## Deployment Methods

### 1. Local Development

```bash
# Terminal 1: Start server
cd server
npm run dev

# Terminal 2: Start client
cd client
npm run dev
```

Access: `http://localhost:3000`

### 2. Local Network (WiFi) Deployment

**Step 1: Build for production**
```bash
cd client
npm run build

cd ../server
npm run build
```

**Step 2: Start production server**
```bash
cd server
npm start
```

**Step 3: Serve client build**
```bash
cd client
npx serve -s dist -l 3000
```

**Step 4: Access from network**
Find IP and share: `http://YOUR_IP:3000`

### 3. Production Deployment

#### Option A: Vercel (Client)
```bash
cd client
npm install -g vercel
vercel --prod
```

#### Option B: Netlify (Client)
```bash
cd client
npm run build
# Upload dist folder to Netlify
```

#### Option C: AWS/DigitalOcean (Full Stack)

**Client (S3 + CloudFront):**
1. Build client: `npm run build`
2. Upload `dist/` to S3 bucket
3. Configure CloudFront distribution
4. Set up custom domain

**Server (EC2/Droplet):**
1. SSH into server
2. Clone repository
3. Install dependencies
4. Set up PM2 for process management:
   ```bash
   npm install -g pm2
   cd server
   pm2 start dist/server.js --name "game-server"
   pm2 save
   pm2 startup
   ```

### 4. Docker Deployment

**Create `docker-compose.yml`:**
```yaml
version: '3.8'
services:
  server:
    build: ./server
    ports:
      - "8080:8080"
    environment:
      - NODE_ENV=production
  
  client:
    build: ./client
    ports:
      - "3000:3000"
    depends_on:
      - server
```

**Deploy:**
```bash
docker-compose up -d
```

---

## Troubleshooting

### Common Issues

#### 1. Build Errors
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
npm run build
```

#### 2. Port Already in Use
```bash
# Kill process on port 3000
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# macOS/Linux
lsof -ti:3000 | xargs kill -9
```

#### 3. WebGL Not Supported
- Update browser to latest version
- Enable hardware acceleration in browser settings
- Update graphics drivers

#### 4. Low FPS
- Lower graphics quality in settings
- Reduce render distance
- Close other browser tabs
- Disable browser extensions

#### 5. Connection Issues
- Check firewall settings
- Ensure server is running
- Verify correct IP address and port
- Check network connectivity

### Debug Mode

Enable debug mode in game:
```javascript
// In browser console
window.gameEngine.getSystem('DebugSystem').enable();
```

View debug info:
- Press F1 for debug console
- FPS counter in top-left
- Entity count
- Chunk loading status
- Network latency

---

## Performance Optimization Checklist

### Client Optimization
- [x] Asset loading system implemented
- [x] LOD system for terrain and models
- [x] Chunk-based world streaming
- [x] Asset pooling for reusable objects
- [x] Particle system with limits
- [x] Frustum culling
- [x] Level of detail management

### Server Optimization
- [x] Socket.io for real-time communication
- [x] Message queue for offline handling
- [x] Player state synchronization
- [x] Efficient broadcast patterns

### Network Optimization
- [x] Message compression
- [x] Delta updates (send only changes)
- [x] Client-side prediction
- [x] Lag compensation

---

## Test Coverage Goals

- **Unit Tests**: 80%+ coverage
- **Integration Tests**: Key workflows covered
- **Stress Tests**: All systems tested under load
- **Cross-Browser**: Chrome, Firefox, Safari, Edge
- **Cross-Device**: Desktop, mobile, tablet

---

## Continuous Testing

### Pre-Commit Checks
```bash
# Run before committing
npm run lint
npm run type-check
npm run test:run
npm run build
```

### CI/CD Pipeline (GitHub Actions)
```yaml
# .github/workflows/test.yml
name: Test
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
      - run: npm install
      - run: npm run lint
      - run: npm run type-check
      - run: npm run test:run
      - run: npm run build
```

---

## Support

For issues or questions:
1. Check this guide's troubleshooting section
2. Review test output for specific errors
3. Check browser console for runtime errors
4. Enable debug mode for detailed logging
5. Open issue on GitHub with debug logs

---

## Version History

- **v1.0.0** - Initial comprehensive testing infrastructure
  - 30+ unit test files
  - Integration tests
  - Stress tests
  - Performance monitoring
  - Cross-device testing guide
  - Multiple deployment methods

---

**Last Updated**: 2025-11-01
