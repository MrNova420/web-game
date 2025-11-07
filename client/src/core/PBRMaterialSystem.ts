import * as THREE from 'three';

/**
 * PBR Material System - Physically Based Rendering
 * Enhances materials with realistic PBR properties using metallic/roughness workflow
 */
export class PBRMaterialSystem {
  private textureLoader: THREE.TextureLoader;
  private cache = new Map<string, THREE.Texture>();
  
  // PBR texture paths for different material types
  private pbrTexturePaths = {
    // Base material types from assets
    stone: {
      baseColor: '/extracted_assets/textures/stone_color.png',
      normal: '/extracted_assets/textures/stone_normal.png',
      roughness: '/extracted_assets/textures/stone_roughness.png',
      metallic: '/extracted_assets/textures/stone_metallic.png',
      ao: '/extracted_assets/textures/stone_ao.png'
    },
    wood: {
      baseColor: '/extracted_assets/textures/wood_color.png',
      normal: '/extracted_assets/textures/wood_normal.png',
      roughness: '/extracted_assets/textures/wood_roughness.png',
      metallic: '/extracted_assets/textures/wood_metallic.png',
      ao: '/extracted_assets/textures/wood_ao.png'
    },
    metal: {
      baseColor: '/extracted_assets/textures/metal_color.png',
      normal: '/extracted_assets/textures/metal_normal.png',
      roughness: '/extracted_assets/textures/metal_roughness.png',
      metallic: '/extracted_assets/textures/metal_metallic.png',
      ao: '/extracted_assets/textures/metal_ao.png'
    }
  };
  
  constructor() {
    this.textureLoader = new THREE.TextureLoader();
    console.log('[PBRMaterialSystem] Physically Based Rendering system initialized');
  }
  
  /**
   * Create a PBR material with full texture support
   */
  public async createPBRMaterial(
    type: 'stone' | 'wood' | 'metal' | 'custom',
    options: {
      color?: THREE.ColorRepresentation;
      roughness?: number;
      metalness?: number;
      customTextures?: {
        baseColor?: string;
        normal?: string;
        roughness?: string;
        metallic?: string;
        ao?: string;
      };
    } = {}
  ): Promise<THREE.MeshStandardMaterial> {
    
    const material = new THREE.MeshStandardMaterial({
      color: options.color || 0xffffff,
      roughness: options.roughness !== undefined ? options.roughness : 0.7,
      metalness: options.metalness !== undefined ? options.metalness : 0.2,
      side: THREE.DoubleSide,
      envMapIntensity: 1.0
    });
    
    // Load PBR textures if available
    const texturePaths = type !== 'custom' 
      ? this.pbrTexturePaths[type] 
      : options.customTextures;
    
    if (texturePaths) {
      try {
        // Load base color/albedo map
        if (texturePaths.baseColor) {
          const baseColorMap = await this.loadTexture(texturePaths.baseColor);
          if (baseColorMap) {
            material.map = baseColorMap;
            material.needsUpdate = true;
          }
        }
        
        // Load normal map for surface detail
        if (texturePaths.normal) {
          const normalMap = await this.loadTexture(texturePaths.normal);
          if (normalMap) {
            material.normalMap = normalMap;
            material.normalScale = new THREE.Vector2(1, 1);
            material.needsUpdate = true;
          }
        }
        
        // Load roughness map
        if (texturePaths.roughness) {
          const roughnessMap = await this.loadTexture(texturePaths.roughness);
          if (roughnessMap) {
            material.roughnessMap = roughnessMap;
            material.needsUpdate = true;
          }
        }
        
        // Load metallic map
        if (texturePaths.metallic) {
          const metallicMap = await this.loadTexture(texturePaths.metallic);
          if (metallicMap) {
            material.metalnessMap = metallicMap;
            material.needsUpdate = true;
          }
        }
        
        // Load ambient occlusion map
        if (texturePaths.ao) {
          const aoMap = await this.loadTexture(texturePaths.ao);
          if (aoMap) {
            material.aoMap = aoMap;
            material.aoMapIntensity = 1.0;
            material.needsUpdate = true;
          }
        }
        
        console.log(`[PBRMaterialSystem] Created PBR material: ${type}`);
      } catch (error) {
        console.warn(`[PBRMaterialSystem] Failed to load some PBR textures for ${type}:`, error);
      }
    }
    
    return material;
  }
  
  /**
   * Load texture with caching
   */
  private async loadTexture(path: string): Promise<THREE.Texture | null> {
    if (this.cache.has(path)) {
      return this.cache.get(path)!;
    }
    
    try {
      const texture = await this.textureLoader.loadAsync(path);
      texture.colorSpace = THREE.SRGBColorSpace;
      texture.wrapS = THREE.RepeatWrapping;
      texture.wrapT = THREE.RepeatWrapping;
      this.cache.set(path, texture);
      return texture;
    } catch (error) {
      console.warn(`[PBRMaterialSystem] Texture not found: ${path}`);
      return null;
    }
  }
  
  /**
   * Upgrade existing material to PBR
   */
  public upgradeToPBR(
    material: THREE.Material,
    type: 'stone' | 'wood' | 'metal' = 'stone'
  ): void {
    if (material instanceof THREE.MeshStandardMaterial) {
      // Material is already standard, just enhance with PBR properties
      material.roughness = type === 'metal' ? 0.2 : type === 'wood' ? 0.8 : 0.7;
      material.metalness = type === 'metal' ? 0.9 : type === 'wood' ? 0.1 : 0.2;
      material.envMapIntensity = 1.0;
      material.needsUpdate = true;
    }
  }
  
  /**
   * Apply PBR material to object and all children
   */
  public async applyPBRToObject(
    object: THREE.Object3D,
    materialType: 'stone' | 'wood' | 'metal' = 'stone'
  ): Promise<void> {
    const pbrMaterial = await this.createPBRMaterial(materialType);
    
    object.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        // Keep existing color if available
        if (child.material instanceof THREE.MeshStandardMaterial) {
          const existingColor = child.material.color.clone();
          pbrMaterial.color.copy(existingColor);
        }
        
        child.material = pbrMaterial.clone();
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });
    
    console.log(`[PBRMaterialSystem] Applied PBR material (${materialType}) to object`);
  }
  
  /**
   * Create environment map for reflections
   * Note: Renderer should be passed as parameter for efficiency
   */
  public createEnvironmentMap(scene: THREE.Scene, renderer?: THREE.WebGLRenderer): THREE.CubeTexture | null {
    // Use existing skybox or create cube texture from scene
    // This provides realistic reflections on metallic surfaces
    const cubeRenderTarget = new THREE.WebGLCubeRenderTarget(256);
    const cubeCamera = new THREE.CubeCamera(0.1, 1000, cubeRenderTarget);
    scene.add(cubeCamera);
    
    // Update cube camera to capture environment
    // Renderer should be provided by caller for efficiency
    if (renderer) {
      cubeCamera.update(renderer, scene);
    }
    
    console.log('[PBRMaterialSystem] Environment map created for reflections');
    return cubeRenderTarget.texture;
  }
  
  /**
   * Get material statistics
   */
  public getStats(): any {
    return {
      cachedTextures: this.cache.size,
      availableMaterialTypes: Object.keys(this.pbrTexturePaths)
    };
  }
}
