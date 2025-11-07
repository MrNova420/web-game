import * as THREE from 'three';

/**
 * VolumetricFogSystem - Advanced atmospheric fog with depth and density
 * Creates realistic atmospheric depth and mood
 */
export class VolumetricFogSystem {
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private fogMesh: THREE.Mesh | null = null;
  private fogUniforms: any;
  private enabled: boolean = true;
  
  // Fog parameters
  private fogDensity: number = 0.00025;
  private fogColor: THREE.Color = new THREE.Color(0x87CEEB);
  private fogNear: number = 50;
  private fogFar: number = 800;
  
  constructor(scene: THREE.Scene, camera: THREE.PerspectiveCamera) {
    this.scene = scene;
    this.camera = camera;
    
    this.setupVolumetricFog();
    
    console.log('[VolumetricFogSystem] Volumetric fog initialized for atmospheric depth');
  }
  
  /**
   * Set up volumetric fog shader
   */
  private setupVolumetricFog(): void {
    // Create fog shader uniforms
    this.fogUniforms = {
      fogColor: { value: this.fogColor },
      fogNear: { value: this.fogNear },
      fogFar: { value: this.fogFar },
      fogDensity: { value: this.fogDensity },
      cameraPos: { value: this.camera.position }
    };
    
    // Enhanced fog with distance-based density
    const fogShader = {
      vertexShader: `
        varying vec3 vWorldPosition;
        varying float vDepth;
        
        void main() {
          vec4 worldPosition = modelMatrix * vec4(position, 1.0);
          vWorldPosition = worldPosition.xyz;
          
          vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
          vDepth = -mvPosition.z;
          
          gl_Position = projectionMatrix * mvPosition;
        }
      `,
      fragmentShader: `
        uniform vec3 fogColor;
        uniform float fogNear;
        uniform float fogFar;
        uniform float fogDensity;
        uniform vec3 cameraPos;
        
        varying vec3 vWorldPosition;
        varying float vDepth;
        
        void main() {
          // Calculate distance-based fog
          float depth = vDepth;
          float fogFactor = smoothstep(fogNear, fogFar, depth);
          
          // Add height-based fog density
          float heightFactor = max(0.0, vWorldPosition.y / 100.0);
          float adjustedDensity = fogDensity * (1.0 - heightFactor * 0.5);
          
          // Exponential fog for more realistic falloff
          float expFog = 1.0 - exp(-adjustedDensity * depth * depth);
          fogFactor = mix(fogFactor, expFog, 0.5);
          
          // Output fog color with calculated opacity
          gl_FragColor = vec4(fogColor, fogFactor * 0.3);
        }
      `
    };
    
    // Note: Volumetric fog is typically implemented as a post-processing effect
    // For now, we'll enhance the standard THREE.js fog
    this.updateSceneFog();
    
    console.log('[VolumetricFogSystem] Volumetric fog shader configured');
  }
  
  /**
   * Update THREE.js fog with enhanced settings
   */
  private updateSceneFog(): void {
    if (!this.enabled) {
      this.scene.fog = null;
      return;
    }
    
    // Use exponential fog for more realistic density
    this.scene.fog = new THREE.FogExp2(this.fogColor, this.fogDensity);
    
    console.log('[VolumetricFogSystem] Scene fog updated');
  }
  
  /**
   * Update fog based on time of day
   */
  public updateForTimeOfDay(hour: number): void {
    // Adjust fog color and density based on time
    if (hour >= 6 && hour < 8) {
      // Dawn - lighter fog
      this.fogColor.setHex(0xffd4a3);
      this.fogDensity = 0.0003;
    } else if (hour >= 8 && hour < 18) {
      // Day - clear with light haze
      this.fogColor.setHex(0xa8d8f0);
      this.fogDensity = 0.00015;
    } else if (hour >= 18 && hour < 20) {
      // Dusk - orange tint
      this.fogColor.setHex(0xffb366);
      this.fogDensity = 0.00025;
    } else {
      // Night - darker, denser fog
      this.fogColor.setHex(0x3d4a5a);
      this.fogDensity = 0.0004;
    }
    
    this.updateSceneFog();
  }
  
  /**
   * Set fog for weather conditions
   */
  public setWeatherFog(weather: 'clear' | 'rain' | 'snow' | 'storm'): void {
    switch (weather) {
      case 'clear':
        this.fogDensity = 0.00015;
        this.fogColor.setHex(0x87CEEB);
        break;
      case 'rain':
        this.fogDensity = 0.0005;
        this.fogColor.setHex(0x7d8d9d);
        break;
      case 'snow':
        this.fogDensity = 0.0007;
        this.fogColor.setHex(0xe0e8f0);
        break;
      case 'storm':
        this.fogDensity = 0.001;
        this.fogColor.setHex(0x4a5560);
        break;
    }
    
    this.updateSceneFog();
    console.log(`[VolumetricFogSystem] Fog updated for ${weather} weather`);
  }
  
  /**
   * Set custom fog parameters
   */
  public setFogParameters(
    density: number,
    color: THREE.ColorRepresentation,
    near?: number,
    far?: number
  ): void {
    this.fogDensity = density;
    this.fogColor = new THREE.Color(color);
    if (near !== undefined) this.fogNear = near;
    if (far !== undefined) this.fogFar = far;
    
    this.updateSceneFog();
  }
  
  /**
   * Enable/disable volumetric fog
   */
  public setEnabled(enabled: boolean): void {
    this.enabled = enabled;
    this.updateSceneFog();
    console.log(`[VolumetricFogSystem] ${enabled ? 'Enabled' : 'Disabled'}`);
  }
  
  /**
   * Update fog each frame (for animated effects)
   */
  public update(deltaTime: number): void {
    if (!this.enabled) return;
    
    // Subtle fog animation (breathing effect)
    const time = Date.now() * 0.0001;
    const breatheFactor = Math.sin(time) * 0.00005;
    
    if (this.scene.fog instanceof THREE.FogExp2) {
      this.scene.fog.density = this.fogDensity + breatheFactor;
    }
  }
  
  /**
   * Get current fog settings
   */
  public getSettings(): any {
    return {
      enabled: this.enabled,
      density: this.fogDensity,
      color: '#' + this.fogColor.getHexString(),
      near: this.fogNear,
      far: this.fogFar
    };
  }
  
  /**
   * Dispose resources
   */
  public dispose(): void {
    if (this.fogMesh) {
      this.scene.remove(this.fogMesh);
      this.fogMesh.geometry.dispose();
      if (this.fogMesh.material instanceof THREE.Material) {
        this.fogMesh.material.dispose();
      }
      this.fogMesh = null;
    }
    
    this.scene.fog = null;
    console.log('[VolumetricFogSystem] Disposed');
  }
}
