import * as THREE from 'three';

/**
 * AdvancedPerformanceMonitor - Comprehensive performance tracking
 * ENHANCEMENT: Following AUTONOMOUS_DEVELOPMENT_GUIDE2.MD Performance Monitoring
 * Tracks FPS, draw calls, memory, and system-specific metrics
 */

interface PerformanceMetrics {
  fps: number;
  frameTime: number;
  drawCalls: number;
  triangles: number;
  geometries: number;
  textures: number;
  programs: number;
  memoryUsage: number;
  sceneObjects: number;
  timestamp: number;
}

interface SystemMetrics {
  name: string;
  updateTime: number;
  enabled: boolean;
}

export class AdvancedPerformanceMonitor {
  private frameTimeHistory: number[] = [];
  private maxHistorySize = 120; // 2 seconds at 60 FPS
  
  private currentMetrics: PerformanceMetrics;
  private systemMetrics = new Map<string, SystemMetrics>();
  
  private lastTime = 0;
  private frameCount = 0;
  private fps = 60;
  
  // Performance targets
  private targetFPS = 60;
  private targetFrameTime = 1000 / 60;
  
  // Warnings
  private lowFPSWarningThreshold = 30;
  private highDrawCallWarningThreshold = 100;
  
  // Statistics
  private statsUpdateInterval = 1000; // Update every second
  private lastStatsUpdate = 0;
  
  constructor(targetFPS: number = 60) {
    this.targetFPS = targetFPS;
    this.targetFrameTime = 1000 / targetFPS;
    
    this.currentMetrics = {
      fps: 0,
      frameTime: 0,
      drawCalls: 0,
      triangles: 0,
      geometries: 0,
      textures: 0,
      programs: 0,
      memoryUsage: 0,
      sceneObjects: 0,
      timestamp: Date.now()
    };
    
    console.log('[AdvancedPerformanceMonitor] Initialized (target: ' + targetFPS + ' FPS)');
  }
  
  /**
   * Update performance metrics
   */
  update(renderer: THREE.WebGLRenderer, scene: THREE.Scene): void {
    const currentTime = performance.now();
    const deltaTime = currentTime - this.lastTime;
    
    if (this.lastTime > 0) {
      // Track frame time
      this.frameTimeHistory.push(deltaTime);
      if (this.frameTimeHistory.length > this.maxHistorySize) {
        this.frameTimeHistory.shift();
      }
      
      this.frameCount++;
    }
    
    this.lastTime = currentTime;
    
    // Update stats periodically
    if (currentTime - this.lastStatsUpdate >= this.statsUpdateInterval) {
      this.updateStatistics(renderer, scene);
      this.lastStatsUpdate = currentTime;
      this.frameCount = 0;
    }
  }
  
  /**
   * Update statistics
   */
  private updateStatistics(renderer: THREE.WebGLRenderer, scene: THREE.Scene): void {
    // Calculate FPS
    const avgFrameTime = this.getAverageFrameTime();
    this.fps = avgFrameTime > 0 ? 1000 / avgFrameTime : 0;
    
    // Get renderer info
    const info = renderer.info;
    
    // Update metrics
    this.currentMetrics = {
      fps: Math.round(this.fps),
      frameTime: avgFrameTime,
      drawCalls: info.render.calls,
      triangles: info.render.triangles,
      geometries: info.memory.geometries,
      textures: info.memory.textures,
      programs: info.programs?.length || 0,
      memoryUsage: this.getMemoryUsage(),
      sceneObjects: this.countSceneObjects(scene),
      timestamp: Date.now()
    };
    
    // Check for performance issues
    this.checkPerformanceIssues();
  }
  
  /**
   * Track system update time
   */
  trackSystem(name: string, updateTime: number, enabled: boolean = true): void {
    this.systemMetrics.set(name, {
      name,
      updateTime,
      enabled
    });
  }
  
  /**
   * Get average frame time
   */
  private getAverageFrameTime(): number {
    if (this.frameTimeHistory.length === 0) return 0;
    const sum = this.frameTimeHistory.reduce((a, b) => a + b, 0);
    return sum / this.frameTimeHistory.length;
  }
  
  /**
   * Get memory usage (if available)
   */
  private getMemoryUsage(): number {
    try {
      // @ts-expect-error - performance.memory is not standard
      if (performance.memory?.usedJSHeapSize) {
        // @ts-expect-error
        return Math.round(performance.memory.usedJSHeapSize / 1024 / 1024); // MB
      }
    } catch (e) {
      // Not available
    }
    return 0;
  }
  
