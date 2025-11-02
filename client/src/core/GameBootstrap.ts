import { MenuManager } from '../ui/MenuManager';
import { LoadingManager } from '../utils/LoadingManager';
import { AssetPreloader } from '../utils/AssetPreloader';
import { PerformanceOptimizer } from '../utils/PerformanceOptimizer';
import { AssetLoader } from '../assets/AssetLoader';
import { GameEngine } from '../core/GameEngine';

/**
 * GameBootstrap - Orchestrates the game startup flow
 * 
 * Startup Flow:
 * 1. Show main menu immediately
 * 2. Preload critical assets in background while user is in menu
 * 3. When user clicks "Start Game":
 *    a. Show loading screen
 *    b. Initialize game engine
 *    c. Initialize all game systems
 *    d. Start game loop
 * 
 * This prevents lag and provides a smooth experience
 */
export class GameBootstrap {
  private menuManager: MenuManager | null = null;
  private loadingManager: LoadingManager | null = null;
  private assetPreloader: AssetPreloader | null = null;
  private perfOptimizer: PerformanceOptimizer;
  private gameEngine: GameEngine | null = null;
  private assetLoader: AssetLoader;
  
  private isPreloadComplete: boolean = false;
  private isGameInitialized: boolean = false;

  constructor() {
    console.log('=================================================');
    console.log('   FANTASY SURVIVAL MMO - OPTIMIZED BOOTSTRAP');
    console.log('=================================================');
    
    this.perfOptimizer = PerformanceOptimizer.getInstance();
    this.assetLoader = new AssetLoader();
    
    console.log(`[Bootstrap] Device tier: ${this.perfOptimizer.deviceTier}`);
    console.log(`[Bootstrap] Target FPS: ${this.perfOptimizer.settings.targetFPS}`);
  }

  /**
   * Initialize the game bootstrap process
   */
  public async initialize(): Promise<void> {
    try {
      // Phase 1: Show menu immediately
      console.log('[Bootstrap] Phase 1: Showing main menu...');
      this.menuManager = new MenuManager();
      
      // Register start game callback
      this.menuManager.onStart(() => {
        this.startGame();
      });
      
      console.log('[Bootstrap] ✓ Menu displayed');
      
      // Phase 2: Start background preloading
      console.log('[Bootstrap] Phase 2: Starting background asset preload...');
      await this.preloadAssetsInBackground();
      
      console.log('[Bootstrap] ✓ Bootstrap initialization complete');
      console.log('[Bootstrap] Waiting for user to start game...');
      
    } catch (error) {
      console.error('[Bootstrap] ✗ Initialization failed:', error);
      this.showError(error instanceof Error ? error.message : 'Unknown error');
      throw error;
    }
  }

  /**
   * Preload critical assets in the background while user is in menu
   */
  private async preloadAssetsInBackground(): Promise<void> {
    this.assetPreloader = new AssetPreloader(this.assetLoader);
    
    // Set up progress callback (could be used to show a small progress indicator in menu)
    this.assetPreloader.onProgress((progress, message) => {
      console.log(`[Bootstrap] Preload progress: ${Math.round(progress)}% - ${message}`);
    });
    
    try {
      // Preload in background - don't block menu
      await this.assetPreloader.preloadCriticalAssets();
      this.isPreloadComplete = true;
      console.log('[Bootstrap] ✓ Background preload complete');
    } catch (error) {
      console.warn('[Bootstrap] Some assets failed to preload, will load on-demand:', error);
      // Don't fail - game can still work with on-demand loading
      this.isPreloadComplete = true;
    }
  }

