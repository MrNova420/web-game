import * as THREE from 'three';

/**
 * AdvancedRenderer - Industry-standard rendering configuration
 * Implements best practices for 3D open world games
 */
export class AdvancedRenderer {
  private renderer: THREE.WebGLRenderer;
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  
  // Quality presets
  public static readonly QUALITY_PRESETS = {
    LOW: {
      shadowMapSize: 1024,
      antialiasing: false,
      pixelRatio: 1,
      toneMappingExposure: 1.0,
      shadowsEnabled: false,
      aoEnabled: false,
      bloomEnabled: false
    },
    MEDIUM: {
      shadowMapSize: 2048,
      antialiasing: true,
      pixelRatio: Math.min(window.devicePixelRatio, 1.5),
      toneMappingExposure: 1.1,
      shadowsEnabled: true,
      aoEnabled: false,
      bloomEnabled: true
    },
    HIGH: {
      shadowMapSize: 4096,
      antialiasing: true,
      pixelRatio: Math.min(window.devicePixelRatio, 2),
      toneMappingExposure: 1.2,
      shadowsEnabled: true,
      aoEnabled: true,
      bloomEnabled: true
    },
    ULTRA: {
      shadowMapSize: 8192,
      antialiasing: true,
      pixelRatio: window.devicePixelRatio,
      toneMappingExposure: 1.3,
      shadowsEnabled: true,
      aoEnabled: true,
      bloomEnabled: true
    }
  };
  
  constructor(
    canvas: HTMLCanvasElement,
    scene: THREE.Scene,
    camera: THREE.PerspectiveCamera,
    qualityPreset: keyof typeof AdvancedRenderer.QUALITY_PRESETS = 'HIGH'
  ) {
    this.scene = scene;
    this.camera = camera;
    
    const preset = AdvancedRenderer.QUALITY_PRESETS[qualityPreset];
    
    // Create renderer with optimal settings
    this.renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: preset.antialiasing,
      powerPreference: 'high-performance',
      alpha: false,
      stencil: false, // Disable if not needed for performance
      depth: true,
      logarithmicDepthBuffer: false, // Can help with z-fighting but has performance cost
      preserveDrawingBuffer: false // Better performance
    });
    
    this.setupRenderer(preset);
    this.setupShadows(preset);
    this.setupMaterialDefaults();
    
    console.log(`[AdvancedRenderer] Initialized with ${qualityPreset} quality preset`);
  }
  
  private setupRenderer(preset: any): void {
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(preset.pixelRatio);
    
    // Color management - CRITICAL for proper visuals
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = preset.toneMappingExposure;
    
    // Rendering settings for proper depth and transparency
    this.renderer.sortObjects = true; // Enable for proper transparency
    this.renderer.autoClear = true;
    this.renderer.autoClearColor = true;
    this.renderer.autoClearDepth = true;
    this.renderer.autoClearStencil = true;
    
    // Performance monitoring
    this.renderer.info.autoReset = false;
    
    console.log('[AdvancedRenderer] Renderer configured with:');
    console.log(`  - Pixel Ratio: ${preset.pixelRatio}`);
    console.log(`  - Tone Mapping: ACESFilmic (exposure: ${preset.toneMappingExposure})`);
    console.log(`  - Antialiasing: ${preset.antialiasing ? 'ON' : 'OFF'}`);
  }
  
  private setupShadows(preset: any): void {
    this.renderer.shadowMap.enabled = preset.shadowsEnabled;
    
    if (preset.shadowsEnabled) {
      // Use PCFSoftShadowMap for best quality shadows
      this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
      this.renderer.shadowMap.autoUpdate = true;
      
      console.log('[AdvancedRenderer] Shadows enabled:');
      console.log(`  - Type: PCFSoftShadowMap`);
      console.log(`  - Map Size: ${preset.shadowMapSize}x${preset.shadowMapSize}`);
    }
  }
  
  private setupMaterialDefaults(): void {
    // Set global material defaults for better rendering
    THREE.Material.prototype.side = THREE.FrontSide; // Default to front side for performance
    
    console.log('[AdvancedRenderer] Material defaults configured');
  }
  
  /**
   * Configure a light for optimal shadow rendering
   */
  public configureLightShadows(
    light: THREE.DirectionalLight | THREE.SpotLight,
    mapSize: number = 2048,
    cameraSize: number = 100
  ): void {
    light.castShadow = true;
    light.shadow.mapSize.width = mapSize;
    light.shadow.mapSize.height = mapSize;
    light.shadow.camera.near = 0.5;
    light.shadow.camera.far = 500;
    
    if (light instanceof THREE.DirectionalLight) {
      light.shadow.camera.left = -cameraSize;
      light.shadow.camera.right = cameraSize;
      light.shadow.camera.top = cameraSize;
      light.shadow.camera.bottom = -cameraSize;
    }
    
    // Reduce shadow acne
    light.shadow.bias = -0.0001;
    light.shadow.normalBias = 0.02;
  }
  
  /**
   * Configure fog for depth perception
   */
  public configureFog(color: THREE.ColorRepresentation, near: number, far: number): void {
    this.scene.fog = new THREE.Fog(color, near, far);
    console.log(`[AdvancedRenderer] Fog configured: near=${near}, far=${far}`);
  }
  
  /**
   * Apply material fixes to an object and all children
   */
  public applyMaterialFixes(object: THREE.Object3D, doubleSided: boolean = true): void {
    object.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        // Ensure normals exist
        if (child.geometry && !child.geometry.attributes.normal) {
          child.geometry.computeVertexNormals();
        }
        
        // Fix materials
        const materials = Array.isArray(child.material) ? child.material : [child.material];
        materials.forEach(mat => {
          if (mat instanceof THREE.MeshStandardMaterial || mat instanceof THREE.MeshPhysicalMaterial) {
            if (doubleSided) {
              mat.side = THREE.DoubleSide;
            }
            mat.flatShading = false;
            mat.needsUpdate = true;
          } else if (mat instanceof THREE.MeshBasicMaterial || mat instanceof THREE.MeshLambertMaterial) {
            // Convert to standard material for better lighting
            const standardMat = new THREE.MeshStandardMaterial({
              color: mat.color,
              map: mat.map,
              side: doubleSided ? THREE.DoubleSide : THREE.FrontSide,
              roughness: 0.7,
              metalness: 0.2
            });
            
            const idx = materials.indexOf(mat);
            if (Array.isArray(child.material)) {
              child.material[idx] = standardMat;
            } else {
              child.material = standardMat;
            }
          }
        });
        
        // Enable shadows
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });
  }
  
  /**
   * Render the scene
   */
  public render(): void {
    this.renderer.render(this.scene, this.camera);
  }
  
  /**
   * Handle window resize
   */
  public handleResize(): void {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }
  
  /**
   * Get renderer instance
   */
  public getRenderer(): THREE.WebGLRenderer {
    return this.renderer;
  }
  
  /**
   * Get rendering statistics
   */
  public getStats(): any {
    return {
      memory: this.renderer.info.memory,
      render: this.renderer.info.render,
      programs: this.renderer.info.programs?.length || 0
    };
  }
  
  /**
   * Dispose renderer
   */
  public dispose(): void {
    this.renderer.dispose();
    this.renderer.forceContextLoss();
  }
}
