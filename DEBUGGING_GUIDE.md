# Bug Tracking & Debugging Workflow

## Quick Debug Checklist

When encountering a bug:

1. **Reproduce the bug** - Can you make it happen again?
2. **Check console** - Are there any errors?
3. **Enable debug mode** - Get detailed logs
4. **Isolate the issue** - Which system is affected?
5. **Test the fix** - Verify the solution works
6. **Document** - Add test to prevent regression

## Known Issues & Fixes

### Build Issues

#### Issue: "Cannot find module"
**Error:**
```
Error: Cannot find module './AssetLoader'
```

**Fix:**
```bash
# Check import paths
cd client/src
find . -name "AssetLoader.ts"
# Update import to correct path
```

#### Issue: TypeScript errors
**Error:**
```
error TS2339: Property 'someMethod' does not exist
```

**Fix:**
1. Check if method exists in class
2. Add method to interface/class
3. Check TypeScript version compatibility

### Runtime Issues

#### Issue: Black screen on load
**Symptoms:** Game loads but shows black screen

**Debug:**
```javascript
// Check WebGL support
const canvas = document.querySelector('canvas');
const gl = canvas.getContext('webgl');
console.log('WebGL supported:', gl !== null);

// Check scene objects
console.log('Scene children:', gameEngine.getScene().children.length);

// Check camera
const camera = gameEngine.getCamera();
console.log('Camera position:', camera.position);
```

**Common Fixes:**
- Update graphics drivers
- Enable hardware acceleration
- Check WebGL compatibility
- Verify assets loaded

#### Issue: Game freezes
**Symptoms:** Game stops responding, high CPU

**Debug:**
```javascript
// Check update loop
const debug = gameEngine.getSystem('DebugSystem');
debug.enable();
debug.trackMetric('updateTime', 0);

// Monitor frame time
let lastFrame = performance.now();
function checkFrameTime() {
  const now = performance.now();
  const delta = now - lastFrame;
  if (delta > 100) { // Freeze detected
    console.warn('Long frame:', delta + 'ms');
    // Log active systems
    gameEngine.listSystems();
  }
  lastFrame = now;
  requestAnimationFrame(checkFrameTime);
}
checkFrameTime();
```

**Common Fixes:**
- Reduce entity count
- Lower graphics settings
- Check for infinite loops
- Clear memory leaks

#### Issue: Memory leak
**Symptoms:** Game slows down over time, memory grows

**Debug:**
```javascript
// Monitor memory growth
const startMem = performance.memory.usedJSHeapSize;
setTimeout(() => {
  const endMem = performance.memory.usedJSHeapSize;
  const growth = (endMem - startMem) / 1048576;
  console.log('Memory growth:', growth.toFixed(2) + 'MB');
}, 300000); // After 5 minutes
```

**Common Fixes:**
```javascript
// Dispose unused objects
gameEngine.getSystem('AssetLoader').disposeUnused();

// Clear old chunks
gameEngine.getSystem('ChunkManager').clearDistant();

// Clean particles
gameEngine.getSystem('ParticleSystem').clearAll();
```

### Network Issues

#### Issue: Can't connect to server
**Symptoms:** "Connection failed" error

**Debug:**
```bash
# Check if server is running
curl http://localhost:8080
# or
netstat -an | grep 8080
```

**Fixes:**
1. Start server: `cd server && npm run dev`
2. Check firewall settings
3. Verify port not in use
4. Check CORS configuration

#### Issue: High latency
**Symptoms:** Actions delayed, rubber-banding

**Debug:**
```javascript
const network = gameEngine.getSystem('NetworkSystem');
console.log('Latency:', network.getLatency());
console.log('Packet Loss:', network.getPacketLoss());
```

**Fixes:**
- Enable client prediction
- Reduce update frequency
- Use delta compression
- Check network connection

### Graphics Issues

#### Issue: Low FPS
**Symptoms:** Game runs slowly, choppy

**Debug:**
```javascript
const perf = gameEngine.getSystem('PerformanceMonitor');
const stats = perf.getStats();
console.log('FPS:', stats.fps);
console.log('Draw Calls:', stats.drawCalls);
console.log('Triangles:', stats.triangles);
```

**Fixes:**
- Lower graphics quality
- Reduce view distance
- Enable LOD
- Limit entities

#### Issue: Texture not loading
**Symptoms:** White/black textures, missing models

**Debug:**
```javascript
// Check texture loading
const loader = gameEngine.getSystem('AssetLoader');
console.log('Loaded assets:', loader.getLoadedCount());
console.log('Failed assets:', loader.getFailedAssets());

// Try manual load
loader.load('path/to/texture.jpg').then(
  (texture) => console.log('Loaded:', texture),
  (error) => console.error('Failed:', error)
);
```

**Fixes:**
- Verify asset path
- Check file format (jpg, png, glb)
- Check file permissions
- Verify assets exist in extracted_assets/

## Debugging Tools

### 1. Browser DevTools

**Console (F12)**
- View errors and warnings
- Run debug commands
- Check network requests

**Performance Tab**
- Profile CPU usage
- Identify bottlenecks
- Track frame rendering

**Memory Tab**
- Find memory leaks
- Take heap snapshots
- Monitor garbage collection

**Network Tab**
- Track asset loading
- Check request timing
- Monitor bandwidth

### 2. Game Debug System

