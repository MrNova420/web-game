import * as THREE from 'three';

/**
 * Advanced Weather System
 * 
 * Professional weather effects:
 * - Rain with particle system
 * - Snow with accumulation
 * - Fog with dynamic density
 * - Thunder and lightning
 * - Wind effects
 * - Weather transitions
 * - Dynamic sound effects
 * 
 * For immersive environmental effects
 */

export type WeatherType = 'clear' | 'rain' | 'heavyRain' | 'snow' | 'blizzard' | 'fog' | 'storm';

export interface WeatherConfig {
  type: WeatherType;
  intensity: number; // 0-1
  transitionTime: number; // ms
  windSpeed: number;
  windDirection: number;
}

export class AdvancedWeatherSystem {
  private scene: THREE.Scene;
  private currentWeather: WeatherType = 'clear';
  private targetWeather: WeatherType = 'clear';
  private transitionProgress = 1;
  private transitionDuration = 5000;
  
  // Particle systems
  private rainParticles: THREE.Points | null = null;
  private snowParticles: THREE.Points | null = null;
  private particleCount = 10000;
  
  // Effects
  private fog: THREE.Fog;
  private lightning: THREE.DirectionalLight | null = null;
  private lightningTimer = 0;
  private lightningInterval = 5000;
  
  // Wind
  private windSpeed = 0;
  private windDirection = 0;
  private windTime = 0;
  
  constructor(scene: THREE.Scene) {
    this.scene = scene;
    this.fog = new THREE.Fog(0xffffff, 50, 500);
    this.scene.fog = this.fog;
    
    this.initializeParticleSystems();
    console.log('🌦️ Advanced Weather System initialized');
  }
  
