import * as THREE from 'three';

/**
 * EnhancedWeatherEffects - Advanced dynamic weather system
 * Builds on WeatherSystem with realistic atmospheric effects
 */
export class EnhancedWeatherEffects {
  private scene: THREE.Scene;
  private camera: THREE.Camera;
  
  // Lightning effects
  private lightningLight: THREE.PointLight | null = null;
  private lightningFlashes: number = 0;
  private lastLightningTime: number = 0;
  
  // Wind effects
  private windDirection: THREE.Vector3 = new THREE.Vector3(1, 0, 0);
  private windStrength: number = 0;
  
  // Rain splash effects
  private splashParticles: THREE.Points | null = null;
  private splashGeometry: THREE.BufferGeometry | null = null;
  
  // Atmospheric effects
  private volumetricLightMesh: THREE.Mesh | null = null;
  
  constructor(scene: THREE.Scene, camera: THREE.Camera) {
    this.scene = scene;
    this.camera = camera;
    
    this.setupLightning();
    
    console.log('[EnhancedWeatherEffects] Advanced weather effects initialized');
  }
  
  /**
   * Set up lightning system for storms
   */
  private setupLightning(): void {
    this.lightningLight = new THREE.PointLight(0xffffff, 0, 500);
    this.lightningLight.position.set(0, 100, 0);
    this.scene.add(this.lightningLight);
  }
  
  /**
   * Trigger lightning flash with managed timing
   */
  private lightningState = { intensity: 0, step: 0 };
  private lightningTimerId: number | null = null;
  
  private triggerLightning(): void {
    if (!this.lightningLight) return;
    
    // Random position for lightning
    const angle = Math.random() * Math.PI * 2;
    const distance = 50 + Math.random() * 150;
    this.lightningLight.position.set(
      Math.cos(angle) * distance,
      80 + Math.random() * 40,
      Math.sin(angle) * distance
    );
    
    // Use state-based animation instead of multiple timeouts
    this.lightningState = { intensity: 15, step: 0 };
    this.animateLightning();
    
    console.log('[EnhancedWeatherEffects] Lightning flash triggered');
  }
  
  private animateLightning(): void {
    if (!this.lightningLight) return;
    
    switch (this.lightningState.step) {
      case 0:
        this.lightningLight.intensity = 15;
        this.lightningTimerId = window.setTimeout(() => this.animateLightning(), 50);
        break;
      case 1:
        this.lightningLight.intensity = 0;
        this.lightningTimerId = window.setTimeout(() => this.animateLightning(), 50);
        break;
      case 2:
        this.lightningLight.intensity = 10;
        this.lightningTimerId = window.setTimeout(() => this.animateLightning(), 50);
        break;
      case 3:
        this.lightningLight.intensity = 0;
        this.lightningTimerId = null;
        return;
    }
    
    this.lightningState.step++;
  }
  
  /**
   * Create rain splash effects on ground
   */
  private createRainSplashes(): void {
    const splashCount = 200;
    this.splashGeometry = new THREE.BufferGeometry();
    const positions = new Float32Array(splashCount * 3);
    const colors = new Float32Array(splashCount * 3);
    
    for (let i = 0; i < splashCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 100;
      positions[i * 3 + 1] = 0.1;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 100;
      
      colors[i * 3] = 0.8;
      colors[i * 3 + 1] = 0.9;
      colors[i * 3 + 2] = 1.0;
    }
    
    this.splashGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    this.splashGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    
    const splashMaterial = new THREE.PointsMaterial({
      size: 0.5,
      vertexColors: true,
      transparent: true,
      opacity: 0.4,
      blending: THREE.AdditiveBlending
    });
    
    this.splashParticles = new THREE.Points(this.splashGeometry, splashMaterial);
    this.scene.add(this.splashParticles);
  }
  
  /**
   * Create volumetric light rays (god rays) - created once, toggled for performance
   */
  private createVolumetricLight(): void {
    // Only create if it doesn't exist
    if (this.volumetricLightMesh) return;
    
    const geometry = new THREE.CylinderGeometry(0.1, 40, 200, 32, 1, true);
    const material = new THREE.ShaderMaterial({
      uniforms: {
        color: { value: new THREE.Color(0xffffff) },
        intensity: { value: 0.3 }
      },
      vertexShader: `
        varying vec3 vNormal;
        varying vec3 vPosition;
        void main() {
          vNormal = normalize(normalMatrix * normal);
          vPosition = position;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform vec3 color;
        uniform float intensity;
        varying vec3 vNormal;
        varying vec3 vPosition;
        
        void main() {
          float edge = 1.0 - abs(dot(vNormal, vec3(0.0, 0.0, 1.0)));
          float heightFade = 1.0 - (vPosition.y / 100.0);
          float alpha = edge * heightFade * intensity;
          gl_FragColor = vec4(color, alpha);
        }
      `,
      transparent: true,
      side: THREE.DoubleSide,
      depthWrite: false,
      blending: THREE.AdditiveBlending
    });
    
    this.volumetricLightMesh = new THREE.Mesh(geometry, material);
    this.volumetricLightMesh.position.set(50, 100, -50);
    this.volumetricLightMesh.rotation.x = Math.PI;
    this.scene.add(this.volumetricLightMesh);
    
    console.log('[EnhancedWeatherEffects] Volumetric lighting created');
  }
  
