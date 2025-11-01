# Technical Architecture & Implementation Guide
## Fantasy Survival MMO Web Game

---

## Project Structure

```
web-game/
├── extracted_assets/          # All game assets (read-only)
│   ├── Universal_Base_Characters/
│   ├── Universal_Animation_Library/
│   ├── KayKit_Adventurers/
│   ├── KayKit_Skeletons/
│   ├── Stylized_Nature_MegaKit/
│   ├── Medieval_Village_MegaKit/
│   ├── KayKit_DungeonRemastered/
│   ├── KayKit_Dungeon_Pack/
│   ├── Fantasy_Props_MegaKit/
│   ├── Fantasy_RPG_Music/
│   ├── EverythingLibrary_Animals/
│   ├── Skyboxes/
│   └── mega-all-in-one-world-builder-kit/
│
├── client/                    # Frontend application
│   ├── src/
│   │   ├── core/             # Core engine systems
│   │   │   ├── Engine.ts     # Main engine class
│   │   │   ├── Renderer.ts   # Rendering system
│   │   │   ├── Scene.ts      # Scene management
│   │   │   └── Camera.ts     # Camera controller
│   │   │
│   │   ├── world/            # World systems
│   │   │   ├── TerrainGenerator.ts
│   │   │   ├── ChunkManager.ts
│   │   │   ├── BiomeSystem.ts
│   │   │   ├── VegetationPlacer.ts
│   │   │   └── WeatherSystem.ts
│   │   │
│   │   ├── entities/         # Game entities
│   │   │   ├── Player.ts
│   │   │   ├── NPC.ts
│   │   │   ├── Enemy.ts
│   │   │   └── Entity.ts (base class)
│   │   │
│   │   ├── systems/          # Game systems
│   │   │   ├── AnimationSystem.ts
│   │   │   ├── PhysicsSystem.ts
│   │   │   ├── CombatSystem.ts
│   │   │   ├── InventorySystem.ts
│   │   │   ├── CraftingSystem.ts
│   │   │   └── QuestSystem.ts
│   │   │
│   │   ├── multiplayer/      # Networking
│   │   │   ├── NetworkManager.ts
│   │   │   ├── EntitySync.ts
│   │   │   └── Interpolation.ts
│   │   │
│   │   ├── ui/               # User interface
│   │   │   ├── components/   # React/Vue components
│   │   │   ├── HUD.tsx
│   │   │   ├── Inventory.tsx
│   │   │   ├── MainMenu.tsx
│   │   │   └── styles/
│   │   │
│   │   ├── assets/           # Asset management
│   │   │   ├── AssetLoader.ts
│   │   │   ├── AssetManager.ts
│   │   │   ├── ModelCache.ts
│   │   │   └── TextureCache.ts
│   │   │
│   │   ├── utils/            # Utilities
│   │   │   ├── Math.ts
│   │   │   ├── Noise.ts
│   │   │   ├── Pathfinding.ts
│   │   │   └── EventEmitter.ts
│   │   │
│   │   ├── config/           # Configuration
│   │   │   ├── gameConfig.ts
│   │   │   ├── biomes.json
│   │   │   ├── items.json
│   │   │   └── recipes.json
│   │   │
│   │   └── main.ts           # Entry point
│   │
│   ├── public/
│   │   ├── index.html
│   │   └── favicon.ico
│   │
│   ├── package.json
│   ├── tsconfig.json
│   ├── vite.config.ts
│   └── README.md
│
├── server/                    # Backend server
│   ├── src/
│   │   ├── server.ts         # Main server
│   │   ├── GameServer.ts     # Game server logic
│   │   ├── WorldManager.ts   # World state management
│   │   ├── PlayerManager.ts  # Player management
│   │   ├── EntityManager.ts  # Entity synchronization
│   │   ├── Database.ts       # Database interface
│   │   ├── Auth.ts           # Authentication
│   │   └── utils/
│   │
│   ├── package.json
│   └── tsconfig.json
│
├── shared/                    # Shared code (client + server)
│   ├── types/                # TypeScript types
│   │   ├── Entity.ts
│   │   ├── Item.ts
│   │   ├── Packet.ts
│   │   └── World.ts
│   │
│   ├── constants/            # Shared constants
│   │   ├── GameConstants.ts
│   │   └── NetworkConstants.ts
│   │
│   └── utils/                # Shared utilities
│       └── Vector3.ts
│
├── tools/                     # Development tools
│   ├── asset-optimizer/      # Asset optimization scripts
│   ├── map-editor/           # Visual map editor (optional)
│   └── data-generator/       # Generate game data
│
├── docs/                      # Documentation
│   ├── API.md
│   ├── ARCHITECTURE.md
│   └── DEPLOYMENT.md
│
├── tests/                     # Tests
│   ├── unit/
│   ├── integration/
│   └── e2e/
│
├── .gitignore
├── .env.example
├── package.json              # Root package.json (monorepo)
├── DEVELOPMENT_ROADMAP.md
├── PROGRESS_TRACKER.md
├── TECHNICAL_GUIDE.md
└── README.md
```

