import { describe, it, expect, beforeEach } from 'vitest';
import { AssetLoader } from '../assets/AssetLoader';

describe('AssetLoader', () => {
  let assetLoader: AssetLoader;

  beforeEach(() => {
    assetLoader = new AssetLoader();
  });

  it('should create an AssetLoader instance', () => {
    expect(assetLoader).toBeDefined();
    expect(assetLoader).toBeInstanceOf(AssetLoader);
  });

  it('should have a load method', () => {
    expect(typeof assetLoader.load).toBe('function');
  });

  it('should have a getAsset method', () => {
    expect(typeof assetLoader.getAsset).toBe('function');
  });

  it('should return null for non-existent assets', () => {
    const asset = assetLoader.getAsset('non-existent-asset');
    expect(asset).toBeNull();
  });
});
