import * as THREE from 'three';

/**
 * Advanced Particle System
 * 
 * Professional particle effects:
 * - Emitters with various shapes
 * - Particle lifetime and fading
 * - Velocity and acceleration
 * - Color gradients
 * - Texture support
 * - Multiple effect types
 * 
 * For visual effects (explosions, magic, fire, etc.)
 */

export interface ParticleEmitterConfig {
  position: THREE.Vector3;
  emissionRate: number; // particles per second
  maxParticles: number;
  lifetime: number; // seconds
  startSize: number;
  endSize: number;
  startColor: THREE.Color;
  endColor: THREE.Color;
  startOpacity: number;
  endOpacity: number;
  velocity: THREE.Vector3;
  velocityVariation: THREE.Vector3;
  acceleration: THREE.Vector3;
  emitterShape: 'point' | 'sphere' | 'cone' | 'box';
  emitterSize: number;
  texture?: THREE.Texture;
  blending: THREE.Blending;
}

interface Particle {
  position: THREE.Vector3;
  velocity: THREE.Vector3;
  age: number;
  lifetime: number;
  size: number;
  startSize: number;
  endSize: number;
  startColor: THREE.Color;
  endColor: THREE.Color;
  startOpacity: number;
  endOpacity: number;
  active: boolean;
}

export class AdvancedParticleSystem {
  private scene: THREE.Scene;
  private particles: Particle[] = [];
  private particleMesh: THREE.Points;
  private config: ParticleEmitterConfig;
  private emissionTimer = 0;
  private isPlaying = true;
  
  constructor(scene: THREE.Scene, config: Partial<ParticleEmitterConfig> = {}) {
    this.scene = scene;
    
    // Default config
    this.config = {
      position: new THREE.Vector3(0, 0, 0),
      emissionRate: 100,
      maxParticles: 1000,
      lifetime: 2,
      startSize: 1,
      endSize: 0.1,
      startColor: new THREE.Color(1, 1, 1),
      endColor: new THREE.Color(0.5, 0.5, 0.5),
      startOpacity: 1,
      endOpacity: 0,
      velocity: new THREE.Vector3(0, 5, 0),
      velocityVariation: new THREE.Vector3(2, 1, 2),
      acceleration: new THREE.Vector3(0, -2, 0),
      emitterShape: 'point',
      emitterSize: 1,
      blending: THREE.AdditiveBlending,
      ...config
    };
    
    this.initializeParticles();
    console.log('✨ Advanced Particle System initialized');
  }
  
  private initializeParticles(): void {
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(this.config.maxParticles * 3);
    const colors = new Float32Array(this.config.maxParticles * 3);
    const sizes = new Float32Array(this.config.maxParticles);
    const alphas = new Float32Array(this.config.maxParticles);
    
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
    geometry.setAttribute('alpha', new THREE.BufferAttribute(alphas, 1));
    
    const material = new THREE.PointsMaterial({
      size: this.config.startSize,
      vertexColors: true,
      transparent: true,
      opacity: this.config.startOpacity,
      blending: this.config.blending,
      depthWrite: false,
      map: this.config.texture,
      sizeAttenuation: true
    });
    
    this.particleMesh = new THREE.Points(geometry, material);
    this.scene.add(this.particleMesh);
    
    // Initialize particle pool
    for (let i = 0; i < this.config.maxParticles; i++) {
      this.particles.push({
        position: new THREE.Vector3(),
        velocity: new THREE.Vector3(),
        age: 0,
        lifetime: this.config.lifetime,
        size: this.config.startSize,
        startSize: this.config.startSize,
        endSize: this.config.endSize,
        startColor: this.config.startColor.clone(),
        endColor: this.config.endColor.clone(),
        startOpacity: this.config.startOpacity,
        endOpacity: this.config.endOpacity,
        active: false
      });
    }
  }
  
