import * as THREE from 'three';

export type WeatherType = 'clear' | 'rain' | 'snow' | 'fog';

export class WeatherSystem {
  private scene: THREE.Scene;
  private currentWeather: WeatherType = 'clear';
  private particleSystem: THREE.Points | null = null;
  private particleCount = 1000;
  private particleGeometry: THREE.BufferGeometry | null = null;
  private particleMaterial: THREE.PointsMaterial | null = null;
  private particles: THREE.Vector3[] = [];
  private velocities: THREE.Vector3[] = [];
  
  constructor(scene: THREE.Scene) {
    this.scene = scene;
  }

  /**
   * Set the current weather
   */
  setWeather(weather: WeatherType) {
    if (this.currentWeather === weather) return;
    
    this.currentWeather = weather;
    this.removeParticles();
    
    switch (weather) {
      case 'rain':
        this.createRain();
        break;
      case 'snow':
        this.createSnow();
        break;
      case 'fog':
        this.createFog();
        break;
      case 'clear':
        // No particles for clear weather
        break;
    }
  }

  /**
   * Create rain particles
   */
  private createRain() {
    this.particleCount = 1000;
    this.particleGeometry = new THREE.BufferGeometry();
    const positions = new Float32Array(this.particleCount * 3);
    
    this.particles = [];
    this.velocities = [];
    
    for (let i = 0; i < this.particleCount; i++) {
      // Spread rain in a large area around camera
      const x = (Math.random() - 0.5) * 200;
      const y = Math.random() * 50 + 10;
      const z = (Math.random() - 0.5) * 200;
      
      positions[i * 3] = x;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = z;
      
      this.particles.push(new THREE.Vector3(x, y, z));
      this.velocities.push(new THREE.Vector3(
        (Math.random() - 0.5) * 0.5, // Slight horizontal drift
        -2, // Fall speed
        (Math.random() - 0.5) * 0.5
      ));
    }
    
    this.particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    
    this.particleMaterial = new THREE.PointsMaterial({
      color: 0x8888ff,
      size: 0.2,
      transparent: true,
      opacity: 0.6
    });
    
    this.particleSystem = new THREE.Points(this.particleGeometry, this.particleMaterial);
    this.scene.add(this.particleSystem);
  }

  /**
   * Create snow particles
   */
  private createSnow() {
    this.particleCount = 800;
    this.particleGeometry = new THREE.BufferGeometry();
    const positions = new Float32Array(this.particleCount * 3);
    
    this.particles = [];
    this.velocities = [];
    
    for (let i = 0; i < this.particleCount; i++) {
      const x = (Math.random() - 0.5) * 200;
      const y = Math.random() * 50 + 10;
      const z = (Math.random() - 0.5) * 200;
      
      positions[i * 3] = x;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = z;
      
      this.particles.push(new THREE.Vector3(x, y, z));
      this.velocities.push(new THREE.Vector3(
        (Math.random() - 0.5) * 0.3,
        -0.5, // Slower fall than rain
        (Math.random() - 0.5) * 0.3
      ));
    }
    
    this.particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    
    this.particleMaterial = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 0.3,
      transparent: true,
      opacity: 0.8
    });
    
    this.particleSystem = new THREE.Points(this.particleGeometry, this.particleMaterial);
    this.scene.add(this.particleSystem);
  }

  /**
   * Create fog effect
   */
  private createFog() {
    // Use Three.js built-in fog
    this.scene.fog = new THREE.Fog(0xcccccc, 10, 100);
  }

  /**
   * Remove current weather particles
   */
  private removeParticles() {
    if (this.particleSystem) {
      this.scene.remove(this.particleSystem);
      this.particleSystem = null;
    }
    
    if (this.particleGeometry) {
      this.particleGeometry.dispose();
      this.particleGeometry = null;
    }
    
    if (this.particleMaterial) {
      this.particleMaterial.dispose();
      this.particleMaterial = null;
    }
    
    // Remove fog
    this.scene.fog = null;
    
    this.particles = [];
    this.velocities = [];
  }

  /**
   * Update weather particles
   */
  update(deltaTime: number, cameraPosition: THREE.Vector3) {
    if (!this.particleSystem || !this.particleGeometry) return;
    
    const positions = this.particleGeometry.attributes.position.array as Float32Array;
    
    for (let i = 0; i < this.particles.length; i++) {
      // Update particle position
      this.particles[i].add(this.velocities[i]);
      
      // Reset particle if it falls below ground
      if (this.particles[i].y < 0) {
        this.particles[i].y = 50;
        this.particles[i].x = cameraPosition.x + (Math.random() - 0.5) * 200;
        this.particles[i].z = cameraPosition.z + (Math.random() - 0.5) * 200;
      }
      
      // Keep particles near camera
      const dx = this.particles[i].x - cameraPosition.x;
      const dz = this.particles[i].z - cameraPosition.z;
      const distance = Math.sqrt(dx * dx + dz * dz);
      
      if (distance > 100) {
        this.particles[i].x = cameraPosition.x + (Math.random() - 0.5) * 200;
        this.particles[i].z = cameraPosition.z + (Math.random() - 0.5) * 200;
      }
      
      // Update geometry
      positions[i * 3] = this.particles[i].x;
      positions[i * 3 + 1] = this.particles[i].y;
      positions[i * 3 + 2] = this.particles[i].z;
    }
    
    this.particleGeometry.attributes.position.needsUpdate = true;
  }

  /**
   * Get current weather
   */
  getCurrentWeather(): WeatherType {
    return this.currentWeather;
  }

  /**
   * Random weather change (for testing/demo)
   */
  randomWeather() {
    const weathers: WeatherType[] = ['clear', 'rain', 'snow', 'fog'];
    const random = Math.floor(Math.random() * weathers.length);
    this.setWeather(weathers[random]);
  }

  /**
   * Cleanup
   */
  dispose() {
    this.removeParticles();
  }
}
