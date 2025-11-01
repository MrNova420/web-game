# Performance Optimization & Debugging Guide

## Quick Performance Checks

### Check Current Performance
```bash
# Build and analyze bundle size
cd client
npm run build

# Check bundle sizes
ls -lh dist/assets/

# Expected sizes:
# - index.js: < 300KB (gzipped < 100KB)
# - three.js: < 600KB (gzipped < 150KB)
# - Total: < 1MB (gzipped < 250KB)
```

### Performance Profiling

#### In-Game Performance Monitor
```javascript
// Open browser console (F12)
const engine = window.gameEngine;
const perfMonitor = engine.getSystem('PerformanceMonitor');

// Get real-time stats
setInterval(() => {
  const stats = perfMonitor.getStats();
  console.log('FPS:', stats.fps);
  console.log('Frame Time:', stats.frameTime + 'ms');
  console.log('Draw Calls:', stats.drawCalls);
  console.log('Triangles:', stats.triangles);
  console.log('Memory:', (performance.memory.usedJSHeapSize / 1048576).toFixed(2) + 'MB');
}, 1000);
```

#### Chrome DevTools Performance
1. Open DevTools (F12)
2. Go to Performance tab
3. Click Record (Ctrl+E)
4. Play game for 10-30 seconds
5. Stop recording
6. Analyze:
   - Long tasks (> 50ms)
   - Rendering bottlenecks
   - JavaScript execution time
   - Memory usage patterns

### Common Performance Issues & Fixes

#### Issue 1: Low FPS (< 30 FPS)

**Diagnosis:**
```javascript
const debugSystem = gameEngine.getSystem('DebugSystem');
debugSystem.enable();
debugSystem.showOverlay('fps');
debugSystem.showOverlay('entities');
debugSystem.showOverlay('chunks');
```

**Solutions:**
1. **Too many entities:**
   ```javascript
   // Reduce view distance
   const settings = gameEngine.getSystem('SettingsSystem');
   settings.setViewDistance(50); // Default: 100
   ```

2. **Too many draw calls:**
   ```javascript
   // Enable asset pooling (instancing)
   const assetPool = gameEngine.getSystem('AssetPool');
   assetPool.enableInstancing(true);
   ```

3. **High polygon count:**
   ```javascript
   // Use LOD system
   const lodManager = gameEngine.getSystem('LODManager');
   lodManager.setLODDistances([25, 50, 100]); // near, mid, far
   ```

#### Issue 2: Memory Leaks

**Diagnosis:**
```javascript
// Monitor memory over time
const startMemory = performance.memory.usedJSHeapSize;
// Play for 5 minutes
const endMemory = performance.memory.usedJSHeapSize;
const growth = (endMemory - startMemory) / 1048576;
console.log('Memory growth:', growth.toFixed(2) + 'MB');
// Growth > 50MB indicates potential leak
```

**Solutions:**
1. **Dispose unused assets:**
   ```javascript
   // When switching scenes
   const assetLoader = gameEngine.getSystem('AssetLoader');
   assetLoader.disposeUnused();
   ```

2. **Clear old chunks:**
   ```javascript
   const chunkManager = gameEngine.getSystem('ChunkManager');
   chunkManager.setMaxLoadedChunks(25); // Limit active chunks
   ```

3. **Clean particle systems:**
   ```javascript
   const particleSystem = gameEngine.getSystem('ParticleSystem');
   particleSystem.setMaxParticles(1000); // Limit total particles
   ```

#### Issue 3: Slow Asset Loading

**Diagnosis:**
```javascript
// Track loading times
performance.mark('load-start');
await assetLoader.load('model.glb');
performance.mark('load-end');
performance.measure('load-time', 'load-start', 'load-end');
console.log(performance.getEntriesByName('load-time')[0].duration + 'ms');
```

**Solutions:**
1. **Preload critical assets:**
   ```javascript
   // In initialization
   await assetLoader.preloadCritical([
     'player_model.glb',
     'terrain_tile.glb',
     'skybox_day.jpg'
   ]);
   ```

2. **Use CDN for assets:**
   ```javascript
   // Configure asset URLs
   assetLoader.setBaseURL('https://cdn.yourgame.com/assets/');
   ```

3. **Compress textures:**
   ```bash
   # Use compressed texture formats
   # Convert to .basis or .ktx2
   ```

#### Issue 4: Network Latency

**Diagnosis:**
```javascript
const networkSystem = gameEngine.getSystem('NetworkSystem');
console.log('Ping:', networkSystem.getLatency() + 'ms');
console.log('Packet Loss:', networkSystem.getPacketLoss() + '%');
```

**Solutions:**
1. **Enable client prediction:**
   ```javascript
   networkSystem.enablePrediction(true);
   ```

2. **Adjust update rate:**
   ```javascript
   networkSystem.setUpdateRate(30); // Default: 60, Lower = less bandwidth
   ```

3. **Use delta compression:**
   ```javascript
   networkSystem.enableDeltaCompression(true);
   ```

## Optimization Checklist

### Graphics Optimization
- [ ] Enable LOD system
- [ ] Set appropriate view distance
- [ ] Use texture compression
- [ ] Enable frustum culling
- [ ] Limit particle count
- [ ] Use mesh instancing for repeated objects
- [ ] Reduce shadow quality on low-end devices

### Memory Optimization
- [ ] Implement asset pooling
- [ ] Dispose unused assets
- [ ] Limit chunk loading radius
- [ ] Clear old particle effects
- [ ] Use texture atlases
- [ ] Implement garbage collection triggers

### Network Optimization
- [ ] Enable message compression
- [ ] Use delta updates
- [ ] Implement client prediction
- [ ] Batch network updates
- [ ] Limit update frequency
- [ ] Compress player states

