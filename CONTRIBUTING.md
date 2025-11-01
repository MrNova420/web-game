# Development Guidelines & Best Practices

## Code Style & Standards

### TypeScript Guidelines

#### Naming Conventions
```typescript
// Classes: PascalCase
class TerrainGenerator {}
class PlayerController {}

// Interfaces: PascalCase with 'I' prefix (optional)
interface IEntity {}
interface PlayerData {}

// Variables and functions: camelCase
const playerHealth = 100;
function calculateDamage() {}

// Constants: UPPER_SNAKE_CASE
const MAX_PLAYERS = 1000;
const DEFAULT_SPAWN_POINT = new Vector3(0, 0, 0);

// Private class members: prefix with underscore
class Player {
  private _health: number;
  private _inventory: Item[];
}
```

#### Type Safety
```typescript
// Always specify types
function movePlayer(position: Vector3, velocity: Vector3): void {
  // Implementation
}

// Use interfaces for object shapes
interface PlayerStats {
  health: number;
  stamina: number;
  mana: number;
}

// Avoid 'any' - use specific types or unknown
// Bad
function processData(data: any) {}

// Good
function processData(data: unknown) {
  if (typeof data === 'object' && data !== null) {
    // Safe to use
  }
}
```

#### Code Organization
```typescript
// Group related code
class Player {
  // Properties first
  private _position: Vector3;
  private _health: number;

  // Constructor
  constructor(position: Vector3) {
    this._position = position;
    this._health = 100;
  }

  // Public methods
  public move(direction: Vector3): void {}
  public takeDamage(amount: number): void {}

  // Private methods
  private updateAnimation(): void {}
  private checkCollision(): boolean {}

  // Getters/Setters last
  get health(): number { return this._health; }
  set health(value: number) { this._health = value; }
}
```

### File Organization

```
src/
├── core/           # Core engine code
├── world/          # World-related systems
├── entities/       # Game entities
├── systems/        # Game systems
├── ui/             # UI components
├── utils/          # Utility functions
└── config/         # Configuration files
```

#### File Naming
- Use kebab-case for files: `terrain-generator.ts`
- Match class name for single-class files: `Player.ts`
- Use index.ts for barrel exports

```typescript
// entities/index.ts
export { Player } from './Player';
export { Enemy } from './Enemy';
export { NPC } from './NPC';
```

### Comments & Documentation

#### When to Comment
```typescript
// Good: Explain WHY, not WHAT
// Using quadtree for spatial partitioning to reduce collision checks
const spatialHash = new QuadTree(bounds);

// Bad: Obvious comment
// Create a new player
const player = new Player();

// Good: Document complex algorithms
/**
 * Generates terrain using multi-octave Perlin noise.
 * Higher octaves add fine detail, lower octaves create large features.
 * 
 * @param x - World X coordinate
 * @param z - World Z coordinate
 * @returns Height value between -heightScale and +heightScale
 */
private getHeight(x: number, z: number): number {
  // Implementation
}
```

#### JSDoc for Public APIs
```typescript
/**
 * Loads a 3D model from the asset library.
 * 
 * @param path - Relative path to the model file
 * @param cache - Whether to cache the loaded model (default: true)
 * @returns Promise resolving to the loaded Object3D
 * @throws {Error} If the file format is not supported
 * 
 * @example
 * const tree = await assetLoader.loadModel(
 *   'extracted_assets/Nature/tree.obj'
 * );
 */
async loadModel(path: string, cache: boolean = true): Promise<Object3D> {
  // Implementation
}
```

---

## Performance Best Practices

### Rendering Optimization

#### Use Instanced Rendering
```typescript
// Bad: Individual meshes for each grass blade
for (let i = 0; i < 10000; i++) {
  const grass = new THREE.Mesh(grassGeometry, grassMaterial);
  scene.add(grass);
}

// Good: Instanced mesh
const instancedMesh = new THREE.InstancedMesh(
  grassGeometry,
  grassMaterial,
  10000
);
scene.add(instancedMesh);
```

