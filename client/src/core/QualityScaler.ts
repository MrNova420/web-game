/**
 * QualityScaler - Adaptive quality adjustment for performance
 * ENHANCEMENT: Automatically adjusts graphics quality based on FPS
 * Based on AUTONOMOUS_DEVELOPMENT_GUIDE2.MD System 1.3
 */
export interface QualitySettings {
  shadowQuality: 'ultra' | 'high' | 'medium' | 'low' | 'none';
  textureQuality: number;
  drawDistance: number;
  particleDensity: number;
  postProcessing: boolean;
  antialiasing: 'SMAA' | 'FXAA' | 'none';
  renderScale: number;
  instanceLimit: number;
  reflections: boolean;
  ambientOcclusion: boolean;
  volumetricFog: boolean;
}

export type QualityPreset = 'ultra' | 'high' | 'medium' | 'low' | 'mobile';

export class QualityScaler {
  private currentPreset: QualityPreset = 'high';
  private settings: QualitySettings;
  private lastAdjustmentTime = 0;
  private adjustmentCooldown = 3000; // 3 seconds between adjustments

  private presets: Record<QualityPreset, QualitySettings> = {
    ultra: {
      shadowQuality: 'ultra',
      textureQuality: 4096,
      drawDistance: 10,
      particleDensity: 1.0,
      postProcessing: true,
      antialiasing: 'SMAA',
      renderScale: 1.0,
      instanceLimit: 100000,
      reflections: true,
      ambientOcclusion: true,
      volumetricFog: true,
    },
    high: {
      shadowQuality: 'high',
      textureQuality: 2048,
      drawDistance: 8,
      particleDensity: 0.8,
      postProcessing: true,
      antialiasing: 'FXAA',
      renderScale: 1.0,
      instanceLimit: 50000,
      reflections: true,
      ambientOcclusion: true,
      volumetricFog: false,
    },
    medium: {
      shadowQuality: 'medium',
      textureQuality: 1024,
      drawDistance: 6,
      particleDensity: 0.5,
      postProcessing: true,
      antialiasing: 'FXAA',
      renderScale: 0.85,
      instanceLimit: 25000,
      reflections: false,
      ambientOcclusion: false,
      volumetricFog: false,
    },
    low: {
      shadowQuality: 'low',
      textureQuality: 512,
      drawDistance: 4,
      particleDensity: 0.2,
      postProcessing: false,
      antialiasing: 'none',
      renderScale: 0.75,
      instanceLimit: 10000,
      reflections: false,
      ambientOcclusion: false,
      volumetricFog: false,
    },
    mobile: {
      shadowQuality: 'none',
      textureQuality: 512,
      drawDistance: 3,
      particleDensity: 0.1,
      postProcessing: false,
      antialiasing: 'none',
      renderScale: 0.6,
      instanceLimit: 5000,
      reflections: false,
      ambientOcclusion: false,
      volumetricFog: false,
    },
  };

  // Callbacks for quality changes
  private onQualityChange: ((settings: QualitySettings) => void) | null = null;

  constructor(initialPreset: QualityPreset = 'high') {
    this.currentPreset = initialPreset;
    this.settings = { ...this.presets[initialPreset] };
    console.log('[QualityScaler] Initialized with preset:', initialPreset);
  }

  /**
   * Set callback for quality changes
   */
  setOnQualityChange(callback: (settings: QualitySettings) => void): void {
    this.onQualityChange = callback;
  }

  /**
   * Get current quality settings
   */
  getSettings(): QualitySettings {
    return { ...this.settings };
  }

  /**
   * Get current preset name
   */
  getCurrentPreset(): QualityPreset {
    return this.currentPreset;
  }

  /**
   * Decrease quality by one level
   */
  decreaseQuality(): void {
    const now = Date.now();
    if (now - this.lastAdjustmentTime < this.adjustmentCooldown) {
      return; // Too soon since last adjustment
    }

    const presetOrder: QualityPreset[] = ['ultra', 'high', 'medium', 'low', 'mobile'];
    const currentIndex = presetOrder.indexOf(this.currentPreset);

    if (currentIndex < presetOrder.length - 1) {
      const newPreset = presetOrder[currentIndex + 1];
      this.setPreset(newPreset);
      console.log(`[QualityScaler] Decreased quality: ${this.currentPreset} -> ${newPreset}`);
      this.lastAdjustmentTime = now;
    }
  }

