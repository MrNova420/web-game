# 🚀 Deployment Guide

## Quick Start - All Methods

This game supports multiple deployment methods. Choose the one that fits your needs:

### Method 1: Local Development (Recommended for testing)
```bash
# Install dependencies
cd client && npm install
cd ../server && npm install

# Run development servers
# Terminal 1 - Client
cd client
npm run dev

# Terminal 2 - Server
cd server
npm run dev
```

### Method 2: Production Build + Static Hosting
```bash
# Build client
cd client
npm install
npm run build

# Deploy dist/ folder to:
# - Vercel
# - Netlify  
# - GitHub Pages
# - AWS S3 + CloudFront
# - Any static hosting service
```

### Method 3: Full Stack with Node.js Server
```bash
# Build both client and server
cd client && npm install && npm run build
cd ../server && npm install && npm run build

# Start production server
cd server
npm start

# Server will serve built client files
```

### Method 4: Docker Deployment
```bash
# Build Docker image
docker build -t web-game .

# Run container
docker run -p 3000:3000 -p 8080:8080 web-game
```

### Method 5: GitHub Actions CI/CD
```bash
# Already configured in .github/workflows/test.yml
# Automatically runs on push to main/develop
# - Tests client & server
# - Builds artifacts
# - Runs security audits
# - Performance tests
```

## Detailed Instructions

### Prerequisites

**Required:**
- Node.js 18.x or higher
- npm 9.x or higher

**Optional:**
- Docker (for containerized deployment)
- Git (for version control)

### Installation Steps

#### 1. Clone Repository
```bash
git clone https://github.com/MrNova420/web-game.git
cd web-game
```

#### 2. Install All Dependencies

**Client:**
```bash
cd client
npm install
```

This installs:
- three.js (3D rendering)
- React (UI framework)
- Vite (build tool)
- TypeScript (type safety)
- simplex-noise (terrain generation)
- socket.io-client (multiplayer)
- vitest (testing)

**Server:**
```bash
cd ../server
npm install
```

This installs:
- Express (web server)
- Socket.IO (WebSocket server)
- TypeScript
- CORS support

#### 3. Development Mode

**Client Development Server:**
```bash
cd client
npm run dev
```
- Runs on http://localhost:3000
- Hot module reload
- Source maps for debugging

**Server Development Server:**
```bash
cd server
npm run dev
```
- Runs on http://localhost:8080
- Auto-restart on file changes
- WebSocket support

#### 4. Production Build

**Build Client:**
```bash
cd client
npm run build
```

Output: `client/dist/` folder containing:
- Optimized JavaScript bundles
- Minified CSS
- HTML entry point
- Assets and textures

**Build Server:**
```bash
cd server
npm run build
```

Output: `server/dist/` folder containing:
- Compiled TypeScript to JavaScript
- Production-ready server code

#### 5. Production Deployment

**Option A: Static Hosting (Client Only)**

Deploy `client/dist/` to any static host:

**Vercel:**
```bash
cd client
npx vercel --prod
```

**Netlify:**
```bash
cd client
npx netlify deploy --prod --dir=dist
```

**GitHub Pages:**
```bash
cd client
npm run build
# Copy dist/ contents to gh-pages branch
```

**Option B: Node.js Server (Full Stack)**

```bash
# Start production server
cd server
npm start
```

Configure environment variables:
```bash
# server/.env
PORT=8080
NODE_ENV=production
CLIENT_URL=http://localhost:3000
```

**Option C: Docker**

Create `Dockerfile`:
```dockerfile
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY client/package*.json ./client/
COPY server/package*.json ./server/

# Install dependencies
RUN cd client && npm ci
RUN cd server && npm ci

# Copy source
COPY client ./client
COPY server ./server

# Build
RUN cd client && npm run build
RUN cd server && npm run build

# Expose ports
EXPOSE 3000 8080

# Start servers
CMD ["npm", "start"]
```

Build and run:
```bash
docker build -t web-game .
docker run -p 3000:3000 -p 8080:8080 web-game
```

## Environment Variables

### Client (.env)
```bash
VITE_API_URL=http://localhost:8080
VITE_WS_URL=ws://localhost:8080
```

### Server (.env)
```bash
PORT=8080
NODE_ENV=production
CORS_ORIGIN=http://localhost:3000
```

## Available Scripts

### Client Scripts
```bash
npm run dev          # Development server
npm run build        # Production build
npm run preview      # Preview production build
npm run lint         # Run ESLint
npm run lint:fix     # Fix ESLint errors
npm run type-check   # TypeScript type checking
npm run test         # Run tests
npm run test:ui      # Run tests with UI
npm run test:run     # Run tests once
npm run test:coverage # Generate coverage report
```

### Server Scripts
```bash
npm run dev          # Development server with auto-reload
npm run build        # Compile TypeScript
npm start            # Start production server
npm run lint         # Run ESLint
npm run lint:fix     # Fix ESLint errors
npm run type-check   # TypeScript type checking
npm run test         # Run tests
npm run test:run     # Run tests once
npm run test:coverage # Generate coverage report
```

## Troubleshooting

### Issue: `npm install` fails

**Solution:**
```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and package-lock.json
rm -rf node_modules package-lock.json

# Reinstall
npm install
```

### Issue: Build fails with "Cannot find module 'vite'"

**Solution:**
```bash
cd client
npm install
npm run build
```

### Issue: TypeScript errors

**Solution:**
```bash
# Check types
npm run type-check

# Rebuild
npm run build
```

### Issue: Port already in use

**Solution:**
```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill

# Kill process on port 8080
lsof -ti:8080 | xargs kill
```

### Issue: WebGL not working

The game now includes **CPU rendering fallback**:
- Automatically detects WebGL support
- Falls back to CPU rendering if GPU instancing unavailable
- Works on all devices and browsers

## Performance Optimization

### GPU Instancing (Default)
- Loads each model once
- Renders many copies with single draw call
- 99% reduction in draw calls
- Works on devices with WebGL support

### CPU Rendering (Fallback)
- Loads each model once
- Clones meshes for each copy
- Compatible with all devices
- Slightly lower performance but universal

### Mobile Optimization
- Touch controls automatically enabled on mobile
- Virtual joystick for movement
- Touch drag for camera
- Responsive UI

## CI/CD Pipeline

GitHub Actions automatically:
1. Runs tests on every push
2. Checks code quality
3. Audits dependencies for security
4. Builds production bundles
5. Runs performance tests
6. Generates artifacts

View workflow: `.github/workflows/test.yml`

## Monitoring

### Development
- Check browser console for errors
- Use React DevTools
- Use Three.js Inspector

### Production
- Monitor server logs
- Track API response times
- Monitor WebSocket connections
- Check error rates

## Support

- **Issues**: https://github.com/MrNova420/web-game/issues
- **Documentation**: See AUTONOMOUS_DEVELOPMENT_GUIDE.md
- **Technical Guide**: See TECHNICAL_GUIDE.md
- **Instancing Guide**: See INSTANCING_FIX_SUMMARY.md

## License

See LICENSE file for details.
