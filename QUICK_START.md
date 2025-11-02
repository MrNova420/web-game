# Quick Start Guide
## Getting Started with Fantasy Survival MMO

This guide will help you get started with the Fantasy Survival MMO web game. The game now features an optimized startup flow with instant menu display and background asset preloading.

---

## Prerequisites

### Required Software
- **Node.js** (v18 or higher) - [Download](https://nodejs.org/)
- **npm** or **yarn** - Comes with Node.js
- **Git** - [Download](https://git-scm.com/)
- **Code Editor** - VS Code recommended

### Recommended VS Code Extensions
- ESLint
- Prettier
- TypeScript and JavaScript Language Features
- GitLens
- Three.js Snippets (if using Three.js)

---

## Initial Setup

### 1. Clone the Repository
```bash
git clone https://github.com/MrNova420/web-game.git
cd web-game
```

### 2. Quick Start with Launch Script (Recommended)
```bash
# Start in development mode (default)
./launch-game.sh

# Or specify mode explicitly
./launch-game.sh dev     # Development mode
./launch-game.sh prod    # Production mode
./launch-game.sh test    # Run tests
./launch-game.sh build   # Build for production
./launch-game.sh status  # Check game status
```

The launch script will:
- Check dependencies and install if needed
- Setup asset symlinks automatically
- Start both client and server
- Display URLs and status

### 3. Manual Start (Alternative)
If you prefer to start services manually:

**Client (Frontend with Menu):**
```bash
cd client
npm install
npm run dev
# Opens at http://localhost:3000
```

**Server (Backend API):**
```bash
cd server
npm install
npm run dev
# Runs at http://localhost:8080
```

### 4. Read the Documentation
Before starting development, read through:
- `DEVELOPMENT_ROADMAP.md` - Complete project roadmap
- `TECHNICAL_GUIDE.md` - Technical architecture and implementation details
- `PROGRESS_TRACKER.md` - Track your progress
- `DEPLOYMENT_GUIDE.md` - Production deployment options

---

## Project Initialization

### Step 1: Choose Your Tech Stack

**Option A: Three.js (Recommended for flexibility)**
```bash
# Create client directory
mkdir client
cd client

# Initialize project
npm init -y
npm install three @types/three
npm install -D vite typescript @types/node

# Install UI framework (React)
npm install react react-dom
npm install -D @types/react @types/react-dom @vitejs/plugin-react

# Install utilities
npm install socket.io-client simplex-noise
npm install -D @types/socket.io-client
```

**Option B: Babylon.js (Recommended for faster development)**
```bash
# Create client directory
mkdir client
cd client

# Initialize project
npm init -y
npm install @babylonjs/core @babylonjs/loaders

# Same UI and utilities as Option A
```

### Step 2: Set Up TypeScript
```bash
cd client

# Create tsconfig.json
cat > tsconfig.json << 'EOF'
{
  "compilerOptions": {
    "target": "ESNext",
    "module": "ESNext",
    "lib": ["ESNext", "DOM"],
    "moduleResolution": "node",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "jsx": "react-jsx",
    "outDir": "./dist",
    "rootDir": "./src"
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
EOF
```

### Step 3: Set Up Vite
```bash
# Create vite.config.ts
cat > vite.config.ts << 'EOF'
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      '/api': 'http://localhost:8080',
      '/socket.io': {
        target: 'http://localhost:8080',
        ws: true
      }
    }
  },
  build: {
    target: 'esnext',
    minify: 'terser'
  }
});
EOF
```

### Step 4: Create Basic Project Structure
```bash
# Create directories
mkdir -p src/{core,world,entities,systems,ui,assets,utils,config}
mkdir -p public

# Create entry point
cat > src/main.ts << 'EOF'
import './style.css';

console.log('Web Game Starting...');

// Initialize your game here
EOF

# Create HTML file
cat > index.html << 'EOF'
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Fantasy Survival MMO</title>
</head>
<body>
  <div id="app"></div>
  <canvas id="game-canvas"></canvas>
  <script type="module" src="/src/main.ts"></script>
</body>
</html>
EOF

# Add scripts to package.json
npm pkg set scripts.dev="vite"
npm pkg set scripts.build="vite build"
npm pkg set scripts.preview="vite preview"
```

### Step 5: Set Up Server (Backend)
```bash
cd ..
mkdir server
cd server

# Initialize server project
npm init -y
npm install express socket.io cors dotenv
npm install -D typescript @types/express @types/node @types/socket.io ts-node nodemon

# Create tsconfig.json
cat > tsconfig.json << 'EOF'
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
EOF

# Create basic server
mkdir src
cat > src/server.ts << 'EOF'
import express from 'express';
import { Server } from 'socket.io';
import http from 'http';
import cors from 'cors';

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*' }
});

io.on('connection', (socket) => {
  console.log('Player connected:', socket.id);

  socket.on('disconnect', () => {
    console.log('Player disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 8080;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
EOF

# Add scripts
npm pkg set scripts.dev="nodemon --exec ts-node src/server.ts"
npm pkg set scripts.build="tsc"
npm pkg set scripts.start="node dist/server.js"
```

---

## First Development Session

### Goal: Create a Basic 3D Scene

#### Step 1: Create the Engine Class
```typescript
// client/src/core/Engine.ts
import * as THREE from 'three';

export class Engine {
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private renderer: THREE.WebGLRenderer;
  private clock: THREE.Clock;

  constructor(canvas: HTMLCanvasElement) {
    // Scene
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x87ceeb);

    // Camera
    this.camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    this.camera.position.set(0, 5, 10);
    this.camera.lookAt(0, 0, 0);

    // Renderer
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(window.devicePixelRatio);

    // Clock
    this.clock = new THREE.Clock();

    // Resize handler
    window.addEventListener('resize', () => this.onResize());

    // Add basic lighting
    this.setupLighting();

    // Add test objects
    this.addTestObjects();
  }

  private setupLighting() {
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    this.scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(5, 10, 5);
    this.scene.add(directionalLight);
  }

  private addTestObjects() {
    // Ground plane
    const groundGeometry = new THREE.PlaneGeometry(100, 100);
    const groundMaterial = new THREE.MeshStandardMaterial({ color: 0x3a9d23 });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    this.scene.add(ground);

    // Test cube
    const cubeGeometry = new THREE.BoxGeometry(2, 2, 2);
    const cubeMaterial = new THREE.MeshStandardMaterial({ color: 0xff0000 });
    const cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
    cube.position.y = 1;
    this.scene.add(cube);
  }

  private onResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  public start() {
    this.animate();
  }

  private animate = () => {
    requestAnimationFrame(this.animate);

    const deltaTime = this.clock.getDelta();
    this.update(deltaTime);
    this.render();
  };

  private update(deltaTime: number) {
    // Update game logic here
  }

  private render() {
    this.renderer.render(this.scene, this.camera);
  }

  public getScene() {
    return this.scene;
  }

  public getCamera() {
    return this.camera;
  }
}
```

#### Step 2: Update main.ts
```typescript
// client/src/main.ts
import { Engine } from './core/Engine';

const canvas = document.getElementById('game-canvas') as HTMLCanvasElement;

if (canvas) {
  const engine = new Engine(canvas);
  engine.start();
  console.log('Game engine started!');
} else {
  console.error('Canvas not found!');
}
```

#### Step 3: Add Basic Styles
```css
/* client/src/style.css */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: Arial, sans-serif;
  overflow: hidden;
}

#game-canvas {
  display: block;
  width: 100vw;
  height: 100vh;
}
```

#### Step 4: Run the Project
```bash
# Terminal 1 - Start client
cd client
npm run dev

# Terminal 2 - Start server
cd server
npm run dev
```

Open browser to `http://localhost:3000` - You should see a green ground plane with a red cube!

---

## Daily Development Workflow

### 1. Plan Your Day
- Check `PROGRESS_TRACKER.md` for current tasks
- Pick 1-3 tasks from the current phase
- Review technical requirements in `TECHNICAL_GUIDE.md`

### 2. Develop
```bash
# Create feature branch
git checkout -b feature/task-name

# Start development servers
npm run dev (in client and server)

# Make changes, test frequently
```

### 3. Test
- Test in browser
- Check console for errors
- Verify performance (FPS)
- Test with multiple browser tabs (multiplayer)

### 4. Commit
```bash
git add .
git commit -m "feat: describe what you did"
git push origin feature/task-name
```

### 5. Update Progress
- Update `PROGRESS_TRACKER.md` with completed tasks
- Mark items as ✓ Complete
- Add any notes or blockers

---

## Asset Loading Example

### Loading a Model from extracted_assets
```typescript
// client/src/assets/AssetLoader.ts
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader';

export class AssetLoader {
  private gltfLoader = new GLTFLoader();
  private objLoader = new OBJLoader();

  async loadTree(): Promise<THREE.Object3D> {
    // Load from extracted_assets
    const path = '../extracted_assets/Stylized_Nature_MegaKit/OBJ/CommonTree_1.obj';
    const model = await this.objLoader.loadAsync(path);
    return model;
  }

  async loadCharacter(): Promise<THREE.Object3D> {
    const path = '../extracted_assets/Universal_Base_Characters/...';
    const gltf = await this.gltfLoader.loadAsync(path);
    return gltf.scene;
  }
}
```

---

## Debugging Tips

### Common Issues

**Issue: "Module not found"**
```bash
# Solution: Install the module
npm install [module-name]
```

**Issue: Black screen**
- Check browser console for errors
- Verify camera position
- Check lighting setup
- Verify canvas element exists

**Issue: Low FPS**
- Check number of draw calls
- Enable frustum culling
- Use instanced rendering for duplicates
- Reduce polygon count on models

**Issue: Assets not loading**
- Check file paths (use relative paths)
- Verify CORS settings
- Check browser network tab
- Verify asset files exist

### Performance Monitoring
```typescript
// Add to Engine class
const stats = new Stats();
document.body.appendChild(stats.dom);

// In animate loop
stats.update();
```

---

## Next Steps After Setup

1. **Week 1**: Complete Phase 1.1 (Project Infrastructure) ✓
2. **Week 1**: Start Phase 1.2 (Core Engine & Rendering)
3. **Week 2**: Begin terrain generation system
4. **Week 2**: Implement chunk loading
5. **Week 3**: Add biome system
6. **Week 3**: Start vegetation placement

---

## Getting Help

### Resources
- **Three.js Docs**: https://threejs.org/docs/
- **Babylon.js Docs**: https://doc.babylonjs.com/
- **Socket.io Docs**: https://socket.io/docs/
- **TypeScript Handbook**: https://www.typescriptlang.org/docs/

### Ask Questions
- Review `TECHNICAL_GUIDE.md` for implementation details
- Check `DEVELOPMENT_ROADMAP.md` for feature specifications
- Google specific errors
- Check Stack Overflow

---

## Summary Checklist

Setup complete when you can check all these boxes:

- [ ] Node.js and npm installed
- [ ] Repository cloned
- [ ] Client directory created with Vite + TypeScript
- [ ] Server directory created with Express + Socket.io
- [ ] Basic 3D scene renders in browser
- [ ] Development servers run without errors
- [ ] Can load and display a test model
- [ ] Git workflow understood
- [ ] Documentation read (Roadmap, Technical Guide, Progress Tracker)

**Once complete, you're ready to start Phase 1.1 of the roadmap!**

---

**Last Updated**: 2025-11-01  
**Version**: 1.0
