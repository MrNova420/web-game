import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass';
import { SSAOPass } from 'three/examples/jsm/postprocessing/SSAOPass';

/**
 * PostProcessingManager handles post-processing effects
 * Includes bloom, ambient occlusion, and other visual enhancements
 */
export class PostProcessingManager {
  private composer: EffectComposer;
  private bloomPass: UnrealBloomPass | null = null;
  private ssaoPass: SSAOPass | null = null;
  private enabled = true;

  constructor(
    renderer: THREE.WebGLRenderer,
    scene: THREE.Scene,
    camera: THREE.PerspectiveCamera
  ) {
    // Create composer
    this.composer = new EffectComposer(renderer);
    
    // Add render pass
    const renderPass = new RenderPass(scene, camera);
    this.composer.addPass(renderPass);
    
    // Add bloom pass for glowing effects
    this.bloomPass = new UnrealBloomPass(
      new THREE.Vector2(window.innerWidth, window.innerHeight),
      0.3,  // strength
      0.4,  // radius
      0.85  // threshold
    );
    this.composer.addPass(this.bloomPass);
    
    // Optionally add SSAO (Screen Space Ambient Occlusion)
    // Note: SSAO can be expensive, so we make it optional
    try {
      this.ssaoPass = new SSAOPass(scene, camera, window.innerWidth, window.innerHeight);
      this.ssaoPass.kernelRadius = 8;
      this.ssaoPass.minDistance = 0.005;
      this.ssaoPass.maxDistance = 0.1;
      this.ssaoPass.enabled = false; // Disabled by default for performance
      this.composer.addPass(this.ssaoPass);
    } catch (error) {
      console.warn('SSAO not available:', error);
    }
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
  }

  /**
   * Enable/disable post-processing
   */
  setEnabled(enabled: boolean) {
    this.enabled = enabled;
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
