# 🔧 Troubleshooting Guide - Game Not Working

## Quick Fix (Run This First!)

```bash
./quick-fix.sh
```

This script will:
1. Install all dependencies
2. Build the game
3. Start both server and client

---

## Common Issues & Solutions

### 1. ❌ Game Not Launching from Terminal

**Symptom**: When you run `npm run dev` nothing happens or you get errors.

**Solution**:
```bash
# Step 1: Install dependencies
cd client
npm install

cd ../server
npm install

# Step 2: Use the launcher script
cd ..
./launch-game.sh dev
```

**Alternative**:
```bash
# Manual launch
# Terminal 1 - Start server:
cd server
npm run dev

# Terminal 2 - Start client:
cd client  
npm run dev

# Then open http://localhost:3000 in your browser
```

---

### 2. 🎮 Game Not Rendering / Black Screen

**Symptom**: Browser shows black screen or game doesn't render.

**Causes & Solutions**:

#### A) WebGL Not Supported
**Check**: Open browser console (F12) and look for WebGL errors

**Solution**:
- Use a modern browser (Chrome, Firefox, Edge)
- Update your graphics drivers
- Enable hardware acceleration in browser settings

#### B) Canvas Not Created
**Check**: Look in console for "Canvas not found" errors

**Solution**: Fixed in latest code - canvas is now auto-created

#### C) Assets Not Loading
**Check**: Look for 404 errors in Network tab (F12)

**Solution**:
```bash
# Make sure you're running from project root
cd /path/to/web-game
./launch-game.sh dev
```

#### D) Three.js Errors
**Check**: Console shows Three.js related errors

**Solution**:
```bash
# Reinstall dependencies
cd client
rm -rf node_modules package-lock.json
npm install
npm run dev
```

---

### 3. 🐛 Game Features Not Working

**Symptom**: Specific game features broken or not responding.

**Solutions**:

#### Check Browser Console
1. Press F12 to open Developer Tools
2. Go to Console tab
3. Look for error messages
4. Report the specific error for targeted fix

#### Common Feature Issues:

**Movement not working**:
- Click on the game canvas first (to capture focus)
- Check that WASD keys aren't blocked by browser

**No sound**:
- Check browser didn't block autoplay
- Click on the game once to enable audio
- Check volume settings

**Poor performance/laggy**:
- Lower graphics settings (if available)
- Close other browser tabs
- Check Performance Guide: `PERFORMANCE_GUIDE.md`

---

### 4. 📦 Dependencies Missing

**Symptom**: "Module not found" or "Cannot find package" errors

**Solution**:
```bash
# Clean install everything
cd client
rm -rf node_modules package-lock.json
npm install

cd ../server
rm -rf node_modules package-lock.json
npm install

# Try again
cd ..
./launch-game.sh dev
```

---

### 5. 🔌 Port Already in Use

**Symptom**: "Port 3000/8080 already in use" error

**Solution**:
```bash
# Find and kill processes using ports
lsof -ti:3000 | xargs kill -9
lsof -ti:8080 | xargs kill -9

# Or use different ports
# Edit client/vite.config.ts and server/src/server.ts
```

---

### 6. 🏗️ Build Errors

**Symptom**: `npm run build` fails with TypeScript errors

**Solution**:
```bash
# TypeScript errors in test files are okay
# They don't affect the game running

# To build anyway:
cd client
npm run build -- --mode production

# Check if dist folder was created
ls -la dist/
```

---

## 🚀 Launch Methods

### Method 1: Quick Launch (Recommended)
```bash
./quick-fix.sh
```

### Method 2: Using Launcher Script
```bash
./launch-game.sh dev
```

### Method 3: Manual Launch
```bash
# Terminal 1:
cd server && npm run dev

# Terminal 2:
cd client && npm run dev

# Open: http://localhost:3000
```

### Method 4: Production Build
```bash
./launch-game.sh build
./launch-game.sh prod
```

---

## 🔍 Debugging Steps

### 1. Check if dependencies are installed
```bash
ls client/node_modules | wc -l
ls server/node_modules | wc -l
# Should show hundreds of packages
```

### 2. Verify builds work
```bash
cd client
npm run build
# Should create dist/ folder

cd ../server
npm run build
# Should create dist/ folder
```

### 3. Check for port conflicts
```bash
netstat -an | grep 3000
netstat -an | grep 8080
```

### 4. Test in different browser
- Try Chrome, Firefox, Edge
- Use incognito/private mode
- Disable browser extensions

### 5. Check system requirements
- Node.js 18+ installed: `node --version`
- NPM installed: `npm --version`
- Git installed: `git --version`

---

## 🎯 Expected Behavior

When working correctly, you should see:

### In Terminal:
```
=================================================
   FANTASY SURVIVAL MMO - FULL GAME LAUNCH
=================================================

Systems: 39 Production-Ready Game Systems
Assets: 4,885 Real 3D Models & Textures

[Main] Creating game engine...
[GameEngine] Initializing...
[Main] Initializing all game systems...
[Main] Starting game loop...

=================================================
   ✓ GAME STARTED SUCCESSFULLY!
=================================================
```

### In Browser:
- 3D rendered world
- Sky/skybox visible
- Ground/terrain visible
- Character (if spawned)
- Can move camera with mouse
- Can move with WASD

### Browser Console (F12):
- Multiple system initialization messages
- No red error messages
- FPS counter (if debug enabled)

---

## 📊 System Status Check

Run this to check game status:
```bash
./check-game-status.sh
```

This will show:
- ✓ What's working
- ⚠ What needs attention
- ✗ What's broken

---

## 🆘 Still Not Working?

### Gather Debug Info:
```bash
# 1. Check Node version
node --version

# 2. Check NPM version
npm --version

# 3. Try clean build
cd client
rm -rf node_modules dist package-lock.json
npm install
npm run build 2>&1 | tee build.log

# 4. Check browser console
# Press F12, copy all errors

# 5. Check if assets exist
ls -la extracted_assets/
```

### Create Issue Report:
Include:
1. Operating system
2. Node.js version
3. Browser and version
4. Error messages from console
5. Steps you've tried
6. Output from `./check-game-status.sh`

---

## 📝 Quick Reference

| Problem | Command |
|---------|---------|
| Install everything | `./quick-fix.sh` |
| Start game | `./launch-game.sh dev` |
| Check status | `./check-game-status.sh` |
| Clean install | `rm -rf */node_modules && npm install` |
| Build for production | `./launch-game.sh build` |
| Kill stuck processes | `pkill -f node` |

---

## ✅ Verification Checklist

Before reporting issues, verify:

- [ ] Node.js 18+ installed
- [ ] Dependencies installed (`node_modules` exist)
- [ ] No port conflicts (3000, 8080 free)
- [ ] Browser supports WebGL
- [ ] Running from project root directory
- [ ] Checked browser console for errors
- [ ] Tried different browser
- [ ] Tried clean install

---

**Last Updated**: 2025-11-01  
**Game Version**: 1.0.0  
**Support**: See DEBUGGING_GUIDE.md for more details
