import { describe, it, expect, beforeEach } from 'vitest';
import { EnvironmentEffects } from '../systems/EnvironmentEffects';

describe('EnvironmentEffects', () => {
  let envEffects: EnvironmentEffects;

  beforeEach(() => {
    envEffects = new EnvironmentEffects();
  });

  it('should create an environment effects system', () => {
    expect(envEffects).toBeDefined();
  });

  it('should enable/disable fog', () => {
    envEffects.setFog(true, 0x888888, 10, 100);
    expect(envEffects.isFogEnabled()).toBe(true);
  });

  it('should control fog density', () => {
    envEffects.setFog(true, 0x888888, 10, 50);
    envEffects.setFogDensity(0.5);
    expect(envEffects.getFogDensity()).toBe(0.5);
  });

  it('should add god rays effect', () => {
    envEffects.enableGodRays(true);
    expect(envEffects.areGodRaysEnabled()).toBe(true);
  });

  it('should control bloom effect', () => {
    envEffects.enableBloom(true, 1.5);
    expect(envEffects.isBloomEnabled()).toBe(true);
  });

  it('should add screen space reflections', () => {
    envEffects.enableSSR(true);
    expect(envEffects.isSSREnabled()).toBe(true);
  });

  it('should update effects over time', () => {
    envEffects.setFog(true, 0x888888, 10, 100);
    envEffects.update(0.016);
    expect(envEffects.isFogEnabled()).toBe(true);
  });
});
