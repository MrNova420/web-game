/**
 * PerformanceOptimizer - Optimizes game performance based on device capabilities
 */
export class PerformanceOptimizer {
  private static instance: PerformanceOptimizer;
  
  public deviceTier: 'low' | 'medium' | 'high' = 'medium';
  public settings = {
    shadows: true,
    antialiasing: true,
    postProcessing: true,
    particleDensity: 1.0,
    viewDistance: 1000,
    lodEnabled: true,
    textureQuality: 'high' as 'low' | 'medium' | 'high',
    targetFPS: 60,
  };
  
  private constructor() {
    this.detectDeviceTier();
    this.applyOptimalSettings();
  }
  
  public static getInstance(): PerformanceOptimizer {
    if (!PerformanceOptimizer.instance) {
      PerformanceOptimizer.instance = new PerformanceOptimizer();
    }
    return PerformanceOptimizer.instance;
  }
  
  private detectDeviceTier(): void {
    // Check device memory
    const memory = (performance as any).memory?.jsHeapSizeLimit || 0;
    const memoryGB = memory / (1024 * 1024 * 1024);
    
    // Check hardware concurrency (CPU cores)
    const cores = navigator.hardwareConcurrency || 2;
    
    // Check for mobile device
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    // Determine tier
    if (isMobile || memoryGB < 2 || cores < 4) {
      this.deviceTier = 'low';
      console.log('[PerformanceOptimizer] Device tier: LOW (mobile or limited resources)');
    } else if (memoryGB >= 4 && cores >= 4) {
      this.deviceTier = 'high';
      console.log('[PerformanceOptimizer] Device tier: HIGH (powerful device)');
    } else {
      this.deviceTier = 'medium';
      console.log('[PerformanceOptimizer] Device tier: MEDIUM (standard device)');
    }
  }
  
  private applyOptimalSettings(): void {
    switch (this.deviceTier) {
      case 'low':
        this.settings = {
          shadows: false,
          antialiasing: false,
          postProcessing: false,
          particleDensity: 0.3,
          viewDistance: 500,
          lodEnabled: true,
          textureQuality: 'low',
          targetFPS: 30,
        };
        console.log('[PerformanceOptimizer] Applied LOW performance settings');
        break;
        
      case 'medium':
        // PERFORMANCE FIX: Disable expensive features for better FPS
        this.settings = {
          shadows: false,  // Shadows are expensive - disabled for 60 FPS
          antialiasing: false,  // MSAA is expensive - disabled for 60 FPS
          postProcessing: false,
          particleDensity: 0.5,  // Reduced from 0.7
          viewDistance: 600,  // Reduced from 750 for fewer render calls
          lodEnabled: true,
          textureQuality: 'medium',
          targetFPS: 60,
        };
        console.log('[PerformanceOptimizer] Applied MEDIUM performance settings');
        break;
        
      case 'high':
        this.settings = {
          shadows: true,
          antialiasing: true,
          postProcessing: true,
          particleDensity: 1.0,
          viewDistance: 1000,
          lodEnabled: true,
          textureQuality: 'high',
          targetFPS: 60,
        };
        console.log('[PerformanceOptimizer] Applied HIGH performance settings');
        break;
    }
  }
  
  public getSettings() {
    return { ...this.settings };
  }
  
  private lastAdjustmentTime = 0;
  private readonly ADJUSTMENT_COOLDOWN = 5000; // Only adjust every 5 seconds
  
  public adjustSettings(fps: number): void {
    // Dynamically adjust settings if FPS drops
    const now = Date.now();
    
    // Throttle adjustments to prevent spam
    if (now - this.lastAdjustmentTime < this.ADJUSTMENT_COOLDOWN) {
      return;
    }
    
    if (fps < 30 && this.deviceTier !== 'low') {
      console.warn('[PerformanceOptimizer] Low FPS detected, reducing quality');
      this.settings.shadows = false;
      this.settings.particleDensity *= 0.7;
      this.settings.viewDistance *= 0.8;
      this.lastAdjustmentTime = now;
    } else if (fps >= 55 && this.deviceTier === 'high') {
      // Gradually restore quality if FPS is good
      if (this.settings.particleDensity < 1.0) {
        this.settings.particleDensity = Math.min(1.0, this.settings.particleDensity * 1.1);
        this.lastAdjustmentTime = now;
      }
    }
  }
}
