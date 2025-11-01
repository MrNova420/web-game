import { describe, it, expect } from 'vitest';
import { GameEngine } from '../../core/GameEngine';

describe('GameEngine Integration Tests', () => {
  it('should initialize game engine', async () => {
    const engine = new GameEngine();
    expect(engine).toBeDefined();
  });

  it('should initialize all systems', async () => {
    const engine = new GameEngine();
    await engine.initialize();
    expect(engine.isInitialized()).toBe(true);
  });

  it('should start and stop game loop', () => {
    const engine = new GameEngine();
    engine.start();
    expect(engine.isRunning()).toBe(true);
    engine.stop();
    expect(engine.isRunning()).toBe(false);
  });

  it('should handle pause/resume', () => {
    const engine = new GameEngine();
    engine.start();
    engine.pause();
    expect(engine.isPaused()).toBe(true);
    engine.resume();
    expect(engine.isPaused()).toBe(false);
  });

  it('should maintain target FPS', () => {
    const engine = new GameEngine();
    engine.start();
    const fps = engine.getCurrentFPS();
    expect(fps).toBeGreaterThan(0);
    expect(fps).toBeLessThanOrEqual(60);
  });
});
