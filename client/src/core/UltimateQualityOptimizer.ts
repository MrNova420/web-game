import * as THREE from 'three';

/**
 * UltimateQualityOptimizer - Maximum visual quality with optimal performance
 * Implements industry best practices for AAA-quality 3D open world games
 */
export class UltimateQualityOptimizer {
  private renderer: THREE.WebGLRenderer;
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  
  // Performance monitoring
  private frameHistory: number[] = [];
  private readonly FRAME_HISTORY_SIZE = 120; // 2 seconds at 60fps
  
  // Quality levels
  private currentQuality: 'maximum' | 'high' | 'balanced' | 'performance' = 'maximum';
  
  // Optimization settings
  private settings = {
    maximum: {
      // Best visual quality - for high-end PCs
      shadowMapSize: 8192,
      shadowCascades: 4,
      antialiasing: 'TAA',
      pixelRatio: window.devicePixelRatio,
      textureQuality: 'ultra',
      postProcessing: true,
      ssr: true,
      volumetricFog: true,
      particleCount: 1.0,
      drawDistance: 1000,
      lodMultiplier: 1.0,
      physicsSteps: 4,
      reflectionProbes: true
    },
    high: {
      shadowMapSize: 4096,
      shadowCascades: 3,
      antialiasing: 'FXAA',
      pixelRatio: Math.min(window.devicePixelRatio, 2),
      textureQuality: 'high',
      postProcessing: true,
      ssr: false,
      volumetricFog: true,
      particleCount: 0.75,
      drawDistance: 750,
      lodMultiplier: 0.8,
      physicsSteps: 3,
      reflectionProbes: false
    },
    balanced: {
      shadowMapSize: 2048,
      shadowCascades: 2,
      antialiasing: 'FXAA',
      pixelRatio: Math.min(window.devicePixelRatio, 1.5),
      textureQuality: 'medium',
      postProcessing: true,
      ssr: false,
      volumetricFog: false,
      particleCount: 0.5,
      drawDistance: 500,
      lodMultiplier: 0.6,
      physicsSteps: 2,
      reflectionProbes: false
    },
    performance: {
      shadowMapSize: 1024,
      shadowCascades: 1,
      antialiasing: 'none',
      pixelRatio: 1,
      textureQuality: 'low',
      postProcessing: false,
      ssr: false,
      volumetricFog: false,
      particleCount: 0.25,
      drawDistance: 300,
      lodMultiplier: 0.4,
      physicsSteps: 1,
      reflectionProbes: false
    }
  };
  
  constructor(
    renderer: THREE.WebGLRenderer,
    scene: THREE.Scene,
    camera: THREE.PerspectiveCamera
  ) {
    this.renderer = renderer;
    this.scene = scene;
    this.camera = camera;
    
    this.applyMaximumQuality();
    
    console.log('[UltimateQualityOptimizer] Initialized for best quality and performance');
  }
  
  /**
   * Apply maximum quality settings
   */
  private applyMaximumQuality(): void {
    this.currentQuality = 'maximum';
    const settings = this.settings.maximum;
    
    // Renderer optimizations
    this.renderer.setPixelRatio(settings.pixelRatio);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.shadowMap.autoUpdate = true;
    
    // Enable all quality features
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.3;
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    
    // Advanced rendering features
    this.renderer.sortObjects = true;
    this.renderer.autoClear = true;
    // Note: physicallyCorrectLights deprecated in THREE.js r155+
    // Lighting is now physically correct by default
    
    // Camera optimization
    this.camera.far = settings.drawDistance;
    this.camera.updateProjectionMatrix();
    
    // Scene optimization
    if (this.scene.fog instanceof THREE.Fog) {
      this.scene.fog.near = settings.drawDistance * 0.5;
      this.scene.fog.far = settings.drawDistance;
    }
    
    console.log('[UltimateQualityOptimizer] Maximum quality settings applied');
  }
  
  /**
   * Optimize materials for best quality
   */
  public optimizeMaterials(): void {
    // Get quality settings for material optimization
    // const settings = this.settings[this.currentQuality];
    
    this.scene.traverse((object) => {
      if (object instanceof THREE.Mesh) {
        const materials = Array.isArray(object.material) ? object.material : [object.material];
        
        materials.forEach(mat => {
          if (mat instanceof THREE.MeshStandardMaterial || mat instanceof THREE.MeshPhysicalMaterial) {
            // High quality material settings
            mat.roughness = mat.roughness || 0.7;
            mat.metalness = mat.metalness || 0.2;
            mat.envMapIntensity = 1.0;
            mat.side = THREE.DoubleSide; // Prevent see-through
            mat.flatShading = false; // Smooth shading
            mat.needsUpdate = true;
            
            // Texture filtering for best quality
            if (mat.map) {
              mat.map.minFilter = THREE.LinearMipmapLinearFilter;
              mat.map.magFilter = THREE.LinearFilter;
              mat.map.anisotropy = this.renderer.capabilities.getMaxAnisotropy();
            }
            
            // Normal map quality
            if (mat.normalMap) {
              mat.normalMap.minFilter = THREE.LinearMipmapLinearFilter;
              mat.normalMap.magFilter = THREE.LinearFilter;
            }
          }
        });
        
        // Shadows for quality
        object.castShadow = true;
        object.receiveShadow = true;
        
        // Frustum culling
        object.frustumCulled = true;
      }
    });
    
    console.log('[UltimateQualityOptimizer] Materials optimized for maximum quality');
  }
  
