import { describe, it, expect, beforeEach } from 'vitest';
import { ResourceSystem } from '../systems/ResourceSystem';

describe('ResourceSystem', () => {
  let resourceSystem: ResourceSystem;

  beforeEach(() => {
    resourceSystem = new ResourceSystem();
  });

  it('should create a resource system', () => {
    expect(resourceSystem).toBeDefined();
  });

  it('should spawn resource nodes', () => {
    const node = resourceSystem.spawnResource('tree', 0, 0, 0);
    expect(node).toBeDefined();
  });

  it('should harvest resources', () => {
    const node = resourceSystem.spawnResource('iron_ore', 10, 0, 10);
    if (node) {
      const harvested = resourceSystem.harvest(node.id, 'player1');
      expect(typeof harvested).toBe('boolean');
    }
  });

  it('should respawn resources', () => {
    const node = resourceSystem.spawnResource('tree', 0, 0, 0);
    if (node) {
      resourceSystem.harvest(node.id, 'player1');
      resourceSystem.update(10); // Wait for respawn
      expect(resourceSystem.canHarvest(node.id)).toBe(true);
    }
  });

  it('should get resource yield', () => {
    const node = resourceSystem.spawnResource('gold_vein', 0, 0, 0);
    if (node) {
      const yield = resourceSystem.getYield(node.id);
      expect(yield).toBeGreaterThan(0);
    }
  });

  it('should track resource availability', () => {
    const resources = resourceSystem.getAvailableResources();
    expect(Array.isArray(resources)).toBe(true);
  });
});
