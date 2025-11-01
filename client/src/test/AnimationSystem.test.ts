import { describe, it, expect, beforeEach } from 'vitest';
import { AnimationSystem } from '../systems/AnimationSystem';

describe('AnimationSystem', () => {
  let animationSystem: AnimationSystem;

  beforeEach(() => {
    animationSystem = new AnimationSystem();
  });

  it('should create an animation system', () => {
    expect(animationSystem).toBeDefined();
  });

  it('should load animations', () => {
    const loaded = animationSystem.loadAnimation('walk', 'path/to/walk.fbx');
    expect(typeof loaded).toBe('boolean');
  });

  it('should play animations', () => {
    animationSystem.loadAnimation('idle', 'path/to/idle.fbx');
    animationSystem.play('entity1', 'idle');
    const current = animationSystem.getCurrentAnimation('entity1');
    expect(current).toBeDefined();
  });

  it('should blend between animations', () => {
    animationSystem.loadAnimation('walk', 'path/to/walk.fbx');
    animationSystem.loadAnimation('run', 'path/to/run.fbx');
    animationSystem.blend('entity1', 'walk', 'run', 0.5);
    expect(animationSystem.isBlending('entity1')).toBe(true);
  });

  it('should update animation state', () => {
    animationSystem.loadAnimation('idle', 'path/to/idle.fbx');
    animationSystem.play('entity1', 'idle');
    animationSystem.update(0.016);
    expect(animationSystem.getCurrentAnimation('entity1')).toBeDefined();
  });

  it('should stop animations', () => {
    animationSystem.play('entity1', 'walk');
    animationSystem.stop('entity1');
    const isPlaying = animationSystem.isPlaying('entity1');
    expect(isPlaying).toBe(false);
  });
});
