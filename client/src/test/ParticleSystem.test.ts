import { describe, it, expect, beforeEach } from 'vitest';
import { ParticleSystem } from '../systems/ParticleSystem';

describe('ParticleSystem', () => {
  let particleSystem: ParticleSystem;

  beforeEach(() => {
    particleSystem = new ParticleSystem();
  });

  it('should create a particle system', () => {
    expect(particleSystem).toBeDefined();
  });

  it('should emit particles', () => {
    particleSystem.emit('fire', 0, 0, 0, 100);
    const particles = particleSystem.getActiveParticles();
    expect(particles.length).toBeGreaterThan(0);
  });

  it('should update particle positions', () => {
    particleSystem.emit('smoke', 0, 5, 0, 50);
    particleSystem.update(0.016);
    expect(particleSystem.getActiveParticles().length).toBeGreaterThan(0);
  });

  it('should remove dead particles', () => {
    particleSystem.emit('spark', 0, 0, 0, 10);
    particleSystem.update(10); // Age all particles
    particleSystem.cleanupDeadParticles();
    expect(particleSystem.getActiveParticles().length).toBe(0);
  });

  it('should limit max particles', () => {
    particleSystem.emit('rain', 0, 10, 0, 10000);
    const particles = particleSystem.getActiveParticles();
    expect(particles.length).toBeLessThanOrEqual(particleSystem.getMaxParticles());
  });

  it('should clear all particles', () => {
    particleSystem.emit('explosion', 0, 0, 0, 500);
    particleSystem.clearAll();
    expect(particleSystem.getActiveParticles().length).toBe(0);
  });
});
