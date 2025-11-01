import { describe, it, expect, beforeEach } from 'vitest';
import { VegetationManager } from '../world/VegetationManager';

describe('VegetationManager', () => {
  let vegManager: VegetationManager;

  beforeEach(() => {
    vegManager = new VegetationManager();
  });

  it('should create a vegetation manager', () => {
    expect(vegManager).toBeDefined();
  });

  it('should place vegetation in chunks', () => {
    vegManager.populateChunk(0, 0);
    const vegetation = vegManager.getVegetation(0, 0);
    expect(Array.isArray(vegetation)).toBe(true);
  });

  it('should use biome-specific vegetation', () => {
    vegManager.populateChunk(0, 0, 'forest');
    const vegetation = vegManager.getVegetation(0, 0);
    expect(vegetation.length).toBeGreaterThan(0);
  });

  it('should clear vegetation', () => {
    vegManager.populateChunk(0, 0);
    vegManager.clearChunk(0, 0);
    const vegetation = vegManager.getVegetation(0, 0);
    expect(vegetation.length).toBe(0);
  });

  it('should handle vegetation density', () => {
    vegManager.setDensity(0.5);
    expect(vegManager.getDensity()).toBe(0.5);
  });

  it('should get total vegetation count', () => {
    vegManager.populateChunk(0, 0);
    const count = vegManager.getTotalCount();
    expect(count).toBeGreaterThanOrEqual(0);
  });
});
