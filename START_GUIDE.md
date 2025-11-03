# 🎮 Game Start Guide - All Methods

## Overview

Fantasy Survival MMO features an optimized startup flow:
1. **Instant Menu Display** (< 100ms) - menu-menu (2).html design
2. **Background Asset Preloading** - Critical assets load while user browses menu
3. **User-Controlled Start** - Game engine starts only when "Play" is clicked

---

## Quick Start Methods

### Method 1: Launch Script (Easiest)

The `launch-game.sh` script handles everything automatically:

```bash
# Development mode (default)
./launch-game.sh

# Or specify mode
./launch-game.sh dev      # Start dev servers
./launch-game.sh prod     # Start production server
./launch-game.sh build    # Build for production
./launch-game.sh test     # Run tests
./launch-game.sh status   # Check game status
```

**What it does:**
- ✅ Checks Node.js version
- ✅ Installs dependencies if missing
- ✅ Sets up asset symlinks
- ✅ Starts client (port 3000) and server (port 8080)
- ✅ Displays startup information

---

### Method 2: Manual Start (Development)

**Step 1: Install Dependencies**
```bash
# Client dependencies
cd client
npm install

# Server dependencies
cd ../server
npm install
```

**Step 2: Start Services**

**Terminal 1 - Start Server:**
```bash
cd server
npm run dev
```
Server runs at: http://localhost:8080

**Terminal 2 - Start Client:**
```bash
cd client
npm run dev
```
Client runs at: http://localhost:3000

**What you'll see:**
1. Browser opens to http://localhost:3000
2. Menu appears instantly with game title and buttons
3. "Loading assets..." message appears
4. After 1-2 seconds: "Ready to play!" message
5. Click "Play" button to start game
6. Loading screen appears briefly
7. Game world loads with all 39 systems

---

### Method 3: Production Build

**Build Everything:**
```bash
# Build client
cd client
npm install
npm run build
# Output: client/dist/

# Build server
cd ../server
npm install
npm run build
# Output: server/dist/
```

**Start Production Server:**
```bash
cd server
npm start
```

**Or use launch script:**
```bash
./launch-game.sh prod
```

---

### Method 4: Docker Deployment

**Prerequisites:**
- Docker installed
- Docker Compose installed

**Start with Docker:**
```bash
# Build and start containers
docker-compose up -d

# View logs
docker-compose logs -f

# Stop containers
docker-compose down
```

**Docker services:**
- Client: http://localhost:3000
- Server: http://localhost:8080

---

## Package.json Scripts Reference

### Client Scripts

```bash
# Development
npm run dev          # Start Vite dev server (port 3000)
npm run build        # Build for production
npm run preview      # Preview production build

# Testing
npm run test         # Run tests with Vitest
npm run test:ui      # Open Vitest UI
npm run test:run     # Run tests once
npm run test:coverage # Generate coverage report

# Code Quality
npm run lint         # Check for linting errors
npm run lint:fix     # Auto-fix linting errors
npm run type-check   # TypeScript type checking
```

### Server Scripts

```bash
# Development
npm run dev          # Start with nodemon + ts-node
npm run build        # Compile TypeScript
npm start            # Start compiled server

# Testing
npm run test         # Run tests with Vitest
npm run test:run     # Run tests once
npm run test:coverage # Generate coverage report

# Code Quality
npm run lint         # Check for linting errors
npm run lint:fix     # Auto-fix linting errors
npm run type-check   # TypeScript type checking
```

---

## Environment Variables

### Client (.env)
```env
# Development
VITE_API_URL=http://localhost:8080
VITE_SOCKET_URL=http://localhost:8080

# Production
VITE_API_URL=https://api.yourgame.com
VITE_SOCKET_URL=https://api.yourgame.com
```

### Server (.env)
```env
# Development
NODE_ENV=development
PORT=8080
CORS_ORIGIN=http://localhost:3000

# Production
NODE_ENV=production
PORT=8080
CORS_ORIGIN=https://yourgame.com
```

