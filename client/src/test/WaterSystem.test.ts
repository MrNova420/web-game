import { describe, it, expect, beforeEach } from 'vitest';
import { WaterSystem } from '../world/WaterSystem';

describe('WaterSystem', () => {
  let waterSystem: WaterSystem;

  beforeEach(() => {
    waterSystem = new WaterSystem();
  });

  it('should create a water system', () => {
    expect(waterSystem).toBeDefined();
  });

  it('should create water planes', () => {
    const water = waterSystem.createWater(0, 0, 100, 100);
    expect(water).toBeDefined();
  });

  it('should animate water', () => {
    waterSystem.createWater(0, 0, 50, 50);
    waterSystem.update(0.016);
    expect(waterSystem.isAnimating()).toBe(true);
  });

  it('should control wave properties', () => {
    waterSystem.setWaveHeight(2.0);
    waterSystem.setWaveSpeed(1.5);
    expect(waterSystem.getWaveHeight()).toBe(2.0);
  });

  it('should handle water reflection', () => {
    waterSystem.enableReflections(true);
    expect(waterSystem.areReflectionsEnabled()).toBe(true);
  });

  it('should check if position is underwater', () => {
    waterSystem.createWater(0, 0, 100, 100);
    const underwater = waterSystem.isUnderwater(50, -1, 50);
    expect(typeof underwater).toBe('boolean');
  });
});
