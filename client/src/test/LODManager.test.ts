import { describe, it, expect, beforeEach } from 'vitest';
import { LODManager } from '../systems/LODManager';

describe('LODManager', () => {
  let lodManager: LODManager;

  beforeEach(() => {
    lodManager = new LODManager();
  });

  it('should create an LOD manager', () => {
    expect(lodManager).toBeDefined();
  });

  it('should register LOD objects', () => {
    const mockObject = { id: 'tree1', position: { x: 0, y: 0, z: 0 } };
    lodManager.register('tree1', mockObject, [1, 5, 10]);
    expect(lodManager.isRegistered('tree1')).toBe(true);
  });

  it('should calculate appropriate LOD level', () => {
    const mockObject = { id: 'building', position: { x: 0, y: 0, z: 0 } };
    lodManager.register('building', mockObject, [10, 50, 100]);
    const level = lodManager.getLODLevel('building', 25);
    expect(level).toBeGreaterThanOrEqual(0);
  });

  it('should update LOD based on camera distance', () => {
    const mockObject = { id: 'mountain', position: { x: 100, y: 0, z: 100 } };
    lodManager.register('mountain', mockObject, [50, 100, 200]);
    lodManager.updateFromCamera({ x: 0, y: 0, z: 0 });
    expect(lodManager.getCurrentLOD('mountain')).toBeGreaterThanOrEqual(0);
  });

  it('should unregister objects', () => {
    lodManager.register('temp', {}, [1, 2, 3]);
    lodManager.unregister('temp');
    expect(lodManager.isRegistered('temp')).toBe(false);
  });

  it('should get all managed objects', () => {
    lodManager.register('obj1', {}, [1, 2]);
    lodManager.register('obj2', {}, [1, 2]);
    const objects = lodManager.getAllObjects();
    expect(objects.length).toBeGreaterThanOrEqual(2);
  });
});