### Code Optimization
- [ ] Minimize garbage creation
- [ ] Use object pools
- [ ] Avoid `delete` operator
- [ ] Cache frequently used values
- [ ] Use TypedArrays for math
- [ ] Implement spatial partitioning

## Performance Targets

### Desktop (High-End)
- FPS: 60 constant
- Frame Time: 16ms
- Memory: < 500MB
- Load Time: < 2s
- View Distance: 150 units

### Desktop (Mid-Range)
- FPS: 45-60
- Frame Time: 16-22ms
- Memory: < 400MB
- Load Time: < 3s
- View Distance: 100 units

### Desktop (Low-End)
- FPS: 30-45
- Frame Time: 22-33ms
- Memory: < 300MB
- Load Time: < 5s
- View Distance: 50 units

### Mobile (High-End)
- FPS: 45-60
- Frame Time: 16-22ms
- Memory: < 300MB
- Load Time: < 4s
- View Distance: 75 units

### Mobile (Mid-Range)
- FPS: 30-45
- Frame Time: 22-33ms
- Memory: < 200MB
- Load Time: < 6s
- View Distance: 50 units

### Mobile (Low-End)
- FPS: 20-30
- Frame Time: 33-50ms
- Memory: < 150MB
- Load Time: < 8s
- View Distance: 30 units

## Debugging Tools

### Built-in Debug Console
```javascript
// Enable debug mode
const debug = gameEngine.getSystem('DebugSystem');
debug.enable();

// Show overlays
debug.showOverlay('fps');      // FPS counter
debug.showOverlay('memory');   // Memory usage
debug.showOverlay('network');  // Network stats
debug.showOverlay('entities'); // Entity count
debug.showOverlay('chunks');   // Chunk info

// Log performance data
debug.exportData(); // Download as JSON
```

### Browser DevTools Tips

**Performance Tab:**
- Look for long tasks (> 50ms)
- Check rendering time
- Identify JavaScript bottlenecks

**Memory Tab:**
- Take heap snapshots
- Compare snapshots to find leaks
- Check detached DOM nodes

**Network Tab:**
- Monitor asset loading
- Check compression
- Identify slow requests

### Common Debug Commands

```javascript
// In browser console:

// Show all active systems
gameEngine.listSystems();

// Get specific system
const combat = gameEngine.getSystem('CombatSystem');

// Pause game
gameEngine.pause();

// Resume game
gameEngine.resume();

// Get scene info
console.log(gameEngine.getScene().children.length); // Object count

// Force garbage collection (if available)
if (window.gc) window.gc();

// Check WebGL capabilities
const renderer = gameEngine.getRenderer();
console.log(renderer.info);
```

## Profiling Scripts

### FPS Logger
```javascript
// Save to console every second
let frameCount = 0;
let lastTime = performance.now();

function logFPS() {
  frameCount++;
  const now = performance.now();
  if (now - lastTime >= 1000) {
    console.log('FPS:', frameCount);
    frameCount = 0;
    lastTime = now;
  }
  requestAnimationFrame(logFPS);
}
logFPS();
```

### Memory Logger
```javascript
// Log memory every 5 seconds
setInterval(() => {
  if (performance.memory) {
    const used = (performance.memory.usedJSHeapSize / 1048576).toFixed(2);
    const total = (performance.memory.totalJSHeapSize / 1048576).toFixed(2);
    console.log(`Memory: ${used}MB / ${total}MB`);
  }
}, 5000);
```

### Network Logger
```javascript
// Log network stats
const network = gameEngine.getSystem('NetworkSystem');
setInterval(() => {
  console.log('Latency:', network.getLatency() + 'ms');
  console.log('Messages Sent:', network.getMessagesSent());
  console.log('Messages Received:', network.getMessagesReceived());
}, 5000);
```

## Performance Testing Script

```bash
#!/bin/bash
# performance-test.sh

echo "Running Performance Tests..."

# Start server
cd server
npm run build
npm start &
SERVER_PID=$!

# Wait for server
sleep 2

# Start client
cd ../client
npm run build
npm run preview &
CLIENT_PID=$!

# Wait for client
sleep 3

# Run Lighthouse performance audit
npx lighthouse http://localhost:3000 \
  --only-categories=performance \
  --output=html \
  --output-path=./performance-report.html

# Cleanup
kill $SERVER_PID $CLIENT_PID

echo "Performance report saved to performance-report.html"
```

## Stress Testing

### Entity Stress Test
```javascript
// Spawn 1000 entities
for (let i = 0; i < 1000; i++) {
  const x = Math.random() * 1000;
  const z = Math.random() * 1000;
  gameEngine.getSystem('NPCSystem').spawnNPC('villager', x, 0, z);
}
console.log('Spawned 1000 entities');
// Monitor FPS impact
```

### Chunk Loading Stress Test
```javascript
// Rapidly move player to trigger chunk loading
const player = gameEngine.getPlayer();
let x = 0;
setInterval(() => {
  x += 50;
  player.setPosition(x, 0, 0);
}, 100);
// Monitor memory and FPS
```

### Particle Stress Test
```javascript
// Spawn massive particle effects
const particles = gameEngine.getSystem('ParticleSystem');
for (let i = 0; i < 100; i++) {
  particles.emit('explosion', Math.random() * 100, 0, Math.random() * 100, 500);
}
// Monitor FPS
```

## Final Notes

- Always test on target hardware
- Use real-world scenarios
- Monitor over extended play sessions
- Test with multiple players (multiplayer)
- Profile regularly during development
- Set performance budgets early
- Optimize incrementally

For more details, see TESTING_GUIDE.md
