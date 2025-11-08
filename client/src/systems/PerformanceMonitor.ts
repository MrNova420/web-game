/**
 * Performance metrics
 */
export interface PerformanceMetrics {
  fps: number;
  frameTime: number;
  drawCalls: number;
  triangles: number;
  memory: number;
  entities: number;
}

/**
 * PerformanceMonitor - Tracks and displays performance metrics
 */
export class PerformanceMonitor {
  private metrics: PerformanceMetrics = {
    fps: 0,
    frameTime: 0,
    drawCalls: 0,
    triangles: 0,
    memory: 0,
    entities: 0
  };

  private frameCount = 0;
  private lastTime = performance.now();
  private fpsUpdateInterval = 500; // ms
  private displayElement: HTMLElement | null = null;
  private enabled = true;

  constructor(showDisplay: boolean = true) {
    if (showDisplay) {
      this.createDisplay();
    }
    console.log('PerformanceMonitor initialized');
  }

  /**
   * Create performance display
   */
  private createDisplay() {
    this.displayElement = document.createElement('div');
    this.displayElement.id = 'performance-monitor';
    this.displayElement.style.cssText = `
      position: fixed;
      top: 20px;
      left: 20px;
      padding: 10px;
      background: rgba(0, 0, 0, 0.7);
      color: #00ff00;
      font-family: 'Courier New', monospace;
      font-size: 12px;
      border: 1px solid #00ff00;
      border-radius: 5px;
      z-index: 9999;
      pointer-events: none;
      min-width: 200px;
    `;
    document.body.appendChild(this.displayElement);
  }

  /**
   * Update metrics
   */
  update(deltaTime: number, renderer?: { info?: { render?: { calls?: number; triangles?: number } } }, scene?: unknown) {
    if (!this.enabled) return;

    const currentTime = performance.now();
    this.frameCount++;

    // Update FPS every interval
    if (currentTime - this.lastTime >= this.fpsUpdateInterval) {
      this.metrics.fps = Math.round((this.frameCount * 1000) / (currentTime - this.lastTime));
      this.frameCount = 0;
      this.lastTime = currentTime;
    }

    // Frame time
    this.metrics.frameTime = deltaTime * 1000;

    // Renderer info
    if (renderer && renderer.info) {
      this.metrics.drawCalls = renderer.info.render.calls;
      this.metrics.triangles = renderer.info.render.triangles;
    }

    // Memory usage (if available)
    const perfWithMemory = performance as { memory?: { usedJSHeapSize?: number } };
    if (perfWithMemory.memory) {
      this.metrics.memory = Math.round((perfWithMemory.memory.usedJSHeapSize || 0) / 1048576);
    }

    // Count entities in scene
    if (scene) {
      let entityCount = 0;
      scene.traverse(() => entityCount++);
      this.metrics.entities = entityCount;
    }

    this.updateDisplay();
  }

  /**
   * Update display
   */
  private updateDisplay() {
    if (!this.displayElement) return;

    const fpsColor = this.metrics.fps >= 60 ? '#00ff00' : this.metrics.fps >= 30 ? '#ffff00' : '#ff0000';
    
    this.displayElement.innerHTML = `
      <div style="color: ${fpsColor}; font-weight: bold;">FPS: ${this.metrics.fps}</div>
      <div>Frame: ${this.metrics.frameTime.toFixed(2)}ms</div>
      <div>Draw Calls: ${this.metrics.drawCalls}</div>
      <div>Triangles: ${this.formatNumber(this.metrics.triangles)}</div>
      <div>Entities: ${this.metrics.entities}</div>
      ${this.metrics.memory > 0 ? `<div>Memory: ${this.metrics.memory}MB</div>` : ''}
    `;
  }

  /**
   * Format number with commas
   */
  private formatNumber(num: number): string {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }

  /**
   * Get metrics
   */
  getMetrics(): PerformanceMetrics {
    return { ...this.metrics };
  }

  /**
   * Toggle display
   */
  toggle() {
    if (this.displayElement) {
      this.displayElement.style.display = 
        this.displayElement.style.display === 'none' ? 'block' : 'none';
    }
  }

  /**
   * Show display
   */
  show() {
    if (this.displayElement) {
      this.displayElement.style.display = 'block';
    }
  }

  /**
   * Hide display
   */
  hide() {
    if (this.displayElement) {
      this.displayElement.style.display = 'none';
    }
  }

  /**
   * Enable/disable monitoring
   */
  setEnabled(enabled: boolean) {
    this.enabled = enabled;
    if (!enabled && this.displayElement) {
      this.displayElement.style.display = 'none';
    }
  }

  /**
   * Get performance warnings
   */
  getWarnings(): string[] {
    const warnings: string[] = [];

    if (this.metrics.fps < 30) {
      warnings.push('Low FPS - Performance issues detected');
    }

    if (this.metrics.drawCalls > 1000) {
      warnings.push('High draw calls - Consider batching');
    }

    if (this.metrics.triangles > 1000000) {
      warnings.push('High triangle count - Consider LOD');
    }

    if (this.metrics.memory > 500) {
      warnings.push('High memory usage - Check for leaks');
    }

    return warnings;
  }

  /**
   * Dispose
   */
  dispose() {
    if (this.displayElement) {
      document.body.removeChild(this.displayElement);
    }
  }
}