  private emitParticle(): void {
    // Find inactive particle
    const particle = this.particles.find(p => !p.active);
    if (!particle) return;
    
    // Set position based on emitter shape
    switch (this.config.emitterShape) {
      case 'point':
        particle.position.copy(this.config.position);
        break;
        
      case 'sphere':
        const phi = Math.random() * Math.PI * 2;
        const theta = Math.random() * Math.PI;
        const radius = Math.random() * this.config.emitterSize;
        particle.position.set(
          this.config.position.x + radius * Math.sin(theta) * Math.cos(phi),
          this.config.position.y + radius * Math.sin(theta) * Math.sin(phi),
          this.config.position.z + radius * Math.cos(theta)
        );
        break;
        
      case 'cone':
        const angle = Math.random() * Math.PI * 2;
        const coneRadius = Math.random() * this.config.emitterSize;
        particle.position.set(
          this.config.position.x + coneRadius * Math.cos(angle),
          this.config.position.y,
          this.config.position.z + coneRadius * Math.sin(angle)
        );
        break;
        
      case 'box':
        particle.position.set(
          this.config.position.x + (Math.random() - 0.5) * this.config.emitterSize,
          this.config.position.y + (Math.random() - 0.5) * this.config.emitterSize,
          this.config.position.z + (Math.random() - 0.5) * this.config.emitterSize
        );
        break;
    }
    
    // Set velocity with variation
    particle.velocity.set(
      this.config.velocity.x + (Math.random() - 0.5) * this.config.velocityVariation.x,
      this.config.velocity.y + (Math.random() - 0.5) * this.config.velocityVariation.y,
      this.config.velocity.z + (Math.random() - 0.5) * this.config.velocityVariation.z
    );
    
    // Reset particle properties
    particle.age = 0;
    particle.lifetime = this.config.lifetime * (0.8 + Math.random() * 0.4);
    particle.startSize = this.config.startSize;
    particle.endSize = this.config.endSize;
    particle.startColor.copy(this.config.startColor);
    particle.endColor.copy(this.config.endColor);
    particle.startOpacity = this.config.startOpacity;
    particle.endOpacity = this.config.endOpacity;
    particle.active = true;
  }
  
  update(deltaTime: number): void {
    if (!this.isPlaying) return;
    
    // Emit new particles
    this.emissionTimer += deltaTime;
    const emissionInterval = 1000 / this.config.emissionRate;
    
    while (this.emissionTimer >= emissionInterval) {
      this.emitParticle();
      this.emissionTimer -= emissionInterval;
    }
    
    // Update particles
    const positions = this.particleMesh.geometry.attributes.position;
    const colors = this.particleMesh.geometry.attributes.color;
    const sizes = this.particleMesh.geometry.attributes.size;
    const alphas = this.particleMesh.geometry.attributes.alpha;
    
    let activeCount = 0;
    
    for (let i = 0; i < this.particles.length; i++) {
      const particle = this.particles[i];
      
      if (!particle.active) {
        // Hide inactive particles
        sizes.setX(i, 0);
        alphas.setX(i, 0);
        continue;
      }
      
      // Update age
      particle.age += deltaTime / 1000;
      
      // Deactivate old particles
      if (particle.age >= particle.lifetime) {
        particle.active = false;
        continue;
      }
      
      // Update position
      particle.velocity.add(
        new THREE.Vector3(
          this.config.acceleration.x * deltaTime / 1000,
          this.config.acceleration.y * deltaTime / 1000,
          this.config.acceleration.z * deltaTime / 1000
        )
      );
      
      particle.position.add(
        new THREE.Vector3(
          particle.velocity.x * deltaTime / 1000,
          particle.velocity.y * deltaTime / 1000,
          particle.velocity.z * deltaTime / 1000
        )
      );
      
      // Calculate interpolation factor
      const t = particle.age / particle.lifetime;
      
      // Interpolate size
      particle.size = particle.startSize + (particle.endSize - particle.startSize) * t;
      
      // Interpolate color
      const color = new THREE.Color();
      color.lerpColors(particle.startColor, particle.endColor, t);
      
      // Interpolate opacity
      const opacity = particle.startOpacity + (particle.endOpacity - particle.startOpacity) * t;
      
      // Update buffers
      positions.setXYZ(i, particle.position.x, particle.position.y, particle.position.z);
      colors.setXYZ(i, color.r, color.g, color.b);
      sizes.setX(i, particle.size);
      alphas.setX(i, opacity);
      
      activeCount++;
    }
    
    // Mark for update
    positions.needsUpdate = true;
    colors.needsUpdate = true;
    sizes.needsUpdate = true;
    alphas.needsUpdate = true;
  }
  
