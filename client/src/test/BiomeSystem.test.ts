import { describe, it, expect } from 'vitest';
import { BiomeSystem } from '../world/BiomeSystem';

describe('BiomeSystem', () => {
  let biomeSystem: BiomeSystem;

  it('should create a BiomeSystem instance', () => {
    biomeSystem = new BiomeSystem();
    expect(biomeSystem).toBeDefined();
    expect(biomeSystem).toBeInstanceOf(BiomeSystem);
  });

  it('should have a getBiome method', () => {
    biomeSystem = new BiomeSystem();
    expect(typeof biomeSystem.getBiome).toBe('function');
  });

  it('should return a valid biome for coordinates', () => {
    biomeSystem = new BiomeSystem();
    const biome = biomeSystem.getBiome(0, 0);
    expect(biome).toBeDefined();
    expect(typeof biome.name).toBe('string');
  });

  it('should return consistent biomes for same coordinates', () => {
    biomeSystem = new BiomeSystem();
    const biome1 = biomeSystem.getBiome(10, 10);
    const biome2 = biomeSystem.getBiome(10, 10);
    expect(biome1.name).toBe(biome2.name);
  });
});
