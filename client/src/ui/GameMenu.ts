/**
 * GameMenu - Loads user's game-menu (2).html which handles everything internally
 * The HTML file has: visuals, asset preloading, and game start functionality
 */

import { AssetLoader } from '../assets/AssetLoader';

export class GameMenu {
  private assetLoader: AssetLoader;
  private onStartGame?: () => void;

  constructor(assetLoader: AssetLoader) {
    this.assetLoader = assetLoader;
  }

  /**
   * Show the user's menu - it handles everything internally
   */
  public async show(onStartGame: () => void): Promise<void> {
    this.onStartGame = onStartGame;
    
    // Load the user's menu HTML file
    await this.loadUserMenu();
    
    // Listen for the start game event from the menu
    this.listenForStartGame();
  }

  /**
   * Load the user's game-menu (2).html file
   */
  private async loadUserMenu(): Promise<void> {
    try {
      const response = await fetch('/game-menu%20(2).html');
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
      
      console.log('✓ User menu loaded');
    } catch (error) {
      console.error('Failed to load user menu:', error);
    }
  }

  /**
   * Listen for start game event from the menu
   */
  private listenForStartGame(): void {
    // Listen for custom event from user's menu
    window.addEventListener('gameMenuStartClicked', () => {
      this.startGame();
    });
  }

  /**
   * Start the game - hide menu and call callback
   */
  private startGame(): void {
    console.log('🎮 Starting game...');
    
    // Hide the menu
    const menu = document.getElementById('game-menu');
    if (menu) {
      menu.style.display = 'none';
    }
    
    // Remove loading status
    const loadingStatus = document.getElementById('loading-status');
    if (loadingStatus) {
      loadingStatus.remove();
    }
    
    // Call the game start callback
    if (this.onStartGame) {
      this.onStartGame();
    }
  }
}