---

## Technology Stack

### Frontend (Client)

#### Core 3D Engine
**Recommended: Three.js**
- Pros: Lightweight, excellent documentation, large community
- Cons: More manual setup required
- Use Case: Best for custom rendering pipelines

**Alternative: Babylon.js**
- Pros: Game-focused, built-in features, TypeScript native
- Cons: Larger bundle size
- Use Case: Faster development, more built-in game features

**Decision Factors**:
- Three.js: If team has WebGL experience, wants fine control
- Babylon.js: If team wants rapid development, built-in game features

#### Build System
**Vite** (Recommended)
```javascript
// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    target: 'esnext',
    minify: 'terser',
    rollupOptions: {
      output: {
        manualChunks: {
          'three': ['three'],
          'react-vendor': ['react', 'react-dom'],
          'game-core': ['./src/core/**'],
        }
      }
    }
  },
  server: {
    port: 3000,
    proxy: {
      '/api': 'http://localhost:8080',
      '/socket.io': {
        target: 'http://localhost:8080',
        ws: true
      }
    }
  }
});
```

#### Language
**TypeScript**
- Strong typing prevents bugs
- Better IDE support
- Essential for large codebase

#### UI Framework
**React** (Recommended) or **Vue.js**
```tsx
// React example for HUD
import React from 'react';
import { useGameState } from './hooks/useGameState';

export const HUD: React.FC = () => {
  const { health, stamina, mana } = useGameState();
  
  return (
    <div className="hud">
      <HealthBar value={health} max={100} />
      <StaminaBar value={stamina} max={100} />
      <ManaBar value={mana} max={100} />
    </div>
  );
};
```

#### State Management
- **Zustand** (lightweight) or **Redux** (more structure)

#### Physics Engine
- **Cannon.js** (JavaScript physics)
- **Ammo.js** (Bullet physics, more accurate)

---

### Backend (Server)

#### Server Runtime
**Node.js with Express**
```typescript
// server.ts
import express from 'express';
import { Server } from 'socket.io';
import http from 'http';

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*' }
});

io.on('connection', (socket) => {
  console.log('Player connected:', socket.id);
  
  socket.on('player:move', (data) => {
    // Validate and broadcast movement
  });
});

server.listen(8080);
```

#### Real-time Communication
**Socket.io** (Recommended)
- Easy WebSocket management
- Automatic fallback to polling
- Room-based broadcasting

**Alternative: WebRTC**
- Lower latency
- Peer-to-peer option
- More complex setup

#### Database
**PostgreSQL** (Primary database)
```sql
-- Player table schema
CREATE TABLE players (
  id SERIAL PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  last_login TIMESTAMP,
  level INTEGER DEFAULT 1,
  experience INTEGER DEFAULT 0,
  position_x FLOAT DEFAULT 0,
  position_y FLOAT DEFAULT 0,
  position_z FLOAT DEFAULT 0
);

CREATE TABLE inventory (
  id SERIAL PRIMARY KEY,
  player_id INTEGER REFERENCES players(id),
  item_id VARCHAR(50) NOT NULL,
  quantity INTEGER DEFAULT 1,
  slot INTEGER
);
```

**Redis** (Caching & Session)
```typescript
import Redis from 'ioredis';

const redis = new Redis();

// Cache player data
await redis.setex(`player:${playerId}`, 3600, JSON.stringify(playerData));

// Get cached data
const cached = await redis.get(`player:${playerId}`);
```

#### Authentication
**JWT (JSON Web Tokens)**
```typescript
import jwt from 'jsonwebtoken';

function generateToken(userId: string) {
  return jwt.sign(
    { userId, type: 'access' },
    process.env.JWT_SECRET!,
    { expiresIn: '24h' }
  );
}

function verifyToken(token: string) {
  return jwt.verify(token, process.env.JWT_SECRET!);
}
```

---

## Core Systems Implementation

