import './style.css';
import { GameEngine } from './core/GameEngine';

/**
 * Main Entry Point - Fantasy Survival MMO
 * Initializes and starts the complete game with all 39 systems
 */

async function main() {
  console.log('=================================================');
  console.log('   FANTASY SURVIVAL MMO - FULL GAME LAUNCH');
  console.log('=================================================');
  console.log('');
  console.log('Systems: 39 Production-Ready Game Systems');
  console.log('Assets: 4,885 Real 3D Models & Textures');
  console.log('Architecture: Complete MMO Foundation');
  console.log('');
  console.log('=================================================');
  
  try {
    // Get or create canvas
    let canvas = document.getElementById('game-canvas') as HTMLCanvasElement;
    
    if (!canvas) {
      console.log('[Main] Creating game canvas...');
      canvas = document.createElement('canvas');
      canvas.id = 'game-canvas';
      canvas.style.width = '100vw';
      canvas.style.height = '100vh';
      canvas.style.display = 'block';
      document.body.appendChild(canvas);
    }
    
    // Create game engine
    console.log('[Main] Creating game engine...');
    const engine = new GameEngine();
    
    // Initialize all 39 systems
    console.log('[Main] Initializing all game systems...');
    await engine.initialize();
    
    // Start game loop
    console.log('[Main] Starting game loop...');
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
    
    // Show error screen
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
        <div style="text-align: center; padding: 20px;">
          <h1>🎮 Game Initialization Failed</h1>
          <p>Please check the browser console (F12) for details</p>
          <pre style="
            background: #000;
            padding: 20px;
            border-radius: 5px;
            text-align: left;
            max-width: 600px;
            overflow: auto;
            margin: 20px auto;
          ">${error instanceof Error ? error.message : String(error)}</pre>
          <button onclick="location.reload()" style="
            background: #4CAF50;
            color: white;
            border: none;
            padding: 10px 20px;
            font-size: 16px;
            border-radius: 5px;
            cursor: pointer;
          ">Reload Game</button>
        </div>
      </div>
    `;
    throw error;
  }
}

// Start the game when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', main);
} else {
  main().catch(error => {
    console.error('Fatal error during game startup:', error);
  });
}
