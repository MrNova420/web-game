/**
 * GameMenu - Integrates the game-menu (2).html functionality
 * Shows menu first, preloads assets in background, starts game on user action
 */

import { AssetLoader } from '../assets/AssetLoader';

export class GameMenu {
  private menuContainer: HTMLElement | null = null;
  private assetLoader: AssetLoader;
  private onStartGame?: () => void;
  private preloadComplete = false;

  constructor(assetLoader: AssetLoader) {
    this.assetLoader = assetLoader;
  }

  /**
   * Show the game menu and start background asset preloading
   */
  public async show(onStartGame: () => void): Promise<void> {
    this.onStartGame = onStartGame;
    
    // Create menu container (based on game-menu (2).html)
    this.createMenuHTML();
    
    // Setup event listeners
    this.setupEventListeners();
    
    // Start preloading assets in background
    this.preloadAssetsInBackground();
  }

  /**
   * Create the menu HTML structure from game-menu (2).html
   */
  private createMenuHTML(): void {
    this.menuContainer = document.createElement('div');
    this.menuContainer.id = 'game-menu';
    this.menuContainer.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: linear-gradient(135deg, #0a0a1e 0%, #1a1a3e 50%, #0f0f2e 100%);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 10000;
      font-family: 'Cinzel', 'Georgia', serif;
    `;

    const menuContent = document.createElement('div');
    menuContent.className = 'menu-container';
    menuContent.style.cssText = `
      text-align: center;
      padding: 40px;
      background: rgba(20, 20, 40, 0.9);
      border-radius: 20px;
      border: 2px solid rgba(100, 150, 255, 0.5);
      box-shadow: 0 0 50px rgba(100, 150, 255, 0.3);
    `;

    const title = document.createElement('h1');
    title.className = 'game-title';
    title.textContent = 'FANTASY SURVIVAL MMO';
    title.style.cssText = `
      font-size: 3rem;
      color: #fff;
      text-shadow: 0 0 20px rgba(100, 200, 255, 0.8);
      margin-bottom: 40px;
      letter-spacing: 4px;
    `;

    const buttonsContainer = document.createElement('div');
    buttonsContainer.className = 'menu-buttons';
    buttonsContainer.style.cssText = `
      display: flex;
      flex-direction: column;
      gap: 15px;
      min-width: 300px;
    `;

    // Create buttons from game-menu (2).html
    const buttons = [
      { id: 'play-btn', text: 'Play', primary: true },
      { id: 'continue-btn', text: 'Continue', primary: false },
      { id: 'settings-btn', text: 'Settings', primary: false },
      { id: 'credits-btn', text: 'Credits', primary: false },
      { id: 'exit-btn', text: 'Exit', primary: false }
    ];

    buttons.forEach(btnConfig => {
      const button = document.createElement('button');
      button.id = btnConfig.id;
      button.className = 'menu-button';
      button.textContent = btnConfig.text;
      button.style.cssText = `
        padding: 15px 40px;
        font-size: 1.2rem;
        font-family: 'Cinzel', 'Georgia', serif;
        color: #fff;
        background: ${btnConfig.primary ? 'linear-gradient(135deg, rgba(50, 100, 200, 0.6), rgba(80, 150, 255, 0.6))' : 'rgba(40, 60, 100, 0.6)'};
        border: 2px solid rgba(100, 150, 255, 0.5);
        border-radius: 10px;
        cursor: pointer;
        transition: all 0.3s ease;
        box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
      `;

      button.addEventListener('mouseenter', () => {
        button.style.transform = 'scale(1.05)';
        button.style.boxShadow = '0 0 20px rgba(100, 200, 255, 0.5)';
      });

      button.addEventListener('mouseleave', () => {
        button.style.transform = 'scale(1)';
        button.style.boxShadow = '0 5px 15px rgba(0, 0, 0, 0.3)';
      });

      buttonsContainer.appendChild(button);
    });

    // Add loading indicator
    const loadingIndicator = document.createElement('div');
    loadingIndicator.id = 'loading-indicator';
    loadingIndicator.style.cssText = `
      margin-top: 30px;
      font-size: 0.9rem;
      color: rgba(255, 255, 255, 0.6);
      font-style: italic;
    `;
    loadingIndicator.textContent = 'Loading assets...';

    menuContent.appendChild(title);
    menuContent.appendChild(buttonsContainer);
    menuContent.appendChild(loadingIndicator);
    this.menuContainer.appendChild(menuContent);
    document.body.appendChild(this.menuContainer);
  }

  /**
   * Setup event listeners for menu buttons
   */
  private setupEventListeners(): void {
    const playBtn = document.getElementById('play-btn');
    const continueBtn = document.getElementById('continue-btn');
    const settingsBtn = document.getElementById('settings-btn');
    const creditsBtn = document.getElementById('credits-btn');
    const exitBtn = document.getElementById('exit-btn');

    if (playBtn) {
      playBtn.addEventListener('click', () => this.handlePlayClick());
    }

    if (continueBtn) {
      continueBtn.addEventListener('click', () => {
        // TODO: Implement continue game functionality
        console.log('[GameMenu] Continue game not yet implemented');
      });
    }

    if (settingsBtn) {
      settingsBtn.addEventListener('click', () => {
        // TODO: Implement settings menu
        console.log('[GameMenu] Settings not yet implemented');
      });
    }

    if (creditsBtn) {
      creditsBtn.addEventListener('click', () => {
        // TODO: Implement credits screen
        console.log('[GameMenu] Credits not yet implemented');
      });
    }

    if (exitBtn) {
      exitBtn.addEventListener('click', () => {
        window.close();
      });
    }

    // Keyboard navigation from game-menu (2).html
    const menuButtons = Array.from(document.querySelectorAll('.menu-button'));
    let currentButtonIndex = 0;

    document.addEventListener('keydown', (e) => {
      if (this.menuContainer && this.menuContainer.style.display !== 'none') {
        if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') {
          e.preventDefault();
          currentButtonIndex = (currentButtonIndex + 1) % menuButtons.length;
          (menuButtons[currentButtonIndex] as HTMLElement).focus();
        } else if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') {
          e.preventDefault();
          currentButtonIndex = (currentButtonIndex - 1 + menuButtons.length) % menuButtons.length;
          (menuButtons[currentButtonIndex] as HTMLElement).focus();
        } else if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          (menuButtons[currentButtonIndex] as HTMLElement).click();
        }
      }
    });
  }

  /**
   * Preload critical game assets in the background while menu is shown
   * Following AUTONOMOUS_DEVELOPMENT_GUIDE.md - uses only extracted_assets
   */
  private async preloadAssetsInBackground(): Promise<void> {
    console.log('[GameMenu] Starting background asset preload...');
    
    const loadingIndicator = document.getElementById('loading-indicator');
    
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
          if (loadingIndicator) {
            loadingIndicator.textContent = `Loading assets... ${progress}%`;
          }
          console.log(`[GameMenu] Preloaded: ${assetPath}`);
        } catch (error) {
          // Asset doesn't exist, skip it (will use fallback)
          console.warn(`[GameMenu] Asset not found: ${assetPath}`);
          loaded++;
        }
      }

      this.preloadComplete = true;
      if (loadingIndicator) {
        loadingIndicator.textContent = 'Ready to play!';
        loadingIndicator.style.color = 'rgba(100, 255, 100, 0.8)';
      }
      console.log('[GameMenu] ✓ Background asset preload complete');
    } catch (error) {
      console.error('[GameMenu] Error during asset preload:', error);
      if (loadingIndicator) {
        loadingIndicator.textContent = 'Assets loaded (with some warnings)';
      }
      this.preloadComplete = true;
    }
  }

  /**
   * Handle Play button click - start the game
   */
  private async handlePlayClick(): Promise<void> {
    console.log('[GameMenu] Play button clicked');
    
    // Wait for preload if not complete
    if (!this.preloadComplete) {
      const loadingIndicator = document.getElementById('loading-indicator');
      if (loadingIndicator) {
        loadingIndicator.textContent = 'Finishing asset load...';
      }
      
      // Wait up to 5 seconds for preload to complete
      const startTime = Date.now();
      while (!this.preloadComplete && Date.now() - startTime < 5000) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }

    // Hide menu
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
    if (this.menuContainer) {
      this.menuContainer.style.opacity = '0';
      setTimeout(() => {
        if (this.menuContainer) {
          this.menuContainer.style.display = 'none';
        }
      }, 500);
    }
  }
}