### 1. Asset Loading System

```typescript
// AssetLoader.ts
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader';

export class AssetLoader {
  private gltfLoader = new GLTFLoader();
  private objLoader = new OBJLoader();
  private textureLoader = new THREE.TextureLoader();
  private cache = new Map<string, any>();

  async loadModel(path: string): Promise<THREE.Object3D> {
    if (this.cache.has(path)) {
      return this.cache.get(path).clone();
    }

    const extension = path.split('.').pop()?.toLowerCase();
    let model: THREE.Object3D;

    if (extension === 'gltf' || extension === 'glb') {
      const gltf = await this.gltfLoader.loadAsync(path);
      model = gltf.scene;
    } else if (extension === 'obj') {
      model = await this.objLoader.loadAsync(path);
    } else {
      throw new Error(`Unsupported format: ${extension}`);
    }

    this.cache.set(path, model);
    return model.clone();
  }

  async loadTexture(path: string): Promise<THREE.Texture> {
    if (this.cache.has(path)) {
      return this.cache.get(path);
    }

    const texture = await this.textureLoader.loadAsync(path);
    this.cache.set(path, texture);
    return texture;
  }

  preloadAssets(paths: string[]): Promise<void[]> {
    return Promise.all(paths.map(path => this.loadModel(path)));
  }
}
```

### 2. Terrain Generation

```typescript
// TerrainGenerator.ts
import * as THREE from 'three';
import { SimplexNoise } from 'simplex-noise';

export class TerrainGenerator {
  private noise: SimplexNoise;
  private chunkSize = 64;
  private heightScale = 20;

  constructor(seed: number = Date.now()) {
    this.noise = new SimplexNoise(seed);
  }

  generateChunk(chunkX: number, chunkZ: number): THREE.Mesh {
    const geometry = new THREE.PlaneGeometry(
      this.chunkSize,
      this.chunkSize,
      this.chunkSize - 1,
      this.chunkSize - 1
    );

    const vertices = geometry.attributes.position.array;

    for (let i = 0; i < vertices.length; i += 3) {
      const worldX = vertices[i] + chunkX * this.chunkSize;
      const worldZ = vertices[i + 1] + chunkZ * this.chunkSize;

      // Multi-octave noise for realistic terrain
      const height = this.getHeight(worldX, worldZ);
      vertices[i + 2] = height;
    }

    geometry.computeVertexNormals();
    geometry.rotateX(-Math.PI / 2);

    const material = new THREE.MeshStandardMaterial({
      color: 0x3a9d23,
      flatShading: false
    });

    return new THREE.Mesh(geometry, material);
  }

  private getHeight(x: number, z: number): number {
    let height = 0;
    let amplitude = this.heightScale;
    let frequency = 0.005;

    // Multiple octaves
    for (let i = 0; i < 4; i++) {
      height += this.noise.noise2D(x * frequency, z * frequency) * amplitude;
      amplitude *= 0.5;
      frequency *= 2;
    }

    return height;
  }

  getBiomeAt(x: number, z: number): string {
    const temperature = this.noise.noise2D(x * 0.001, z * 0.001);
    const moisture = this.noise.noise2D(x * 0.001 + 1000, z * 0.001 + 1000);

    if (temperature > 0.5) {
      return moisture > 0.2 ? 'forest' : 'desert';
    } else if (temperature > 0) {
      return moisture > 0.5 ? 'swamp' : 'plains';
    } else {
      return 'tundra';
    }
  }
}
```

### 3. Player Controller

```typescript
// Player.ts
import * as THREE from 'three';

export class Player {
  public mesh: THREE.Object3D;
  public position: THREE.Vector3;
  public velocity: THREE.Vector3;
  public rotation: THREE.Euler;
  
  private speed = 5;
  private jumpForce = 10;
  private gravity = -20;
  private isGrounded = false;

  constructor(model: THREE.Object3D) {
    this.mesh = model;
    this.position = new THREE.Vector3();
    this.velocity = new THREE.Vector3();
    this.rotation = new THREE.Euler();
  }

  update(deltaTime: number, input: InputState) {
    // Movement
    const moveDirection = new THREE.Vector3();
    
    if (input.forward) moveDirection.z -= 1;
    if (input.backward) moveDirection.z += 1;
    if (input.left) moveDirection.x -= 1;
    if (input.right) moveDirection.x += 1;

    moveDirection.normalize();
    moveDirection.applyEuler(this.rotation);
    
    this.velocity.x = moveDirection.x * this.speed;
    this.velocity.z = moveDirection.z * this.speed;

    // Jumping
    if (input.jump && this.isGrounded) {
      this.velocity.y = this.jumpForce;
      this.isGrounded = false;
    }

    // Gravity
    this.velocity.y += this.gravity * deltaTime;

    // Update position
    this.position.addScaledVector(this.velocity, deltaTime);

    // Ground check (simplified)
    if (this.position.y <= 0) {
      this.position.y = 0;
      this.velocity.y = 0;
      this.isGrounded = true;
    }

    // Update mesh
    this.mesh.position.copy(this.position);
    this.mesh.rotation.copy(this.rotation);
  }
}

interface InputState {
  forward: boolean;
  backward: boolean;
  left: boolean;
  right: boolean;
  jump: boolean;
}
```