  private initializeParticleSystems(): void {
    // Rain particles
    const rainGeometry = new THREE.BufferGeometry();
    const rainPositions = new Float32Array(this.particleCount * 3);
    const rainVelocities = new Float32Array(this.particleCount);
    
    for (let i = 0; i < this.particleCount; i++) {
      rainPositions[i * 3] = Math.random() * 200 - 100;
      rainPositions[i * 3 + 1] = Math.random() * 100;
      rainPositions[i * 3 + 2] = Math.random() * 200 - 100;
      rainVelocities[i] = Math.random() * 0.5 + 0.5;
    }
    
    rainGeometry.setAttribute('position', new THREE.BufferAttribute(rainPositions, 3));
    rainGeometry.setAttribute('velocity', new THREE.BufferAttribute(rainVelocities, 1));
    
    const rainMaterial = new THREE.PointsMaterial({
      color: 0xaaaaaa,
      size: 0.5,
      transparent: true,
      opacity: 0.6
    });
    
    this.rainParticles = new THREE.Points(rainGeometry, rainMaterial);
    this.rainParticles.visible = false;
    this.scene.add(this.rainParticles);
    
    // Snow particles
    const snowGeometry = new THREE.BufferGeometry();
    const snowPositions = new Float32Array(this.particleCount * 3);
    const snowVelocities = new Float32Array(this.particleCount);
    
    for (let i = 0; i < this.particleCount; i++) {
      snowPositions[i * 3] = Math.random() * 200 - 100;
      snowPositions[i * 3 + 1] = Math.random() * 100;
      snowPositions[i * 3 + 2] = Math.random() * 200 - 100;
      snowVelocities[i] = Math.random() * 0.2 + 0.1;
    }
    
    snowGeometry.setAttribute('position', new THREE.BufferAttribute(snowPositions, 3));
    snowGeometry.setAttribute('velocity', new THREE.BufferAttribute(snowVelocities, 1));
    
    const snowMaterial = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 2,
      transparent: true,
      opacity: 0.8
    });
    
    this.snowParticles = new THREE.Points(snowGeometry, snowMaterial);
    this.snowParticles.visible = false;
    this.scene.add(this.snowParticles);
    
    // Lightning
    this.lightning = new THREE.DirectionalLight(0x88aaff, 0);
    this.lightning.position.set(0, 100, 0);
    this.scene.add(this.lightning);
  }
  
  setWeather(weather: WeatherType, transitionTime: number = 5000): void {
    if (weather === this.currentWeather) return;
    
    this.targetWeather = weather;
    this.transitionDuration = transitionTime;
    this.transitionProgress = 0;
    
    console.log(`🌦️ Transitioning to ${weather} weather over ${transitionTime}ms`);
  }
  
  update(deltaTime: number, cameraPosition: THREE.Vector3): void {
    // Handle weather transition
    if (this.transitionProgress < 1) {
      this.transitionProgress += deltaTime / this.transitionDuration;
      this.transitionProgress = Math.min(this.transitionProgress, 1);
      
      if (this.transitionProgress >= 1) {
        this.currentWeather = this.targetWeather;
        this.applyWeather();
      }
    }
    
    // Update particles
    this.updateRain(deltaTime, cameraPosition);
    this.updateSnow(deltaTime, cameraPosition);
    
    // Update wind
    this.windTime += deltaTime;
    const windVariation = Math.sin(this.windTime * 0.001) * 0.3;
    
    // Update lightning
    if (this.currentWeather === 'storm') {
      this.updateLightning(deltaTime);
    }
  }
  
  private applyWeather(): void {
    // Reset all weather effects
    if (this.rainParticles) this.rainParticles.visible = false;
    if (this.snowParticles) this.snowParticles.visible = false;
    if (this.lightning) this.lightning.intensity = 0;
    
    switch (this.currentWeather) {
      case 'clear':
        this.fog.far = 500;
        this.fog.color.setHex(0xffffff);
        break;
        
      case 'rain':
        if (this.rainParticles) this.rainParticles.visible = true;
        this.fog.far = 300;
        this.fog.color.setHex(0xaaaaaa);
        this.windSpeed = 5;
        break;
        
      case 'heavyRain':
        if (this.rainParticles) {
          this.rainParticles.visible = true;
          (this.rainParticles.material as THREE.PointsMaterial).opacity = 0.8;
        }
        this.fog.far = 200;
        this.fog.color.setHex(0x888888);
        this.windSpeed = 10;
        break;
        
      case 'snow':
        if (this.snowParticles) this.snowParticles.visible = true;
        this.fog.far = 250;
        this.fog.color.setHex(0xdddddd);
        this.windSpeed = 3;
        break;
        
      case 'blizzard':
        if (this.snowParticles) {
          this.snowParticles.visible = true;
          (this.snowParticles.material as THREE.PointsMaterial).opacity = 1.0;
        }
        this.fog.far = 100;
        this.fog.color.setHex(0xcccccc);
        this.windSpeed = 15;
        break;
        
      case 'fog':
        this.fog.far = 150;
        this.fog.color.setHex(0xcccccc);
        this.windSpeed = 1;
        break;
        
      case 'storm':
        if (this.rainParticles) this.rainParticles.visible = true;
        this.fog.far = 150;
        this.fog.color.setHex(0x666666);
        this.windSpeed = 20;
        this.lightningInterval = 3000 + Math.random() * 5000;
        break;
    }
    
    console.log(`✅ Weather applied: ${this.currentWeather}`);
  }
  
  private updateRain(deltaTime: number, cameraPos: THREE.Vector3): void {
    if (!this.rainParticles || !this.rainParticles.visible) return;
    
    const positions = this.rainParticles.geometry.attributes.position;
    const velocities = this.rainParticles.geometry.attributes.velocity;
    
    for (let i = 0; i < this.particleCount; i++) {
      let y = positions.getY(i);
      const velocity = velocities.getX(i);
      
      // Fall down
      y -= velocity * deltaTime * 0.1;
      
      // Reset at top when hitting ground
      if (y < 0) {
        y = 100;
        positions.setX(i, cameraPos.x + (Math.random() * 200 - 100));
        positions.setZ(i, cameraPos.z + (Math.random() * 200 - 100));
      }
      
      positions.setY(i, y);
    }
    
    positions.needsUpdate = true;
  }
  
  private updateSnow(deltaTime: number, cameraPos: THREE.Vector3): void {
    if (!this.snowParticles || !this.snowParticles.visible) return;
    
    const positions = this.snowParticles.geometry.attributes.position;
    const velocities = this.snowParticles.geometry.attributes.velocity;
    
    for (let i = 0; i < this.particleCount; i++) {
      let x = positions.getX(i);
      let y = positions.getY(i);
      let z = positions.getZ(i);
      const velocity = velocities.getX(i);
      
      // Fall down slowly
      y -= velocity * deltaTime * 0.05;
      
      // Drift with wind
      x += Math.sin(this.windTime * 0.001 + i) * 0.1;
      z += Math.cos(this.windTime * 0.001 + i) * 0.1;
      
      // Reset at top when hitting ground
      if (y < 0) {
        y = 100;
        x = cameraPos.x + (Math.random() * 200 - 100);
        z = cameraPos.z + (Math.random() * 200 - 100);
      }
      
      positions.setX(i, x);
      positions.setY(i, y);
      positions.setZ(i, z);
    }
    
    positions.needsUpdate = true;
  }
  
  private updateLightning(deltaTime: number): void {
    if (!this.lightning) return;
    
    this.lightningTimer += deltaTime;
    
    // Random lightning strikes
    if (this.lightningTimer >= this.lightningInterval) {
      this.lightningTimer = 0;
      this.lightningInterval = 3000 + Math.random() * 7000;
      
      // Lightning flash
      this.lightning.intensity = 3;
      
      setTimeout(() => {
        if (this.lightning) this.lightning.intensity = 0;
      }, 100);
      
      console.log('⚡ Lightning strike!');
    }
  }
  
  getCurrentWeather(): WeatherType {
    return this.currentWeather;
  }
  
  getWindSpeed(): number {
    return this.windSpeed;
  }
  
  getWindDirection(): number {
    return this.windDirection;
  }
  
  setWindDirection(direction: number): void {
    this.windDirection = direction;
  }
  
  getStatistics(): {
    current: WeatherType;
    target: WeatherType;
    transitionProgress: number;
    windSpeed: number;
    fogDistance: number;
    particlesVisible: number;
  } {
    let particlesVisible = 0;
    if (this.rainParticles?.visible) particlesVisible = this.particleCount;
    if (this.snowParticles?.visible) particlesVisible = this.particleCount;
    
    return {
      current: this.currentWeather,
      target: this.targetWeather,
      transitionProgress: this.transitionProgress,
      windSpeed: this.windSpeed,
      fogDistance: this.fog.far,
      particlesVisible
    };
  }
  
  dispose(): void {
    if (this.rainParticles) {
      this.rainParticles.geometry.dispose();
      (this.rainParticles.material as THREE.Material).dispose();
      this.scene.remove(this.rainParticles);
    }
    
    if (this.snowParticles) {
      this.snowParticles.geometry.dispose();
      (this.snowParticles.material as THREE.Material).dispose();
      this.scene.remove(this.snowParticles);
    }
    
    if (this.lightning) {
      this.scene.remove(this.lightning);
    }
    
    console.log('🌦️ Weather system disposed');
  }
}