  /**
   * Increase quality by one level
   */
  increaseQuality(): void {
    const now = Date.now();
    if (now - this.lastAdjustmentTime < this.adjustmentCooldown) {
      return; // Too soon since last adjustment
    }

    const presetOrder: QualityPreset[] = ['ultra', 'high', 'medium', 'low', 'mobile'];
    const currentIndex = presetOrder.indexOf(this.currentPreset);

    if (currentIndex > 0) {
      const newPreset = presetOrder[currentIndex - 1];
      this.setPreset(newPreset);
      console.log(`[QualityScaler] Increased quality: ${this.currentPreset} -> ${newPreset}`);
      this.lastAdjustmentTime = now;
    }
  }

  /**
   * Set quality preset
   */
  setPreset(preset: QualityPreset): void {
    this.currentPreset = preset;
    this.settings = { ...this.presets[preset] };

    if (this.onQualityChange) {
      this.onQualityChange(this.settings);
    }
  }

  /**
   * ENHANCEMENT: Auto-detect optimal quality based on device
   */
  detectOptimalQuality(): QualityPreset {
    const gpu = this.detectGPU();
    const memory = this.getAvailableMemory();
    const isMobile = /Mobile|Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

    console.log('[QualityScaler] Device detection:', {
      gpu: gpu.tier,
      memory: memory ? `${(memory / 1e9).toFixed(1)}GB` : 'unknown',
      isMobile,
    });

    if (isMobile) {
      return 'mobile';
    }

    if (gpu.tier === 'high' && memory > 4e9) {
      return 'ultra';
    }

    if (gpu.tier === 'high' || (gpu.tier === 'medium' && memory > 2e9)) {
      return 'high';
    }

    if (gpu.tier === 'medium') {
      return 'medium';
    }

    return 'low';
  }

  /**
   * Detect GPU tier
   */
  private detectGPU(): { tier: 'high' | 'medium' | 'low'; renderer: string } {
    try {
      const canvas = document.createElement('canvas');
      const gl =
        canvas.getContext('webgl2') ||
        canvas.getContext('webgl') ||
        canvas.getContext('experimental-webgl');

      if (!gl) {
        return { tier: 'low', renderer: 'unknown' };
      }

      const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
      const renderer = debugInfo
        ? gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL)
        : '';

      console.log('[QualityScaler] GPU:', renderer);

      // Classify GPU tier based on renderer string
      if (
        /NVIDIA|RTX|GTX (1[0-9]|[2-9][0-9])|Radeon RX (5|6|7)[0-9]{2,3}|Apple M[1-9]|Mali-G[7-9][0-9]/i.test(
          renderer
        )
      ) {
        return { tier: 'high', renderer };
      }

      if (/Intel.*Iris|Intel.*UHD|Intel.*Xe|Adreno [6-9][0-9]{2}/i.test(renderer)) {
        return { tier: 'medium', renderer };
      }

      return { tier: 'low', renderer };
    } catch (e) {
      console.warn('[QualityScaler] Failed to detect GPU:', e);
      return { tier: 'medium', renderer: 'unknown' };
    }
  }

  /**
   * Get available memory (if supported)
   */
  private getAvailableMemory(): number | null {
    try {
      // @ts-expect-error - performance.memory is not standard but widely supported
      if (performance.memory?.jsHeapSizeLimit) {
        // @ts-expect-error
        return performance.memory.jsHeapSizeLimit;
      }
      return null;
    } catch (e) {
      return null;
    }
  }

  /**
   * Get quality level as number (0-4)
   */
  getQualityLevel(): number {
    const presetOrder: QualityPreset[] = ['mobile', 'low', 'medium', 'high', 'ultra'];
    return presetOrder.indexOf(this.currentPreset);
  }

  /**
   * Set quality level by number (0-4)
   */
  setQualityLevel(level: number): void {
    const presetOrder: QualityPreset[] = ['mobile', 'low', 'medium', 'high', 'ultra'];
    const clamped = Math.max(0, Math.min(4, Math.floor(level)));
    this.setPreset(presetOrder[clamped]);
  }
}
