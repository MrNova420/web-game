/**
 * GameMenu - Uses the user's game-menu.html and adds functionality
 * Loads their HTML exactly as-is and just adds asset preloading + game start
 */

import { AssetLoader } from '../assets/AssetLoader';

export class GameMenu {
  private assetLoader: AssetLoader;
  private onStartGame?: () => void;
  private preloadComplete = false;

  constructor(assetLoader: AssetLoader) {
    this.assetLoader = assetLoader;
  }

  /**
   * Show the user's menu and start background asset preloading
   */
  public async show(onStartGame: () => void): Promise<void> {
    this.onStartGame = onStartGame;
    
    // Load the user's actual game-menu.html file
    await this.loadUserMenu();
    
    // Add functionality: asset preloading and start game button
    this.addFunctionality();
  }

  /**
   * Load the user's game-menu.html file exactly as-is
   */
  private async loadUserMenu(): Promise<void> {
    try {
      const response = await fetch('/game-menu.html');
      const htmlText = await response.text();
      
      // Parse the HTML
      const parser = new DOMParser();
      const doc = parser.parseFromString(htmlText, 'text/html');
      
      // Copy styles from user's HTML
      const styles = doc.querySelectorAll('style');
      styles.forEach(style => {
        const styleElement = document.createElement('style');
        styleElement.textContent = style.textContent;
        document.head.appendChild(styleElement);
      });
      
      // Copy body content from user's HTML
      const bodyContent = doc.body.innerHTML;
      document.body.insertAdjacentHTML('afterbegin', bodyContent);
      
      // Copy and execute scripts from user's HTML
      const scripts = doc.querySelectorAll('script');
      scripts.forEach(script => {
        if (script.textContent) {
          const scriptElement = document.createElement('script');
          scriptElement.textContent = script.textContent;
          document.body.appendChild(scriptElement);
        }
      });
      
      console.log('[GameMenu] ✓ Loaded user game-menu.html exactly as provided');
    } catch (error) {
      console.error('[GameMenu] Failed to load game-menu.html:', error);
    }
  }

  /**
   * Add functionality to the user's menu: asset preloading and game start
   */
  private addFunctionality(): void {
    // Find the "Start Game" button in user's HTML
    setTimeout(() => {
      const startBtn = document.getElementById('start-game-btn') ||
                       document.querySelector('button:first-of-type') ||
                       document.querySelector('[onclick*="startGame"]');
      
      if (startBtn) {
        // Add click handler to start game
        startBtn.addEventListener('click', () => this.handleStartGame());
        console.log('[GameMenu] ✓ Connected Start Game button');
      }

      // Add loading indicator
      this.addLoadingStatus();
      
      // Start preloading assets in background
      this.preloadAssetsInBackground();
    }, 100);
  }

  /**
   * Add a loading status indicator
   */
  private addLoadingStatus(): void {
    const statusDiv = document.createElement('div');
    statusDiv.id = 'preload-status';
    statusDiv.style.cssText = `
      position: fixed;
      bottom: 20px;
      left: 50%;
      transform: translateX(-50%);
      color: #fff;
      font-size: 0.9rem;
      text-align: center;
      padding: 10px 20px;
      background: rgba(0, 0, 0, 0.7);
      border-radius: 8px;
      z-index: 10001;
    `;
    statusDiv.textContent = 'Loading assets...';
    document.body.appendChild(statusDiv);
  }

  /**
   * Preload critical game assets in the background while menu is shown
   * Following AUTONOMOUS_DEVELOPMENT_GUIDE.md - uses only extracted_assets
   */
  private async preloadAssetsInBackground(): Promise<void> {
    console.log('[GameMenu] Starting background asset preload...');
    
    const statusDiv = document.getElementById('preload-status');
    
    try {
      // Preload critical assets from extracted_assets folder
      const criticalAssets = [
        // Trees from Stylized_Nature_MegaKit (per guide)
        '../extracted_assets/Stylized_Nature_MegaKit/OBJ/CommonTree_1.obj',
        '../extracted_assets/Stylized_Nature_MegaKit/OBJ/CommonTree_2.obj',
        '../extracted_assets/Stylized_Nature_MegaKit/OBJ/PineTree_1.obj',
        
        // Rocks from Stylized_Nature_MegaKit (per guide)
        '../extracted_assets/Stylized_Nature_MegaKit/OBJ/Rock_1.obj',
        '../extracted_assets/Stylized_Nature_MegaKit/OBJ/Rock_2.obj',
        
        // Grass from Stylized_Nature_MegaKit (per guide)
        '../extracted_assets/Stylized_Nature_MegaKit/OBJ/Grass_1.obj',
      ];

      let loaded = 0;
      for (const assetPath of criticalAssets) {
        try {
          await this.assetLoader.loadModel(assetPath);
          loaded++;
          const progress = Math.floor((loaded / criticalAssets.length) * 100);
          if (statusDiv) {
            statusDiv.textContent = `Loading assets... ${progress}%`;
          }
          console.log(`[GameMenu] Preloaded: ${assetPath}`);
        } catch (error) {
          // Asset doesn't exist, skip it (will use fallback)
          console.warn(`[GameMenu] Asset not found: ${assetPath}`);
          loaded++;
        }
      }

      this.preloadComplete = true;
      if (statusDiv) {
        statusDiv.textContent = 'Ready to play!';
        statusDiv.style.color = '#0f0';
      }
      console.log('[GameMenu] ✓ Background asset preload complete');
    } catch (error) {
      console.error('[GameMenu] Error during asset preload:', error);
      if (statusDiv) {
        statusDiv.textContent = 'Assets loaded (with some warnings)';
      }
      this.preloadComplete = true;
    }
  }

  /**
   * Handle Start Game button click
   */
  private async handleStartGame(): Promise<void> {
    console.log('[GameMenu] Start Game button clicked');
    
    // Wait for preload if not complete
    if (!this.preloadComplete) {
      const statusDiv = document.getElementById('preload-status');
      if (statusDiv) {
        statusDiv.textContent = 'Finishing asset load...';
      }
      
      // Wait up to 5 seconds for preload to complete
      const startTime = Date.now();
      while (!this.preloadComplete && Date.now() - startTime < 5000) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }

    // Hide the menu
    this.hide();

    // Start game
    if (this.onStartGame) {
      console.log('[GameMenu] Starting game engine...');
      this.onStartGame();
    }
  }

  /**
   * Hide the menu
   */
  public hide(): void {
    const gameMenu = document.getElementById('game-menu');
    if (gameMenu) {
      gameMenu.style.transition = 'opacity 0.5s';
      gameMenu.style.opacity = '0';
      setTimeout(() => {
        gameMenu.style.display = 'none';
      }, 500);
    }
    
    const statusDiv = document.getElementById('preload-status');
    if (statusDiv) {
      statusDiv.remove();
    }
  }
}
