import { GameEngine } from './core/GameEngine';

/**
 * Main Entry Point - Fantasy Survival MMO
 * Initializes and starts the complete game with all 33 systems
 */

async function main() {
  console.log('=================================================');
  console.log('   FANTASY SURVIVAL MMO - FULL GAME LAUNCH');
  console.log('=================================================');
  console.log('');
  console.log('Systems: 33 Production-Ready Game Systems');
  console.log('Assets: 824+ Real 3D Models & Textures');
  console.log('Architecture: Complete MMO Foundation');
  console.log('');
  console.log('=================================================');
  
  try {
    // Create game engine
    const engine = new GameEngine();
    
    // Initialize all 33 systems
    console.log('\n[Main] Initializing game...');
    await engine.initialize();
    
    // Start game loop
    console.log('\n[Main] Starting game...');
    engine.start();
    
    console.log('\n=================================================');
    console.log('   ✓ GAME STARTED SUCCESSFULLY!');
    console.log('=================================================');
    console.log('\nControls:');
    console.log('  WASD - Movement');
    console.log('  Mouse - Look around');
    console.log('  E - Interact');
    console.log('  I - Inventory');
    console.log('  Q - Quest Log');
    console.log('  C - Character Stats');
    console.log('  M - Map');
    console.log('  F1 - Debug Console');
    console.log('\n=================================================');
    
    // Expose engine to window for debugging
    (window as any).gameEngine = engine;
    
    // Handle page unload
    window.addEventListener('beforeunload', () => {
      console.log('[Main] Shutting down game...');
      engine.stop();
    });
    
  } catch (error) {
    console.error('\n=================================================');
    console.error('   ✗ GAME INITIALIZATION FAILED');
    console.error('=================================================');
    console.error(error);
    throw error;
  }
}

// Start the game
main().catch(error => {
  console.error('Fatal error:', error);
  document.body.innerHTML = `
    <div style="
      display: flex;
      align-items: center;
      justify-content: center;
      height: 100vh;
      font-family: Arial, sans-serif;
      background: #1a1a1a;
      color: #ff4444;
    ">
      <div style="text-align: center;">
        <h1>Game Initialization Failed</h1>
        <p>Please check the console for details</p>
        <pre style="
          background: #000;
          padding: 20px;
          border-radius: 5px;
          text-align: left;
          max-width: 600px;
          overflow: auto;
        ">${error.message}</pre>
      </div>
    </div>
  `;
});;
import { Engine } from './core/Engine';

const canvas = document.getElementById('game-canvas') as HTMLCanvasElement;

if (canvas) {
  const engine = new Engine(canvas);
  engine.start();
  console.log('Game engine started!');
} else {
  console.error('Canvas not found!');
}
