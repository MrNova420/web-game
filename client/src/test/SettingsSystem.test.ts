import { describe, it, expect, beforeEach } from 'vitest';
import { SettingsSystem } from '../systems/SettingsSystem';

describe('SettingsSystem', () => {
  let settingsSystem: SettingsSystem;

  beforeEach(() => {
    settingsSystem = new SettingsSystem();
    localStorage.clear();
  });

  it('should create a settings system', () => {
    expect(settingsSystem).toBeDefined();
  });

  it('should get/set graphics quality', () => {
    settingsSystem.setGraphicsQuality('high');
    expect(settingsSystem.getGraphicsQuality()).toBe('high');
  });

  it('should get/set volume levels', () => {
    settingsSystem.setMasterVolume(0.7);
    expect(settingsSystem.getMasterVolume()).toBe(0.7);
  });

  it('should toggle fullscreen', () => {
    settingsSystem.setFullscreen(true);
    expect(settingsSystem.isFullscreen()).toBe(true);
  });

  it('should save settings', () => {
    settingsSystem.setGraphicsQuality('medium');
    settingsSystem.save();
    const newSettings = new SettingsSystem();
    expect(newSettings.getGraphicsQuality()).toBe('medium');
  });

  it('should reset to defaults', () => {
    settingsSystem.setGraphicsQuality('low');
    settingsSystem.resetToDefaults();
    expect(settingsSystem.getGraphicsQuality()).toBe('high');
  });

  it('should handle resolution changes', () => {
    settingsSystem.setResolution(1920, 1080);
    const res = settingsSystem.getResolution();
    expect(res.width).toBe(1920);
    expect(res.height).toBe(1080);
  });
});
