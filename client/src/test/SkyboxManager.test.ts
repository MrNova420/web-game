import { describe, it, expect, beforeEach } from 'vitest';
import { SkyboxManager } from '../world/SkyboxManager';

describe('SkyboxManager', () => {
  let skyboxManager: SkyboxManager;

  beforeEach(() => {
    skyboxManager = new SkyboxManager();
  });

  it('should create a skybox manager', () => {
    expect(skyboxManager).toBeDefined();
  });

  it('should load skybox', () => {
    const loaded = skyboxManager.loadSkybox('day');
    expect(typeof loaded).toBe('boolean');
  });

  it('should change skybox', () => {
    skyboxManager.loadSkybox('day');
    skyboxManager.setSkybox('night');
    expect(skyboxManager.getCurrentSkybox()).toBe('night');
  });

  it('should transition between skyboxes', () => {
    skyboxManager.loadSkybox('sunset');
    skyboxManager.transitionTo('night', 5);
    skyboxManager.update(6);
    expect(skyboxManager.getCurrentSkybox()).toBe('night');
  });

  it('should handle skybox rotation', () => {
    skyboxManager.setRotation(Math.PI / 4);
    expect(skyboxManager.getRotation()).toBeCloseTo(Math.PI / 4, 2);
  });

  it('should control skybox brightness', () => {
    skyboxManager.setBrightness(0.5);
    expect(skyboxManager.getBrightness()).toBe(0.5);
  });
});
