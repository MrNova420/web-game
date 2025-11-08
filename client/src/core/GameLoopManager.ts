import { QualityScaler } from './QualityScaler';

/**
 * GameLoopManager - Professional game loop with fixed timestep physics
 * ENHANCEMENT: Fixed timestep for physics, variable for rendering
 * Based on AUTONOMOUS_DEVELOPMENT_GUIDE2.MD System 1.1
 */
export class GameLoopManager {
  // ENHANCEMENT: Fixed timestep for physics, variable for rendering
  private fixedTimestep = 1 / 60; // 60 FPS physics
  private maxFrameTime = 0.25; // Prevent spiral of death
  private accumulator = 0;
  private lastTime = 0;

  // ENHANCEMENT: Frame timing analytics
  private frameTimeHistory: number[] = [];
  private fps = 60;
  private deltaTime = 0;

  // ENHANCEMENT: Adaptive quality scaling
  private targetFPS = 60;
  private qualityScaler: QualityScaler | null = null;

  // Callbacks
  private updatePhysicsCallback: ((dt: number) => void) | null = null;
  private updateGameCallback: ((dt: number, alpha: number) => void) | null = null;
  private renderCallback: ((alpha: number) => void) | null = null;

  private isRunning = false;
  private animationFrameId: number | null = null;

  constructor(targetFPS: number = 60) {
    this.targetFPS = targetFPS;
    this.fixedTimestep = 1 / targetFPS;
    console.log('[GameLoopManager] Initialized with target FPS:', targetFPS);
  }

  /**
   * Set the quality scaler for adaptive quality adjustment
   */
  setQualityScaler(scaler: QualityScaler): void {
    this.qualityScaler = scaler;
  }

  /**
   * Set callback for physics updates (fixed timestep)
   */
  setPhysicsCallback(callback: (dt: number) => void): void {
    this.updatePhysicsCallback = callback;
  }

  /**
   * Set callback for game logic updates (variable timestep)
   */
  setGameCallback(callback: (dt: number, alpha: number) => void): void {
    this.updateGameCallback = callback;
  }

  /**
   * Set callback for rendering
   */
  setRenderCallback(callback: (alpha: number) => void): void {
    this.renderCallback = callback;
  }

  /**
   * Start the game loop
   */
  start(): void {
    if (this.isRunning) {
      console.warn('[GameLoopManager] Already running');
      return;
    }

    this.isRunning = true;
    this.lastTime = performance.now() / 1000;
    this.animationFrameId = requestAnimationFrame(() => this.loop());
    console.log('[GameLoopManager] Started');
  }

  /**
   * Stop the game loop
   */
  stop(): void {
    this.isRunning = false;
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
    console.log('[GameLoopManager] Stopped');
  }

  /**
   * Main game loop with fixed timestep physics
   */
  private loop(): void {
    if (!this.isRunning) return;

    const currentTime = performance.now() / 1000;
    let frameTime = currentTime - this.lastTime;

    // Clamp frame time to prevent instability
    if (frameTime > this.maxFrameTime) {
      console.warn(
        `[GameLoopManager] Large frame time: ${frameTime.toFixed(3)}s, clamping to ${this.maxFrameTime}s`
      );
      frameTime = this.maxFrameTime;
    }

    this.lastTime = currentTime;
    this.accumulator += frameTime;

    // Fixed timestep physics updates
    let physicsSteps = 0;
    const maxPhysicsSteps = 5; // Prevent too many physics steps in one frame

    while (this.accumulator >= this.fixedTimestep && physicsSteps < maxPhysicsSteps) {
      if (this.updatePhysicsCallback) {
        this.updatePhysicsCallback(this.fixedTimestep);
      }
      this.accumulator -= this.fixedTimestep;
      physicsSteps++;
    }

    // If we hit max physics steps, reset accumulator to prevent spiral of death
    if (physicsSteps >= maxPhysicsSteps) {
      console.warn('[GameLoopManager] Too many physics steps, resetting accumulator');
      this.accumulator = 0;
    }

    // Variable timestep for everything else
    const alpha = this.accumulator / this.fixedTimestep;
    if (this.updateGameCallback) {
      this.updateGameCallback(frameTime, alpha);
    }

    // Render with interpolation factor
    if (this.renderCallback) {
      this.renderCallback(alpha);
    }

    // Track performance and auto-adjust quality
    this.trackPerformance(frameTime);
    this.autoAdjustQuality();

    // Schedule next frame
    this.animationFrameId = requestAnimationFrame(() => this.loop());
  }

  /**
   * ENHANCEMENT: Track frame performance
   */
  private trackPerformance(frameTime: number): void {
    this.frameTimeHistory.push(frameTime);
    if (this.frameTimeHistory.length > 60) {
      this.frameTimeHistory.shift();
    }

    const avgFrameTime =
      this.frameTimeHistory.reduce((a, b) => a + b, 0) / this.frameTimeHistory.length;
    this.fps = 1 / avgFrameTime;
    this.deltaTime = avgFrameTime;
  }

  /**
   * ENHANCEMENT: Dynamic quality scaling based on performance
   */
  private autoAdjustQuality(): void {
    if (!this.qualityScaler) return;

    // Only adjust every 60 frames (about once per second)
    if (this.frameTimeHistory.length < 60) return;

    if (this.fps < this.targetFPS - 10) {
      this.qualityScaler.decreaseQuality();
    } else if (this.fps > this.targetFPS + 5) {
      this.qualityScaler.increaseQuality();
    }
  }

  /**
   * Get current FPS
   */
  getFPS(): number {
    return this.fps;
  }

  /**
   * Get current frame delta time
   */
  getDeltaTime(): number {
    return this.deltaTime;
  }

  /**
   * Get frame time history for analytics
   */
  getFrameTimeHistory(): number[] {
    return [...this.frameTimeHistory];
  }

  /**
   * Get average frame time
   */
  getAverageFrameTime(): number {
    if (this.frameTimeHistory.length === 0) return 0;
    return this.frameTimeHistory.reduce((a, b) => a + b, 0) / this.frameTimeHistory.length;
  }

  /**
   * Check if loop is running
   */
  isActive(): boolean {
    return this.isRunning;
  }
}