#### Reuse Geometries and Materials
```typescript
// Bad: Create new geometry each time
function createTree() {
  const geometry = new THREE.CylinderGeometry(0.2, 0.2, 2);
  return new THREE.Mesh(geometry, material);
}

// Good: Reuse geometry
const treeGeometry = new THREE.CylinderGeometry(0.2, 0.2, 2);
function createTree() {
  return new THREE.Mesh(treeGeometry, sharedMaterial);
}
```

#### Implement Object Pooling
```typescript
class BulletPool {
  private pool: Bullet[] = [];
  
  acquire(): Bullet {
    return this.pool.pop() || new Bullet();
  }
  
  release(bullet: Bullet): void {
    bullet.reset();
    this.pool.push(bullet);
  }
}
```

### Memory Management

#### Dispose of Resources
```typescript
// Always dispose when removing objects
function removeEnemy(enemy: Enemy): void {
  scene.remove(enemy.mesh);
  
  // Dispose geometry
  enemy.mesh.geometry.dispose();
  
  // Dispose materials
  if (Array.isArray(enemy.mesh.material)) {
    enemy.mesh.material.forEach(m => m.dispose());
  } else {
    enemy.mesh.material.dispose();
  }
  
  // Dispose textures
  if (enemy.mesh.material.map) {
    enemy.mesh.material.map.dispose();
  }
}
```

#### Avoid Memory Leaks
```typescript
// Bad: Event listeners not cleaned up
class Player {
  constructor() {
    window.addEventListener('resize', this.onResize);
  }
}

// Good: Clean up in destroy method
class Player {
  constructor() {
    this.boundOnResize = this.onResize.bind(this);
    window.addEventListener('resize', this.boundOnResize);
  }
  
  destroy() {
    window.removeEventListener('resize', this.boundOnResize);
  }
}
```

---

## Networking Best Practices

### Minimize Network Traffic

#### Send Only Changes
```typescript
// Bad: Send full state every frame
socket.emit('player:update', {
  position: player.position,
  rotation: player.rotation,
  health: player.health,
  stamina: player.stamina,
  inventory: player.inventory
});

// Good: Send only what changed
if (player.positionChanged) {
  socket.emit('player:position', {
    x: player.position.x,
    y: player.position.y,
    z: player.position.z
  });
}
```

#### Use Binary Data for Efficiency
```typescript
// For high-frequency updates, use binary format
const buffer = new ArrayBuffer(12);
const view = new DataView(buffer);
view.setFloat32(0, position.x, true);
view.setFloat32(4, position.y, true);
view.setFloat32(8, position.z, true);
socket.emit('player:position', buffer);
```

### Client-Side Prediction
```typescript
class Player {
  update(input: Input, deltaTime: number) {
    // Apply movement immediately (prediction)
    this.position.add(this.velocity.multiplyScalar(deltaTime));
    
    // Send to server
    this.networkManager.sendInput(input);
  }
  
  // When server response arrives
  onServerUpdate(serverPosition: Vector3) {
    // Reconcile if there's a significant difference
    const error = this.position.distanceTo(serverPosition);
    if (error > 0.5) {
      // Smoothly interpolate to server position
      this.position.lerp(serverPosition, 0.1);
    }
  }
}
```

### Server Authority
```typescript
// Server validates all actions
socket.on('player:attack', (data) => {
  const player = players.get(socket.id);
  
  // Validate: Can player attack?
  if (!player.canAttack()) {
    return; // Ignore invalid action
  }
  
  // Validate: Is target in range?
  const target = entities.get(data.targetId);
  if (!player.isInRange(target)) {
    return; // Ignore out-of-range attack
  }
  
  // Process valid action
  const damage = player.calculateDamage();
  target.takeDamage(damage);
  
  // Broadcast result
  io.emit('entity:damaged', {
    targetId: data.targetId,
    damage: damage
  });
});
```

---

## Asset Management

### Loading Strategy

