import * as THREE from 'three';
import { IntegrationManager } from '../systems/IntegrationManager';
import { AssetLoader } from '../assets/AssetLoader';
import { RealAssetTerrainGenerator } from '../world/RealAssetTerrainGenerator';
import { ChunkManager } from '../world/ChunkManager';
import { BiomeSystem } from '../world/BiomeSystem';
import { VegetationManager } from '../world/VegetationManager';
import { GrassSystem } from '../world/GrassSystem';
import { SkyboxManager } from '../world/SkyboxManager';
import { DayNightCycle } from '../world/DayNightCycle';
import { WeatherSystem } from '../world/WeatherSystem';

// Import all game systems
import { CharacterSystem } from '../systems/CharacterSystem';
import { AnimationSystem } from '../systems/AnimationSystem';
import { PlayerStatsSystem } from '../systems/PlayerStatsSystem';
import { NPCSystem } from '../systems/NPCSystem';
import { EnemySystem } from '../systems/EnemySystem';
import { InventorySystem } from '../systems/InventorySystem';
import { QuestSystem } from '../systems/QuestSystem';
import { CraftingSystem } from '../systems/CraftingSystem';
import { BuildingSystem } from '../systems/BuildingSystem';
import { ResourceSystem } from '../systems/ResourceSystem';
import { CombatSystem } from '../systems/CombatSystem';
import { NetworkSystem } from '../systems/NetworkSystem';
import { UISystem } from '../systems/UISystem';
import { AudioSystem } from '../systems/AudioSystem';
import { ParticleSystem } from '../systems/ParticleSystem';
import { SaveSystem } from '../systems/SaveSystem';
import { AchievementSystem } from '../systems/AchievementSystem';
import { MinimapSystem } from '../systems/MinimapSystem';
import { TutorialSystem } from '../systems/TutorialSystem';
import { InputManager } from '../systems/InputManager';
import { PerformanceMonitor } from '../systems/PerformanceMonitor';
import { AssetPool } from '../systems/AssetPool';
import { SettingsSystem } from '../systems/SettingsSystem';
import { EnvironmentEffects } from '../systems/EnvironmentEffects';
import { DebugSystem } from '../systems/DebugSystem';
import { LODManager } from '../systems/LODManager';
import { DungeonSystem } from '../systems/DungeonSystem';
import { PerformanceOptimizer } from '../utils/PerformanceOptimizer';
import { PlayerController } from './PlayerController';

// Type for progress callback
type ProgressCallback = (progress: number, message: string) => void;

/**
 * GameEngine - Main game engine coordinating all systems
 * Integrates all 39 game systems into a cohesive MMO experience with performance optimization
 */
export class GameEngine {
  // THREE.js core
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private renderer: THREE.WebGLRenderer;
  
  // Integration
  private integrationManager: IntegrationManager;
  private assetLoader: AssetLoader;
  private perfOptimizer: PerformanceOptimizer;
  
  // CONTROLS FIX: Add PlayerController
  private playerController: PlayerController | null = null;
  
  // Game loop
  private isRunning: boolean = false;
  private isPaused: boolean = false;
  private lastTime: number = 0;
  private deltaTime: number = 0;
  private frameId: number = 0;
  
  // Fixed timestep
  private TARGET_FPS: number = 60;
  private FRAME_TIME: number = 1000 / this.TARGET_FPS;
  private accumulator: number = 0;
  
  constructor(perfOptimizer?: PerformanceOptimizer) {
    console.log('[GameEngine] Initializing Optimized Fantasy Survival MMO...');
    
    // Get or create performance optimizer
    this.perfOptimizer = perfOptimizer || PerformanceOptimizer.getInstance();
    const settings = this.perfOptimizer.getSettings();
    
    // Adjust target FPS based on device
    this.TARGET_FPS = settings.targetFPS;
    this.FRAME_TIME = 1000 / this.TARGET_FPS;
    
    console.log(`[GameEngine] Performance tier: ${this.perfOptimizer.deviceTier}`);
    console.log(`[GameEngine] Target FPS: ${this.TARGET_FPS}`);
    
    // Initialize THREE.js with performance settings
    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.Fog(0x87CEEB, 10, settings.viewDistance);
    
    this.camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      settings.viewDistance
    );
    this.camera.position.set(0, 20, 30); // Set initial camera position
    
    this.renderer = new THREE.WebGLRenderer({ 
      antialias: settings.antialiasing,
      powerPreference: 'high-performance',
      alpha: false
    });
    
    this.setupRenderer(settings);
    
    // Initialize integration manager
    this.integrationManager = new IntegrationManager();
    
    // Initialize asset loader
    this.assetLoader = new AssetLoader();
    
