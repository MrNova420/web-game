import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass';
import { SSAOPass } from 'three/examples/jsm/postprocessing/SSAOPass';
import { FXAAShader } from 'three/examples/jsm/shaders/FXAAShader';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass';
import { TAAPass, SSRShader } from './AdvancedPostProcessing';

/**
 * PostProcessingManager - Advanced post-processing effects for AAA visuals
 * Implements bloom, SSAO, TAA, SSR, and color correction
 */
export class PostProcessingManager {
  private composer: EffectComposer;
  private bloomPass: UnrealBloomPass | null = null;
  private ssaoPass: SSAOPass | null = null;
  private fxaaPass: ShaderPass | null = null;
  private taaPass: TAAPass | null = null;
  private ssrPass: ShaderPass | null = null;
  private enabled = true;
  private quality: 'low' | 'medium' | 'high' | 'ultra' = 'high';

  constructor(
    renderer: THREE.WebGLRenderer,
    scene: THREE.Scene,
    camera: THREE.PerspectiveCamera,
    quality: 'low' | 'medium' | 'high' | 'ultra' = 'high' // Optional with default for backward compatibility
  ) {
    this.quality = quality;
    
    // Create composer
    this.composer = new EffectComposer(renderer);
    
    // Add render pass (base rendering)
    const renderPass = new RenderPass(scene, camera);
    this.composer.addPass(renderPass);
    
    // Add SSAO for ambient occlusion (medium quality and above)
    if (quality === 'medium' || quality === 'high' || quality === 'ultra') {
      try {
        this.ssaoPass = new SSAOPass(scene, camera, window.innerWidth, window.innerHeight);
        this.ssaoPass.kernelRadius = quality === 'ultra' ? 16 : quality === 'high' ? 12 : 8;
        this.ssaoPass.minDistance = 0.002;
        this.ssaoPass.maxDistance = 0.08;
        this.ssaoPass.enabled = quality === 'high' || quality === 'ultra';
        this.composer.addPass(this.ssaoPass);
        
        console.log(`[PostProcessing] SSAO enabled (quality: ${quality})`);
      } catch (error) {
        console.warn('[PostProcessing] SSAO not available:', error);
      }
    }
    
    // Add bloom pass for glowing effects (all qualities)
    this.bloomPass = new UnrealBloomPass(
      new THREE.Vector2(window.innerWidth, window.innerHeight),
      quality === 'ultra' ? 0.5 : quality === 'high' ? 0.4 : quality === 'medium' ? 0.3 : 0.2,  // strength
      quality === 'ultra' ? 0.6 : quality === 'high' ? 0.5 : 0.4,  // radius
      quality === 'ultra' ? 0.8 : 0.85  // threshold
    );
    this.composer.addPass(this.bloomPass);
    
    // Add TAA (Temporal Anti-Aliasing) for ultra quality
    if (quality === 'ultra') {
      try {
        this.taaPass = new TAAPass(window.innerWidth, window.innerHeight);
        this.composer.addPass(this.taaPass);
        console.log('[PostProcessing] TAA (Temporal Anti-Aliasing) enabled');
      } catch (error) {
        console.warn('[PostProcessing] TAA not available:', error);
      }
    }
    
    // Add SSR (Screen Space Reflections) for high and ultra quality
    if (quality === 'high' || quality === 'ultra') {
      try {
        this.ssrPass = new ShaderPass(SSRShader);
        this.ssrPass.enabled = quality === 'ultra'; // Only enabled for ultra by default
        this.composer.addPass(this.ssrPass);
        console.log('[PostProcessing] SSR (Screen Space Reflections) configured');
      } catch (error) {
        console.warn('[PostProcessing] SSR not available:', error);
      }
    }
    
    // Add FXAA anti-aliasing pass (medium quality and above, if no TAA)
    if (quality !== 'low' && quality !== 'ultra') {
      this.fxaaPass = new ShaderPass(FXAAShader);
      const pixelRatio = renderer.getPixelRatio();
      const resolutionUniform = this.fxaaPass.material.uniforms['resolution'];
      if (resolutionUniform) {
        resolutionUniform.value.x = 1 / (window.innerWidth * pixelRatio);
        resolutionUniform.value.y = 1 / (window.innerHeight * pixelRatio);
      }
      this.composer.addPass(this.fxaaPass);
      
      console.log('[PostProcessing] FXAA anti-aliasing enabled');
    }
    
    console.log(`[PostProcessing] Initialized with ${quality} quality (TAA: ${!!this.taaPass}, SSR: ${!!this.ssrPass})`);
  }

  /**
   * Render with post-processing
   */
  render() {
    if (this.enabled) {
      this.composer.render();
    }
  }

  /**
   * Update on window resize
   */
  setSize(width: number, height: number) {
    this.composer.setSize(width, height);
    
    if (this.bloomPass) {
      this.bloomPass.resolution.set(width, height);
    }
    
    if (this.ssaoPass) {
      this.ssaoPass.setSize(width, height);
    }
    
    if (this.taaPass) {
      this.taaPass.setSize(width, height);
    }
    
    if (this.fxaaPass) {
      const pixelRatio = this.composer.renderer.getPixelRatio();
      const resolutionUniform = this.fxaaPass.material.uniforms['resolution'];
      if (resolutionUniform) {
        resolutionUniform.value.x = 1 / (width * pixelRatio);
        resolutionUniform.value.y = 1 / (height * pixelRatio);
      }
    }
  }

  /**
   * Enable/disable post-processing
   */
  setEnabled(enabled: boolean) {
    this.enabled = enabled;
    console.log(`[PostProcessing] ${enabled ? 'Enabled' : 'Disabled'}`);
  }

  /**
   * Set bloom intensity
   */
  setBloomStrength(strength: number) {
    if (this.bloomPass) {
      this.bloomPass.strength = Math.max(0, Math.min(3, strength));
    }
  }

  /**
   * Set bloom radius
   */
  setBloomRadius(radius: number) {
    if (this.bloomPass) {
      this.bloomPass.radius = Math.max(0, Math.min(1, radius));
    }
  }

  /**
   * Set bloom threshold
   */
  setBloomThreshold(threshold: number) {
    if (this.bloomPass) {
      this.bloomPass.threshold = Math.max(0, Math.min(1, threshold));
    }
  }

  /**
   * Enable/disable SSAO
   */
  setSSAOEnabled(enabled: boolean) {
    if (this.ssaoPass) {
      this.ssaoPass.enabled = enabled;
    }
  }
  
  /**
   * Enable/disable SSR (Screen Space Reflections)
   */
  setSSREnabled(enabled: boolean) {
    if (this.ssrPass) {
      this.ssrPass.enabled = enabled;
      console.log(`[PostProcessing] SSR ${enabled ? 'enabled' : 'disabled'}`);
    }
  }
  
  /**
   * Enable/disable TAA (Temporal Anti-Aliasing)
   */
  setTAAEnabled(enabled: boolean) {
    if (this.taaPass) {
      this.taaPass.enabled = enabled;
      console.log(`[PostProcessing] TAA ${enabled ? 'enabled' : 'disabled'}`);
    }
  }

  /**
   * Get composer for advanced usage
   */
  getComposer(): EffectComposer {
    return this.composer;
  }

  /**
   * Check if post-processing is enabled
   */
  isEnabled(): boolean {
    return this.enabled;
  }
}
