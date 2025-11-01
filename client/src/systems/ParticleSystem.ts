import * as THREE from 'three';

/**
 * Particle effect types
 */
export type ParticleEffectType = 
  | 'hit_spark'
  | 'blood_splatter'
  | 'heal_glow'
  | 'level_up'
  | 'item_collect'
  | 'magic_cast'
  | 'explosion'
  | 'smoke';

/**
 * ParticleEffect - Manages visual particle effects
 * Uses THREE.js particle systems (not asset models - acceptable for VFX)
 */
export class ParticleSystem {
  private activeEffects: THREE.Points[] = [];
  private scene: THREE.Scene;

  constructor(scene: THREE.Scene) {
    this.scene = scene;
    console.log('ParticleSystem initialized');
  }

  /**
   * Create hit spark effect
   */
  createHitSpark(position: THREE.Vector3, color: THREE.Color = new THREE.Color(0xffaa00)) {
    const particleCount = 20;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const velocities: THREE.Vector3[] = [];

    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = position.x;
      positions[i * 3 + 1] = position.y;
      positions[i * 3 + 2] = position.z;

      velocities.push(new THREE.Vector3(
        (Math.random() - 0.5) * 3,
        Math.random() * 3,
        (Math.random() - 0.5) * 3
      ));
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const material = new THREE.PointsMaterial({
      color: color,
      size: 0.3,
      transparent: true,
      opacity: 1.0,
      blending: THREE.AdditiveBlending
    });

    const particles = new THREE.Points(geometry, material);
    particles.userData.velocities = velocities;
    particles.userData.lifetime = 0;
    particles.userData.maxLifetime = 0.5;

    this.scene.add(particles);
    this.activeEffects.push(particles);
  }

