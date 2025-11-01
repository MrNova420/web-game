import { describe, it, expect, beforeEach } from 'vitest';
import { ChunkManager } from '../world/ChunkManager';

describe('ChunkManager', () => {
  let chunkManager: ChunkManager;

  beforeEach(() => {
    chunkManager = new ChunkManager();
  });

  it('should create a chunk manager', () => {
    expect(chunkManager).toBeDefined();
  });

  it('should generate chunks', () => {
    const chunk = chunkManager.getChunk(0, 0);
    expect(chunk).toBeDefined();
  });

  it('should cache loaded chunks', () => {
    chunkManager.getChunk(0, 0);
    const cached = chunkManager.isChunkLoaded(0, 0);
    expect(cached).toBe(true);
  });

  it('should unload far chunks', () => {
    chunkManager.getChunk(0, 0);
    chunkManager.updatePlayerPosition(1000, 1000);
    chunkManager.unloadDistantChunks(100);
    expect(chunkManager.isChunkLoaded(0, 0)).toBe(false);
  });

  it('should get neighboring chunks', () => {
    chunkManager.getChunk(0, 0);
    const neighbors = chunkManager.getNeighbors(0, 0);
    expect(Array.isArray(neighbors)).toBe(true);
  });

  it('should track active chunks', () => {
    chunkManager.getChunk(0, 0);
    chunkManager.getChunk(1, 0);
    const count = chunkManager.getActiveChunkCount();
    expect(count).toBeGreaterThanOrEqual(2);
  });
});
