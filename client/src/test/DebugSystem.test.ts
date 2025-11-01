import { describe, it, expect, beforeEach } from 'vitest';
import { DebugSystem } from '../systems/DebugSystem';

describe('DebugSystem', () => {
  let debugSystem: DebugSystem;

  beforeEach(() => {
    debugSystem = new DebugSystem();
  });

  it('should create a debug system', () => {
    expect(debugSystem).toBeDefined();
  });

  it('should enable/disable debug mode', () => {
    debugSystem.enable();
    expect(debugSystem.isEnabled()).toBe(true);
    debugSystem.disable();
    expect(debugSystem.isEnabled()).toBe(false);
  });

  it('should log debug messages', () => {
    debugSystem.log('Test message');
    const logs = debugSystem.getLogs();
    expect(logs.length).toBeGreaterThan(0);
  });

  it('should track performance metrics', () => {
    debugSystem.trackMetric('fps', 60);
    const metrics = debugSystem.getMetrics();
    expect(metrics.fps).toBe(60);
  });

  it('should toggle debug overlays', () => {
    debugSystem.showOverlay('fps');
    expect(debugSystem.isOverlayVisible('fps')).toBe(true);
  });

  it('should clear logs', () => {
    debugSystem.log('Test 1');
    debugSystem.log('Test 2');
    debugSystem.clearLogs();
    expect(debugSystem.getLogs().length).toBe(0);
  });

  it('should export debug data', () => {
    debugSystem.log('Debug info');
    const data = debugSystem.exportData();
    expect(data).toBeDefined();
  });
});