  play(): void {
    this.isPlaying = true;
  }
  
  pause(): void {
    this.isPlaying = false;
  }
  
  stop(): void {
    this.isPlaying = false;
    this.particles.forEach(p => p.active = false);
  }
  
  burst(count: number): void {
    for (let i = 0; i < count; i++) {
      this.emitParticle();
    }
  }
  
  setPosition(position: THREE.Vector3): void {
    this.config.position.copy(position);
  }
  
  setEmissionRate(rate: number): void {
    this.config.emissionRate = rate;
  }
  
  getActiveParticleCount(): number {
    return this.particles.filter(p => p.active).length;
  }
  
  dispose(): void {
    this.particleMesh.geometry.dispose();
    (this.particleMesh.material as THREE.Material).dispose();
    this.scene.remove(this.particleMesh);
    console.log('✨ Particle system disposed');
  }
  
  // Preset effects
  static createFireEffect(scene: THREE.Scene, position: THREE.Vector3): AdvancedParticleSystem {
    return new AdvancedParticleSystem(scene, {
      position,
      emissionRate: 50,
      maxParticles: 500,
      lifetime: 1.5,
      startSize: 2,
      endSize: 0.5,
      startColor: new THREE.Color(1, 0.5, 0),
      endColor: new THREE.Color(1, 0, 0),
      startOpacity: 0.8,
      endOpacity: 0,
      velocity: new THREE.Vector3(0, 3, 0),
      velocityVariation: new THREE.Vector3(1, 1, 1),
      acceleration: new THREE.Vector3(0, 2, 0),
      emitterShape: 'cone',
      emitterSize: 0.5,
      blending: THREE.AdditiveBlending
    });
  }
  
  static createExplosionEffect(scene: THREE.Scene, position: THREE.Vector3): AdvancedParticleSystem {
    const effect = new AdvancedParticleSystem(scene, {
      position,
      emissionRate: 0,
      maxParticles: 100,
      lifetime: 0.8,
      startSize: 3,
      endSize: 0.1,
      startColor: new THREE.Color(1, 0.8, 0),
      endColor: new THREE.Color(1, 0.2, 0),
      startOpacity: 1,
      endOpacity: 0,
      velocity: new THREE.Vector3(0, 0, 0),
      velocityVariation: new THREE.Vector3(10, 10, 10),
      acceleration: new THREE.Vector3(0, -5, 0),
      emitterShape: 'sphere',
      emitterSize: 0.5,
      blending: THREE.AdditiveBlending
    });
    
    effect.burst(100);
    effect.pause();
    
    return effect;
  }
  
  static createMagicEffect(scene: THREE.Scene, position: THREE.Vector3): AdvancedParticleSystem {
    return new AdvancedParticleSystem(scene, {
      position,
      emissionRate: 30,
      maxParticles: 300,
      lifetime: 2,
      startSize: 1.5,
      endSize: 0.5,
      startColor: new THREE.Color(0.5, 0.5, 1),
      endColor: new THREE.Color(1, 0.5, 1),
      startOpacity: 0.8,
      endOpacity: 0,
      velocity: new THREE.Vector3(0, 2, 0),
      velocityVariation: new THREE.Vector3(2, 1, 2),
      acceleration: new THREE.Vector3(0, 1, 0),
      emitterShape: 'sphere',
      emitterSize: 1,
      blending: THREE.AdditiveBlending
    });
  }
}