  /**
   * Start the game when user clicks "Start Game"
   */
  private async startGame(): Promise<void> {
    console.log('\n=================================================');
    console.log('   STARTING GAME');
    console.log('=================================================');
    
    try {
      // Create loading manager
      this.loadingManager = new LoadingManager();
      this.loadingManager.updateProgress(5, 'Initializing game...');
      
      // Small delay to ensure loading screen renders
      await this.delay(100);
      
      // Check if preload is complete
      if (!this.isPreloadComplete) {
        this.loadingManager.updateProgress(10, 'Waiting for assets...');
        console.log('[Bootstrap] Waiting for background preload to complete...');
        
        // Wait for preload to complete (with timeout)
        const timeout = 30000; // 30 seconds max
        const startTime = Date.now();
        while (!this.isPreloadComplete && (Date.now() - startTime) < timeout) {
          await this.delay(100);
        }
      }
      
      this.loadingManager.updateProgress(20, 'Creating game engine...');
      await this.delay(50);
      
      // Initialize game engine
      console.log('[Bootstrap] Initializing game engine...');
      this.gameEngine = new GameEngine(this.perfOptimizer);
      
      this.loadingManager.updateProgress(30, 'Loading game systems...');
      
      // Initialize all game systems with progress tracking
      await this.gameEngine.initialize((progress: number, message: string) => {
        // Map 0-100% progress to 30-90% of loading bar
        const adjustedProgress = 30 + (progress * 0.6);
        this.loadingManager?.updateProgress(adjustedProgress, message);
      });
      
      this.loadingManager.updateProgress(90, 'Starting game loop...');
      await this.delay(100);
      
      // Start game loop
      console.log('[Bootstrap] Starting game loop...');
      this.gameEngine.start();
      
      this.loadingManager.updateProgress(95, 'Finalizing...');
      await this.delay(100);
      
      // Mark as initialized
      this.isGameInitialized = true;
      
      // Complete loading
      this.loadingManager.complete();
      
      console.log('\n=================================================');
      console.log('   ✓ GAME STARTED SUCCESSFULLY!');
      console.log('=================================================');
      this.logGameInfo();
      
      // Expose to window for debugging
      (window as Window & { gameEngine?: GameEngine }).gameEngine = this.gameEngine;
      (window as Window & { perfOptimizer?: PerformanceOptimizer }).perfOptimizer = this.perfOptimizer;
      
      // Set up cleanup
      this.setupCleanup();
      
    } catch (error) {
      console.error('\n=================================================');
      console.error('   ✗ GAME START FAILED');
      console.error('=================================================');
      console.error(error);
      
      this.showError(error instanceof Error ? error.message : 'Unknown error occurred');
      throw error;
    }
  }

  /**
   * Log game information
   */
  private logGameInfo(): void {
    const settings = this.perfOptimizer.getSettings();
    
    console.log(`\nPerformance Settings:`);
    console.log(`  Device Tier: ${this.perfOptimizer.deviceTier.toUpperCase()}`);
    console.log(`  Target FPS: ${settings.targetFPS}`);
    console.log(`  Shadows: ${settings.shadows ? 'ON' : 'OFF'}`);
    console.log(`  View Distance: ${settings.viewDistance}m`);
    console.log(`  Antialiasing: ${settings.antialiasing ? 'ON' : 'OFF'}`);
    console.log(`  Texture Quality: ${settings.textureQuality}`);
    
    console.log(`\nGame Controls:`);
    console.log(`  WASD - Movement`);
    console.log(`  Mouse - Look around`);
    console.log(`  E - Interact`);
    console.log(`  I - Inventory`);
    console.log(`  Q - Quest Log`);
    console.log(`  C - Character Stats`);
    console.log(`  M - Map`);
    console.log(`  F1 - Debug Console`);
    
    console.log(`\nAsset Preload:`);
    console.log(`  Preloaded Assets: ${this.assetPreloader?.getPreloadedCount() || 0}`);
    
    console.log('\n=================================================\n');
  }

  /**
   * Set up cleanup handlers
   */
  private setupCleanup(): void {
    window.addEventListener('beforeunload', () => {
      console.log('[Bootstrap] Shutting down game...');
      if (this.gameEngine) {
        this.gameEngine.stop();
      }
    });
  }

  /**
   * Show error message
   */
  private showError(message: string): void {
    if (this.loadingManager) {
      this.loadingManager.showError(message);
    } else {
      alert(`Game Error: ${message}\n\nPlease check the console (F12) for more details.`);
    }
  }

  /**
   * Utility delay function
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Get game engine instance
   */
  public getGameEngine(): GameEngine | null {
    return this.gameEngine;
  }

  /**
   * Check if game is initialized
   */
  public isInitialized(): boolean {
    return this.isGameInitialized;
  }

  /**
   * Get menu manager
   */
  public getMenuManager(): MenuManager | null {
    return this.menuManager;
  }
}
