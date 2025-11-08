import * as THREE from 'three';
import { FastTrackWorldComplete } from './FastTrackWorldComplete';
import { SkyboxManager } from './SkyboxManager';
import { DayNightCycle } from './DayNightCycle';
import { WeatherSystem } from './WeatherSystem';
import { EnhancedVegetationPlacer } from './EnhancedVegetationPlacer';
import { AdvancedLightingSystem } from '../core/AdvancedLightingSystem';
import { PBRMaterialSystem } from '../core/PBRMaterialSystem';
import { CompleteAssetIntegrator } from '../assets/CompleteAssetIntegrator';

/**
 * ComprehensiveWorldManager - Master world management system
 * ENHANCEMENT: Integrates all world systems following AUTONOMOUS_DEVELOPMENT_GUIDE2.MD
 * Coordinates terrain, vegetation, lighting, weather, and day/night cycles
 */
export class ComprehensiveWorldManager {
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private renderer: THREE.WebGLRenderer;
  
  // Core systems
  private fastTrackWorld: FastTrackWorldComplete | null = null;
  private skyboxManager: SkyboxManager;
  private dayNightCycle: DayNightCycle | null = null;
  private weatherSystem: WeatherSystem | null = null;
  private lightingSystem: AdvancedLightingSystem;
  private vegetationPlacer: EnhancedVegetationPlacer;
  private pbrMaterialSystem: PBRMaterialSystem;
  private assetIntegrator: CompleteAssetIntegrator;
  
  // State
  private isInitialized = false;
  private worldBuildComplete = false;
  
  constructor(scene: THREE.Scene, camera: THREE.PerspectiveCamera, renderer: THREE.WebGLRenderer) {
    this.scene = scene;
    this.camera = camera;
    this.renderer = renderer;
    
    // Initialize core systems
    this.skyboxManager = new SkyboxManager(scene);
    this.lightingSystem = new AdvancedLightingSystem(scene);
    this.vegetationPlacer = new EnhancedVegetationPlacer();
    this.pbrMaterialSystem = new PBRMaterialSystem();
    this.assetIntegrator = new CompleteAssetIntegrator();
    
    console.log('[ComprehensiveWorldManager] Initialized with all systems');
  }
  
  /**
   * Initialize all world systems
   */
  async initialize(): Promise<void> {
    console.log('[ComprehensiveWorldManager] Starting initialization...');
    
    // Load skybox
    console.log('[ComprehensiveWorldManager] Loading skybox...');
    await this.skyboxManager.loadSkybox('day');
    
    // Initialize day/night cycle
    console.log('[ComprehensiveWorldManager] Initializing day/night cycle...');
    this.dayNightCycle = new DayNightCycle(this.scene, this.skyboxManager);
    
    // Initialize weather system
    console.log('[ComprehensiveWorldManager] Initializing weather system...');
    this.weatherSystem = new WeatherSystem(this.scene, this.camera);
    
    // Set initial lighting
    console.log('[ComprehensiveWorldManager] Configuring lighting...');
    this.lightingSystem.updateTimeOfDay(12); // Start at noon
    
    // Log asset inventory
    this.assetIntegrator.logInventory();
    
    this.isInitialized = true;
    console.log('[ComprehensiveWorldManager] ✅ Initialization complete');
  }
  
  /**
   * Build complete world using FastTrack system
   */
  async buildWorld(progressCallback?: (progress: number, message: string) => void): Promise<void> {
    if (!this.isInitialized) {
      throw new Error('[ComprehensiveWorldManager] Must initialize before building world');
    }
    
    console.log('[ComprehensiveWorldManager] Building complete world...');
    
    // Create FastTrack world builder
    this.fastTrackWorld = new FastTrackWorldComplete(this.scene, this.camera, this.renderer);
    
    // Build the world
    await this.fastTrackWorld.buildCompleteWorld();
    
    this.worldBuildComplete = true;
    console.log('[ComprehensiveWorldManager] ✅ World build complete');
  }
  
  /**
   * Update all systems (call every frame)
   */
  update(deltaTime: number): void {
    if (!this.isInitialized) return;
    
    // Update day/night cycle
    if (this.dayNightCycle) {
      this.dayNightCycle.update(deltaTime);
    }
    
    // Update skybox based on time
    this.skyboxManager.update(deltaTime);
    
    // Update lighting
    this.lightingSystem.update(deltaTime);
    
    // Update weather
    if (this.weatherSystem) {
      this.weatherSystem.update(deltaTime);
    }
  }
  