  /**
   * Create heal glow effect
   */
  createHealGlow(position: THREE.Vector3) {
    const particleCount = 30;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const velocities: THREE.Vector3[] = [];

    for (let i = 0; i < particleCount; i++) {
      const angle = (i / particleCount) * Math.PI * 2;
      const radius = 0.5;
      
      positions[i * 3] = position.x + Math.cos(angle) * radius;
      positions[i * 3 + 1] = position.y;
      positions[i * 3 + 2] = position.z + Math.sin(angle) * radius;

      velocities.push(new THREE.Vector3(0, 2, 0));
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const material = new THREE.PointsMaterial({
      color: 0x00ff88,
      size: 0.4,
      transparent: true,
      opacity: 1.0,
      blending: THREE.AdditiveBlending
    });

    const particles = new THREE.Points(geometry, material);
    particles.userData.velocities = velocities;
    particles.userData.lifetime = 0;
    particles.userData.maxLifetime = 1.0;

    this.scene.add(particles);
    this.activeEffects.push(particles);
  }

  /**
   * Create level up effect
   */
  createLevelUpEffect(position: THREE.Vector3) {
    const particleCount = 50;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const velocities: THREE.Vector3[] = [];

    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = position.x;
      positions[i * 3 + 1] = position.y;
      positions[i * 3 + 2] = position.z;

      const angle = (i / particleCount) * Math.PI * 2;
      velocities.push(new THREE.Vector3(
        Math.cos(angle) * 2,
        3,
        Math.sin(angle) * 2
      ));
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const material = new THREE.PointsMaterial({
      color: 0xffd700,
      size: 0.5,
      transparent: true,
      opacity: 1.0,
      blending: THREE.AdditiveBlending
    });

    const particles = new THREE.Points(geometry, material);
    particles.userData.velocities = velocities;
    particles.userData.lifetime = 0;
    particles.userData.maxLifetime = 1.5;

    this.scene.add(particles);
    this.activeEffects.push(particles);

    console.log('LEVEL UP!');
  }

  /**
   * Create magic cast effect
   */
  createMagicCast(position: THREE.Vector3, targetPosition: THREE.Vector3) {
    const particleCount = 15;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const velocities: THREE.Vector3[] = [];

    const direction = new THREE.Vector3()
      .subVectors(targetPosition, position)
      .normalize()
      .multiplyScalar(10);

    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = position.x;
      positions[i * 3 + 1] = position.y;
      positions[i * 3 + 2] = position.z;

      velocities.push(direction.clone().add(new THREE.Vector3(
        (Math.random() - 0.5) * 2,
        (Math.random() - 0.5) * 2,
        (Math.random() - 0.5) * 2
      )));
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const material = new THREE.PointsMaterial({
      color: 0x8888ff,
      size: 0.4,
      transparent: true,
      opacity: 1.0,
      blending: THREE.AdditiveBlending
    });

    const particles = new THREE.Points(geometry, material);
    particles.userData.velocities = velocities;
    particles.userData.lifetime = 0;
    particles.userData.maxLifetime = 0.7;

    this.scene.add(particles);
    this.activeEffects.push(particles);
  }

  /**
   * Create item collect effect
   */
  createItemCollect(position: THREE.Vector3) {
    const particleCount = 20;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const velocities: THREE.Vector3[] = [];

    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = position.x;
      positions[i * 3 + 1] = position.y;
      positions[i * 3 + 2] = position.z;

      velocities.push(new THREE.Vector3(
        (Math.random() - 0.5) * 1,
        Math.random() * 2 + 1,
        (Math.random() - 0.5) * 1
      ));
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const material = new THREE.PointsMaterial({
      color: 0xffff00,
      size: 0.3,
      transparent: true,
      opacity: 1.0,
      blending: THREE.AdditiveBlending
    });

    const particles = new THREE.Points(geometry, material);
    particles.userData.velocities = velocities;
    particles.userData.lifetime = 0;
    particles.userData.maxLifetime = 0.8;

    this.scene.add(particles);
    this.activeEffects.push(particles);
  }

  /**
   * Update all particle effects
   */
  update(deltaTime: number) {
    const gravity = new THREE.Vector3(0, -9.8, 0);
    
    for (let i = this.activeEffects.length - 1; i >= 0; i--) {
      const effect = this.activeEffects[i];
      effect.userData.lifetime += deltaTime;

      const positions = effect.geometry.attributes.position.array as Float32Array;
      const velocities = effect.userData.velocities as THREE.Vector3[];

      // Update particle positions
      for (let j = 0; j < velocities.length; j++) {
        velocities[j].add(gravity.clone().multiplyScalar(deltaTime));
        
        positions[j * 3] += velocities[j].x * deltaTime;
        positions[j * 3 + 1] += velocities[j].y * deltaTime;
        positions[j * 3 + 2] += velocities[j].z * deltaTime;
      }

      effect.geometry.attributes.position.needsUpdate = true;

      // Fade out
      const lifeRatio = effect.userData.lifetime / effect.userData.maxLifetime;
      const material = effect.material as THREE.PointsMaterial;
      material.opacity = 1.0 - lifeRatio;

      // Remove expired effects
      if (effect.userData.lifetime >= effect.userData.maxLifetime) {
        this.scene.remove(effect);
        effect.geometry.dispose();
        material.dispose();
        this.activeEffects.splice(i, 1);
      }
    }
  }

  /**
   * Create effect by type
   */
  createEffect(type: ParticleEffectType, position: THREE.Vector3, targetPosition?: THREE.Vector3) {
    switch (type) {
      case 'hit_spark':
        this.createHitSpark(position);
        break;
      case 'heal_glow':
        this.createHealGlow(position);
        break;
      case 'level_up':
        this.createLevelUpEffect(position);
        break;
      case 'item_collect':
        this.createItemCollect(position);
        break;
      case 'magic_cast':
        if (targetPosition) {
          this.createMagicCast(position, targetPosition);
        }
        break;
      default:
        console.warn('Unknown particle effect type:', type);
    }
  }

  /**
   * Clear all effects
   */
  clearAll() {
    this.activeEffects.forEach(effect => {
      this.scene.remove(effect);
      effect.geometry.dispose();
      (effect.material as THREE.Material).dispose();
    });
    this.activeEffects = [];
  }
}
