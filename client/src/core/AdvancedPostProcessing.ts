import * as THREE from 'three';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass';

/**
 * TAA (Temporal Anti-Aliasing) Pass
 * Provides better anti-aliasing than FXAA with temporal sampling
 */
export class TAAPass extends ShaderPass {
  private historyTexture: THREE.WebGLRenderTarget;
  private sampleIndex: number = 0;
  private jitterOffsets: THREE.Vector2[] = [];
  
  // Reusable objects for rendering
  private copyQuad: THREE.Mesh;
  private copyScene: THREE.Scene;
  private copyCamera: THREE.OrthographicCamera;
  
  constructor(width: number, height: number) {
    const shader = {
      uniforms: {
        tDiffuse: { value: null },
        tHistory: { value: null },
        alpha: { value: 0.9 },
        resolution: { value: new THREE.Vector2(width, height) }
      },
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform sampler2D tDiffuse;
        uniform sampler2D tHistory;
        uniform float alpha;
        uniform vec2 resolution;
        varying vec2 vUv;
        
        void main() {
          vec4 currentColor = texture2D(tDiffuse, vUv);
          vec4 historyColor = texture2D(tHistory, vUv);
          
          // Blend current frame with history
          vec4 result = mix(currentColor, historyColor, alpha);
          
          // Clamp to prevent ghosting
          result = clamp(result, 0.0, 1.0);
          
          gl_FragColor = result;
        }
      `
    };
    
    super(shader);
    
    // Create history buffer
    this.historyTexture = new THREE.WebGLRenderTarget(width, height, {
      minFilter: THREE.LinearFilter,
      magFilter: THREE.LinearFilter,
      format: THREE.RGBAFormat
    });
    
    this.uniforms['tHistory'].value = this.historyTexture.texture;
    
    // Generate jitter offsets for sub-pixel sampling (8 samples)
    this.generateJitterOffsets(8);
    
    // Create reusable rendering objects (once, not per frame)
    this.copyScene = new THREE.Scene();
    this.copyCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    this.copyQuad = new THREE.Mesh(
      new THREE.PlaneGeometry(2, 2),
      new THREE.MeshBasicMaterial()
    );
    this.copyScene.add(this.copyQuad);
    
    console.log('[TAAPass] Temporal Anti-Aliasing initialized');
  }
  
  private generateJitterOffsets(samples: number): void {
    // Halton sequence for better distribution
    this.jitterOffsets = [];
    for (let i = 0; i < samples; i++) {
      const x = this.halton(i + 1, 2) - 0.5;
      const y = this.halton(i + 1, 3) - 0.5;
      this.jitterOffsets.push(new THREE.Vector2(x, y));
    }
  }
  
  private halton(index: number, base: number): number {
    let result = 0;
    let f = 1 / base;
    let i = index;
    while (i > 0) {
      result += f * (i % base);
      i = Math.floor(i / base);
      f /= base;
    }
    return result;
  }
  
  public getJitterOffset(): THREE.Vector2 {
    const offset = this.jitterOffsets[this.sampleIndex % this.jitterOffsets.length];
    this.sampleIndex++;
    return offset;
  }
  
  public render(
    renderer: THREE.WebGLRenderer,
    writeBuffer: THREE.WebGLRenderTarget,
    readBuffer: THREE.WebGLRenderTarget
  ): void {
    // Set input texture
    this.uniforms['tDiffuse'].value = readBuffer.texture;
    
    // Render TAA pass
    super.render(renderer, writeBuffer, readBuffer);
    
    // Update history by copying current output using reusable objects
    const currentRenderTarget = renderer.getRenderTarget();
    renderer.setRenderTarget(this.historyTexture);
    
    // Clear and copy writeBuffer to history
    renderer.clear();
    
    // Update material with current texture
    if (this.copyQuad.material instanceof THREE.MeshBasicMaterial) {
      this.copyQuad.material.map = writeBuffer.texture;
      this.copyQuad.material.needsUpdate = true;
    }
    
    renderer.render(this.copyScene, this.copyCamera);
    
    // Restore original render target
    renderer.setRenderTarget(currentRenderTarget);
  }
  
  public setSize(width: number, height: number): void {
    this.historyTexture.setSize(width, height);
    this.uniforms['resolution'].value.set(width, height);
  }
  
  public dispose(): void {
    this.historyTexture.dispose();
    
    // Dispose reusable rendering objects
    this.copyQuad.geometry.dispose();
    if (this.copyQuad.material instanceof THREE.Material) {
      this.copyQuad.material.dispose();
    }
  }
}

/**
 * SSR (Screen Space Reflections) Shader
 * Provides realistic reflections for water and metallic surfaces
 */
export const SSRShader = {
  uniforms: {
    tDiffuse: { value: null },
    tDepth: { value: null },
    tNormal: { value: null },
    resolution: { value: new THREE.Vector2(1, 1) },
    cameraMatrix: { value: new THREE.Matrix4() },
    projectionMatrix: { value: new THREE.Matrix4() },
    inverseProjectionMatrix: { value: new THREE.Matrix4() },
    maxDistance: { value: 100 },
    thickness: { value: 0.1 },
    stride: { value: 1 },
    steps: { value: 20 }
  },
  
  vertexShader: `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  
  fragmentShader: `
    uniform sampler2D tDiffuse;
    uniform sampler2D tDepth;
    uniform sampler2D tNormal;
    uniform vec2 resolution;
    uniform mat4 cameraMatrix;
    uniform mat4 projectionMatrix;
    uniform mat4 inverseProjectionMatrix;
    uniform float maxDistance;
    uniform float thickness;
    uniform float stride;
    uniform int steps;
    
    varying vec2 vUv;
    
    vec3 getViewPosition(vec2 uv, float depth) {
      vec4 clipPos = vec4(uv * 2.0 - 1.0, depth * 2.0 - 1.0, 1.0);
      vec4 viewPos = inverseProjectionMatrix * clipPos;
      return viewPos.xyz / viewPos.w;
    }
    
    void main() {
      vec4 baseColor = texture2D(tDiffuse, vUv);
      float depth = texture2D(tDepth, vUv).r;
      vec3 normal = texture2D(tNormal, vUv).rgb * 2.0 - 1.0;
      
      // Skip if no valid depth or normal
      if (depth >= 1.0 || length(normal) < 0.1) {
        gl_FragColor = baseColor;
        return;
      }
      
      // Get view space position
      vec3 viewPos = getViewPosition(vUv, depth);
      vec3 viewDir = normalize(viewPos);
      vec3 reflectDir = reflect(viewDir, normal);
      
      // Ray march in screen space
      vec3 rayStep = reflectDir * stride / float(steps);
      vec3 currentPos = viewPos;
      vec2 hitUV = vUv;
      bool hit = false;
      
      for (int i = 0; i < steps; i++) {
        currentPos += rayStep;
        
        // Project to screen space
        vec4 projectedPos = projectionMatrix * vec4(currentPos, 1.0);
        vec2 screenUV = (projectedPos.xy / projectedPos.w) * 0.5 + 0.5;
        
        // Check bounds
        if (screenUV.x < 0.0 || screenUV.x > 1.0 || screenUV.y < 0.0 || screenUV.y > 1.0) {
          break;
        }
        
        // Sample depth at current position
        float sampleDepth = texture2D(tDepth, screenUV).r;
        vec3 samplePos = getViewPosition(screenUV, sampleDepth);
        
        // Check for intersection
        float depthDiff = abs(currentPos.z - samplePos.z);
        if (depthDiff < thickness) {
          hitUV = screenUV;
          hit = true;
          break;
        }
      }
      
      // Blend reflection
      if (hit) {
        vec4 reflectionColor = texture2D(tDiffuse, hitUV);
        float fresnel = pow(1.0 - abs(dot(normal, viewDir)), 3.0);
        gl_FragColor = mix(baseColor, reflectionColor, fresnel * 0.5);
      } else {
        gl_FragColor = baseColor;
      }
    }
  `
};
