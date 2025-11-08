import * as THREE from 'three';

/**
 * SkyboxManager - Enhanced to support day/night cycle and smooth transitions
 * ENHANCEMENT: Following AUTONOMOUS_DEVELOPMENT_GUIDE2.MD Section V
 */
export class SkyboxManager {
  private scene: THREE.Scene;
  private textureLoader: THREE.TextureLoader;
  private currentSkybox: THREE.Mesh | null = null;
  
  // ENHANCEMENT: Time of day tracking for dynamic skybox
  private timeOfDay: number = 0.5; // 0-1 (0=midnight, 0.5=noon, 1=midnight)
  private timeSpeed: number = 0.0001; // Speed of day/night cycle
  private isPaused: boolean = false;

  private skyboxes = {
    day: '/extracted_assets/Skyboxes/BlueSkySkybox.png',
    sunset: '/extracted_assets/Skyboxes/SunsetSky.png',
    green: '/extracted_assets/Skyboxes/GreenSky.png',
    purple: '/extracted_assets/Skyboxes/PurplyBlueSky.png',
    default: '/extracted_assets/Skyboxes/SkySkybox.png'
  };

  constructor(scene: THREE.Scene) {
    this.scene = scene;
    this.textureLoader = new THREE.TextureLoader();
    console.log('[SkyboxManager] Enhanced with day/night cycle support');
  }

  async loadSkybox(type: 'day' | 'sunset' | 'green' | 'purple' | 'default' = 'day') {
    // Remove existing skybox if any
    if (this.currentSkybox) {
      this.scene.remove(this.currentSkybox);
      this.currentSkybox.geometry.dispose();
      (this.currentSkybox.material as THREE.Material).dispose();
      this.currentSkybox = null;
    }

    const skyboxPath = this.skyboxes[type];
    
    try {
      // RENDERING FIX: Properly load skybox texture with error handling
      const texture = await this.textureLoader.loadAsync(skyboxPath);
      texture.colorSpace = THREE.SRGBColorSpace;
      texture.minFilter = THREE.LinearFilter;
      texture.magFilter = THREE.LinearFilter;
      
      // Create a large sphere for the skybox
      const geometry = new THREE.SphereGeometry(900, 60, 40); // Larger and smoother
      const material = new THREE.MeshBasicMaterial({
        map: texture,
        side: THREE.BackSide, // Render inside of sphere
        depthWrite: false,
        fog: false // Skybox should not be affected by fog
      });

      this.currentSkybox = new THREE.Mesh(geometry, material);
      this.currentSkybox.renderOrder = -1; // Render skybox first
      this.currentSkybox.frustumCulled = false; // Never cull skybox
      this.currentSkybox.name = `skybox_${type}`;
      this.scene.add(this.currentSkybox);
      
      console.log(`[SkyboxManager] Skybox loaded successfully: ${type} (radius: 900)`);
    } catch (error) {
      console.warn(`[SkyboxManager] Failed to load skybox: ${type}`, error);
      // Fallback: Use scene background color
      this.scene.background = new THREE.Color(0x87CEEB); // Sky blue
    }
  }

  setSkyboxTime(hour: number) {
    // Automatically set skybox based on time of day
    if (hour >= 6 && hour < 18) {
      this.loadSkybox('day');
    } else if (hour >= 18 && hour < 20) {
      this.loadSkybox('sunset');
    } else {
      this.loadSkybox('purple');
    }
  }
  
  // ENHANCEMENT: Update time of day for dynamic cycle
  update(deltaTime: number): void {
    if (this.isPaused) return;
    
    // Advance time
    this.timeOfDay += this.timeSpeed * deltaTime;
    if (this.timeOfDay > 1.0) this.timeOfDay -= 1.0;
    
    // Update skybox based on time
    this.updateSkyboxByTime();
  }
  
  // ENHANCEMENT: Automatically switch skybox based on time of day
  private updateSkyboxByTime(): void {
    const hour = this.timeOfDay * 24;
    
    // Sunrise (5-7)
    if (hour >= 5 && hour < 7) {
      if (!this.currentSkybox || !this.currentSkybox.name.includes('sunset')) {
        this.loadSkybox('sunset');
      }
    }
    // Day (7-17)
    else if (hour >= 7 && hour < 17) {
      if (!this.currentSkybox || !this.currentSkybox.name.includes('day')) {
        this.loadSkybox('day');
      }
    }
    // Sunset (17-19)
    else if (hour >= 17 && hour < 19) {
      if (!this.currentSkybox || !this.currentSkybox.name.includes('sunset')) {
        this.loadSkybox('sunset');
      }
    }
    // Night (19-5)
    else {
      if (!this.currentSkybox || !this.currentSkybox.name.includes('purple')) {
        this.loadSkybox('purple');
      }
    }
  }
  
  // ENHANCEMENT: Control time speed
  setTimeSpeed(speed: number): void {
    this.timeSpeed = speed;
    console.log(`[SkyboxManager] Time speed set to ${speed}`);
  }
  
  // ENHANCEMENT: Set specific time of day
  setTime(time: number): void {
    this.timeOfDay = Math.max(0, Math.min(1, time));
    this.updateSkyboxByTime();
    console.log(`[SkyboxManager] Time set to ${(this.timeOfDay * 24).toFixed(1)} hours`);
  }
  
  // ENHANCEMENT: Convenience methods
  setSunrise(): void {
    this.setTime(0.25); // 6 AM
  }
  
  setNoon(): void {
    this.setTime(0.5); // 12 PM
  }
  
  setSunset(): void {
    this.setTime(0.75); // 6 PM
  }
  
  setMidnight(): void {
    this.setTime(0.0); // 12 AM
  }
  
  // ENHANCEMENT: Pause/resume time
  pauseTime(): void {
    this.isPaused = true;
  }
  
  resumeTime(): void {
    this.isPaused = false;
  }
  
  // ENHANCEMENT: Get current time
  getTimeOfDay(): number {
    return this.timeOfDay;
  }

  dispose() {
    if (this.currentSkybox) {
      this.scene.remove(this.currentSkybox);
      this.currentSkybox.geometry.dispose();
      (this.currentSkybox.material as THREE.Material).dispose();
      this.currentSkybox = null;
    }
  }
}
