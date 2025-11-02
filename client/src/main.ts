import './style.css';
import { GameBootstrap } from './core/GameBootstrap';

/**
 * Main Entry Point - Fantasy Survival MMO
 * 
 * Optimized Startup Flow:
 * 1. Show main menu immediately (no loading wait)
 * 2. Preload assets in background while user is in menu
 * 3. Initialize game only when user clicks "Start Game"
 * 4. Smooth transition with progress tracking
 * 
 * This provides the best user experience with no initial lag
 */

async function main() {
  try {
    // Create and initialize game bootstrap
    const bootstrap = new GameBootstrap();
    await bootstrap.initialize();
    
    // Bootstrap will handle:
    // - Showing the menu
    // - Background asset preloading
    // - Game initialization when user starts
    // - Progress tracking
    // - Error handling
    
    console.log('[Main] Game bootstrap ready - waiting for user input');
    
  } catch (error) {
    console.error('[Main] Fatal error during bootstrap:', error);
    
    // Show user-friendly error
    const errorDiv = document.createElement('div');
    errorDiv.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: #1a1a2e;
      color: white;
      padding: 30px;
      border-radius: 15px;
      text-align: center;
      max-width: 500px;
      border: 3px solid #ff4444;
      z-index: 99999;
    `;
    errorDiv.innerHTML = `
      <h2 style="color: #ff4444; margin-bottom: 20px;">⚠️ Game Failed to Load</h2>
      <p style="margin-bottom: 20px;">${error instanceof Error ? error.message : 'Unknown error'}</p>
      <button onclick="location.reload()" style="
        background: #4CAF50;
        color: white;
        border: none;
        padding: 15px 30px;
        font-size: 18px;
        border-radius: 5px;
        cursor: pointer;
      ">Reload Game</button>
    `;
    document.body.appendChild(errorDiv);
  }
}

// Start the game when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', main);
} else {
  // Delay slightly to ensure DOM is fully ready
  setTimeout(() => {
    main().catch(error => {
      console.error('[Main] Fatal error:', error);
    });
  }, 50);
}
