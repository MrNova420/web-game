import { describe, it, expect, beforeEach } from 'vitest';
import { PerformanceMonitor } from '../systems/PerformanceMonitor';

describe('PerformanceMonitor', () => {
  let performanceMonitor: PerformanceMonitor;

  beforeEach(() => {
    performanceMonitor = new PerformanceMonitor();
  });

  it('should create a PerformanceMonitor instance', () => {
    expect(performanceMonitor).toBeDefined();
    expect(performanceMonitor).toBeInstanceOf(PerformanceMonitor);
  });

  it('should have an update method', () => {
    expect(typeof performanceMonitor.update).toBe('function');
  });

  it('should track FPS', () => {
    performanceMonitor.update(0.016); // ~60 FPS
    const stats = performanceMonitor.getStats();
    expect(stats).toBeDefined();
    expect(typeof stats.fps).toBe('number');
  });

  it('should calculate average FPS over time', () => {
    // Simulate multiple frames
    for (let i = 0; i < 60; i++) {
      performanceMonitor.update(0.016);
    }
    const stats = performanceMonitor.getStats();
    expect(stats.fps).toBeGreaterThan(0);
    expect(stats.fps).toBeLessThanOrEqual(60);
  });
});