#### Prioritize Critical Assets
```typescript
// Load in stages
async function loadAssets() {
  // Stage 1: Critical (show loading screen immediately)
  await loadCriticalAssets([
    'ui/loading-spinner.png',
    'ui/fonts.ttf'
  ]);
  
  // Stage 2: Core gameplay (needed before game starts)
  await loadCoreAssets([
    'characters/player.glb',
    'terrain/grass-texture.png',
    'skybox.png'
  ]);
  
  // Stage 3: Environment (load while playing)
  loadEnvironmentAssets([
    'nature/trees.glb',
    'buildings/houses.glb'
  ]).then(() => {
    console.log('All assets loaded');
  });
}
```

#### Implement Progressive Loading
```typescript
class AssetManager {
  async loadBiomeAssets(biome: string) {
    // Load biome-specific assets only when player enters biome
    if (!this.biomeCache.has(biome)) {
      const assets = await this.loadBiomeAssetList(biome);
      this.biomeCache.set(biome, assets);
    }
  }
  
  unloadDistantBiomes(currentBiome: string) {
    for (const [biome, assets] of this.biomeCache) {
      if (this.getDistance(biome, currentBiome) > 2) {
        this.disposeAssets(assets);
        this.biomeCache.delete(biome);
      }
    }
  }
}
```

---

## Testing Guidelines

### Unit Testing
```typescript
// Test individual functions
describe('TerrainGenerator', () => {
  let generator: TerrainGenerator;
  
  beforeEach(() => {
    generator = new TerrainGenerator(12345); // Fixed seed
  });
  
  test('generates consistent height for same coordinates', () => {
    const height1 = generator.getHeight(10, 20);
    const height2 = generator.getHeight(10, 20);
    expect(height1).toBe(height2);
  });
  
  test('generates different heights for different coordinates', () => {
    const height1 = generator.getHeight(10, 20);
    const height2 = generator.getHeight(100, 200);
    expect(height1).not.toBe(height2);
  });
});
```

### Integration Testing
```typescript
// Test system interactions
describe('Combat System', () => {
  test('player can damage enemy', () => {
    const player = new Player();
    const enemy = new Enemy();
    const initialHealth = enemy.health;
    
    player.attack(enemy);
    
    expect(enemy.health).toBeLessThan(initialHealth);
  });
});
```

### Manual Testing Checklist
- [ ] Performance: 60 FPS in typical scenarios
- [ ] Memory: No leaks during extended play
- [ ] Multiplayer: Smooth synchronization
- [ ] UI: All buttons and menus work
- [ ] Assets: All models and textures load correctly
- [ ] Cross-browser: Works in Chrome, Firefox, Edge

---

## Git Workflow

### Branch Naming
```
feature/terrain-generation
feature/player-movement
fix/collision-bug
refactor/asset-loader
docs/update-readme
```

### Commit Messages
```
feat: add terrain generation system
fix: resolve player falling through floor
refactor: optimize chunk loading
docs: update API documentation
style: format code with prettier
test: add unit tests for combat system
perf: implement instanced rendering for grass
```

### Pull Request Template
```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Refactoring
- [ ] Documentation

## Testing
- [ ] Unit tests added/updated
- [ ] Manual testing completed
- [ ] Performance tested

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-reviewed code
- [ ] Commented complex code
- [ ] Updated documentation
- [ ] No new warnings
```

---

## Debugging Tips

### Performance Profiling
```typescript
// Use Performance API
const start = performance.now();
expensiveOperation();
const duration = performance.now() - start;
console.log(`Operation took ${duration}ms`);

// Profile specific sections
console.time('Terrain Generation');
generateTerrain();
console.timeEnd('Terrain Generation');
```

