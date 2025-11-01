import { describe, it, expect, beforeEach } from 'vitest';
import { AssetPool } from '../systems/AssetPool';

describe('AssetPool', () => {
  let assetPool: AssetPool;

  beforeEach(() => {
    assetPool = new AssetPool();
  });

  it('should create an asset pool', () => {
    expect(assetPool).toBeDefined();
  });

  it('should add assets to pool', () => {
    const mockAsset = { id: 'tree1', type: 'model' };
    assetPool.add('tree1', mockAsset);
    expect(assetPool.has('tree1')).toBe(true);
  });

  it('should retrieve assets from pool', () => {
    const mockAsset = { id: 'rock1', type: 'model' };
    assetPool.add('rock1', mockAsset);
    const retrieved = assetPool.get('rock1');
    expect(retrieved).toEqual(mockAsset);
  });

  it('should remove assets from pool', () => {
    assetPool.add('temp', { id: 'temp' });
    assetPool.remove('temp');
    expect(assetPool.has('temp')).toBe(false);
  });

  it('should clear all assets', () => {
    assetPool.add('asset1', { id: '1' });
    assetPool.add('asset2', { id: '2' });
    assetPool.clear();
    expect(assetPool.size()).toBe(0);
  });

  it('should track pool size', () => {
    assetPool.add('a1', {});
    assetPool.add('a2', {});
    expect(assetPool.size()).toBe(2);
  });

  it('should handle cloning assets', () => {
    const original = { id: 'original', data: 'test' };
    assetPool.add('original', original);
    const cloned = assetPool.clone('original');
    expect(cloned).not.toBe(original);
  });
});
