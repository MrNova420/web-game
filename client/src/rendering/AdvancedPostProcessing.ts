import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass';
import { SMAAPass } from 'three/examples/jsm/postprocessing/SMAAPass';
import { SSAOPass } from 'three/examples/jsm/postprocessing/SSAOPass';

/**
 * Advanced Post-Processing System
 * 
 * Professional post-processing effects including:
 * - SSAO (Screen Space Ambient Occlusion)
 * - Bloom for fantasy glow effects
 * - SMAA (Subpixel Morphological Anti-Aliasing)
 * - Quality presets
 * 
 * Following AUTONOMOUS_DEVELOPMENT_GUIDE2.MD Section 2.3
 */
export class AdvancedPostProcessing {
  private composer: EffectComposer;
  private renderPass: RenderPass;
  private bloomPass: UnrealBloomPass;
  private smaaPass: SMAAPass;
  private ssaoPass: SSAOPass;
  private enabled: boolean = true;
  
  constructor(
    private renderer: THREE.WebGLRenderer,
    private scene: THREE.Scene,
    private camera: THREE.Camera
  ) {
    this.setupComposer();
  }
  
  private setupComposer(): void {
    console.log('🎨 Initializing Advanced Post-Processing...');
    
    // Create composer
    this.composer = new EffectComposer(this.renderer);
    
    // Base render pass
    this.renderPass = new RenderPass(this.scene, this.camera);
    this.composer.addPass(this.renderPass);
    
    // SSAO for depth and realism
    this.ssaoPass = new SSAOPass(this.scene, this.camera);
    this.ssaoPass.kernelRadius = 16;
    this.ssaoPass.minDistance = 0.005;
    this.ssaoPass.maxDistance = 0.1;
    this.composer.addPass(this.ssaoPass);
    
    // Bloom for magic/fantasy glow
    this.bloomPass = new UnrealBloomPass(
      new THREE.Vector2(window.innerWidth, window.innerHeight),
      0.5,  // Strength
      0.4,  // Radius
      0.85  // Threshold
    );
    this.composer.addPass(this.bloomPass);
    
    // SMAA for smooth edges
    this.smaaPass = new SMAAPass(
      window.innerWidth * this.renderer.getPixelRatio(),
      window.innerHeight * this.renderer.getPixelRatio()
    );
    this.composer.addPass(this.smaaPass);
    
    console.log('✅ Post-processing initialized');
  }
  
  /**
   * Render with post-processing effects
   */
  render(): void {
    if (this.enabled) {
      this.composer.render();
    } else {
      this.renderer.render(this.scene, this.camera);
    }
  }
  
  /**
   * Set quality preset
   */
  setQuality(preset: 'ultra' | 'high' | 'medium' | 'low' | 'mobile'): void {
    console.log(`🎨 Setting post-processing quality: ${preset}`);
    
    switch(preset) {
      case 'ultra':
      case 'high':
        this.ssaoPass.enabled = true;
        this.bloomPass.enabled = true;
        this.smaaPass.enabled = true;
        this.bloomPass.strength = 0.5;
        this.ssaoPass.kernelRadius = 16;
        break;
        
      case 'medium':
        this.ssaoPass.enabled = false;
        this.bloomPass.enabled = true;
        this.smaaPass.enabled = true;
        this.bloomPass.strength = 0.3;
        break;
        
      case 'low':
      case 'mobile':
        this.ssaoPass.enabled = false;
        this.bloomPass.enabled = false;
        this.smaaPass.enabled = false;
        break;
    }
  }
  
  /**
   * Handle window resize
   */
  resize(width: number, height: number): void {
    this.composer.setSize(width, height);
    this.bloomPass.setSize(width, height);
  }
  
  /**
   * Enable/disable post-processing
   */
  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
  }
  
  /**
   * Get current enabled state
   */
  isEnabled(): boolean {
    return this.enabled;
  }
  
  /**
   * Enable/disable specific effects
   */
  setSSAO(enabled: boolean): void {
    this.ssaoPass.enabled = enabled;
  }
  
  setBloom(enabled: boolean): void {
    this.bloomPass.enabled = enabled;
  }
  
  setSMAA(enabled: boolean): void {
    this.smaaPass.enabled = enabled;
  }
  
  /**
   * Adjust bloom settings
   */
  setBloomSettings(strength: number, radius: number, threshold: number): void {
    this.bloomPass.strength = strength;
    this.bloomPass.radius = radius;
    this.bloomPass.threshold = threshold;
  }
  
  /**
   * Adjust SSAO settings
   */
  setSSAOSettings(kernelRadius: number, minDistance: number, maxDistance: number): void {
    this.ssaoPass.kernelRadius = kernelRadius;
    this.ssaoPass.minDistance = minDistance;
    this.ssaoPass.maxDistance = maxDistance;
  }
  
  /**
   * Get statistics
   */
  getStatistics(): {
    enabled: boolean;
    ssao: boolean;
    bloom: boolean;
    smaa: boolean;
    passes: number;
  } {
    return {
      enabled: this.enabled,
      ssao: this.ssaoPass.enabled,
      bloom: this.bloomPass.enabled,
      smaa: this.smaaPass.enabled,
      passes: this.composer.passes.length
    };
  }
  
  /**
   * Dispose of resources
   */
  dispose(): void {
    this.composer.dispose();
    console.log('🎨 Post-processing disposed');
  }
}