### 4. Chunk Management

```typescript
// ChunkManager.ts
export class ChunkManager {
  private chunks = new Map<string, THREE.Mesh>();
  private renderDistance = 5; // chunks
  private terrainGenerator: TerrainGenerator;

  constructor(terrainGenerator: TerrainGenerator) {
    this.terrainGenerator = terrainGenerator;
  }

  update(playerPosition: THREE.Vector3, scene: THREE.Scene) {
    const chunkX = Math.floor(playerPosition.x / 64);
    const chunkZ = Math.floor(playerPosition.z / 64);

    // Load chunks around player
    for (let x = -this.renderDistance; x <= this.renderDistance; x++) {
      for (let z = -this.renderDistance; z <= this.renderDistance; z++) {
        const cx = chunkX + x;
        const cz = chunkZ + z;
        const key = `${cx},${cz}`;

        if (!this.chunks.has(key)) {
          const chunk = this.terrainGenerator.generateChunk(cx, cz);
          chunk.position.set(cx * 64, 0, cz * 64);
          scene.add(chunk);
          this.chunks.set(key, chunk);
        }
      }
    }

    // Unload distant chunks
    for (const [key, chunk] of this.chunks.entries()) {
      const [cx, cz] = key.split(',').map(Number);
      const distance = Math.max(
        Math.abs(cx - chunkX),
        Math.abs(cz - chunkZ)
      );

      if (distance > this.renderDistance + 1) {
        scene.remove(chunk);
        chunk.geometry.dispose();
        (chunk.material as THREE.Material).dispose();
        this.chunks.delete(key);
      }
    }
  }
}
```

### 5. Multiplayer Synchronization

```typescript
// NetworkManager.ts
import { io, Socket } from 'socket.io-client';

export class NetworkManager {
  private socket: Socket;
  private players = new Map<string, RemotePlayer>();

  constructor(serverUrl: string) {
    this.socket = io(serverUrl);
    this.setupListeners();
  }

  private setupListeners() {
    this.socket.on('player:joined', (data) => {
      console.log('Player joined:', data.id);
      // Create remote player
    });

    this.socket.on('player:left', (data) => {
      console.log('Player left:', data.id);
      // Remove remote player
    });

    this.socket.on('player:update', (data) => {
      // Update remote player position/state
      const player = this.players.get(data.id);
      if (player) {
        player.updateTarget(data.position, data.rotation);
      }
    });
  }

  sendPlayerUpdate(position: THREE.Vector3, rotation: THREE.Euler) {
    this.socket.emit('player:update', {
      position: { x: position.x, y: position.y, z: position.z },
      rotation: { x: rotation.x, y: rotation.y, z: rotation.z }
    });
  }
}
```

---

## Performance Optimization Strategies

### 1. Instanced Rendering
```typescript
// For grass, rocks, small objects
const geometry = new THREE.PlaneGeometry(0.5, 0.5);
const material = new THREE.MeshStandardMaterial({ map: grassTexture });
const instancedMesh = new THREE.InstancedMesh(geometry, material, 10000);

for (let i = 0; i < 10000; i++) {
  const matrix = new THREE.Matrix4();
  matrix.setPosition(
    Math.random() * 100,
    0,
    Math.random() * 100
  );
  instancedMesh.setMatrixAt(i, matrix);
}
```

### 2. Level of Detail (LOD)
```typescript
const lod = new THREE.LOD();
lod.addLevel(highDetailMesh, 0);
lod.addLevel(mediumDetailMesh, 50);
lod.addLevel(lowDetailMesh, 100);
scene.add(lod);
```

### 3. Texture Atlasing
```typescript
// Combine multiple textures into one atlas
// Reduces texture switching and draw calls
```