```javascript
// Enable debug mode
const debug = gameEngine.getSystem('DebugSystem');
debug.enable();

// Show overlays
debug.showOverlay('fps');
debug.showOverlay('memory');
debug.showOverlay('network');
debug.showOverlay('entities');

// Log specific events
debug.log('Custom message');
debug.trackMetric('custom_metric', 123);

// Export debug data
const data = debug.exportData();
console.log(data);
```

### 3. System-Specific Debugging

**ChunkManager:**
```javascript
const chunks = gameEngine.getSystem('ChunkManager');
console.log('Active chunks:', chunks.getActiveChunkCount());
console.log('Player chunk:', chunks.getPlayerChunk());
```

**EntityManager:**
```javascript
const entities = gameEngine.getSystem('NPCSystem');
console.log('Total NPCs:', entities.getAllNPCs().length);
console.log('Active NPCs:', entities.getActiveNPCs().length);
```

**NetworkSystem:**
```javascript
const network = gameEngine.getSystem('NetworkSystem');
console.log('Connected:', network.isConnected());
console.log('Queue size:', network.getMessageQueue().length);
```

## Testing Procedures

### Unit Test Debug
```bash
# Run specific test
npm test -- AssetLoader.test.ts

# Run with verbose output
npm test -- --reporter=verbose

# Run in watch mode
npm test -- --watch
```

### Integration Test Debug
```bash
# Run integration tests
npm test -- integration/

# Run with UI
npm run test:ui
```

### Manual Testing Checklist

- [ ] Game loads without errors
- [ ] Player spawns correctly
- [ ] Movement works (WASD)
- [ ] Camera rotates (mouse)
- [ ] Terrain generates
- [ ] NPCs spawn
- [ ] Enemies spawn
- [ ] Combat works
- [ ] Inventory opens (I)
- [ ] Crafting works
- [ ] Building works
- [ ] Quests track
- [ ] Audio plays
- [ ] Settings save
- [ ] Multiplayer connects
- [ ] No memory leaks
- [ ] No console errors
- [ ] FPS stable (>30)

## Common Error Messages

### "WebGL context lost"
**Cause:** GPU crash or memory issue
**Fix:**
- Reduce graphics quality
- Lower texture resolution
- Limit concurrent operations
- Update graphics drivers

### "Out of memory"
**Cause:** Too many assets loaded
**Fix:**
```javascript
// Clear unused assets
assetLoader.disposeUnused();
// Reduce view distance
settings.setViewDistance(50);
// Limit entities
npcSystem.setMaxNPCs(50);
```

### "Failed to fetch"
**Cause:** Network request failed
**Fix:**
- Check internet connection
- Verify server is running
- Check asset paths
- Review CORS settings

### "Cannot read property of undefined"
**Cause:** Accessing uninitialized object
**Fix:**
```javascript
// Add null checks
if (entity && entity.component) {
  entity.component.doSomething();
}

// Use optional chaining
entity?.component?.doSomething();
```

## Bug Report Template

When reporting a bug, include:

```markdown
## Bug Description
Brief description of the issue

## Steps to Reproduce
1. Step 1
2. Step 2
3. Step 3

## Expected Behavior
What should happen

## Actual Behavior
What actually happens

## Environment
- Browser: Chrome 120
- OS: Windows 11
- Device: Desktop
- Screen: 1920x1080

## Console Output
```
Paste any console errors here
```

## Screenshots/Videos
[Attach if relevant]

## Additional Context
Any other relevant information
```

## Regression Testing

After fixing a bug:

1. **Add test case**
```typescript
it('should not crash when X happens', () => {
  // Test the fix
  expect(() => buggyFunction()).not.toThrow();
});
```

2. **Run full test suite**
```bash
npm run test:run
```

3. **Manual verification**
- Test the specific scenario
- Test related features
- Test on different devices

4. **Update documentation**
- Add to known issues (if workaround)
- Update changelog
- Update user guide

## Performance Debugging

### Profile CPU Usage
```javascript
// Start profiling
console.profile('GameLoop');

// Run game for 10 seconds
setTimeout(() => {
  console.profileEnd('GameLoop');
  // View profile in DevTools Performance tab
}, 10000);
```

### Track Memory Allocation
```javascript
// Take heap snapshot before
// DevTools > Memory > Take Snapshot

// Play game for 5 minutes

// Take heap snapshot after
// Compare snapshots to find leaks
```

### Network Profiling
```javascript
// Log all network activity
const network = gameEngine.getSystem('NetworkSystem');
network.on('message', (msg) => {
  console.log('Sent:', msg.type, msg.size + ' bytes');
});
```

## Automated Debugging

### Error Tracking
```javascript
// Add error handler
window.addEventListener('error', (event) => {
  console.error('Global error:', event.error);
  // Send to error tracking service
  // logError(event.error);
});

window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise:', event.reason);
});
```

### Performance Monitoring
```javascript
// Log performance metrics
setInterval(() => {
  const perf = gameEngine.getSystem('PerformanceMonitor');
  const stats = perf.getStats();
  
  if (stats.fps < 30) {
    console.warn('Low FPS detected:', stats.fps);
    // Take action or log for analysis
  }
}, 5000);
```

## Support Resources

- GitHub Issues: [link]
- Discord Community: [link]
- Documentation: See README.md
- Testing Guide: See TESTING_GUIDE.md
- Performance Guide: See PERFORMANCE_GUIDE.md

---

**Last Updated:** 2025-11-01
