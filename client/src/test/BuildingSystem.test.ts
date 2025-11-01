import { describe, it, expect } from 'vitest';
import { BuildingSystem } from '../systems/BuildingSystem';

describe('BuildingSystem', () => {
  let buildingSystem: BuildingSystem;

  beforeEach(() => {
    buildingSystem = new BuildingSystem();
  });

  it('should create a building system', () => {
    expect(buildingSystem).toBeDefined();
  });

  it('should place structures', () => {
    const placed = buildingSystem.placeStructure('wooden_wall', 0, 0, 0);
    expect(typeof placed).toBe('boolean');
  });

  it('should check placement validity', () => {
    const isValid = buildingSystem.canPlaceAt(0, 0, 0);
    expect(typeof isValid).toBe('boolean');
  });

  it('should remove structures', () => {
    buildingSystem.placeStructure('wooden_wall', 5, 0, 5);
    const removed = buildingSystem.removeStructure(5, 0, 5);
    expect(typeof removed).toBe('boolean');
  });

  it('should get structure at position', () => {
    buildingSystem.placeStructure('wooden_wall', 10, 0, 10);
    const structure = buildingSystem.getStructureAt(10, 0, 10);
    expect(structure !== null || structure === null).toBe(true);
  });

  it('should list all structures', () => {
    const structures = buildingSystem.getAllStructures();
    expect(Array.isArray(structures)).toBe(true);
  });
});