  /**
   * Update weather effects
   */
  public update(deltaTime: number, weather: string, _playerPosition: THREE.Vector3): void {
    const currentTime = Date.now();
    
    // Update based on weather type
    switch (weather) {
      case 'storm':
        this.updateStorm(currentTime);
        this.windStrength = 0.8;
        break;
      case 'rain':
        this.windStrength = 0.3;
        break;
      case 'clear':
        this.windStrength = 0.1;
        // Toggle volumetric lighting (don't recreate each time)
        if (Math.random() < 0.001 && !this.volumetricLightMesh) {
          this.createVolumetricLight();
        }
        break;
      default:
        this.windStrength = 0.2;
    }
    
    // Update wind direction
    const windTime = currentTime * 0.0001;
    this.windDirection.set(
      Math.cos(windTime),
      0,
      Math.sin(windTime)
    ).normalize();
    
    // Update volumetric light position to follow sun
    if (this.volumetricLightMesh) {
      const sunAngle = (currentTime * 0.00001) % (Math.PI * 2);
      this.volumetricLightMesh.position.x = Math.cos(sunAngle) * 100;
      this.volumetricLightMesh.position.z = Math.sin(sunAngle) * 100;
    }
    
    // Animate rain splashes
    if (this.splashParticles && this.splashGeometry) {
      const positions = this.splashGeometry.attributes.position.array as Float32Array;
      for (let i = 0; i < positions.length; i += 3) {
        // Ripple effect
        positions[i + 1] = 0.1 + Math.sin(currentTime * 0.01 + i) * 0.05;
      }
      this.splashGeometry.attributes.position.needsUpdate = true;
    }
  }
  
  /**
   * Update storm effects
   */
  private updateStorm(currentTime: number): void {
    // Random lightning strikes
    if (currentTime - this.lastLightningTime > 3000 + Math.random() * 7000) {
      this.triggerLightning();
      this.lastLightningTime = currentTime;
      this.lightningFlashes++;
    }
  }
  
  /**
   * Set weather type
   */
  public setWeather(weather: string): void {
    // Clean up old effects
    if (this.splashParticles) {
      this.scene.remove(this.splashParticles);
      this.splashGeometry?.dispose();
      this.splashParticles = null;
      this.splashGeometry = null;
    }
    
    // Create new effects based on weather
    switch (weather) {
      case 'rain':
      case 'storm':
        this.createRainSplashes();
        break;
      case 'clear':
        // Remove intensive effects
        break;
    }
    
    console.log(`[EnhancedWeatherEffects] Weather set to: ${weather}`);
  }
  
  /**
   * Get wind data for vegetation
   */
  public getWindData(): { direction: THREE.Vector3; strength: number } {
    return {
      direction: this.windDirection.clone(),
      strength: this.windStrength
    };
  }
  
  /**
   * Enable/disable volumetric lighting
   */
  public setVolumetricLighting(enabled: boolean): void {
    if (enabled && !this.volumetricLightMesh) {
      this.createVolumetricLight();
    } else if (!enabled && this.volumetricLightMesh) {
      this.scene.remove(this.volumetricLightMesh);
      this.volumetricLightMesh.geometry.dispose();
      if (this.volumetricLightMesh.material instanceof THREE.Material) {
        this.volumetricLightMesh.material.dispose();
      }
      this.volumetricLightMesh = null;
    }
  }
  
  /**
   * Get statistics
   */
  public getStats(): { lightningFlashes: number; windStrength: number } {
    return {
      lightningFlashes: this.lightningFlashes,
      windStrength: this.windStrength,
      windDirection: this.windDirection.toArray(),
      volumetricLightActive: !!this.volumetricLightMesh
    };
  }
  
  /**
   * Dispose resources
   */
  public dispose(): void {
    // Clean up lightning timer
    if (this.lightningTimerId !== null) {
      window.clearTimeout(this.lightningTimerId);
      this.lightningTimerId = null;
    }
    
    if (this.lightningLight) {
      this.scene.remove(this.lightningLight);
    }
    
    if (this.splashParticles) {
      this.scene.remove(this.splashParticles);
      this.splashGeometry?.dispose();
    }
    
    if (this.volumetricLightMesh) {
      this.scene.remove(this.volumetricLightMesh);
      this.volumetricLightMesh.geometry.dispose();
      if (this.volumetricLightMesh.material instanceof THREE.Material) {
        this.volumetricLightMesh.material.dispose();
      }
    }
    
    console.log('[EnhancedWeatherEffects] Disposed');
  }
}