  /**
   * Count objects in scene
   */
  private countSceneObjects(scene: THREE.Scene): number {
    let count = 0;
    scene.traverse(() => count++);
    return count;
  }
  
  /**
   * Check for performance issues
   */
  private checkPerformanceIssues(): void {
    const metrics = this.currentMetrics;
    
    // Low FPS warning
    if (metrics.fps < this.lowFPSWarningThreshold) {
      console.warn(
        `[AdvancedPerformanceMonitor] ⚠️ Low FPS: ${metrics.fps} (target: ${this.targetFPS})`
      );
    }
    
    // High draw calls warning
    if (metrics.drawCalls > this.highDrawCallWarningThreshold) {
      console.warn(
        `[AdvancedPerformanceMonitor] ⚠️ High draw calls: ${metrics.drawCalls} (consider instancing)`
      );
    }
    
    // High geometry count
    if (metrics.geometries > 1000) {
      console.warn(
        `[AdvancedPerformanceMonitor] ⚠️ High geometry count: ${metrics.geometries} (consider pooling)`
      );
    }
  }
  
  /**
   * Get current metrics
   */
  getMetrics(): PerformanceMetrics {
    return { ...this.currentMetrics };
  }
  
  /**
   * Get system metrics
   */
  getSystemMetrics(): SystemMetrics[] {
    return Array.from(this.systemMetrics.values());
  }
  
  /**
   * Get performance summary
   */
  getSummary(): string {
    const m = this.currentMetrics;
    return `FPS: ${m.fps} | Frame: ${m.frameTime.toFixed(2)}ms | Draws: ${m.drawCalls} | Tris: ${m.triangles} | Objects: ${m.sceneObjects}`;
  }
  
  /**
   * Log detailed performance report
   */
  logReport(): void {
    const m = this.currentMetrics;
    
    console.log('\n=== PERFORMANCE REPORT ===');
    console.log(`FPS: ${m.fps} / ${this.targetFPS}`);
    console.log(`Frame Time: ${m.frameTime.toFixed(2)}ms (target: ${this.targetFrameTime.toFixed(2)}ms)`);
    console.log(`Draw Calls: ${m.drawCalls}`);
    console.log(`Triangles: ${m.triangles.toLocaleString()}`);
    console.log(`Geometries: ${m.geometries}`);
    console.log(`Textures: ${m.textures}`);
    console.log(`Programs: ${m.programs}`);
    if (m.memoryUsage > 0) {
      console.log(`Memory: ${m.memoryUsage}MB`);
    }
    console.log(`Scene Objects: ${m.sceneObjects}`);
    
    if (this.systemMetrics.size > 0) {
      console.log('\nSystem Update Times:');
      this.systemMetrics.forEach(sys => {
        if (sys.enabled) {
          console.log(`  ${sys.name}: ${sys.updateTime.toFixed(2)}ms`);
        }
      });
    }
    
    console.log('=== END REPORT ===\n');
  }
  
  /**
   * Get performance grade (A-F)
   */
  getPerformanceGrade(): string {
    const fpsRatio = this.currentMetrics.fps / this.targetFPS;
    
    if (fpsRatio >= 0.95) return 'A'; // 95-100%
    if (fpsRatio >= 0.85) return 'B'; // 85-95%
    if (fpsRatio >= 0.70) return 'C'; // 70-85%
    if (fpsRatio >= 0.50) return 'D'; // 50-70%
    return 'F'; // <50%
  }
  
  /**
   * Check if performance is acceptable
   */
  isPerformanceAcceptable(): boolean {
    return this.currentMetrics.fps >= this.targetFPS * 0.8; // 80% of target
  }
  
  /**
   * Get optimization suggestions
   */
  getOptimizationSuggestions(): string[] {
    const suggestions: string[] = [];
    const m = this.currentMetrics;
    
    if (m.drawCalls > 50) {
      suggestions.push('Use GPU instancing to reduce draw calls');
    }
    
    if (m.triangles > 1000000) {
      suggestions.push('Implement LOD system to reduce triangle count');
    }
    
    if (m.geometries > 500) {
      suggestions.push('Use geometry pooling/reuse');
    }
    
    if (m.textures > 100) {
      suggestions.push('Use texture atlases to reduce texture count');
    }
    
    if (m.fps < this.targetFPS * 0.8) {
      suggestions.push('Consider reducing quality settings');
    }
    
    return suggestions;
  }
  
  /**
   * Reset statistics
   */
  reset(): void {
    this.frameTimeHistory = [];
    this.frameCount = 0;
    this.lastTime = 0;
    console.log('[AdvancedPerformanceMonitor] Statistics reset');
  }
}
