import * as THREE from 'three';

/**
 * GraphicsQualityManager - Dynamic quality adjustment for optimal performance
 * Implements adaptive quality scaling based on FPS
 */
export class GraphicsQualityManager {
  private renderer: THREE.WebGLRenderer;
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  
  private currentQuality: 'low' | 'medium' | 'high' | 'ultra';
  private targetFPS: number = 60;
  private fpsHistory: number[] = [];
  private historySize: number = 60; // 1 second at 60fps
  
  // Quality settings
  private qualitySettings = {
    low: {
      pixelRatio: 0.75,
      shadowMapSize: 1024,
      viewDistance: 300,
      fogStart: 150,
      fogEnd: 300,
      antialiasing: false,
      shadows: false,
      toneMappingExposure: 1.0
    },
    medium: {
      pixelRatio: 1.0,
      shadowMapSize: 2048,
      viewDistance: 500,
      fogStart: 250,
      fogEnd: 500,
      antialiasing: true,
      shadows: true,
      toneMappingExposure: 1.1
    },
    high: {
      pixelRatio: Math.min(window.devicePixelRatio, 1.5),
      shadowMapSize: 4096,
      viewDistance: 750,
      fogStart: 400,
      fogEnd: 750,
      antialiasing: true,
      shadows: true,
      toneMappingExposure: 1.2
    },
    ultra: {
      pixelRatio: window.devicePixelRatio,
      shadowMapSize: 8192,
      viewDistance: 1000,
      fogStart: 500,
      fogEnd: 1000,
      antialiasing: true,
      shadows: true,
      toneMappingExposure: 1.3
    }
  };
  
  constructor(
    renderer: THREE.WebGLRenderer,
    scene: THREE.Scene,
    camera: THREE.PerspectiveCamera,
    initialQuality: 'low' | 'medium' | 'high' | 'ultra' = 'high'
  ) {
    this.renderer = renderer;
    this.scene = scene;
    this.camera = camera;
    this.currentQuality = initialQuality;
    
    this.applyQualitySettings(initialQuality);
    
    console.log(`[GraphicsQualityManager] Initialized with ${initialQuality} quality`);
  }
  
  /**
   * Apply quality settings to renderer and scene
   */
  private applyQualitySettings(quality: 'low' | 'medium' | 'high' | 'ultra'): void {
    const settings = this.qualitySettings[quality];
    
    // Update renderer
    this.renderer.setPixelRatio(settings.pixelRatio);
    this.renderer.shadowMap.enabled = settings.shadows;
    this.renderer.toneMappingExposure = settings.toneMappingExposure;
    
    // Update camera far plane
    this.camera.far = settings.viewDistance;
    this.camera.updateProjectionMatrix();
    
    // Update fog
    if (this.scene.fog instanceof THREE.Fog) {
      this.scene.fog.near = settings.fogStart;
      this.scene.fog.far = settings.fogEnd;
    } else {
      this.scene.fog = new THREE.Fog(0x87CEEB, settings.fogStart, settings.fogEnd);
    }
    
    console.log(`[GraphicsQualityManager] Applied ${quality} settings:`);
    console.log(`  - Pixel Ratio: ${settings.pixelRatio}`);
    console.log(`  - View Distance: ${settings.viewDistance}m`);
    console.log(`  - Shadows: ${settings.shadows ? 'ON' : 'OFF'}`);
    console.log(`  - Shadow Map Size: ${settings.shadowMapSize}x${settings.shadowMapSize}`);
  }
  
  /**
   * Record FPS sample for adaptive quality
   */
  public recordFPS(fps: number): void {
    this.fpsHistory.push(fps);
    
    if (this.fpsHistory.length > this.historySize) {
      this.fpsHistory.shift();
    }
  }
  
  /**
   * Get average FPS from history
   */
  public getAverageFPS(): number {
    if (this.fpsHistory.length === 0) return 60;
    
    const sum = this.fpsHistory.reduce((a, b) => a + b, 0);
    return sum / this.fpsHistory.length;
  }
  
  /**
   * Automatically adjust quality based on performance
   */
  public autoAdjustQuality(): boolean {
    const avgFPS = this.getAverageFPS();
    
    // Need enough samples before adjusting
    if (this.fpsHistory.length < this.historySize) {
      return false;
    }
    
    let newQuality = this.currentQuality;
    
    // Decrease quality if FPS is too low
    if (avgFPS < this.targetFPS * 0.8) {
      if (this.currentQuality === 'ultra') newQuality = 'high';
      else if (this.currentQuality === 'high') newQuality = 'medium';
      else if (this.currentQuality === 'medium') newQuality = 'low';
    }
    // Increase quality if FPS is good
    else if (avgFPS > this.targetFPS * 0.95) {
      if (this.currentQuality === 'low') newQuality = 'medium';
      else if (this.currentQuality === 'medium') newQuality = 'high';
      else if (this.currentQuality === 'high') newQuality = 'ultra';
    }
    
    if (newQuality !== this.currentQuality) {
      console.log(`[GraphicsQualityManager] Auto-adjusting quality: ${this.currentQuality} -> ${newQuality} (avg FPS: ${avgFPS.toFixed(1)})`);
      this.setQuality(newQuality);
      return true;
    }
    
    return false;
  }
  
  /**
   * Manually set quality level
   */
  public setQuality(quality: 'low' | 'medium' | 'high' | 'ultra'): void {
    if (quality === this.currentQuality) return;
    
    this.currentQuality = quality;
    this.applyQualitySettings(quality);
    
    // Clear FPS history when manually changing quality
    this.fpsHistory = [];
  }
  
  /**
   * Get current quality level
   */
  public getCurrentQuality(): 'low' | 'medium' | 'high' | 'ultra' {
    return this.currentQuality;
  }
  
  /**
   * Get quality settings for current level
   */
  public getSettings(): Record<string, unknown> {
    return { ...this.qualitySettings[this.currentQuality] };
  }
  
  // FPS limits
  private static readonly MIN_TARGET_FPS = 30;
  private static readonly MAX_TARGET_FPS = 144;
  
  /**
   * Set target FPS for auto-adjustment
   */
  public setTargetFPS(fps: number): void {
    this.targetFPS = Math.max(
      GraphicsQualityManager.MIN_TARGET_FPS, 
      Math.min(GraphicsQualityManager.MAX_TARGET_FPS, fps)
    );
    console.log(`[GraphicsQualityManager] Target FPS set to ${this.targetFPS}`);
  }
  
  /**
   * Get rendering statistics
   */
  public getStats(): Record<string, unknown> {
    return {
      quality: this.currentQuality,
      averageFPS: this.getAverageFPS(),
      targetFPS: this.targetFPS,
      settings: this.getSettings(),
      rendererInfo: {
        drawCalls: this.renderer.info.render.calls,
        triangles: this.renderer.info.render.triangles,
        geometries: this.renderer.info.memory.geometries,
        textures: this.renderer.info.memory.textures
      }
    };
  }
}