### 4. Frustum Culling
```typescript
// Automatically handled by Three.js
// Ensure proper bounding boxes on objects
mesh.geometry.computeBoundingBox();
```

### 5. Object Pooling
```typescript
class ObjectPool<T> {
  private available: T[] = [];
  private inUse = new Set<T>();

  constructor(
    private factory: () => T,
    private reset: (obj: T) => void,
    initialSize: number = 10
  ) {
    for (let i = 0; i < initialSize; i++) {
      this.available.push(this.factory());
    }
  }

  acquire(): T {
    let obj = this.available.pop();
    if (!obj) {
      obj = this.factory();
    }
    this.inUse.add(obj);
    return obj;
  }

  release(obj: T) {
    if (this.inUse.has(obj)) {
      this.inUse.delete(obj);
      this.reset(obj);
      this.available.push(obj);
    }
  }
}
```

---

## Asset Pipeline

### Loading Strategy
1. **Critical Assets** (load immediately): Player model, UI assets, skybox
2. **High Priority** (load during splash screen): Common terrain textures, essential models
3. **Lazy Load** (load as needed): Biome-specific assets, dungeon assets
4. **Streaming** (progressive): Music, ambient sounds

### Asset Optimization
```bash
# Texture optimization
pngquant --quality 65-80 input.png -o output.png
cwebp -q 80 input.png -o output.webp

# Model optimization
gltf-pipeline -i input.gltf -o output.glb -d
```

---

## Development Workflow

### Git Workflow
1. **main** branch: Production-ready code
2. **develop** branch: Integration branch
3. **feature/** branches: Individual features
4. **hotfix/** branches: Critical fixes

### Daily Workflow
```bash
# Start of day
git checkout develop
git pull origin develop
git checkout -b feature/terrain-generation

# Development
# ... make changes ...
git add .
git commit -m "feat: implement basic terrain generation"

# End of day
git push origin feature/terrain-generation
# Create pull request
```

### Testing Strategy
1. **Unit Tests**: Test individual systems
2. **Integration Tests**: Test system interactions
3. **Manual Playtesting**: Play through features
4. **Performance Testing**: Profile and optimize

---

## Deployment

### Development Server
```bash
# Client
cd client
npm run dev

# Server
cd server
npm run dev
```

### Production Build
```bash
# Client
cd client
npm run build
# Outputs to dist/

# Server
cd server
npm run build
# Outputs to dist/
```

### Hosting Options
1. **Client**: Vercel, Netlify, or CDN (Cloudflare)
2. **Server**: AWS EC2, DigitalOcean, Heroku
3. **Database**: AWS RDS, Digital Ocean Managed Database
4. **Assets**: AWS S3 + CloudFront

---

## Security Considerations

### Client-Side
- Never trust client input
- Validate all actions server-side
- Use HTTPS only
- Implement rate limiting

### Server-Side
```typescript
// Input validation
function validatePosition(pos: any): boolean {
  return (
    typeof pos.x === 'number' &&
    typeof pos.y === 'number' &&
    typeof pos.z === 'number' &&
    Math.abs(pos.x) < 10000 &&
    Math.abs(pos.y) < 1000 &&
    Math.abs(pos.z) < 10000
  );
}

// Rate limiting
const rateLimiter = rateLimit({
  windowMs: 1000,
  max: 100 // 100 requests per second
});
```

---

## Monitoring & Analytics

### Performance Metrics
```typescript
// Client FPS monitoring
let lastTime = performance.now();
let frames = 0;

function updateFPS() {
  frames++;
  const now = performance.now();
  
  if (now >= lastTime + 1000) {
    const fps = Math.round((frames * 1000) / (now - lastTime));
    console.log('FPS:', fps);
    frames = 0;
    lastTime = now;
  }
}
```

### Server Monitoring
- Use PM2 for process management
- Implement health check endpoints
- Log errors and performance metrics
- Use monitoring services (DataDog, New Relic)

---

## Next Steps

1. **Choose Tech Stack**: Decide between Three.js vs Babylon.js
2. **Set Up Project**: Initialize client and server directories
3. **Configure Build Tools**: Set up Vite, TypeScript, linting
4. **Create Base Classes**: Engine, Scene, Camera, Entity
5. **Implement Asset Loader**: Load models from extracted_assets
6. **Build Prototype**: Simple scene with player movement

---

**Document Version**: 1.0  
**Last Updated**: 2025-11-01  
**Status**: Ready for Implementation