  /**
   * Apply LOD (Level of Detail) for performance
   */
  public applyLOD(objects: THREE.Object3D[]): void {
    const settings = this.settings[this.currentQuality];
    
    objects.forEach(object => {
      if (object instanceof THREE.Mesh) {
        // Set LOD based on distance and quality
        const lod = new THREE.LOD();
        
        // High detail (near)
        lod.addLevel(object.clone(), 0);
        
        // Medium detail
        const mediumDetail = object.clone();
        this.simplifyGeometry(mediumDetail, 0.7 * settings.lodMultiplier);
        lod.addLevel(mediumDetail, 50 * settings.lodMultiplier);
        
        // Low detail (far)
        const lowDetail = object.clone();
        this.simplifyGeometry(lowDetail, 0.4 * settings.lodMultiplier);
        lod.addLevel(lowDetail, 100 * settings.lodMultiplier);
        
        object.parent?.add(lod);
      }
    });
    
    console.log('[UltimateQualityOptimizer] LOD applied to objects');
  }
  
  /**
   * Simplify geometry for LOD
   */
  private simplifyGeometry(mesh: THREE.Mesh, quality: number): void {
    // Note: Geometry simplification would require additional library
    // For now, we adjust material quality
    const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
    materials.forEach(mat => {
      if (mat instanceof THREE.MeshStandardMaterial) {
        mat.flatShading = quality < 0.5;
      }
    });
  }
  
  /**
   * Optimize lights for quality and performance
   */
  public optimizeLights(): void {
    const settings = this.settings[this.currentQuality];
    
    this.scene.traverse((object) => {
      if (object instanceof THREE.DirectionalLight) {
        object.castShadow = true;
        object.shadow.mapSize.width = settings.shadowMapSize;
        object.shadow.mapSize.height = settings.shadowMapSize;
        object.shadow.camera.near = 0.5;
        object.shadow.camera.far = 500;
        object.shadow.bias = -0.0001;
        object.shadow.normalBias = 0.02;
        
        // Shadow camera optimization
        object.shadow.camera.left = -150;
        object.shadow.camera.right = 150;
        object.shadow.camera.top = 150;
        object.shadow.camera.bottom = -150;
        object.shadow.camera.updateProjectionMatrix();
      } else if (object instanceof THREE.PointLight || object instanceof THREE.SpotLight) {
        object.castShadow = this.currentQuality === 'maximum';
        if (object.castShadow && object.shadow) {
          object.shadow.mapSize.width = settings.shadowMapSize / 2;
          object.shadow.mapSize.height = settings.shadowMapSize / 2;
        }
      }
    });
    
    console.log('[UltimateQualityOptimizer] Lights optimized');
  }
  
  /**
   * Record frame time for performance monitoring
   */
  public recordFrame(deltaTime: number): void {
    const fps = 1 / deltaTime;
    this.frameHistory.push(fps);
    
    if (this.frameHistory.length > this.FRAME_HISTORY_SIZE) {
      this.frameHistory.shift();
    }
  }
  
  /**
   * Get average FPS
   */
  public getAverageFPS(): number {
    if (this.frameHistory.length === 0) return 60;
    
    const sum = this.frameHistory.reduce((a, b) => a + b, 0);
    return sum / this.frameHistory.length;
  }
  
  /**
   * Auto-adjust quality based on performance
   */
  public autoAdjustQuality(): boolean {
    const avgFPS = this.getAverageFPS();
    const targetFPS = 60;
    
    let newQuality = this.currentQuality;
    
    // Upgrade if performing well
    if (avgFPS > targetFPS * 1.2) {
      if (this.currentQuality === 'performance') newQuality = 'balanced';
      else if (this.currentQuality === 'balanced') newQuality = 'high';
      else if (this.currentQuality === 'high') newQuality = 'maximum';
    }
    // Downgrade if struggling
    else if (avgFPS < targetFPS * 0.8) {
      if (this.currentQuality === 'maximum') newQuality = 'high';
      else if (this.currentQuality === 'high') newQuality = 'balanced';
      else if (this.currentQuality === 'balanced') newQuality = 'performance';
    }
    
    if (newQuality !== this.currentQuality) {
      this.setQuality(newQuality);
      return true;
    }
    
    return false;
  }
  
  /**
   * Set quality level manually
   */
  public setQuality(quality: 'maximum' | 'high' | 'balanced' | 'performance'): void {
    this.currentQuality = quality;
    const settings = this.settings[quality];
    
    // Apply renderer settings
    this.renderer.setPixelRatio(settings.pixelRatio);
    this.renderer.shadowMap.enabled = settings.shadowMapSize > 0;
    
    if (this.renderer.shadowMap.enabled) {
      this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    }
    
    // Update camera
    this.camera.far = settings.drawDistance;
    this.camera.updateProjectionMatrix();
    
    // Update fog
    if (this.scene.fog instanceof THREE.Fog) {
      this.scene.fog.near = settings.drawDistance * 0.5;
      this.scene.fog.far = settings.drawDistance;
    }
    
    // Re-optimize
    this.optimizeLights();
    
    console.log(`[UltimateQualityOptimizer] Quality set to: ${quality} (avg FPS: ${this.getAverageFPS().toFixed(1)})`);
  }
  
  /**
   * Get current settings
   */
  public getSettings(): Record<string, unknown> {
    return {
      quality: this.currentQuality,
      ...this.settings[this.currentQuality],
      avgFPS: this.getAverageFPS()
    };
  }
  
  /**
   * Get performance statistics
   */
  public getStats(): Record<string, unknown> {
    return {
      quality: this.currentQuality,
      avgFPS: this.getAverageFPS(),
      minFPS: Math.min(...this.frameHistory),
      maxFPS: Math.max(...this.frameHistory),
      rendererInfo: {
        drawCalls: this.renderer.info.render.calls,
        triangles: this.renderer.info.render.triangles,
        geometries: this.renderer.info.memory.geometries,
        textures: this.renderer.info.memory.textures
      }
    };
  }
}
