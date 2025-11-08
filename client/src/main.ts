import './style.css';
import { GameEngine } from './core/GameEngine';
import { LoadingManager } from './utils/LoadingManager';
import { PerformanceOptimizer } from './utils/PerformanceOptimizer';
import { AssetLoader } from './assets/AssetLoader';
import { GameMenu } from './ui/GameMenu';

/**
 * Main Entry Point - Fantasy Survival MMO
 * Shows game menu first, preloads assets in background, starts game on user action
 * Following AUTONOMOUS_DEVELOPMENT_GUIDE.md principles
 */

async function main() {
  console.log('=================================================');
  console.log('   FANTASY SURVIVAL MMO');
  console.log('=================================================');
  
  // Initialize asset loader for preloading
  const assetLoader = new AssetLoader();
  
  // Create and show game menu (from game-menu.html)
  const gameMenu = new GameMenu(assetLoader);
  
  // Show menu and start background asset preloading
  await gameMenu.show(async () => {
    // This function is called when user clicks "Play"
    await startGame();
  });
  
  console.log('[Main] Game menu displayed, assets preloading in background');
}

/**
 * Start the actual game - called when user clicks Play button
 */
async function startGame() {
  console.log('=================================================');
  console.log('   STARTING GAME ENGINE');
  console.log('=================================================');
  
  // Create loading manager
  const loadingManager = new LoadingManager();
  loadingManager.updateProgress(5, 'Detecting device capabilities...');
  
  // Initialize performance optimizer
  const perfOptimizer = PerformanceOptimizer.getInstance();
  console.log(`[Main] Device tier: ${perfOptimizer.deviceTier}`);
  console.log(`[Main] Target FPS: ${perfOptimizer.settings.targetFPS}`);
  loadingManager.updateProgress(10, 'Performance settings configured');
  
  try {
    // Small delay to let loading screen render
    await new Promise(resolve => setTimeout(resolve, 100));
    
    loadingManager.updateProgress(15, 'Creating game canvas...');
    
    // Canvas will be created by GameEngine
    
    loadingManager.updateProgress(20, 'Initializing game engine...');
    
    // Create game engine with performance settings
    console.log('[Main] Creating optimized game engine...');
    const engine = new GameEngine(perfOptimizer);
    
    loadingManager.updateProgress(30, 'Loading world systems...');
    await new Promise(resolve => setTimeout(resolve, 50));
    
    // Initialize systems progressively
    console.log('[Main] Initializing game systems...');
    
    // Phase 1: World (30-50%)
    loadingManager.updateProgress(40, 'Generating terrain...');
    
    // Phase 2: Characters (50-65%)
    loadingManager.updateProgress(55, 'Loading character systems...');
    
    // Phase 3: Gameplay (65-80%)
    loadingManager.updateProgress(70, 'Initializing gameplay systems...');
    
    // Initialize all systems
    await engine.initialize((progress: number, message: string) => {
      // Progressive loading callback
      const adjustedProgress = 30 + (progress * 0.6); // 30-90%
      loadingManager.updateProgress(adjustedProgress, message);
    });
    
    loadingManager.updateProgress(90, 'Starting game...');
    // Removed setTimeout to prevent any potential blocking
    
    // Start game loop immediately
    console.log('[Main] Starting optimized game loop...');
    engine.start();
    
    loadingManager.updateProgress(95, 'Preparing user interface...');
    // Removed setTimeout to prevent any potential blocking
    
    // Complete loading immediately
    loadingManager.complete();
    
    console.log('\n=================================================');
    console.log('   ✓ GAME STARTED SUCCESSFULLY!');
    console.log('=================================================');
    console.log(`\nPerformance: ${perfOptimizer.deviceTier.toUpperCase()} settings`);
    console.log(`Target FPS: ${perfOptimizer.settings.targetFPS}`);
    console.log(`Shadows: ${perfOptimizer.settings.shadows ? 'ON' : 'OFF'}`);
    console.log(`View Distance: ${perfOptimizer.settings.viewDistance}m`);
    console.log('\nControls:');
    console.log('  WASD - Movement');
    console.log('  Mouse - Look around');
    console.log('  E - Interact | I - Inventory');
    console.log('  Q - Quest Log | C - Character Stats');
    console.log('  M - Map | F1 - Debug Console');
    console.log('\n=================================================');
    
    // Expose to window for debugging
    (window as { gameEngine?: unknown; perfOptimizer?: unknown }).gameEngine = engine;
    (window as { gameEngine?: unknown; perfOptimizer?: unknown }).perfOptimizer = perfOptimizer;
    
    // Handle cleanup
    window.addEventListener('beforeunload', () => {
      console.log('[Main] Shutting down game...');
      engine.stop();
    });
    
    // Monitor performance
    let frameCount = 0;
    let lastCheck = performance.now();
    setInterval(() => {
      const now = performance.now();
      const elapsed = now - lastCheck;
      const fps = (frameCount / elapsed) * 1000;
      frameCount = 0;
      lastCheck = now;
      
      // Adjust settings if performance drops
      perfOptimizer.adjustSettings(fps);
    }, 5000);
    
  } catch (error) {
    console.error('\n=================================================');
    console.error('   ✗ GAME INITIALIZATION FAILED');
    console.error('=================================================');
    console.error(error);
    
    // Show error through loading manager
    loadingManager.showError(
      error instanceof Error ? error.message : 'Unknown error occurred. Check console (F12) for details.'
    );
    
    throw error;
  }
}

// Start the game when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', main);
} else {
  // Delay slightly to ensure DOM is fully ready
  setTimeout(() => {
    main().catch(error => {
      console.error('Fatal error during game startup:', error);
    });
  }, 50);
}