  /**
   * ENHANCEMENT: Enable automatic day/night cycle
   */
  enableDayNightCycle(speed?: number): void {
    if (this.dayNightCycle) {
      this.dayNightCycle.setSpeed(speed || 0.01);
      this.dayNightCycle.start();
      console.log('[ComprehensiveWorldManager] Day/night cycle enabled');
    }
    
    // Also enable lighting auto-update
    this.lightingSystem.enableAutoCycle(speed || 0.01);
    
    // And skybox auto-update
    this.skyboxManager.resumeTime();
    if (speed) {
      this.skyboxManager.setTimeSpeed(speed / 10); // Skybox updates slower
    }
  }
  
  /**
   * ENHANCEMENT: Disable automatic day/night cycle
   */
  disableDayNightCycle(): void {
    if (this.dayNightCycle) {
      this.dayNightCycle.stop();
      console.log('[ComprehensiveWorldManager] Day/night cycle disabled');
    }
    
    this.lightingSystem.disableAutoCycle();
    this.skyboxManager.pauseTime();
  }
  
  /**
   * ENHANCEMENT: Set specific time of day
   */
  setTimeOfDay(hour: number): void {
    if (this.dayNightCycle) {
      this.dayNightCycle.setTime(hour);
    }
    this.lightingSystem.updateTimeOfDay(hour);
    this.skyboxManager.setTime(hour / 24);
  }
  
  /**
   * ENHANCEMENT: Change weather
   */
  setWeather(type: 'clear' | 'rain' | 'snow' | 'fog'): void {
    if (this.weatherSystem) {
      switch(type) {
        case 'rain':
          this.weatherSystem.setRainIntensity(0.5);
          break;
        case 'snow':
          this.weatherSystem.setSnowIntensity(0.5);
          break;
        case 'fog':
          this.weatherSystem.setFogIntensity(0.8);
          break;
        case 'clear':
          this.weatherSystem.setRainIntensity(0);
          this.weatherSystem.setSnowIntensity(0);
          this.weatherSystem.setFogIntensity(0);
          break;
      }
      console.log(`[ComprehensiveWorldManager] Weather set to: ${type}`);
    }
  }
  
  /**
   * Get all systems for external access
   */
  getSystems() {
    return {
      skybox: this.skyboxManager,
      dayNight: this.dayNightCycle,
      weather: this.weatherSystem,
      lighting: this.lightingSystem,
      vegetation: this.vegetationPlacer,
      materials: this.pbrMaterialSystem,
      assets: this.assetIntegrator,
      world: this.fastTrackWorld
    };
  }
  
  /**
   * Get world statistics
   */
  getStatistics(): {
    worldBuildComplete: boolean;
    timeOfDay: number;
    assetCount: number;
    systems: string[];
  } {
    return {
      worldBuildComplete: this.worldBuildComplete,
      timeOfDay: this.lightingSystem.getTimeOfDay(),
      assetCount: this.assetIntegrator.getTotalAssetCount(),
      systems: [
        'FastTrackWorld',
        'SkyboxManager',
        'DayNightCycle',
        'WeatherSystem',
        'AdvancedLightingSystem',
        'EnhancedVegetationPlacer',
        'PBRMaterialSystem',
        'CompleteAssetIntegrator'
      ]
    };
  }
  
  /**
   * Log current status
   */
  logStatus(): void {
    const stats = this.getStatistics();
    console.log('\n=== COMPREHENSIVE WORLD MANAGER STATUS ===');
    console.log(`Initialized: ${this.isInitialized}`);
    console.log(`World Build Complete: ${stats.worldBuildComplete}`);
    console.log(`Time of Day: ${stats.timeOfDay.toFixed(1)} hours`);
    console.log(`Total Assets: ${stats.assetCount}`);
    console.log(`Active Systems: ${stats.systems.length}`);
    console.log('Systems:');
    stats.systems.forEach(sys => console.log(`  - ${sys}`));
    console.log('=== END STATUS ===\n');
  }
  
  /**
   * Cleanup
   */
  dispose(): void {
    this.skyboxManager.dispose();
    this.lightingSystem.dispose();
    if (this.dayNightCycle) {
      this.dayNightCycle.dispose();
    }
    if (this.weatherSystem) {
      this.weatherSystem.dispose();
    }
    console.log('[ComprehensiveWorldManager] Disposed');
  }
}