### Visual Debugging
```typescript
// Helper to visualize collision boxes
function debugDrawBoundingBox(mesh: THREE.Mesh) {
  const box = new THREE.BoxHelper(mesh, 0xff0000);
  scene.add(box);
}

// Show coordinate axes
const axesHelper = new THREE.AxesHelper(5);
scene.add(axesHelper);

// Display debug info
const debugText = document.createElement('div');
debugText.style.position = 'absolute';
debugText.style.top = '10px';
debugText.style.left = '10px';
debugText.style.color = 'white';
document.body.appendChild(debugText);

function updateDebugInfo() {
  debugText.innerHTML = `
    FPS: ${fps}<br>
    Draw Calls: ${renderer.info.render.calls}<br>
    Triangles: ${renderer.info.render.triangles}<br>
    Position: ${player.position.toArray().map(v => v.toFixed(2))}
  `;
}
```

### Network Debugging
```typescript
// Log all network events
socket.onAny((event, ...args) => {
  console.log(`[Network] ${event}:`, args);
});

// Measure latency
let sentTime = 0;
function measurePing() {
  sentTime = Date.now();
  socket.emit('ping');
}

socket.on('pong', () => {
  const latency = Date.now() - sentTime;
  console.log(`Latency: ${latency}ms`);
});
```

---

## Common Pitfalls to Avoid

### 1. Creating Objects in Update Loop
```typescript
// Bad: Creates garbage every frame
function update() {
  const temp = new Vector3(); // DON'T DO THIS
  temp.copy(player.position);
}

// Good: Reuse objects
const tempVector = new Vector3(); // Create once
function update() {
  tempVector.copy(player.position);
}
```

### 2. Not Cleaning Up Event Listeners
```typescript
// Bad: Memory leak
function startGame() {
  window.addEventListener('keydown', handleKeyDown);
}

// Good: Clean up
let isRunning = false;
function startGame() {
  isRunning = true;
  window.addEventListener('keydown', handleKeyDown);
}

function stopGame() {
  isRunning = false;
  window.removeEventListener('keydown', handleKeyDown);
}
```

### 3. Blocking the Main Thread
```typescript
// Bad: Freezes the game
function generateWorld() {
  for (let i = 0; i < 1000000; i++) {
    // Heavy computation
  }
}

// Good: Use Web Workers or spread over frames
function* generateWorldIterator() {
  for (let i = 0; i < 1000; i++) {
    generateChunk(i);
    yield; // Allow frame to render
  }
}

function processGenerator(generator: Generator) {
  const next = generator.next();
  if (!next.done) {
    requestAnimationFrame(() => processGenerator(generator));
  }
}
```

### 4. Trusting Client Input
```typescript
// Bad: Client can cheat
socket.on('player:teleport', (position) => {
  player.position.copy(position); // Client can teleport anywhere!
});

// Good: Validate on server
socket.on('player:move', (direction) => {
  // Server calculates new position based on valid movement
  const newPosition = player.position.add(
    direction.normalize().multiplyScalar(player.speed * deltaTime)
  );
  
  // Validate
  if (isValidPosition(newPosition)) {
    player.position.copy(newPosition);
    io.emit('player:position', { id: socket.id, position: newPosition });
  }
});
```

---

## Code Review Checklist

Before submitting code for review:

- [ ] Code follows style guidelines
- [ ] No console.log statements (use proper logging)
- [ ] No commented-out code
- [ ] Variables have meaningful names
- [ ] Complex logic is commented
- [ ] No magic numbers (use named constants)
- [ ] Error handling implemented
- [ ] Memory leaks checked
- [ ] Performance tested
- [ ] Works in all supported browsers
- [ ] Responsive to different screen sizes (UI)
- [ ] Accessibility considered (UI)

---

## Resources

### Learning Resources
- Three.js Fundamentals: https://threejs.org/manual/
- TypeScript Handbook: https://www.typescriptlang.org/docs/
- Game Programming Patterns: http://gameprogrammingpatterns.com/
- Real-Time Multiplayer Games: https://gabrielgambetta.com/client-server-game-architecture.html

### Tools
- Three.js Inspector: Browser extension for debugging
- Stats.js: FPS and performance monitoring
- dat.GUI: Quick debug controls
- TypeScript Playground: Test TypeScript code

---

**Last Updated**: 2025-11-01  
**Version**: 1.0
