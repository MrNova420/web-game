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

/**
 * GameEngine - Main game engine coordinating all systems
 * Integrates all 33 game systems into a cohesive MMO experience
 */
export class GameEngine {
  // THREE.js core
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private renderer: THREE.WebGLRenderer;
  
  // Integration
  private integrationManager: IntegrationManager;
  private assetLoader: AssetLoader;
  
  // Game loop
  private isRunning: boolean = false;
  private isPaused: boolean = false;
  private lastTime: number = 0;
  private deltaTime: number = 0;
  private frameId: number = 0;
  
  // Fixed timestep
  private readonly TARGET_FPS = 60;
  private readonly FRAME_TIME = 1000 / this.TARGET_FPS;
  private accumulator: number = 0;
  
  constructor() {
    console.log('[GameEngine] Initializing Fantasy Survival MMO...');
    
    // Initialize THREE.js
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    this.renderer = new THREE.WebGLRenderer({ 
      antialias: true,
      powerPreference: 'high-performance'
    });
    
    this.setupRenderer();
    
    // Initialize integration manager
    this.integrationManager = new IntegrationManager();
    
    // Initialize asset loader
    this.assetLoader = new AssetLoader();
    
    console.log('[GameEngine] Core initialization complete');
  }
  
  private setupRenderer(): void {
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    
    document.body.appendChild(this.renderer.domElement);
    
    // Handle window resize
    window.addEventListener('resize', () => {
      this.camera.aspect = window.innerWidth / window.innerHeight;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(window.innerWidth, window.innerHeight);
    });
  }
  
  /**
   * Initialize all game systems
   */
  public async initialize(): Promise<void> {
    console.log('[GameEngine] Initializing all game systems...');
    
    try {
      // Phase 1: World & Environment Systems
      await this.initializeWorldSystems();
      
      // Phase 2: Character & Animation Systems
      await this.initializeCharacterSystems();
      
      // Phase 3: Entity Systems
      await this.initializeEntitySystems();
      
      // Phase 4: Gameplay Systems
      await this.initializeGameplaySystems();
      
      // Phase 5: Combat & Multiplayer
      await this.initializeCombatSystems();
      
      // Phase 6: UI & Audio
      await this.initializeUIAudioSystems();
      
      // Phase 7: Optimization & Polish
      await this.initializeOptimizationSystems();
      
      // Initialize all systems through integration manager
      await this.integrationManager.initializeAll();
      
      console.log('[GameEngine] ✓ All 33 systems initialized successfully!');
      console.log('[GameEngine] Game is ready to start!');
      
    } catch (error) {
      console.error('[GameEngine] ✗ Initialization failed:', error);
      throw error;
    }
  }
  
  private async initializeWorldSystems(): Promise<void> {
    console.log('[GameEngine] Initializing World Systems...');
    
    // Terrain
    const terrainGen = new RealAssetTerrainGenerator(this.assetLoader);
    this.integrationManager.registerSystem('terrain', terrainGen, []);
    
    // Biomes
    const biomeSystem = new BiomeSystem();
    this.integrationManager.registerSystem('biomes', biomeSystem, []);
    
    // Chunks
    const chunkManager = new ChunkManager(this.scene, terrainGen, this.camera);
    this.integrationManager.registerSystem('chunks', chunkManager, ['terrain', 'biomes']);
    
    // Vegetation
    const vegetation = new VegetationManager(this.scene, this.assetLoader);
    this.integrationManager.registerSystem('vegetation', vegetation, ['terrain']);
    
    // Grass
    const grass = new GrassSystem(this.scene, this.assetLoader);
    this.integrationManager.registerSystem('grass', grass, ['terrain']);
    
    // Skybox
    const skybox = new SkyboxManager(this.scene);
    this.integrationManager.registerSystem('skybox', skybox, []);
    
    // Day/Night Cycle
    const dayNight = new DayNightCycle(this.scene);
    this.integrationManager.registerSystem('daynight', dayNight, ['skybox']);
    
    // Weather
    const weather = new WeatherSystem(this.scene, this.camera);
    this.integrationManager.registerSystem('weather', weather, []);
    
    // Dungeons
    const dungeon = new DungeonSystem(this.scene, this.assetLoader);
    this.integrationManager.registerSystem('dungeon', dungeon, ['terrain']);
  }
  
  private async initializeCharacterSystems(): Promise<void> {
    console.log('[GameEngine] Initializing Character Systems...');
    
    const characters = new CharacterSystem(this.scene, this.assetLoader);
    this.integrationManager.registerSystem('characters', characters, []);
    
    const animations = new AnimationSystem();
    this.integrationManager.registerSystem('animations', animations, ['characters']);
    
    const playerStats = new PlayerStatsSystem();
    this.integrationManager.registerSystem('playerStats', playerStats, ['characters']);
  }
  
  private async initializeEntitySystems(): Promise<void> {
    console.log('[GameEngine] Initializing Entity Systems...');
    
    const npcs = new NPCSystem(this.scene, this.assetLoader);
    this.integrationManager.registerSystem('npcs', npcs, ['characters']);
    
    const enemies = new EnemySystem(this.scene, this.assetLoader, this.camera);
    this.integrationManager.registerSystem('enemies', enemies, ['characters']);
  }
  
  private async initializeGameplaySystems(): Promise<void> {
    console.log('[GameEngine] Initializing Gameplay Systems...');
    
    const inventory = new InventorySystem(this.scene, this.assetLoader);
    this.integrationManager.registerSystem('inventory', inventory, []);
    
    const quests = new QuestSystem();
    this.integrationManager.registerSystem('quests', quests, []);
    
    const crafting = new CraftingSystem(this.scene, this.assetLoader);
    this.integrationManager.registerSystem('crafting', crafting, ['inventory']);
    
    const building = new BuildingSystem(this.scene, this.assetLoader);
    this.integrationManager.registerSystem('building', building, ['inventory']);
    
    const resources = new ResourceSystem(this.scene, this.assetLoader);
    this.integrationManager.registerSystem('resources', resources, ['inventory']);
  }
  
  private async initializeCombatSystems(): Promise<void> {
    console.log('[GameEngine] Initializing Combat & Multiplayer Systems...');
    
    const combat = new CombatSystem(this.scene);
    this.integrationManager.registerSystem('combat', combat, ['playerStats', 'enemies']);
    
    const network = new NetworkSystem();
    this.integrationManager.registerSystem('network', network, []);
  }
  
  private async initializeUIAudioSystems(): Promise<void> {
    console.log('[GameEngine] Initializing UI & Audio Systems...');
    
    const ui = new UISystem();
    this.integrationManager.registerSystem('ui', ui, ['playerStats', 'inventory', 'quests']);
    
    const audio = new AudioSystem();
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
