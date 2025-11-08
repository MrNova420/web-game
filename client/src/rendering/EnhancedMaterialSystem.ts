import * as THREE from 'three';

/**
 * EnhancedMaterialSystem - PBR materials for all game assets
 * ENHANCEMENT: Full PBR materials with texture support
 * Based on AUTONOMOUS_DEVELOPMENT_GUIDE2.MD System 2.1
 */

export interface MaterialDefinition {
  baseColor: THREE.Color;
  roughness: number;
  metalness: number;
  normalScale: number;
  emissive?: THREE.Color;
  emissiveIntensity?: number;
}

export class EnhancedMaterialSystem {
  private materialCache = new Map<string, THREE.Material>();
  private textureCache = new Map<string, THREE.Texture>();
  private textureLoader = new THREE.TextureLoader();

  // ENHANCEMENT: Material library for asset types
  private materialLibrary: Record<string, MaterialDefinition> = {
    stone: {
      baseColor: new THREE.Color(0x808080),
      roughness: 0.9,
      metalness: 0.1,
      normalScale: 1.5,
    },
    wood: {
      baseColor: new THREE.Color(0x8b4513),
      roughness: 0.8,
      metalness: 0.0,
      normalScale: 1.0,
    },
    metal: {
      baseColor: new THREE.Color(0xc0c0c0),
      roughness: 0.3,
      metalness: 0.9,
      normalScale: 0.5,
    },
    grass: {
      baseColor: new THREE.Color(0x3a9d23),
      roughness: 0.9,
      metalness: 0.0,
      normalScale: 0.8,
    },
    dirt: {
      baseColor: new THREE.Color(0x8b7355),
      roughness: 0.95,
      metalness: 0.0,
      normalScale: 1.2,
    },
    sand: {
      baseColor: new THREE.Color(0xf4e4c1),
      roughness: 0.85,
      metalness: 0.0,
      normalScale: 0.5,
    },
    leather: {
      baseColor: new THREE.Color(0x8b5a2b),
      roughness: 0.7,
      metalness: 0.0,
      normalScale: 0.6,
    },
    fabric: {
      baseColor: new THREE.Color(0xeeeeee),
      roughness: 0.9,
      metalness: 0.0,
      normalScale: 0.4,
    },
    crystal: {
      baseColor: new THREE.Color(0x88ccff),
      roughness: 0.1,
      metalness: 0.0,
      normalScale: 0.3,
      emissive: new THREE.Color(0x4488ff),
      emissiveIntensity: 0.3,
    },
    gold: {
      baseColor: new THREE.Color(0xffd700),
      roughness: 0.4,
      metalness: 1.0,
      normalScale: 0.2,
    },
    foliage: {
      baseColor: new THREE.Color(0x4a7c3e),
      roughness: 0.85,
      metalness: 0.0,
      normalScale: 0.7,
    },
    water: {
      baseColor: new THREE.Color(0x4488bb),
      roughness: 0.05,
      metalness: 0.0,
      normalScale: 0.5,
    },
  };

  /**
   * Create PBR material with optional textures
   */
  createPBRMaterial(
    assetType: string,
    texturePaths?: {
      baseColor?: string;
      normal?: string;
      roughness?: string;
      metalness?: string;
      ao?: string;
      emissive?: string;
    }
  ): THREE.MeshStandardMaterial {
    // Get base properties or use default (stone)
    const baseProps = this.materialLibrary[assetType] || this.materialLibrary.stone;

    // Create material
    const material = new THREE.MeshStandardMaterial({
      color: baseProps.baseColor,
      roughness: baseProps.roughness,
      metalness: baseProps.metalness,
      envMapIntensity: 1.0,
      // ENHANCEMENT: Load PBR textures if available
      map: texturePaths?.baseColor ? this.loadTexture(texturePaths.baseColor) : null,
      normalMap: texturePaths?.normal ? this.loadTexture(texturePaths.normal) : null,
      roughnessMap: texturePaths?.roughness ? this.loadTexture(texturePaths.roughness) : null,
      metalnessMap: texturePaths?.metalness ? this.loadTexture(texturePaths.metalness) : null,
      aoMap: texturePaths?.ao ? this.loadTexture(texturePaths.ao) : null,
      emissiveMap: texturePaths?.emissive ? this.loadTexture(texturePaths.emissive) : null,
    });

    // Set normal scale if normal map is provided
    if (material.normalMap) {
      material.normalScale = new THREE.Vector2(baseProps.normalScale, baseProps.normalScale);
    }

    // Set emissive properties
    if (baseProps.emissive) {
      material.emissive = baseProps.emissive;
      material.emissiveIntensity = baseProps.emissiveIntensity || 1.0;
    }

    return material;
  }

  /**
   * Load texture with caching
   */
  private loadTexture(path: string): THREE.Texture {
    // Check cache first
    if (this.textureCache.has(path)) {
      return this.textureCache.get(path)!;
    }

    // Load new texture
    const texture = this.textureLoader.load(path);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;

    // Cache it
    this.textureCache.set(path, texture);

    return texture;
  }

  /**
   * ENHANCEMENT: Apply PBR to existing mesh
   */
  upgradeMeshToPBR(mesh: THREE.Mesh, assetType: string = 'stone'): void {
    if (
      mesh.material instanceof THREE.MeshBasicMaterial ||
      mesh.material instanceof THREE.MeshLambertMaterial ||
      mesh.material instanceof THREE.MeshPhongMaterial
    ) {
      const oldMaterial = mesh.material;
      const oldColor = oldMaterial.color.clone();

      // Create new PBR material with same color
      const newMaterial = this.createPBRMaterial(assetType);
      newMaterial.color.copy(oldColor);

      // Apply new material
      mesh.material = newMaterial;

      // Dispose old material
      oldMaterial.dispose();
    }
  }

  /**
   * ENHANCEMENT: Upgrade all meshes in a scene/group to PBR
   */
  upgradeSceneToPBR(object: THREE.Object3D, assetType: string = 'stone'): void {
    object.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        this.upgradeMeshToPBR(child, assetType);
      }
    });
  }

  /**
   * Create material with custom properties
   */
  createCustomMaterial(properties: Partial<MaterialDefinition>): THREE.MeshStandardMaterial {
    const defaults = this.materialLibrary.stone;

    return new THREE.MeshStandardMaterial({
      color: properties.baseColor || defaults.baseColor,
      roughness: properties.roughness ?? defaults.roughness,
      metalness: properties.metalness ?? defaults.metalness,
      emissive: properties.emissive,
      emissiveIntensity: properties.emissiveIntensity,
    });
  }

  /**
   * Get cached material by key
   */
  getCachedMaterial(key: string): THREE.Material | undefined {
    return this.materialCache.get(key);
  }

  /**
   * Cache a material for reuse
   */
  cacheMaterial(key: string, material: THREE.Material): void {
    this.materialCache.set(key, material);
  }

  /**
   * Get material definition
   */
  getMaterialDefinition(assetType: string): MaterialDefinition | undefined {
    return this.materialLibrary[assetType];
  }

  /**
   * Add custom material definition
   */
  addMaterialDefinition(name: string, definition: MaterialDefinition): void {
    this.materialLibrary[name] = definition;
  }

  /**
   * Cleanup
   */
  dispose(): void {
    // Dispose all cached materials
    this.materialCache.forEach((material) => material.dispose());
    this.materialCache.clear();

    // Dispose all cached textures
    this.textureCache.forEach((texture) => texture.dispose());
    this.textureCache.clear();

    console.log('[EnhancedMaterialSystem] Disposed');
  }
}