    console.log('[GameEngine] Core initialization complete');
  }
  
  private setupRenderer(settings: any): void {
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    
    // Adjust pixel ratio based on device tier
    const pixelRatio = settings.textureQuality === 'low' ? 1 : 
                      settings.textureQuality === 'medium' ? Math.min(window.devicePixelRatio, 1.5) :
                      Math.min(window.devicePixelRatio, 2);
    this.renderer.setPixelRatio(pixelRatio);
    
    this.renderer.shadowMap.enabled = settings.shadows;
    if (settings.shadows) {
      this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    }
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    
    // Append to existing canvas or body
    const existingCanvas = document.getElementById('game-canvas');
    if (existingCanvas && existingCanvas !== this.renderer.domElement) {
      existingCanvas.remove();
    }
    document.body.appendChild(this.renderer.domElement);
    
    // Handle window resize
    window.addEventListener('resize', () => {
      this.camera.aspect = window.innerWidth / window.innerHeight;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(window.innerWidth, window.innerHeight);
    });
  }
  
  /**
   * Initialize all game systems with progress tracking
   */
  public async initialize(progressCallback?: ProgressCallback): Promise<void> {
    console.log('[GameEngine] Initializing all game systems...');
    
    const updateProgress = (progress: number, message: string) => {
      if (progressCallback) progressCallback(progress, message);
    };
    
    try {
      // Phase 1: World & Environment Systems (0-20%)
      updateProgress(0, 'Loading world systems...');
      await this.initializeWorldSystems();
      updateProgress(20, 'World systems loaded');
      
      // Phase 2: Character & Animation Systems (20-35%)
      updateProgress(20, 'Loading character systems...');
      await this.initializeCharacterSystems();
      updateProgress(35, 'Character systems loaded');
      
      // Phase 3: Entity Systems (35-50%)
      updateProgress(35, 'Loading entity systems...');
      await this.initializeEntitySystems();
      updateProgress(50, 'Entity systems loaded');
      
      // Phase 4: Gameplay Systems (50-65%)
      updateProgress(50, 'Loading gameplay systems...');
      await this.initializeGameplaySystems();
      updateProgress(65, 'Gameplay systems loaded');
      
      // Phase 5: Combat & Multiplayer (65-80%)
      updateProgress(65, 'Loading combat systems...');
      await this.initializeCombatSystems();
      updateProgress(80, 'Combat systems loaded');
      
      // Phase 6: UI & Audio (80-90%)
      updateProgress(80, 'Loading UI and audio...');
      await this.initializeUIAudioSystems();
      updateProgress(90, 'UI and audio loaded');
      
      // Phase 7: Optimization & Polish (90-100%)
      updateProgress(90, 'Optimizing systems...');
      await this.initializeOptimizationSystems();
      updateProgress(95, 'Systems optimized');
      
      // Initialize all systems through integration manager
      updateProgress(95, 'Integrating systems...');
      await this.integrationManager.initializeAll();
      
      // CONTROLS FIX: Initialize player controller
      updateProgress(98, 'Setting up player controls...');
      this.initializePlayerController();
      
      updateProgress(100, 'All systems ready!');
      
      console.log('[GameEngine] ✓ All 39 systems initialized successfully!');
      console.log('[GameEngine] ✓ Player controls ready!');
      console.log('[GameEngine] Game is ready to start!');
      
    } catch (error) {
      console.error('[GameEngine] ✗ Initialization failed:', error);
      throw error;
    }
  }
  
  /**
   * CONTROLS FIX: Initialize player controller for movement
   */
  private initializePlayerController(): void {
    console.log('[GameEngine] Initializing player controller...');
    
    // Set camera at spawn position
    const startPosition = new THREE.Vector3(0, 25, 30);
    this.camera.position.copy(startPosition);
    
    // Create player controller for WASD + mouse controls
    this.playerController = new PlayerController(this.camera, startPosition);
    
    console.log('[GameEngine] ✓ Player controller initialized - WASD + Mouse controls active');
  }
  
  private async initializeWorldSystems(): Promise<void> {
    console.log('[GameEngine] Initializing World Systems...');
    
    // Terrain with INSTANCING fix
    const terrainGen = new RealAssetTerrainGenerator(this.assetLoader);
    this.integrationManager.registerSystem('terrain', terrainGen, []);
    
    // PERFORMANCE FIX: Pre-load all tile models for instancing
    console.log('[GameEngine] Pre-loading terrain tiles for GPU instancing...');
    await terrainGen.preloadTileModels(this.scene);
    
    // Biomes
    const biomeSystem = new BiomeSystem();
    this.integrationManager.registerSystem('biomes', biomeSystem, []);
    
    // Chunks - pass only terrain generator, then set scene
    const chunkManager = new ChunkManager(terrainGen);
    chunkManager.setScene(this.scene);
    this.integrationManager.registerSystem('chunks', chunkManager, ['terrain', 'biomes']);
    
    // Vegetation - pass asset loader and terrain generator  
    const vegetation = new VegetationManager(this.assetLoader, terrainGen);
    this.integrationManager.registerSystem('vegetation', vegetation, ['terrain']);
    
    // PERFORMANCE FIX: Pre-load all vegetation models for instancing
    console.log('[GameEngine] Pre-loading vegetation models for GPU instancing...');
    await vegetation.preloadVegetationModels(this.scene);
    
    // Grass - pass terrain generator and asset loader
    const grass = new GrassSystem(terrainGen, this.assetLoader);
    this.integrationManager.registerSystem('grass', grass, ['terrain']);
    
    // Link vegetation and grass to chunk manager
    chunkManager.setVegetationManager(vegetation);
    chunkManager.setGrassSystem(grass);
    
    // Skybox - FIXED to load properly
    const skybox = new SkyboxManager(this.scene);
    this.integrationManager.registerSystem('skybox', skybox, []);
    await skybox.loadSkybox('day'); // Load skybox immediately
    
    // Create lights for day/night cycle
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(50, 100, 50);
    directionalLight.castShadow = true;
    this.scene.add(directionalLight);
    
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    this.scene.add(ambientLight);
    
    // Day/Night Cycle - pass lights and skybox
    const dayNight = new DayNightCycle(directionalLight, ambientLight, skybox);
    this.integrationManager.registerSystem('daynight', dayNight, ['skybox']);
    
    // Weather
    const weather = new WeatherSystem(this.scene);
    this.integrationManager.registerSystem('weather', weather, []);
    
    // Dungeons - pass asset loader
    const dungeon = new DungeonSystem(this.assetLoader);
    this.integrationManager.registerSystem('dungeon', dungeon, ['terrain']);
  }
  
  private async initializeCharacterSystems(): Promise<void> {
    console.log('[GameEngine] Initializing Character Systems...');
    
    const characters = new CharacterSystem(this.assetLoader);
    this.integrationManager.registerSystem('characters', characters, []);
    
    const animations = new AnimationSystem();
    this.integrationManager.registerSystem('animations', animations, ['characters']);
    
    const playerStats = new PlayerStatsSystem();
    this.integrationManager.registerSystem('playerStats', playerStats, ['characters']);
  }
  
  private async initializeEntitySystems(): Promise<void> {
    console.log('[GameEngine] Initializing Entity Systems...');
    
    const npcs = new NPCSystem(this.assetLoader);
    this.integrationManager.registerSystem('npcs', npcs, ['characters']);
    
    const enemies = new EnemySystem(this.assetLoader);
    this.integrationManager.registerSystem('enemies', enemies, ['characters']);
  }
  
  private async initializeGameplaySystems(): Promise<void> {
    console.log('[GameEngine] Initializing Gameplay Systems...');
    
    const inventory = new InventorySystem(this.assetLoader);
    this.integrationManager.registerSystem('inventory', inventory, []);
    
    const quests = new QuestSystem();
    this.integrationManager.registerSystem('quests', quests, []);
    
    const crafting = new CraftingSystem(this.assetLoader);
    this.integrationManager.registerSystem('crafting', crafting, ['inventory']);
    
    const building = new BuildingSystem(this.assetLoader);
    this.integrationManager.registerSystem('building', building, ['inventory']);
    
    const resources = new ResourceSystem(this.assetLoader);
    this.integrationManager.registerSystem('resources', resources, ['inventory']);
  }
  
  private async initializeCombatSystems(): Promise<void> {
    console.log('[GameEngine] Initializing Combat & Multiplayer Systems...');
    
    const combat = new CombatSystem();
    this.integrationManager.registerSystem('combat', combat, ['playerStats', 'enemies']);
    
    const network = new NetworkSystem();
    this.integrationManager.registerSystem('network', network, []);
  }
  
  private async initializeUIAudioSystems(): Promise<void> {
    console.log('[GameEngine] Initializing UI & Audio Systems...');
    
    const ui = new UISystem();
    this.integrationManager.registerSystem('ui', ui, ['playerStats', 'inventory', 'quests']);
    
    const audio = new AudioSystem(this.camera);
    this.integrationManager.registerSystem('audio', audio, []);
    
    const particles = new ParticleSystem(this.scene);
    this.integrationManager.registerSystem('particles', particles, []);
    
    const minimap = new MinimapSystem();
    this.integrationManager.registerSystem('minimap', minimap, ['enemies', 'npcs', 'resources']);
    
    const tutorial = new TutorialSystem();
    this.integrationManager.registerSystem('tutorial', tutorial, ['ui']);
    
    const input = new InputManager();
    this.integrationManager.registerSystem('input', input, []);
  }
  
  private async initializeOptimizationSystems(): Promise<void> {
    console.log('[GameEngine] Initializing Optimization Systems...');
    
    const performance = new PerformanceMonitor();
    this.integrationManager.registerSystem('performance', performance, []);
    
    const assetPool = new AssetPool();
    this.integrationManager.registerSystem('assetPool', assetPool, []);
    
    const settings = new SettingsSystem();
    this.integrationManager.registerSystem('settings', settings, []);
    
    const environment = new EnvironmentEffects(this.scene, this.camera);
    this.integrationManager.registerSystem('environment', environment, ['audio', 'weather']);
    
    const debug = new DebugSystem(this.scene, this.camera);
    this.integrationManager.registerSystem('debug', debug, []);
    
    const lod = new LODManager(this.scene, this.camera);
    this.integrationManager.registerSystem('lod', lod, []);
    
    const save = new SaveSystem();
    this.integrationManager.registerSystem('save', save, ['playerStats', 'inventory', 'quests']);
    
    const achievements = new AchievementSystem();
    this.integrationManager.registerSystem('achievements', achievements, ['playerStats', 'quests']);
  }
  
  /**
   * Start the game loop
   */
  public start(): void {
    if (this.isRunning) {
      console.warn('[GameEngine] Game is already running');
      return;
    }
    
    console.log('[GameEngine] Starting game loop...');
    this.isRunning = true;
    this.isPaused = false;
    this.lastTime = performance.now();
    this.gameLoop();
  }
  
  /**
   * Main game loop with fixed timestep
   */
  private gameLoop = (): void => {
    if (!this.isRunning) return;
    
    const currentTime = performance.now();
    let frameTime = currentTime - this.lastTime;
    this.lastTime = currentTime;
    
    // Cap frame time to prevent spiral of death
    if (frameTime > 250) frameTime = 250;
    
    this.accumulator += frameTime;
    
    // Fixed timestep updates
    while (this.accumulator >= this.FRAME_TIME) {
      if (!this.isPaused) {
        this.deltaTime = this.FRAME_TIME / 1000;
        this.update(this.deltaTime);
      }
      this.accumulator -= this.FRAME_TIME;
    }
    
    // Render
    this.render();
    
    // Continue loop
    this.frameId = requestAnimationFrame(this.gameLoop);
  };
  
  /**
   * Update all systems
   */
  private update(deltaTime: number): void {
    // CONTROLS FIX: Update player controller for movement
    if (this.playerController) {
      const terrainGen = this.integrationManager.getSystem<RealAssetTerrainGenerator>('terrain');
      const terrainHeight = terrainGen 
        ? terrainGen.getHeight(this.camera.position.x, this.camera.position.z)
        : 0;
      
      this.playerController.update(deltaTime, terrainHeight);
    }
    
    // Update player position in chunk manager
    const chunkManager = this.integrationManager.getSystem<ChunkManager>('chunks');
    if (chunkManager) {
      chunkManager.setPlayerPosition(this.camera.position);
    }
    
    // Update all systems through integration manager
    this.integrationManager.updateAll(deltaTime);
  }
  
  /**
   * Render the scene
   */
  private render(): void {
    this.renderer.render(this.scene, this.camera);
  }
  
  /**
   * Pause the game
   */
  public pause(): void {
    this.isPaused = true;
    this.integrationManager.pauseAll();
    console.log('[GameEngine] Game paused');
  }
  
  /**
   * Resume the game
   */
  public resume(): void {
    this.isPaused = false;
    this.integrationManager.resumeAll();
    console.log('[GameEngine] Game resumed');
  }
  
  /**
   * Stop the game
   */
  public stop(): void {
    if (!this.isRunning) return;
    
    console.log('[GameEngine] Stopping game...');
    this.isRunning = false;
    
    if (this.frameId) {
      cancelAnimationFrame(this.frameId);
    }
    
    this.dispose();
  }
  
  /**
   * Get integration manager for direct system access
   */
  public getIntegrationManager(): IntegrationManager {
    return this.integrationManager;
  }
  
  /**
   * Get statistics
   */
  public getStats(): any {
    return {
      fps: Math.round(1 / this.deltaTime),
      deltaTime: this.deltaTime,
      isPaused: this.isPaused,
      systemStats: this.integrationManager.getStats()
    };
  }
  
  /**
   * Cleanup
   */
  public dispose(): void {
    console.log('[GameEngine] Disposing...');
    
    // Dispose all systems
    this.integrationManager.disposeAll();
    
    // Dispose THREE.js
    this.scene.traverse((object) => {
      if (object instanceof THREE.Mesh) {
        object.geometry.dispose();
        if (Array.isArray(object.material)) {
          object.material.forEach(mat => mat.dispose());
        } else {
          object.material.dispose();
        }
      }
    });
    
    this.renderer.dispose();
    
    console.log('[GameEngine] Disposed successfully');
  }
}
