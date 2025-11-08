import * as THREE from 'three';

/**
 * AdvancedLightingSystem - Professional lighting setup for open world games
 * Implements multi-light setup with proper intensities and shadow configuration
 */
export class AdvancedLightingSystem {
  private scene: THREE.Scene;
  private lights: Map<string, THREE.Light> = new Map();
  private timeOfDay: number = 12; // 0-24 hours
  
  // Light configuration
  private sunLight!: THREE.DirectionalLight;
  private ambientLight!: THREE.AmbientLight;
  private hemisphereLight!: THREE.HemisphereLight;
  private fillLights: THREE.PointLight[] = [];
  
  constructor(scene: THREE.Scene) {
    this.scene = scene;
    
    this.setupMainLights();
    this.setupFillLights();
    
    console.log('[AdvancedLightingSystem] Professional lighting system initialized');
  }
  
  private setupMainLights(): void {
    // Sun - Primary directional light
    this.sunLight = new THREE.DirectionalLight(0xfff5e6, 2.0); // Warm sunlight
    this.sunLight.position.set(100, 150, 50);
    this.sunLight.castShadow = true;
    
    // Configure high-quality shadows
    this.sunLight.shadow.mapSize.width = 4096;
    this.sunLight.shadow.mapSize.height = 4096;
    this.sunLight.shadow.camera.near = 0.5;
    this.sunLight.shadow.camera.far = 500;
    this.sunLight.shadow.camera.left = -150;
    this.sunLight.shadow.camera.right = 150;
    this.sunLight.shadow.camera.top = 150;
    this.sunLight.shadow.camera.bottom = -150;
    this.sunLight.shadow.bias = -0.0001;
    this.sunLight.shadow.normalBias = 0.02;
    
    this.scene.add(this.sunLight);
    this.lights.set('sun', this.sunLight);
    
    // Ambient light - Provides base illumination
    this.ambientLight = new THREE.AmbientLight(0xb0c4de, 0.6); // Soft blue-white
    this.scene.add(this.ambientLight);
    this.lights.set('ambient', this.ambientLight);
    
    // Hemisphere light - Sky and ground colors
    this.hemisphereLight = new THREE.HemisphereLight(
      0x87CEEB, // Sky color - bright blue
      0x4a7c59, // Ground color - earthy green
      0.8        // Intensity
    );
    this.hemisphereLight.position.set(0, 50, 0);
    this.scene.add(this.hemisphereLight);
    this.lights.set('hemisphere', this.hemisphereLight);
    
    console.log('[AdvancedLightingSystem] Main lights configured:');
    console.log('  - Directional Sun: 2.0 intensity, 4096x4096 shadows');
    console.log('  - Ambient: 0.6 intensity');
    console.log('  - Hemisphere: 0.8 intensity');
  }
  
  private setupFillLights(): void {
    // Add subtle fill lights to eliminate harsh shadows
    // These are positioned to fill in dark areas
    const fillLight1 = new THREE.PointLight(0xffffff, 0.3, 100);
    fillLight1.position.set(-50, 20, 50);
    this.scene.add(fillLight1);
    this.fillLights.push(fillLight1);
    
    const fillLight2 = new THREE.PointLight(0xffffff, 0.3, 100);
    fillLight2.position.set(50, 20, -50);
    this.scene.add(fillLight2);
    this.fillLights.push(fillLight2);
    
    console.log(`[AdvancedLightingSystem] ${this.fillLights.length} fill lights added`);
  }
  
  // Constants for sun position calculation
  private static readonly MIN_SUN_HEIGHT = 10; // Minimum sun height above horizon
  
  /**
   * Update lighting based on time of day
   */
  public updateTimeOfDay(hour: number): void {
    this.timeOfDay = hour % 24;
    
    // Calculate sun position
    const sunAngle = (this.timeOfDay / 24) * Math.PI * 2 - Math.PI / 2;
    const sunHeight = Math.sin(sunAngle);
    const sunDistance = 200;
    
    this.sunLight.position.set(
      Math.cos(sunAngle) * sunDistance,
      Math.max(sunHeight * sunDistance, AdvancedLightingSystem.MIN_SUN_HEIGHT), // Never go below horizon
      Math.sin(sunAngle) * sunDistance * 0.5
    );
    
    // Adjust light intensities based on time
    if (this.timeOfDay >= 6 && this.timeOfDay <= 18) {
      // Daytime (6 AM - 6 PM)
      const dayProgress = (this.timeOfDay - 6) / 12;
      const maxIntensity = 2.0;
      const intensity = Math.sin(dayProgress * Math.PI) * maxIntensity;
      
      this.sunLight.intensity = Math.max(intensity, 0.3);
      this.sunLight.color.setHex(0xfff5e6); // Warm daylight
      this.ambientLight.intensity = 0.6;
      this.hemisphereLight.intensity = 0.8;
    } else {
      // Nighttime
      this.sunLight.intensity = 0.1;
      this.sunLight.color.setHex(0x9db4c0); // Moonlight blue
      this.ambientLight.intensity = 0.3;
      this.hemisphereLight.intensity = 0.4;
    }
  }
  
  /**
   * Set custom sun intensity
   */
  public setSunIntensity(intensity: number): void {
    this.sunLight.intensity = Math.max(0, Math.min(3, intensity));
  }
  
  /**
   * Set ambient light intensity
   */
  public setAmbientIntensity(intensity: number): void {
    this.ambientLight.intensity = Math.max(0, Math.min(2, intensity));
  }
  
  /**
   * Set hemisphere light intensity
   */
  public setHemisphereIntensity(intensity: number): void {
    this.hemisphereLight.intensity = Math.max(0, Math.min(2, intensity));
  }
  
  /**
   * Enable/disable shadows
   */
  public setShadowsEnabled(enabled: boolean): void {
    this.sunLight.castShadow = enabled;
    console.log(`[AdvancedLightingSystem] Shadows ${enabled ? 'enabled' : 'disabled'}`);
  }
  
  /**
   * Get sun light for day/night cycle integration
   */
  public getSunLight(): THREE.DirectionalLight {
    return this.sunLight;
  }
  
  /**
   * Get ambient light
   */
  public getAmbientLight(): THREE.AmbientLight {
    return this.ambientLight;
  }
  
  /**
   * Get hemisphere light
   */
  public getHemisphereLight(): THREE.HemisphereLight {
    return this.hemisphereLight;
  }
  
  /**
   * Get all lights
   */
  public getAllLights(): THREE.Light[] {
    return Array.from(this.lights.values()).concat(this.fillLights);
  }
  
  /**
   * Add debug helpers to visualize lights
   */
  public addDebugHelpers(): void {
    const sunHelper = new THREE.DirectionalLightHelper(this.sunLight, 10);
    this.scene.add(sunHelper);
    
    const hemisphereHelper = new THREE.HemisphereLightHelper(this.hemisphereLight, 10);
    this.scene.add(hemisphereHelper);
    
    this.fillLights.forEach(light => {
      const helper = new THREE.PointLightHelper(light, 5);
      this.scene.add(helper);
    });
    
    console.log('[AdvancedLightingSystem] Debug helpers added');
  }
  
  /**
   * Remove all lights from scene
   */
  public dispose(): void {
    this.lights.forEach(light => this.scene.remove(light));
    this.fillLights.forEach(light => this.scene.remove(light));
    this.lights.clear();
    this.fillLights = [];
    
    console.log('[AdvancedLightingSystem] Disposed');
  }
}