---

## Startup Flow Details

### Development Flow

```
1. Run: ./launch-game.sh dev
   ↓
2. Script checks dependencies → Installs if needed
   ↓
3. Server starts (port 8080) → Express + Socket.IO ready
   ↓
4. Client starts (port 3000) → Vite dev server ready
   ↓
5. Browser opens → Menu loads instantly
   ↓
6. AssetPreloader starts → Loads 6 critical assets in background:
   - CommonTree_1.obj
   - CommonTree_2.obj
   - PineTree_1.obj
   - Rock_1.obj
   - Rock_2.obj
   - Grass_1.obj
   ↓
7. User sees "Ready to play!" → Clicks "Play" button
   ↓
8. GameEngine.initialize() → Loads 39 game systems
   ↓
9. Game starts → User can play
```

### Production Flow

```
1. Run: npm run build (both client and server)
   ↓
2. Client output: dist/ folder with:
   - index.html (entry point)
   - Bundled JS/CSS (minified)
   - Asset references
   ↓
3. Server output: dist/ folder with:
   - Compiled JavaScript
   - Server logic
   ↓
4. Deploy to hosting:
   - Client → Static hosting (Vercel, Netlify, S3)
   - Server → Node.js hosting (EC2, Heroku, DigitalOcean)
   ↓
5. User visits URL → Same instant menu flow
```

---

## Troubleshooting Start Issues

### Problem: "Cannot find module 'vite'"

**Solution:**
```bash
cd client
rm -rf node_modules package-lock.json
npm install
```

### Problem: "Port 3000 already in use"

**Solution:**
```bash
# Find process using port 3000
lsof -ti:3000

# Kill process
kill -9 $(lsof -ti:3000)

# Or change port in vite.config.ts
```

### Problem: "Port 8080 already in use"

**Solution:**
```bash
# Find and kill process
lsof -ti:8080
kill -9 $(lsof -ti:8080)

# Or change port in server/src/server.ts
```

### Problem: "Assets not loading"

**Solution:**
```bash
# Check asset symlink
ls -la client/public/extracted_assets

# If missing, create it
cd client/public
ln -sf ../../extracted_assets .
```

### Problem: "Menu not appearing"

**Diagnosis:**
1. Check browser console for errors
2. Verify GameMenu.ts is imported in main.ts
3. Check if menu container is in DOM

**Solution:**
```bash
# Rebuild and clear cache
cd client
rm -rf dist node_modules/.vite
npm run build
```

---

## Performance Optimization

### Development Mode
- Hot module replacement (HMR) enabled
- Source maps for debugging
- Fast refresh for React components
- No minification (faster builds)

### Production Mode
- Code splitting for optimal loading
- Minification with Terser
- Tree shaking to remove unused code
- Asset optimization
- Gzip compression

---

## Monitoring During Development

### Check Game Status
```bash
./launch-game.sh status
```

### View Logs
```bash
# Client logs (Vite)
# Displayed in terminal where you ran npm run dev

# Server logs
# Displayed in server terminal
# Or check /tmp/server.log if using launch script
```

### Performance Monitoring
```bash
# Open browser DevTools
# - Network tab: Check asset loading
# - Performance tab: Check FPS and timing
# - Console: Check for errors
```

---

## Additional Resources

- **DEPLOYMENT_GUIDE.md** - Full production deployment options
- **QUICK_START.md** - Getting started guide
- **AUTONOMOUS_DEVELOPMENT_GUIDE.md** - Development principles
- **TECHNICAL_GUIDE.md** - Architecture details

---

## Support

If you encounter issues not covered here:
1. Check the console for error messages
2. Review the TROUBLESHOOTING.md file
3. Check GitHub Issues
4. Create a new issue with details

---

**Last Updated:** 2025-11-02
**Version:** 1.1.0 (With optimized menu flow)
